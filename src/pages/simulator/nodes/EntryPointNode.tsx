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
        w-[220px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#F472B6]/60'
          : 'border-white/[0.08]'
        }
        bg-[#252525]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(244,114,182,0.2), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Source-only handles — entry points are flow origins */}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#F472B6] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#F472B6] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#F472B6] !w-[8px] !h-[8px] !border-[1.5px] !border-[#252525]" />

      {/* Header */}
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-[#F472B6]/[0.08]">
        <RiLoginBoxLine size={14} className="text-[#F472B6] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate flex-1">
          Entry Points
        </span>
      </div>

      {/* Body: pills */}
      <div className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] flex flex-wrap gap-[var(--token-spacing-1)]">
        {!hasEntries && (
          <p className="text-[length:var(--token-font-size-caption)] text-[#666] italic">
            No entry points defined
          </p>
        )}

        {/* Auto entries from flow.entryPoints */}
        {autoEntries.map((entry) => (
          <span
            key={`auto-${entry}`}
            className="px-[var(--token-spacing-2)] py-[1px] bg-[#F472B6]/10 text-[#F472B6] rounded-full text-[length:var(--token-font-size-caption)]"
          >
            {entry}
          </span>
        ))}

        {/* Linked-from flows */}
        {linkedFrom.map((f) => (
          <span
            key={`link-${f.id}`}
            className="px-[var(--token-spacing-2)] py-[1px] bg-[#60A5FA]/10 text-[#60A5FA] rounded-full text-[length:var(--token-font-size-caption)]"
          >
            <span className="font-mono">{f.id}</span>
          </span>
        ))}

        {/* Manual entries */}
        {manualEntries.map((entry) => (
          <span
            key={`manual-${entry}`}
            className="px-[var(--token-spacing-2)] py-[1px] border border-[#F472B6]/30 text-[#F472B6] rounded-full text-[length:var(--token-font-size-caption)]"
          >
            {entry}
          </span>
        ))}
      </div>
    </div>
  )
}

export default memo(EntryPointNode)
