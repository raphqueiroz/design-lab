import type { Flow } from './flowRegistry'
import type { FlowGraph, FlowGraphNode, FlowGraphEdge } from './flowGraph.types'

const NODE_HEIGHT = 80
const VERTICAL_GAP = 120

/**
 * Generates a linear top-to-bottom flow graph from the existing screens[] array.
 * Called when no persisted graph exists for a flow.
 */
export function autoGenerateFlowGraph(flow: Flow): FlowGraph {
  const nodes: FlowGraphNode[] = flow.screens.map((screen, index) => ({
    id: `node-${screen.id}`,
    type: 'screen' as const,
    position: {
      x: 300,
      y: index * (NODE_HEIGHT + VERTICAL_GAP),
    },
    data: {
      label: screen.title,
      screenId: screen.id,
      nodeType: 'screen' as const,
      description: screen.description,
    },
  }))

  const edges: FlowGraphEdge[] = flow.screens.slice(0, -1).map((screen, index) => ({
    id: `edge-${screen.id}-to-${flow.screens[index + 1].id}`,
    source: `node-${screen.id}`,
    target: `node-${flow.screens[index + 1].id}`,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#4ADE80', strokeWidth: 2 },
    labelStyle: { fill: '#A0A0A0', fontSize: 11 },
    labelBgStyle: { fill: '#2C2C2C', fillOpacity: 0.9 },
  }))

  return {
    flowId: flow.id,
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  }
}
