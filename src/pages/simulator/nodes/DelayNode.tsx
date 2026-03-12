import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiTimerLine } from '@remixicon/react'
import type { FlowNodeData } from '../flowGraph.types'

function DelayNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const subtitle = [nodeData.delayType, nodeData.delayDuration].filter(Boolean).join(' · ')

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#FB923C]/60'
          : 'border-white/[0.08]'
        }
        bg-[#302518]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(251,146,60,0.2), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <RiTimerLine size={14} className="text-[#FB923C] shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate block">
            {nodeData.label}
          </span>
          {subtitle && (
            <span className="text-[length:var(--token-font-size-caption)] text-[#888] truncate block capitalize">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#FB923C] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302518]" />
    </div>
  )
}

export default memo(DelayNode)
