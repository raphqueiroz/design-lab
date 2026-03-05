/**
 * Bidirectional sync between flow graph node labels and screen titles.
 *
 * Canvas → Screen: when a node label changes, update the screen title.
 * Screen → Canvas: when a screen title changes, update the node label.
 */

import { getFlowGraph, saveFlowGraph } from './flowGraphStore'
import { updateScreenInFlow } from './dynamicFlowStore'
import type { FlowNodeData } from './flowGraph.types'

/**
 * Sync a node label change to the corresponding screen title.
 * Called from FlowCanvas when a user edits a node's label.
 * Only works for dynamic flows (static flow titles are code-defined).
 */
export function syncNodeLabelToScreen(
  flowId: string,
  screenId: string,
  newLabel: string,
  isDynamic: boolean,
): void {
  if (isDynamic) {
    updateScreenInFlow(flowId, screenId, { title: newLabel })
  }
}

/**
 * Sync a screen title change to the corresponding node label in the graph.
 * Called from AnnotationsPanel when a user edits a screen's title.
 */
export function syncScreenTitleToNode(
  flowId: string,
  screenId: string,
  newTitle: string,
): void {
  const graph = getFlowGraph(flowId)
  if (!graph) return

  let changed = false
  const updatedNodes = graph.nodes.map((node) => {
    const data = node.data as FlowNodeData
    if (data.screenId === screenId && data.label !== newTitle) {
      changed = true
      return {
        ...node,
        data: { ...data, label: newTitle },
      }
    }
    return node
  })

  if (changed) {
    saveFlowGraph(flowId, updatedNodes, graph.edges)
  }
}
