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
        w-[200px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#FB923C] shadow-[0_0_0_2px_rgba(251,146,60,0.3)]'
          : 'border-[#78716C]'
        }
        bg-[#3D3020]
      `}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <RiTimerLine size={14} className="text-[#FB923C] shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate block">
            {nodeData.label}
          </span>
          {subtitle && (
            <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary truncate block capitalize">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#FB923C] !w-[10px] !h-[10px] !border-2 !border-[#3D3020]" />
    </div>
  )
}

export default memo(DelayNode)
