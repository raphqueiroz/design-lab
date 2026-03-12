import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiStackLine } from '@remixicon/react'
import type { FlowNodeData, OverlayType } from '../flowGraph.types'

const overlayLabels: Record<OverlayType, string> = {
  'bottom-sheet': 'Bottom Sheet',
  modal: 'Modal',
  dialog: 'Dialog',
  popover: 'Popover',
  toast: 'Toast',
}

function OverlayNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const overlayType = nodeData.overlayType ?? 'bottom-sheet'

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#2DD4BF]/60'
          : 'border-white/[0.08]'
        }
        bg-[#1A2A2E]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(45,212,191,0.2), 0 4px 12px rgba(0,0,0,0.4), 3px 3px 0 0 rgba(45,212,191,0.1)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04), 3px 3px 0 0 rgba(45,212,191,0.08)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
      {/* Header bar */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-[#2DD4BF]/[0.06]">
        <RiStackLine size={14} className="text-[#2DD4BF] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate flex-1">
          {nodeData.label}
        </span>
        <span className="text-[length:10px] text-[#2DD4BF]/80 bg-[#2DD4BF]/10 px-[6px] py-[1px] rounded-full shrink-0">
          {overlayLabels[overlayType]}
        </span>
      </div>
      {/* Description */}
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-[#888] line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#2DD4BF] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2A2E]" />
    </div>
  )
}

export default memo(OverlayNode)
