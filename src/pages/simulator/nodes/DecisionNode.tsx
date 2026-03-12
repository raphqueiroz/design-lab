import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiGitBranchLine } from '@remixicon/react'
import type { FlowNodeData } from '../flowGraph.types'

function DecisionNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#FBBF24]/60'
          : 'border-white/[0.08]'
        }
        bg-[#302A1E]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(251,191,36,0.2), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <RiGitBranchLine size={14} className="text-[#FBBF24] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate">
          {nodeData.label}
        </span>
      </div>
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] border-t border-white/[0.06]">
          <p className="text-[length:var(--token-font-size-caption)] text-[#888] line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#FBBF24] !w-[8px] !h-[8px] !border-[1.5px] !border-[#302A1E]" />
    </div>
  )
}

export default memo(DecisionNode)
