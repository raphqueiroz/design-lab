import type { NodeTypes } from '@xyflow/react'
import ScreenNode from './ScreenNode'
import DecisionNode from './DecisionNode'
import ErrorNode from './ErrorNode'

export const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  decision: DecisionNode,
  error: ErrorNode,
}
