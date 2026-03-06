import type { Node, Edge } from '@xyflow/react'

/** The supported node types on the flow canvas */
export type FlowNodeType = 'screen' | 'page' | 'decision' | 'error' | 'flow-reference' | 'action' | 'overlay' | 'api-call' | 'delay' | 'note' | 'entry-point'

/** Node types that can be created by the user. Excludes legacy 'page' (alias for 'screen'). */
export type CreatableNodeType = Exclude<FlowNodeType, 'page'>

/** Action types for action nodes */
export type ActionType = 'tap' | 'swipe' | 'input' | 'scroll' | 'long-press'

/** Overlay types for overlay nodes */
export type OverlayType = 'bottom-sheet' | 'modal' | 'dialog' | 'popover' | 'toast'

/** HTTP methods for API call nodes */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** Delay/wait types for delay nodes */
export type DelayType = 'timer' | 'polling' | 'webhook' | 'event'

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
  /** For flow-reference nodes: the target flow ID to navigate to */
  targetFlowId?: string
  /** For action nodes: what kind of user action */
  actionType?: ActionType
  /** For action nodes: the target element (e.g. "Confirm Button", "Amount Field") */
  actionTarget?: string
  /** For overlay nodes: the type of overlay */
  overlayType?: OverlayType
  /** For overlay nodes: which screen node this overlay belongs to */
  parentScreenNodeId?: string
  /** For page/screen nodes: reference to a Page entity in the page registry */
  pageId?: string
  /** For page nodes: which state is currently active */
  activeStateId?: string
  /** For api-call nodes: HTTP method */
  apiMethod?: ApiMethod
  /** For api-call nodes: the endpoint path */
  apiEndpoint?: string
  /** For delay nodes: the type of wait */
  delayType?: DelayType
  /** For delay nodes: estimated duration (e.g. "~30s", "5min") */
  delayDuration?: string
  /** For action nodes: whether the user manually edited the auto-generated label */
  labelManuallyEdited?: boolean
  /** For overlay nodes: interactive elements inside this overlay */
  interactiveElements?: { id: string; component: string; label: string }[]
  /** For entry-point nodes: manually added entry labels */
  manualEntryPoints?: string[]
  /** For entry-point nodes: auto-computed entry point labels (injected at render time) */
  autoEntryPoints?: string[]
  /** For entry-point nodes: auto-computed linked-from flows (injected at render time) */
  linkedFromFlows?: { id: string; name: string }[]
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
  /** Code-defined version — when bumped, bootstrapFlowGraph overwrites localStorage */
  graphVersion?: number
}
