import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  RiCursorLine,
  RiDragMoveLine,
  RiInputMethodLine,
  RiCollapseVerticalLine,
  RiTapeLine,
} from '@remixicon/react'
import type { FlowNodeData, ActionType } from '../flowGraph.types'

const actionIcons: Record<ActionType, typeof RiCursorLine> = {
  tap: RiCursorLine,
  swipe: RiDragMoveLine,
  input: RiInputMethodLine,
  scroll: RiCollapseVerticalLine,
  'long-press': RiTapeLine,
}

function ActionNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const actionType = nodeData.actionType ?? 'tap'
  const Icon = actionIcons[actionType] ?? RiCursorLine

  return (
    <div
      className={`
        w-[200px] rounded-[var(--token-radius-full)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#A78BFA] shadow-[0_0_0_2px_rgba(167,139,250,0.3)]'
          : 'border-[#78716C]'
        }
        bg-[#2D2640]
      `}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <Icon size={12} className="text-[#A78BFA] shrink-0" />
        <span className="flex-1 min-w-0 text-[length:var(--token-font-size-caption)] text-shell-text-secondary truncate">
          {nodeData.actionTarget && nodeData.label.includes(nodeData.actionTarget) ? (
            <>
              {nodeData.label.slice(0, nodeData.label.indexOf(nodeData.actionTarget))}
              <span className="font-semibold text-shell-text">{nodeData.actionTarget}</span>
            </>
          ) : (
            nodeData.label
          )}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#A78BFA] !w-[10px] !h-[10px] !border-2 !border-[#2D2640]" />
    </div>
  )
}

export default memo(ActionNode)
