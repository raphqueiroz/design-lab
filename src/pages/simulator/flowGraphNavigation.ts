/**
 * Pure navigation logic that derives screen navigation from the flow graph.
 *
 * The graph IS the navigation model — the Prototype player follows edges
 * to navigate between screens. Non-screen nodes (decision, error,
 * flow-reference, action, overlay) are pass-through: the player skips them
 * and follows their outgoing edges to reach the next screen node.
 */

import type { Node, Edge } from '@xyflow/react'
import type { FlowNodeData, OverlayType, ActionType } from './flowGraph.types'

export interface ScreenOverlayInfo {
  nodeId: string
  label: string
  description?: string
  overlayType: OverlayType
  triggerLabel?: string
  triggerActionType?: ActionType
}

export interface NavigableStep {
  nodeId: string
  screenId: string
  label: string
}

/** Check whether a node is a navigable screen/page node with a linked screenId or pageId. */
function isScreenNode(node: Node): boolean {
  const d = node.data as FlowNodeData
  if (d.nodeType === 'screen' || d.nodeType === 'page') {
    return d.screenId !== null || d.pageId !== undefined
  }
  return false
}

/**
 * Build an adjacency map: nodeId → list of target nodeIds via outgoing edges.
 */
function buildAdjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const edge of edges) {
    const list = adj.get(edge.source) ?? []
    list.push(edge.target)
    adj.set(edge.source, list)
  }
  return adj
}

/**
 * Build a reverse adjacency map: nodeId → list of source nodeIds.
 */
function buildReverseAdjacency(edges: Edge[]): Map<string, string[]> {
  const rev = new Map<string, string[]>()
  for (const edge of edges) {
    const list = rev.get(edge.target) ?? []
    list.push(edge.source)
    rev.set(edge.target, list)
  }
  return rev
}

/**
 * Find the start node: a screen node with no incoming edges from other screen
 * nodes. If multiple candidates exist, pick the topmost by Y position.
 * Falls back to the topmost screen node overall.
 */
function findStartNode(nodes: Node[], edges: Edge[]): Node | null {
  const screenNodes = nodes.filter(isScreenNode)
  if (screenNodes.length === 0) return null

  // All nodes that are targets of an edge from a screen node
  const screenNodeIds = new Set(screenNodes.map((n) => n.id))
  const hasIncomingFromScreen = new Set<string>()

  for (const edge of edges) {
    if (screenNodeIds.has(edge.source) && screenNodeIds.has(edge.target)) {
      hasIncomingFromScreen.add(edge.target)
    }
  }

  // Screen nodes with no incoming edge from another screen node
  const roots = screenNodes.filter((n) => !hasIncomingFromScreen.has(n.id))
  const candidates = roots.length > 0 ? roots : screenNodes

  // Pick topmost by Y position
  return candidates.reduce((best, n) =>
    n.position.y < best.position.y ? n : best,
  )
}

/**
 * From a given node, follow outgoing edges to find the next reachable screen
 * nodes, skipping pass-through nodes (decision, error, flow-reference, action, overlay).
 *
 * When `skipScreenId` is provided, screen nodes with that screenId are treated
 * as pass-through (state-transition nodes for the same page) so the traversal
 * continues through them to find the next *different* screen.
 */
function followEdgesToScreens(
  fromNodeId: string,
  adj: Map<string, string[]>,
  nodeMap: Map<string, Node>,
  visited: Set<string> = new Set(),
  skipScreenId?: string,
): Node[] {
  const results: Node[] = []
  const targets = adj.get(fromNodeId) ?? []

  for (const targetId of targets) {
    if (visited.has(targetId)) continue
    visited.add(targetId)

    const targetNode = nodeMap.get(targetId)
    if (!targetNode) continue

    if (isScreenNode(targetNode)) {
      const td = targetNode.data as FlowNodeData
      const sid = td.screenId ?? td.pageId
      if (skipScreenId && sid === skipScreenId) {
        // Same page (state transition) — treat as pass-through
        results.push(...followEdgesToScreens(targetId, adj, nodeMap, visited, skipScreenId))
      } else {
        results.push(targetNode)
      }
    } else {
      // Pass-through: keep following edges
      results.push(...followEdgesToScreens(targetId, adj, nodeMap, visited, skipScreenId))
    }
  }

  return results
}

type FollowResult =
  | { type: 'screen'; node: Node }
  | { type: 'flow-reference'; flowId: string }

/**
 * Like followEdgesToScreens, but also stops at flow-reference nodes.
 * Used by resolveScreenElementTarget / resolveOverlayElementTarget
 * to find cross-flow navigation targets through pass-through nodes
 * (api-call, delay, decision, etc.).
 */
function followEdgesToDestination(
  fromNodeId: string,
  adj: Map<string, string[]>,
  nodeMap: Map<string, Node>,
  visited: Set<string> = new Set(),
  skipScreenId?: string,
): FollowResult[] {
  const results: FollowResult[] = []
  const targets = adj.get(fromNodeId) ?? []

  for (const targetId of targets) {
    if (visited.has(targetId)) continue
    visited.add(targetId)

    const targetNode = nodeMap.get(targetId)
    if (!targetNode) continue
    const td = targetNode.data as FlowNodeData

    if (td.nodeType === 'flow-reference' && td.targetFlowId) {
      results.push({ type: 'flow-reference', flowId: td.targetFlowId })
    } else if (isScreenNode(targetNode)) {
      const sid = td.screenId ?? td.pageId
      if (skipScreenId && sid === skipScreenId) {
        results.push(...followEdgesToDestination(targetId, adj, nodeMap, visited, skipScreenId))
      } else {
        results.push({ type: 'screen', node: targetNode })
      }
    } else {
      // Pass-through: keep following edges
      results.push(...followEdgesToDestination(targetId, adj, nodeMap, visited, skipScreenId))
    }
  }

  return results
}

/**
 * Derive a linear navigation path from the graph by walking edges
 * starting from the start node. Unreachable screen nodes are appended
 * at the end to ensure no screens are lost.
 */
export function deriveNavigationPath(nodes: Node[], edges: Edge[]): NavigableStep[] {
  const screenNodes = nodes.filter(isScreenNode)
  if (screenNodes.length === 0) return []

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = buildAdjacency(edges)
  const startNode = findStartNode(nodes, edges)
  if (!startNode) return []

  const path: NavigableStep[] = []
  const visited = new Set<string>()
  const queue: Node[] = [startNode]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current.id)) continue
    visited.add(current.id)

    const d = current.data as FlowNodeData
    path.push({
      nodeId: current.id,
      screenId: d.screenId ?? d.pageId!,
      label: d.label,
    })

    const currentScreenId = d.screenId ?? d.pageId!

    // Follow edges to next screen nodes, skipping same-screenId state-transition nodes
    const nextScreens = followEdgesToScreens(current.id, adj, nodeMap, new Set(), currentScreenId)
    for (const next of nextScreens) {
      if (!visited.has(next.id)) {
        queue.push(next)
      }
    }
  }

  // Append unreachable screen nodes (deduplicate by screenId — state-transition nodes don't count)
  const seenScreenIds = new Set(path.map((s) => s.screenId))
  for (const node of screenNodes) {
    if (!visited.has(node.id)) {
      const d = node.data as FlowNodeData
      const sid = d.screenId ?? d.pageId!
      if (seenScreenIds.has(sid)) continue // skip duplicate screenId
      seenScreenIds.add(sid)
      path.push({
        nodeId: node.id,
        screenId: sid,
        label: d.label,
      })
    }
  }

  return path
}

/**
 * Given the current node, return the next screen nodes reachable via edges
 * (skipping non-screen pass-through nodes).
 */
export function getNextScreenOptions(
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[],
): NavigableStep[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = buildAdjacency(edges)
  const currentNode = nodeMap.get(currentNodeId)
  const currentScreenId = currentNode ? ((currentNode.data as FlowNodeData).screenId ?? (currentNode.data as FlowNodeData).pageId) : undefined
  const nextNodes = followEdgesToScreens(currentNodeId, adj, nodeMap, new Set(), currentScreenId ?? undefined)

  return nextNodes.map((n) => {
    const d = n.data as FlowNodeData
    return {
      nodeId: n.id,
      screenId: d.screenId ?? d.pageId!,
      label: d.label,
    }
  })
}

/**
 * Given the current node, return the previous screen node by following
 * reverse edges (skipping pass-through nodes).
 */
export function getPreviousScreen(
  currentNodeId: string,
  nodes: Node[],
  edges: Edge[],
): NavigableStep | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const rev = buildReverseAdjacency(edges)

  const visited = new Set<string>()

  function findPrevScreen(nodeId: string): Node | null {
    const sources = rev.get(nodeId) ?? []
    for (const srcId of sources) {
      if (visited.has(srcId)) continue
      visited.add(srcId)

      const srcNode = nodeMap.get(srcId)
      if (!srcNode) continue

      if (isScreenNode(srcNode)) {
        return srcNode
      }
      // Pass-through: keep going backwards
      const found = findPrevScreen(srcId)
      if (found) return found
    }
    return null
  }

  const prev = findPrevScreen(currentNodeId)
  if (!prev) return null

  const d = prev.data as FlowNodeData
  return {
    nodeId: prev.id,
    screenId: d.screenId ?? d.pageId!,
    label: d.label,
  }
}

/**
 * Walk edges backwards from a node to find its connected screen/page node.
 * BFS reverse traversal, returns the first screen/page node found.
 */
export function findParentScreenNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): Node | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const rev = buildReverseAdjacency(edges)
  const visited = new Set<string>()
  const queue = [nodeId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    const sources = rev.get(currentId) ?? []
    for (const srcId of sources) {
      if (visited.has(srcId)) continue
      const srcNode = nodeMap.get(srcId)
      if (!srcNode) continue
      const d = srcNode.data as FlowNodeData
      if (d.nodeType === 'screen' || d.nodeType === 'page') {
        return srcNode
      }
      queue.push(srcId)
    }
  }

  return null
}

/**
 * Walk edges backwards from a node to find the first screen, page, OR overlay node.
 * Unlike findParentScreenNode, this stops at overlay nodes too — used for
 * resolving interactive elements when an action sits under an overlay.
 */
export function findParentInteractiveNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): Node | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const rev = buildReverseAdjacency(edges)
  const visited = new Set<string>()
  const queue = [nodeId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)

    const sources = rev.get(currentId) ?? []
    for (const srcId of sources) {
      if (visited.has(srcId)) continue
      const srcNode = nodeMap.get(srcId)
      if (!srcNode) continue
      const d = srcNode.data as FlowNodeData
      if (d.nodeType === 'screen' || d.nodeType === 'page' || d.nodeType === 'overlay') {
        return srcNode
      }
      queue.push(srcId)
    }
  }

  return null
}

/**
 * Resolve what happens when a user taps an interactive element on a screen.
 * Walks outgoing edges from the screen node, looking for action nodes whose
 * actionTarget matches the element label, then follows those to the final
 * destination (screen node or flow-reference).
 *
 * Also searches through same-screenId nodes (state transitions) so that
 * action nodes attached to a state-transition screen are found.
 */
export function resolveScreenElementTarget(
  screenNodeId: string,
  elementLabel: string,
  nodes: Node[],
  edges: Edge[],
): { type: 'screen'; nodeId: string; screenId: string } | { type: 'flow'; flowId: string } | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = buildAdjacency(edges)

  // Determine the screenId so we can search through same-screenId state-transition nodes
  const originNode = nodeMap.get(screenNodeId)
  const originScreenId = originNode ? ((originNode.data as FlowNodeData).screenId ?? (originNode.data as FlowNodeData).pageId) : null

  // Collect all screen node IDs to search (the origin + any reachable same-screenId nodes)
  const searchNodeIds: string[] = [screenNodeId]
  if (originScreenId) {
    const visited = new Set<string>([screenNodeId])
    const queue = [screenNodeId]
    while (queue.length > 0) {
      const nid = queue.shift()!
      for (const targetId of adj.get(nid) ?? []) {
        if (visited.has(targetId)) continue
        visited.add(targetId)
        const tn = nodeMap.get(targetId)
        if (!tn) continue
        const td = tn.data as FlowNodeData
        // Follow through non-screen pass-through nodes
        if (!isScreenNode(tn)) {
          queue.push(targetId)
          continue
        }
        // If same screenId, add to search set and keep walking
        const sid = td.screenId ?? td.pageId
        if (sid === originScreenId) {
          searchNodeIds.push(targetId)
          queue.push(targetId)
        }
      }
    }
  }

  // Search all collected nodes for matching action targets
  for (const nodeId of searchNodeIds) {
    const targets = adj.get(nodeId) ?? []
    for (const targetId of targets) {
      const targetNode = nodeMap.get(targetId)
      if (!targetNode) continue
      const td = targetNode.data as FlowNodeData

      // Match action nodes whose actionTarget matches the element
      if (td.nodeType === 'action' && td.actionTarget === elementLabel) {
        // Follow edges from this action node to find the destination
        const actionTargets = adj.get(targetId) ?? []
        for (const destId of actionTargets) {
          const destNode = nodeMap.get(destId)
          if (!destNode) continue
          const dd = destNode.data as FlowNodeData

          if (dd.nodeType === 'flow-reference' && dd.targetFlowId) {
            return { type: 'flow', flowId: dd.targetFlowId }
          }
          if ((dd.nodeType === 'screen' || dd.nodeType === 'page') && (dd.screenId || dd.pageId)) {
            const destScreenId = (dd.screenId ?? dd.pageId)!
            // If destination is same screen, keep following to find the real target
            if (destScreenId === originScreenId) {
              const deeper = followEdgesToScreens(destId, adj, nodeMap, new Set(), originScreenId ?? undefined)
              if (deeper.length > 0) {
                const ds = deeper[0].data as FlowNodeData
                return { type: 'screen', nodeId: deeper[0].id, screenId: (ds.screenId ?? ds.pageId)! }
              }
              continue
            }
            return { type: 'screen', nodeId: destNode.id, screenId: destScreenId }
          }
          // Keep following pass-through nodes (api-call, delay, decision, etc.)
          // Must check for flow-reference nodes too, not just screens
          const deeper = followEdgesToDestination(destId, adj, nodeMap, new Set(), originScreenId ?? undefined)
          for (const result of deeper) {
            if (result.type === 'flow-reference') {
              return { type: 'flow', flowId: result.flowId }
            }
            if (result.type === 'screen') {
              const ds = result.node.data as FlowNodeData
              return { type: 'screen', nodeId: result.node.id, screenId: (ds.screenId ?? ds.pageId)! }
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * Resolve what happens when a user taps an interactive element inside an overlay.
 * Walks outgoing edges from the overlay node, looking for action nodes whose
 * actionTarget matches the element label, then follows those to the final
 * destination (screen node or flow-reference).
 */
export function resolveOverlayElementTarget(
  overlayNodeId: string,
  elementLabel: string,
  nodes: Node[],
  edges: Edge[],
): { type: 'screen'; nodeId: string; screenId: string } | { type: 'flow'; flowId: string } | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = buildAdjacency(edges)

  const targets = adj.get(overlayNodeId) ?? []
  for (const targetId of targets) {
    const targetNode = nodeMap.get(targetId)
    if (!targetNode) continue
    const td = targetNode.data as FlowNodeData

    // Match action nodes whose actionTarget matches the clicked element
    if (td.nodeType === 'action' && td.actionTarget === elementLabel) {
      // Follow edges from this action node to find the destination
      const actionTargets = adj.get(targetId) ?? []
      for (const destId of actionTargets) {
        const destNode = nodeMap.get(destId)
        if (!destNode) continue
        const dd = destNode.data as FlowNodeData

        if (dd.nodeType === 'flow-reference' && dd.targetFlowId) {
          return { type: 'flow', flowId: dd.targetFlowId }
        }
        if ((dd.nodeType === 'screen' || dd.nodeType === 'page') && (dd.screenId || dd.pageId)) {
          return { type: 'screen', nodeId: destNode.id, screenId: (dd.screenId ?? dd.pageId)! }
        }
        // Keep following pass-through nodes (api-call, delay, decision, etc.)
        const deeper = followEdgesToDestination(destId, adj, nodeMap)
        for (const result of deeper) {
          if (result.type === 'flow-reference') {
            return { type: 'flow', flowId: result.flowId }
          }
          if (result.type === 'screen') {
            const ds = result.node.data as FlowNodeData
            return { type: 'screen', nodeId: result.node.id, screenId: (ds.screenId ?? ds.pageId)! }
          }
        }
      }
    }
  }

  return null
}

/**
 * Find all overlay nodes reachable from a screen node.
 * Handles both direct screen→overlay and screen→action→overlay patterns.
 */
export function getOverlaysForScreen(
  screenNodeId: string,
  nodes: Node[],
  edges: Edge[],
): ScreenOverlayInfo[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = buildAdjacency(edges)
  const results: ScreenOverlayInfo[] = []

  const directTargets = adj.get(screenNodeId) ?? []

  for (const targetId of directTargets) {
    const targetNode = nodeMap.get(targetId)
    if (!targetNode) continue
    const td = targetNode.data as FlowNodeData

    if (td.nodeType === 'overlay') {
      // Direct: screen → overlay
      results.push({
        nodeId: targetNode.id,
        label: td.label,
        description: td.description,
        overlayType: td.overlayType ?? 'bottom-sheet',
        triggerLabel: td.label,
      })
    } else if (td.nodeType === 'action') {
      // screen → action → overlay(s)
      const actionTargets = adj.get(targetId) ?? []
      for (const overlayId of actionTargets) {
        const overlayNode = nodeMap.get(overlayId)
        if (!overlayNode) continue
        const od = overlayNode.data as FlowNodeData
        if (od.nodeType !== 'overlay') continue

        results.push({
          nodeId: overlayNode.id,
          label: od.label,
          description: od.description,
          overlayType: od.overlayType ?? 'bottom-sheet',
          triggerLabel: td.label,
          triggerActionType: td.actionType,
        })
      }
    }
  }

  return results
}
