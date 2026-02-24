import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { AlertTriangle } from 'lucide-react'
import type { FlowNodeData } from '../flowGraph.types'

function ErrorNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData

  return (
    <div
      className={`
        w-[180px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#F87171] shadow-[0_0_0_2px_rgba(248,113,113,0.3)]'
          : 'border-[#7F1D1D]'
        }
        bg-[#3D2626]
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#F87171] !w-[10px] !h-[10px] !border-2 !border-[#3D2626]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <AlertTriangle size={14} className="text-[#F87171] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate">
          {nodeData.label}
        </span>
      </div>
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] border-t border-[#7F1D1D]/30">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#F87171] !w-[10px] !h-[10px] !border-2 !border-[#3D2626]" />
    </div>
  )
}

export default memo(ErrorNode)
