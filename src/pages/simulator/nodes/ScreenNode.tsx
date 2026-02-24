import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Monitor, Play } from 'lucide-react'
import type { FlowNodeData } from '../flowGraph.types'

function ScreenNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const isPlaceholder = nodeData.screenId === null

  return (
    <div
      className={`
        w-[200px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-shell-selected-text shadow-[0_0_0_2px_rgba(74,222,128,0.3)]'
          : 'border-shell-border'
        }
        ${isPlaceholder ? 'border-dashed' : ''}
        bg-shell-surface
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-shell-selected-text !w-[10px] !h-[10px] !border-2 !border-shell-surface" />
      {/* Header bar */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-shell-hover">
        <Monitor size={14} className="text-shell-selected-text shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate flex-1">
          {nodeData.label}
        </span>
        {nodeData.screenId && (
          <Play size={12} className="text-shell-text-tertiary shrink-0" />
        )}
      </div>
      {/* Description */}
      {nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary line-clamp-2">
            {nodeData.description}
          </p>
        </div>
      )}
      {isPlaceholder && !nodeData.description && (
        <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary italic">
            Placeholder
          </p>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-shell-selected-text !w-[10px] !h-[10px] !border-2 !border-shell-surface" />
    </div>
  )
}

export default memo(ScreenNode)
