import type { Flow } from './flowRegistry'
import { getFlowsLinkingTo } from './flowRegistry'
import type { FlowGraph, FlowGraphNode, FlowGraphEdge } from './flowGraph.types'
import { resolveEdgeHandles } from './resolveEdgeHandles'

const NODE_HEIGHT = 80
const VERTICAL_GAP = 120

/**
 * Generates a linear top-to-bottom flow graph from the existing screens[] array.
 * Called when no persisted graph exists for a flow.
 *
 * When a screen uses BottomSheet components, auto-generates action + overlay nodes
 * to document those interactions in the graph.
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
      ...(screen.pageId ? { pageId: screen.pageId } : {}),
    },
  }))

  const edges: FlowGraphEdge[] = flow.screens.slice(0, -1).map((screen, index) => {
    const sourceNode = nodes.find((n) => n.id === `node-${screen.id}`)!
    const targetNode = nodes.find((n) => n.id === `node-${flow.screens[index + 1].id}`)!
    const handles = resolveEdgeHandles(sourceNode, targetNode)
    return {
      id: `edge-${screen.id}-to-${flow.screens[index + 1].id}`,
      source: `node-${screen.id}`,
      target: `node-${flow.screens[index + 1].id}`,
      sourceHandle: handles.sourceHandle,
      targetHandle: handles.targetHandle,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#4ADE80', strokeWidth: 2 },
      labelStyle: { fill: '#A0A0A0', fontSize: 11 },
      labelBgStyle: { fill: '#2C2C2C', fillOpacity: 0.9 },
    }
  })

  // Auto-generate action + overlay nodes for screens that use BottomSheet
  for (const screen of flow.screens) {
    if (!screen.componentsUsed.includes('BottomSheet')) continue

    const screenNodeId = `node-${screen.id}`
    const screenNode = nodes.find((n) => n.id === screenNodeId)
    if (!screenNode) continue

    const actionNodeId = `action-${screen.id}-sheet`
    const overlayNodeId = `overlay-${screen.id}-sheet`

    nodes.push({
      id: actionNodeId,
      type: 'action' as const,
      position: {
        x: screenNode.position.x - 240,
        y: screenNode.position.y,
      },
      data: {
        label: 'User Action',
        screenId: null,
        nodeType: 'action' as const,
        actionType: 'tap',
      },
    })

    nodes.push({
      id: overlayNodeId,
      type: 'overlay' as const,
      position: {
        x: screenNode.position.x - 480,
        y: screenNode.position.y,
      },
      data: {
        label: `${screen.title} Sheet`,
        screenId: null,
        nodeType: 'overlay' as const,
        overlayType: 'bottom-sheet',
        parentScreenNodeId: screenNodeId,
      },
    })

    const actionNode = nodes.find((n) => n.id === actionNodeId)!
    const overlayNode = nodes.find((n) => n.id === overlayNodeId)!
    const screenToAction = resolveEdgeHandles(screenNode, actionNode)
    const actionToOverlay = resolveEdgeHandles(actionNode, overlayNode)

    edges.push(
      {
        id: `edge-${screen.id}-to-action-sheet`,
        source: screenNodeId,
        target: actionNodeId,
        sourceHandle: screenToAction.sourceHandle,
        targetHandle: screenToAction.targetHandle,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#FBBF24', strokeWidth: 2 },
        labelStyle: { fill: '#A0A0A0', fontSize: 11 },
        labelBgStyle: { fill: '#2C2C2C', fillOpacity: 0.9 },
      },
      {
        id: `edge-action-to-overlay-${screen.id}-sheet`,
        source: actionNodeId,
        target: overlayNodeId,
        sourceHandle: actionToOverlay.sourceHandle,
        targetHandle: actionToOverlay.targetHandle,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#FBBF24', strokeWidth: 2 },
        labelStyle: { fill: '#A0A0A0', fontSize: 11 },
        labelBgStyle: { fill: '#2C2C2C', fillOpacity: 0.9 },
      },
    )
  }

  // Prepend entry-point node if flow has entry points or is linked from other flows
  const hasEntryPoints = (flow.entryPoints ?? []).length > 0
  const hasLinkedFrom = getFlowsLinkingTo(flow.id).length > 0
  if (hasEntryPoints || hasLinkedFrom) {
    const entryNodeId = `entry-point-${flow.id}`
    const firstScreenNode = nodes[0]
    const entryY = firstScreenNode ? firstScreenNode.position.y - (NODE_HEIGHT + VERTICAL_GAP) : 0
    const entryNode: FlowGraphNode = {
      id: entryNodeId,
      type: 'entry-point' as const,
      position: { x: 300, y: entryY },
      data: {
        label: 'Entry Points',
        screenId: null,
        nodeType: 'entry-point' as const,
      },
    }
    nodes.unshift(entryNode)

    if (firstScreenNode) {
      const handles = resolveEdgeHandles(entryNode, firstScreenNode)
      edges.unshift({
        id: `edge-entry-to-${firstScreenNode.id}`,
        source: entryNodeId,
        target: firstScreenNode.id,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#F472B6', strokeWidth: 2 },
        labelStyle: { fill: '#A0A0A0', fontSize: 11 },
        labelBgStyle: { fill: '#2C2C2C', fillOpacity: 0.9 },
      })
    }
  }

  return {
    flowId: flow.id,
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  }
}
