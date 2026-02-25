import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { FileText, GitBranch } from 'lucide-react'
import type { PageNodeData } from '../pageGallery.types'

function PageCardNode({ data, selected }: NodeProps) {
  const nodeData = data as PageNodeData

  return (
    <div
      className={`
        w-[220px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-shell-selected-text shadow-[0_0_0_2px_rgba(74,222,128,0.3)]'
          : 'border-shell-border'
        }
        bg-shell-surface
      `}
    >
      {/* Header bar */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-shell-hover">
        <FileText size={14} className="text-shell-selected-text shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate flex-1">
          {nodeData.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] flex flex-col gap-[var(--token-spacing-1)]">
        {nodeData.description && (
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary line-clamp-2">
            {nodeData.description}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center gap-[var(--token-spacing-2)] mt-[var(--token-spacing-1)]">
          <span className="px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary">
            {nodeData.area}
          </span>
          {nodeData.flowCount > 0 && (
            <span className="flex items-center gap-[2px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">
              <GitBranch size={10} />
              {nodeData.flowCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(PageCardNode)
