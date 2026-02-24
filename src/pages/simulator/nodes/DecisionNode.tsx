import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import type { FlowNodeData } from '../flowGraph.types'

function DecisionNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData

  return (
    <div
      className={`
        w-[160px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#FBBF24] shadow-[0_0_0_2px_rgba(251,191,36,0.3)]'
          : 'border-[#78716C]'
        }
        bg-[#3D3526]
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#FBBF24] !w-[10px] !h-[10px] !border-2 !border-[#3D3526]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <GitBranch size={14} className="text-[#FBBF24] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate">
          {nodeData.label}
        </span>
      </div>
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] border-t border-[#78716C]/30">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="default" className="!bg-[#FBBF24] !w-[10px] !h-[10px] !border-2 !border-[#3D3526]" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-[#FBBF24] !w-[10px] !h-[10px] !border-2 !border-[#3D3526]" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-[#FBBF24] !w-[10px] !h-[10px] !border-2 !border-[#3D3526]" />
    </div>
  )
}

export default memo(DecisionNode)
