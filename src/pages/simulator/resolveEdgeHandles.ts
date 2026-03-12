import type { Node } from '@xyflow/react'

/**
 * Approximate node widths by type (from the node component styles).
 */
export const NODE_WIDTHS: Record<string, number> = {
  screen: 200,
  page: 200,
  decision: 200,
  error: 200,
  'flow-reference': 200,
  action: 200,
  overlay: 200,
  state: 200,
  'api-call': 200,
  delay: 200,
  note: 200,
  'entry-point': 200,
}

const DEFAULT_NODE_HEIGHT = 60

// Available handles on every node component:
//   Source (outgoing): bottom, left-source, right-source
//   Target (incoming): top, left-target, right-target
// NEVER assign sourceHandle='top' or targetHandle='bottom' — they don't exist.

function getNodeBounds(node: Node) {
  const w = node.measured?.width ?? NODE_WIDTHS[node.type ?? 'screen'] ?? 200
  const h = node.measured?.height ?? DEFAULT_NODE_HEIGHT
  return {
    w, h,
    cx: node.position.x + w / 2,
    cy: node.position.y + h / 2,
    left: node.position.x,
    right: node.position.x + w,
    top: node.position.y,
    bottom: node.position.y + h,
  }
}

/**
 * Given source and target nodes, returns the optimal sourceHandle and targetHandle.
 * Only returns valid handles that exist on node components.
 */
export function resolveEdgeHandles(
  source: Node,
  target: Node,
): { sourceHandle: string; targetHandle: string } {
  const s = getNodeBounds(source)
  const t = getNodeBounds(target)

  // Target fully below → standard vertical flow
  if (t.top >= s.bottom) {
    return { sourceHandle: 'bottom', targetHandle: 'top' }
  }
  // Target fully above → use side handles (no source 'top' or target 'bottom')
  if (t.bottom <= s.top) {
    return (t.cx - s.cx) >= 0
      ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
      : { sourceHandle: 'left-source', targetHandle: 'right-target' }
  }
  // Target to the right
  if (t.left >= s.right) {
    return { sourceHandle: 'right-source', targetHandle: 'left-target' }
  }
  // Target to the left
  if (t.right <= s.left) {
    return { sourceHandle: 'left-source', targetHandle: 'right-target' }
  }

  // Overlapping — use center-to-center
  const dx = t.cx - s.cx
  const dy = t.cy - s.cy

  if (Math.abs(dy) >= Math.abs(dx)) {
    if (dy >= 0) return { sourceHandle: 'bottom', targetHandle: 'top' }
    // Upward → side handles
    return dx >= 0
      ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
      : { sourceHandle: 'left-source', targetHandle: 'right-target' }
  }
  return dx >= 0
    ? { sourceHandle: 'right-source', targetHandle: 'left-target' }
    : { sourceHandle: 'left-source', targetHandle: 'right-target' }
}

/**
 * Score how well a source handle fits the direction to the target. Higher = better.
 */
function scoreSourceHandle(handle: string, s: ReturnType<typeof getNodeBounds>, t: ReturnType<typeof getNodeBounds>): number {
  const dx = t.cx - s.cx
  const dy = t.cy - s.cy
  switch (handle) {
    case 'bottom':       return dy > 0 ? 100 + dy : -100
    case 'left-source':  return dx < 0 ? 80 + Math.abs(dx) : -80
    case 'right-source': return dx > 0 ? 80 + dx : -80
    default: return 0
  }
}

/**
 * Score how well a target handle fits the direction from the source. Higher = better.
 */
function scoreTargetHandle(handle: string, s: ReturnType<typeof getNodeBounds>, t: ReturnType<typeof getNodeBounds>): number {
  const dx = s.cx - t.cx
  const dy = s.cy - t.cy
  switch (handle) {
    case 'top':           return dy < 0 ? 100 + Math.abs(dy) : -100
    case 'left-target':   return dx < 0 ? 80 + Math.abs(dx) : -80
    case 'right-target':  return dx > 0 ? 80 + dx : -80
    default: return 0
  }
}

const SOURCE_HANDLES = ['bottom', 'left-source', 'right-source'] as const
const TARGET_HANDLES = ['top', 'left-target', 'right-target'] as const

interface EdgeLike {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  [key: string]: unknown
}

/**
 * Recalculates edge handles based on node positions.
 * When multiple edges share the same handle on the same node, distributes
 * them across available handles using geometric scoring to avoid overlaps.
 */
export function recalculateEdgeHandles(
  nodes: Node[],
  edges: EdgeLike[],
): EdgeLike[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Step 1: Resolve initial best handle for each edge
  type Resolved = { edge: EdgeLike; sh: string; th: string }
  const resolved: Resolved[] = edges.map((edge) => {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (!source || !target) {
      return { edge, sh: edge.sourceHandle ?? 'bottom', th: edge.targetHandle ?? 'top' }
    }
    const { sourceHandle, targetHandle } = resolveEdgeHandles(source, target)
    return { edge, sh: sourceHandle, th: targetHandle }
  })

  // Step 2: Detect & fix source-side collisions
  const sourceGroups = new Map<string, Map<string, number[]>>()
  for (let i = 0; i < resolved.length; i++) {
    const r = resolved[i]
    if (!sourceGroups.has(r.edge.source)) sourceGroups.set(r.edge.source, new Map())
    const hm = sourceGroups.get(r.edge.source)!
    if (!hm.has(r.sh)) hm.set(r.sh, [])
    hm.get(r.sh)!.push(i)
  }

  for (const [nodeId, handleMap] of sourceGroups) {
    for (const [, indices] of handleMap) {
      if (indices.length <= 1) continue
      const sourceNode = nodeMap.get(nodeId)
      if (!sourceNode) continue
      const sBounds = getNodeBounds(sourceNode)

      // Sort by target X (left to right)
      indices.sort((a, b) => {
        const tA = nodeMap.get(resolved[a].edge.target)
        const tB = nodeMap.get(resolved[b].edge.target)
        if (!tA || !tB) return 0
        return tA.position.x - tB.position.x
      })

      const used = new Set<string>()
      for (const idx of indices) {
        const targetNode = nodeMap.get(resolved[idx].edge.target)
        if (!targetNode) continue
        const tBounds = getNodeBounds(targetNode)
        const candidates = SOURCE_HANDLES
          .filter((h) => !used.has(h))
          .map((h) => ({ handle: h, score: scoreSourceHandle(h, sBounds, tBounds) }))
          .sort((a, b) => b.score - a.score)
        if (candidates.length > 0) {
          resolved[idx].sh = candidates[0].handle
          used.add(candidates[0].handle)
        }
      }
    }
  }

  // Step 3: Detect & fix target-side collisions
  const targetGroups = new Map<string, Map<string, number[]>>()
  for (let i = 0; i < resolved.length; i++) {
    const r = resolved[i]
    if (!targetGroups.has(r.edge.target)) targetGroups.set(r.edge.target, new Map())
    const hm = targetGroups.get(r.edge.target)!
    if (!hm.has(r.th)) hm.set(r.th, [])
    hm.get(r.th)!.push(i)
  }

  for (const [nodeId, handleMap] of targetGroups) {
    for (const [, indices] of handleMap) {
      if (indices.length <= 1) continue
      const targetNode = nodeMap.get(nodeId)
      if (!targetNode) continue
      const tBounds = getNodeBounds(targetNode)

      indices.sort((a, b) => {
        const sA = nodeMap.get(resolved[a].edge.source)
        const sB = nodeMap.get(resolved[b].edge.source)
        if (!sA || !sB) return 0
        return sA.position.x - sB.position.x
      })

      const used = new Set<string>()
      for (const idx of indices) {
        const sourceNode = nodeMap.get(resolved[idx].edge.source)
        if (!sourceNode) continue
        const sBounds = getNodeBounds(sourceNode)
        const candidates = TARGET_HANDLES
          .filter((h) => !used.has(h))
          .map((h) => ({ handle: h, score: scoreTargetHandle(h, sBounds, tBounds) }))
          .sort((a, b) => b.score - a.score)
        if (candidates.length > 0) {
          resolved[idx].th = candidates[0].handle
          used.add(candidates[0].handle)
        }
      }
    }
  }

  return resolved.map((r) => ({
    ...r.edge,
    sourceHandle: r.sh,
    targetHandle: r.th,
  }))
}
