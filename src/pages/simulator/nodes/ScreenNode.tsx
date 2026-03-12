import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiComputerLine, RiPlayLine } from '@remixicon/react'
import type { FlowNodeData } from '../flowGraph.types'

function ScreenNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const isPlaceholder = nodeData.screenId === null

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#4ADE80]/60'
          : 'border-white/[0.08]'
        }
        ${isPlaceholder ? 'border-dashed' : ''}
        bg-[#252525]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(74,222,128,0.2), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      {/* Header bar */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-white/[0.04]">
        <RiComputerLine size={14} className="text-[#4ADE80] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate flex-1">
          {nodeData.label}
        </span>
        {nodeData.screenId && (
          <RiPlayLine size={12} className="text-[#666] shrink-0" />
        )}
      </div>
      {/* Description */}
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-[#888] line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      {isPlaceholder && !nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-[#666] italic">
            Placeholder
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#4ADE80] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
    </div>
  )
}

export default memo(ScreenNode)
