import type { Node } from '@xyflow/react'

/**
 * Approximate node widths by type (from the node component styles).
 * Height is estimated since it varies with content.
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
  'entry-point': 220,
}

const DEFAULT_NODE_HEIGHT = 60

/**
 * Given source and target nodes, returns the optimal sourceHandle and targetHandle
 * based on their relative positions:
 * - Target below source → bottom / top
 * - Target above source → top / bottom
 * - Target to the right → right-source / left-target
 * - Target to the left → left-source / right-target
 */
export function resolveEdgeHandles(
  source: Node,
  target: Node,
): { sourceHandle: string; targetHandle: string } {
  const sw = NODE_WIDTHS[source.type ?? 'screen'] ?? 200
  const tw = NODE_WIDTHS[target.type ?? 'screen'] ?? 200

  const sourceCx = source.position.x + sw / 2
  const sourceCy = source.position.y + DEFAULT_NODE_HEIGHT / 2
  const targetCx = target.position.x + tw / 2
  const targetCy = target.position.y + DEFAULT_NODE_HEIGHT / 2

  const dx = targetCx - sourceCx
  const dy = targetCy - sourceCy

  if (Math.abs(dy) >= Math.abs(dx)) {
    // Vertical relationship
    if (dy >= 0) {
      return { sourceHandle: 'bottom', targetHandle: 'top' }
    }
    return { sourceHandle: 'top', targetHandle: 'bottom' }
  }

  // Horizontal relationship
  if (dx >= 0) {
    return { sourceHandle: 'right-source', targetHandle: 'left-target' }
  }
  return { sourceHandle: 'left-source', targetHandle: 'right-target' }
}

/**
 * Recalculates sourceHandle/targetHandle for all edges based on current node positions.
 * Returns a new edges array (does not mutate).
 */
export function recalculateEdgeHandles(
  nodes: Node[],
  edges: { id: string; source: string; target: string; [key: string]: unknown }[],
): typeof edges {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  return edges.map((edge) => {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (!source || !target) return edge

    const { sourceHandle, targetHandle } = resolveEdgeHandles(source, target)
    return { ...edge, sourceHandle, targetHandle }
  })
}
