import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiLoginBoxLine } from '@remixicon/react'
import type { FlowNodeData } from '../flowGraph.types'

function EntryPointNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const autoEntries = nodeData.autoEntryPoints ?? []
  const linkedFrom = nodeData.linkedFromFlows ?? []
  const manualEntries = nodeData.manualEntryPoints ?? []
  const hasEntries = autoEntries.length > 0 || linkedFrom.length > 0 || manualEntries.length > 0

  return (
    <div
      className={`
        w-[220px] rounded-[var(--token-radius-md)] border-2 overflow-hidden
        transition-colors duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#F472B6] shadow-[0_0_0_2px_rgba(244,114,182,0.3)]'
          : 'border-shell-border'
        }
        bg-shell-surface
      `}
    >
      {/* Source-only handles — entry points are flow origins */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#F472B6] !w-[10px] !h-[10px] !border-2 !border-shell-surface" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#F472B6] !w-[10px] !h-[10px] !border-2 !border-shell-surface" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#F472B6] !w-[10px] !h-[10px] !border-2 !border-shell-surface" />

      {/* Header */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-[#3D1F33]">
        <RiLoginBoxLine size={14} className="text-[#F472B6] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-shell-text truncate flex-1">
          Entry Points
        </span>
      </div>

      {/* Body: pills */}
      <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] flex flex-wrap gap-[var(--token-spacing-1)]">
        {!hasEntries && (
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary italic">
            No entry points defined
          </p>
        )}

        {/* Auto entries from flow.entryPoints */}
        {autoEntries.map((entry) => (
          <span
            key={`auto-${entry}`}
            className="px-[var(--token-spacing-2)] py-[1px] bg-[#F472B6]/15 text-[#F472B6] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
          >
            {entry}
          </span>
        ))}

        {/* Linked-from flows */}
        {linkedFrom.map((f) => (
          <span
            key={`link-${f.id}`}
            className="px-[var(--token-spacing-2)] py-[1px] bg-[#60A5FA]/15 text-[#60A5FA] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
          >
            {f.name}
          </span>
        ))}

        {/* Manual entries */}
        {manualEntries.map((entry) => (
          <span
            key={`manual-${entry}`}
            className="px-[var(--token-spacing-2)] py-[1px] border border-[#F472B6]/40 text-[#F472B6] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
          >
            {entry}
          </span>
        ))}
      </div>
    </div>
  )
}

export default memo(EntryPointNode)
