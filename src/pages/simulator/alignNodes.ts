import type { Node, Edge } from '@xyflow/react'
import ELK from 'elkjs/lib/elk.bundled.js'
import { NODE_WIDTHS } from './resolveEdgeHandles'
import { recalculateEdgeHandles } from './resolveEdgeHandles'
import type { FlowNodeData } from './flowGraph.types'

const DEFAULT_NODE_HEIGHT = 80
const SATELLITE_GAP = 80

const elk = new ELK()

/**
 * Repositions all existing nodes using ELK (Eclipse Layout Kernel) for
 * crossing-minimized hierarchical layout, then positions satellites
 * (overlays, fail branches, hidden actions) relative to their parents.
 */
export async function alignNodes(
  nodes: Node[],
  edges: Edge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (nodes.length === 0) return { nodes, edges }

  // Identify hidden action nodes (same logic as FlowCanvas enrichedNodes):
  // action nodes with exactly 1 incoming edge that don't bridge to overlays and have outgoing edges
  const hiddenActionNodeIds = new Set<string>()
  {
    const inCount = new Map<string, number>()
    const outTargets = new Map<string, string[]>()
    for (const e of edges) {
      inCount.set(e.target, (inCount.get(e.target) ?? 0) + 1)
      if (!outTargets.has(e.source)) outTargets.set(e.source, [])
      outTargets.get(e.source)!.push(e.target)
    }
    const nm = new Map(nodes.map((n) => [n.id, n]))
    for (const n of nodes) {
      const d = n.data as FlowNodeData
      if (d.nodeType !== 'action') continue
      if ((inCount.get(n.id) ?? 0) !== 1) continue
      const targets = outTargets.get(n.id) ?? []
      if (targets.length === 0) continue
      const bridgesToOverlay = targets.some((tid) => {
        const t = nm.get(tid)
        return t && (t.data as FlowNodeData).nodeType === 'overlay'
      })
      if (bridgesToOverlay) continue
      hiddenActionNodeIds.add(n.id)
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Build edge lookup
  const edgesFromSource = new Map<string, Edge[]>()
  const edgesToTarget = new Map<string, Edge[]>()
  for (const edge of edges) {
    if (!edgesFromSource.has(edge.source)) edgesFromSource.set(edge.source, [])
    edgesFromSource.get(edge.source)!.push(edge)
    if (!edgesToTarget.has(edge.target)) edgesToTarget.set(edge.target, [])
    edgesToTarget.get(edge.target)!.push(edge)
  }

  // ── Identify satellite nodes (excluded from ELK layout) ──
  const satelliteNodeIds = new Set<string>(hiddenActionNodeIds)

  // --- Overlay satellites ---
  const overlaySatellitesOf = new Map<string, { actionId: string; overlayId: string }[]>()

  for (const node of nodes) {
    const data = node.data as FlowNodeData
    if (data.nodeType !== 'overlay' || !data.parentScreenNodeId) continue

    const parentId = data.parentScreenNodeId
    if (!nodeMap.has(parentId)) continue

    const incomingEdges = edgesToTarget.get(node.id) ?? []
    let bridgeActionId: string | null = null

    for (const inEdge of incomingEdges) {
      const sourceNode = nodeMap.get(inEdge.source)
      if (!sourceNode) continue
      const sourceData = sourceNode.data as FlowNodeData
      if (sourceData.nodeType === 'action') {
        const actionIncoming = edgesToTarget.get(sourceNode.id) ?? []
        if (actionIncoming.some((e) => e.source === parentId)) {
          bridgeActionId = sourceNode.id
          break
        }
      }
    }

    satelliteNodeIds.add(node.id)
    if (bridgeActionId) satelliteNodeIds.add(bridgeActionId)

    if (!overlaySatellitesOf.has(parentId)) overlaySatellitesOf.set(parentId, [])
    overlaySatellitesOf.get(parentId)!.push({
      actionId: bridgeActionId ?? '',
      overlayId: node.id,
    })
  }

  // --- Decision fail-branch satellites ---
  const decisionFailTargets = new Map<string, string[]>()

  for (const node of nodes) {
    const data = node.data as FlowNodeData
    if (data.nodeType !== 'decision') continue

    const outEdges = edgesFromSource.get(node.id) ?? []
    if (outEdges.length < 2) continue

    for (const edge of outEdges) {
      const targetNode = nodeMap.get(edge.target)
      if (!targetNode) continue
      const targetData = targetNode.data as FlowNodeData

      const isErrorTarget = targetData.nodeType === 'error'
      const isRightHandle = edge.sourceHandle === 'right-source'
      const label = (typeof edge.label === 'string' ? edge.label : '').toLowerCase()
      const isFailLabel = /fail|error|no|expired|block/i.test(label)

      if (isErrorTarget || isRightHandle || isFailLabel) {
        satelliteNodeIds.add(edge.target)
        if (!decisionFailTargets.has(node.id)) decisionFailTargets.set(node.id, [])
        decisionFailTargets.get(node.id)!.push(edge.target)
      }
    }
  }

  // ── Build spine: all non-satellite nodes ──
  const spineNodeIds = new Set(
    nodes.filter((n) => !satelliteNodeIds.has(n.id)).map((n) => n.id),
  )

  // Build virtual spine edges, bridging through hidden satellite nodes.
  // IMPORTANT: stop at the FIRST spine node reached — don't bridge transitively
  // through spine nodes. This preserves the correct chain depth.
  const spineEdges: { id: string; source: string; target: string }[] = []
  const seenSpineEdges = new Set<string>()

  function addSpineEdge(source: string, target: string, edgeId: string) {
    const key = `${source}→${target}`
    if (seenSpineEdges.has(key)) return
    seenSpineEdges.add(key)
    spineEdges.push({ id: edgeId, source, target })
  }

  // For each edge, follow through satellites to find the immediate next spine nodes
  function followToNextSpine(startId: string): string[] {
    const results: string[] = []
    const visited = new Set<string>()
    const queue = [startId]
    while (queue.length > 0) {
      const id = queue.pop()!
      if (visited.has(id)) continue
      visited.add(id)
      if (spineNodeIds.has(id)) {
        // Found a spine node — record it but DON'T continue past it
        results.push(id)
      } else {
        // Satellite — keep following outgoing edges
        for (const e of edges) {
          if (e.source === id) queue.push(e.target)
        }
      }
    }
    return results
  }

  for (const edge of edges) {
    if (spineNodeIds.has(edge.source) && spineNodeIds.has(edge.target)) {
      addSpineEdge(edge.source, edge.target, edge.id)
    } else if (spineNodeIds.has(edge.source) && satelliteNodeIds.has(edge.target)) {
      const nextSpine = followToNextSpine(edge.target)
      for (const dsId of nextSpine) {
        addSpineEdge(edge.source, dsId, `virtual-${edge.source}-${dsId}`)
      }
    }
  }

  // ── Run ELK layout on spine ──
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      // Spacing
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.layered.spacing.edgeNodeBetweenLayers': '40',
      'elk.spacing.edgeNode': '40',
      // Crossing minimization
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      // Node placement — NETWORK_SIMPLEX keeps connected nodes close
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      // Respect edge order from the model
      'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
      // Compact layout
      'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
    },
    children: [...spineNodeIds].map((id) => {
      const node = nodeMap.get(id)!
      const w = node.measured?.width ?? NODE_WIDTHS[node.type ?? 'screen'] ?? 200
      const h = node.measured?.height ?? DEFAULT_NODE_HEIGHT
      return { id, width: w, height: h }
    }),
    edges: spineEdges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const layoutResult = await elk.layout(elkGraph)

  // ── Apply ELK positions, centered on origin ──
  const newPositions = new Map<string, { x: number; y: number }>()

  if (layoutResult.children) {
    const root = layoutResult as { width?: number; height?: number; children?: typeof layoutResult.children }
    const totalW = root.width ?? 0
    const totalH = root.height ?? 0
    const offsetX = -totalW / 2
    const offsetY = -totalH / 2

    for (const elkNode of layoutResult.children) {
      newPositions.set(elkNode.id, {
        x: (elkNode.x ?? 0) + offsetX,
        y: (elkNode.y ?? 0) + offsetY,
      })
    }
  }

  const nodeWidth = 200

  // ── Position overlay satellites to the left of their parent screen ──
  for (const [parentId, satellites] of overlaySatellitesOf) {
    const parentPos = newPositions.get(parentId)
    if (!parentPos) continue

    for (let i = 0; i < satellites.length; i++) {
      const { actionId, overlayId } = satellites[i]
      const verticalOffset = i * (DEFAULT_NODE_HEIGHT + 20)
      const actionX = parentPos.x - nodeWidth - SATELLITE_GAP
      const overlayX = parentPos.x - (nodeWidth + SATELLITE_GAP) * 2

      if (actionId) {
        newPositions.set(actionId, { x: actionX, y: parentPos.y + verticalOffset })
      }
      newPositions.set(overlayId, { x: overlayX, y: parentPos.y + verticalOffset })
    }
  }

  // ── Position decision fail targets to the right and slightly below ──
  for (const [decisionId, failTargetIds] of decisionFailTargets) {
    const decisionPos = newPositions.get(decisionId)
    if (!decisionPos) continue

    for (let i = 0; i < failTargetIds.length; i++) {
      const failX = decisionPos.x + (nodeWidth + SATELLITE_GAP) * (i + 1)
      const failY = decisionPos.y + 30
      newPositions.set(failTargetIds[i], { x: failX, y: failY })
    }
  }

  // Position hidden action nodes between their source and target (for correct edge routing)
  for (const actionId of hiddenActionNodeIds) {
    if (newPositions.has(actionId)) continue
    const incoming = edges.find((e) => e.target === actionId)
    const outgoing = edges.find((e) => e.source === actionId)
    if (incoming && outgoing) {
      const sourcePos = newPositions.get(incoming.source)
      const targetPos = newPositions.get(outgoing.target)
      if (sourcePos && targetPos) {
        newPositions.set(actionId, {
          x: (sourcePos.x + targetPos.x) / 2,
          y: (sourcePos.y + targetPos.y) / 2,
        })
        continue
      }
    }
    // Fallback: position at source
    if (incoming) {
      const sourcePos = newPositions.get(incoming.source)
      if (sourcePos) {
        newPositions.set(actionId, { ...sourcePos })
        continue
      }
    }
  }

  const alignedNodes = nodes.map((n) => ({
    ...n,
    position: newPositions.get(n.id) ?? n.position,
  }))

  const alignedEdges = recalculateEdgeHandles(alignedNodes, edges) as Edge[]

  return { nodes: alignedNodes, edges: alignedEdges }
}
