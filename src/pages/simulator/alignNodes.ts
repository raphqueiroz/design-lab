import type { Node, Edge } from '@xyflow/react'
import { NODE_WIDTHS } from './resolveEdgeHandles'
import { recalculateEdgeHandles } from './resolveEdgeHandles'
import type { FlowNodeData } from './flowGraph.types'

const NODE_HEIGHT = 80
const VERTICAL_GAP = 80
const DECISION_VERTICAL_GAP = 120
const HORIZONTAL_GAP = 30
const SATELLITE_GAP = 40

/**
 * Repositions all existing nodes in a centered layered layout
 * using topological ordering from edges, then recalculates edge handles.
 *
 * - Layer 0 = root nodes (no incoming edges)
 * - Each subsequent layer = nodes whose parents are in previous layers
 * - Nodes within a layer are centered horizontally
 * - The entire layout is centered on (0, 0)
 * - Overlay nodes and their connecting action nodes are placed side-by-side
 *   with the parent screen node (to the left)
 * - Decision fail branches (error nodes) are placed to the right of the
 *   decision node; the happy path continues vertically
 */
export function alignNodes(
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  if (nodes.length === 0) return { nodes, edges }

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

  // ── Identify satellite nodes (excluded from main spine) ──
  const satelliteNodeIds = new Set<string>()

  // --- Overlay satellites ---
  // Map: parentScreenNodeId → { actionNodeId, overlayNodeId }[]
  const overlaySatellitesOf = new Map<string, { actionId: string; overlayId: string }[]>()

  for (const node of nodes) {
    const data = node.data as FlowNodeData
    if (data.nodeType !== 'overlay' || !data.parentScreenNodeId) continue

    const parentId = data.parentScreenNodeId
    if (!nodeMap.has(parentId)) continue

    // Find the action node bridging parent → action → overlay
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
  // For each decision node, identify the fail branch target and pull it out of the spine.
  // Fail branch = edge to an error node, OR any non-bottom edge (right-source handle).
  // The happy path is the edge that continues vertically (bottom handle).
  // Map: decisionNodeId → failTargetNodeId[]
  const decisionFailTargets = new Map<string, string[]>()

  for (const node of nodes) {
    const data = node.data as FlowNodeData
    if (data.nodeType !== 'decision') continue

    const outEdges = edgesFromSource.get(node.id) ?? []
    if (outEdges.length < 2) continue // no branching

    for (const edge of outEdges) {
      const targetNode = nodeMap.get(edge.target)
      if (!targetNode) continue
      const targetData = targetNode.data as FlowNodeData

      // Identify fail branch: target is error node, or edge uses right-source handle,
      // or edge label contains fail/error/no/expired keywords
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

  // ── Filter to main-spine nodes only ──
  const spineNodes = nodes.filter((n) => !satelliteNodeIds.has(n.id))

  // Build adjacency for spine nodes only
  const childrenOf = new Map<string, string[]>()
  const parentsOf = new Map<string, string[]>()

  for (const edge of edges) {
    if (satelliteNodeIds.has(edge.source) || satelliteNodeIds.has(edge.target)) continue
    if (!childrenOf.has(edge.source)) childrenOf.set(edge.source, [])
    childrenOf.get(edge.source)!.push(edge.target)
    if (!parentsOf.has(edge.target)) parentsOf.set(edge.target, [])
    parentsOf.get(edge.target)!.push(edge.source)
  }

  // Assign layers via BFS (longest-path layering so children always sit below parents)
  const layerOf = new Map<string, number>()
  const roots = spineNodes.filter(
    (n) => !parentsOf.has(n.id) || parentsOf.get(n.id)!.length === 0,
  )

  const queue: { id: string; layer: number }[] = roots.map((n) => ({
    id: n.id,
    layer: 0,
  }))

  while (queue.length > 0) {
    const { id, layer } = queue.shift()!
    if (layerOf.has(id) && layerOf.get(id)! >= layer) continue
    layerOf.set(id, layer)
    for (const childId of childrenOf.get(id) ?? []) {
      queue.push({ id: childId, layer: layer + 1 })
    }
  }

  // Handle disconnected spine nodes
  const maxAssignedLayer = Math.max(0, ...layerOf.values())
  let nextLayer = maxAssignedLayer + 1
  for (const node of spineNodes) {
    if (!layerOf.has(node.id)) {
      layerOf.set(node.id, nextLayer++)
    }
  }

  // Group spine nodes by layer
  const layerGroups = new Map<number, Node[]>()
  for (const node of spineNodes) {
    const layer = layerOf.get(node.id)!
    if (!layerGroups.has(layer)) layerGroups.set(layer, [])
    layerGroups.get(layer)!.push(node)
  }

  for (const group of layerGroups.values()) {
    group.sort((a, b) => a.position.x - b.position.x)
  }

  const sortedLayers = [...layerGroups.entries()].sort((a, b) => a[0] - b[0])

  // Identify which layers contain a decision node (next layer needs extra gap for labels)
  const decisionLayers = new Set<number>()
  for (const [layer, layerNodes] of sortedLayers) {
    if (layerNodes.some((n) => (n.data as FlowNodeData).nodeType === 'decision')) {
      decisionLayers.add(layer)
    }
  }

  // Calculate cumulative Y positions (variable gap after decision layers)
  const layerYPositions: number[] = []
  let cumulativeY = 0
  for (let i = 0; i < sortedLayers.length; i++) {
    layerYPositions.push(cumulativeY)
    if (i < sortedLayers.length - 1) {
      const prevLayerIdx = sortedLayers[i][0]
      const gap = decisionLayers.has(prevLayerIdx) ? DECISION_VERTICAL_GAP : VERTICAL_GAP
      cumulativeY += NODE_HEIGHT + gap
    }
  }

  // Center vertically
  const totalHeight = cumulativeY
  const startY = -totalHeight / 2

  // Position spine nodes
  const newPositions = new Map<string, { x: number; y: number }>()

  for (let i = 0; i < sortedLayers.length; i++) {
    const layerNodes = sortedLayers[i][1]
    const y = startY + layerYPositions[i]

    const widths = layerNodes.map((n) => NODE_WIDTHS[n.type ?? 'screen'] ?? 200)
    const totalWidth =
      widths.reduce((sum, w) => sum + w, 0) +
      (layerNodes.length - 1) * HORIZONTAL_GAP

    let x = -totalWidth / 2
    for (let j = 0; j < layerNodes.length; j++) {
      newPositions.set(layerNodes[j].id, { x, y })
      x += widths[j] + HORIZONTAL_GAP
    }
  }

  const nodeWidth = 200

  // ── Position overlay satellites to the left of their parent screen ──
  for (const [parentId, satellites] of overlaySatellitesOf) {
    const parentPos = newPositions.get(parentId)
    if (!parentPos) continue

    for (let i = 0; i < satellites.length; i++) {
      const { actionId, overlayId } = satellites[i]
      const actionX = parentPos.x - nodeWidth - SATELLITE_GAP
      const overlayX = parentPos.x - (nodeWidth + SATELLITE_GAP) * 2

      if (actionId) {
        newPositions.set(actionId, { x: actionX, y: parentPos.y })
      }
      newPositions.set(overlayId, { x: overlayX, y: parentPos.y })
    }
  }

  // ── Position decision fail targets to the right of the decision node ──
  for (const [decisionId, failTargetIds] of decisionFailTargets) {
    const decisionPos = newPositions.get(decisionId)
    if (!decisionPos) continue

    for (let i = 0; i < failTargetIds.length; i++) {
      const failX = decisionPos.x + (nodeWidth + SATELLITE_GAP) * (i + 1)
      newPositions.set(failTargetIds[i], { x: failX, y: decisionPos.y })
    }
  }

  const alignedNodes = nodes.map((n) => ({
    ...n,
    position: newPositions.get(n.id) ?? n.position,
  }))

  const alignedEdges = recalculateEdgeHandles(alignedNodes, edges) as Edge[]

  return { nodes: alignedNodes, edges: alignedEdges }
}
