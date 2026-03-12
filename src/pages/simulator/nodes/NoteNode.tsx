import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { RiStickyNoteLine } from '@remixicon/react'
import type { FlowNodeData } from '../flowGraph.types'

function NoteNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border border-dashed overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#A8A29E]/60'
          : 'border-white/[0.08]'
        }
        bg-[#252525]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(168,162,158,0.15), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-start gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <RiStickyNoteLine size={14} className="text-[#666] shrink-0 mt-[1px]" />
        <div className="flex-1 min-w-0">
          <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#999] truncate block">
            {nodeData.label}
          </span>
          {nodeData.description && (
            <p className="text-[length:var(--token-font-size-caption)] text-[#666] line-clamp-4 mt-[2px]">
              {nodeData.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(NoteNode)
