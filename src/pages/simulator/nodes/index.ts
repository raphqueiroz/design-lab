import type { NodeTypes } from '@xyflow/react'
import ScreenNode from './ScreenNode'
import DecisionNode from './DecisionNode'
import ErrorNode from './ErrorNode'
import FlowReferenceNode from './FlowReferenceNode'
import ActionNode from './ActionNode'
import OverlayNode from './OverlayNode'
import ApiCallNode from './ApiCallNode'
import DelayNode from './DelayNode'
import NoteNode from './NoteNode'
import EntryPointNode from './EntryPointNode'

export const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  page: ScreenNode,
  decision: DecisionNode,
  error: ErrorNode,
  'flow-reference': FlowReferenceNode,
  action: ActionNode,
  overlay: OverlayNode,
  'api-call': ApiCallNode,
  delay: DelayNode,
  note: NoteNode,
  'entry-point': EntryPointNode,
}
