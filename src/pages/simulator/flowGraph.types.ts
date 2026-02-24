import type { Node, Edge } from '@xyflow/react'

/** The three supported node types on the flow canvas */
export type FlowNodeType = 'screen' | 'decision' | 'error'

/**
 * Data payload stored inside each React Flow Node.
 * This is the `data` field of Node<FlowNodeData>.
 */
export interface FlowNodeData extends Record<string, unknown> {
  /** Human-readable label shown on the node */
  label: string
  /** Maps to a screen id in the flow's screens[] array, or null for placeholder/decision nodes */
  screenId: string | null
  /** Node type determines visual rendering */
  nodeType: FlowNodeType
  /** Optional description for planning notes */
  description?: string
}

/** Typed React Flow node using our custom data */
export type FlowGraphNode = Node<FlowNodeData>

/**
 * Edge with a label for branching (e.g., "success", "error", "back").
 * Uses the standard React Flow Edge type directly — the `label` field is built in.
 */
export type FlowGraphEdge = Edge

/**
 * Complete serializable graph for a single flow.
 * This is what gets persisted to localStorage / Supabase.
 */
export interface FlowGraph {
  flowId: string
  nodes: Node[]
  edges: Edge[]
  updatedAt: string
}
