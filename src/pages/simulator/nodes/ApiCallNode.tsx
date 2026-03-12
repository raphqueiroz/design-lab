import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { RiServerLine } from '@remixicon/react'
import type { FlowNodeData, ApiMethod } from '../flowGraph.types'

const methodColors: Record<ApiMethod, string> = {
  GET: 'bg-[#4ADE80]/20 text-[#4ADE80]',
  POST: 'bg-[#22D3EE]/20 text-[#22D3EE]',
  PUT: 'bg-[#FBBF24]/20 text-[#FBBF24]',
  DELETE: 'bg-[#F87171]/20 text-[#F87171]',
}

function ApiCallNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const method = nodeData.apiMethod ?? 'GET'

  return (
    <div
      className={`
        w-[200px] rounded-[12px] border overflow-hidden
        transition-all duration-[var(--token-transition-fast)]
        ${selected
          ? 'border-[#22D3EE]/60'
          : 'border-white/[0.08]'
        }
        bg-[#1A2E38]
      `}
      style={{
        boxShadow: selected
          ? '0 0 0 1px rgba(34,211,238,0.2), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
      <Handle type="target" position={Position.Left} id="left-target" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
      <Handle type="source" position={Position.Left} id="left-source" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
      <Handle type="target" position={Position.Right} id="right-target" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
      <Handle type="source" position={Position.Right} id="right-source" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
      <div className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)]">
        <RiServerLine size={14} className="text-[#22D3EE] shrink-0" />
        <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-[#e0e0e0] truncate">
          {nodeData.label}
        </span>
      </div>
      {(nodeData.apiEndpoint || nodeData.apiMethod) && (
        <div className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-3)] pb-[var(--token-spacing-2)]">
          <span className={`text-[length:10px] font-bold px-[5px] py-[1px] rounded-[4px] leading-tight ${methodColors[method]}`}>
            {method}
          </span>
          {nodeData.apiEndpoint && (
            <span className="text-[length:var(--token-font-size-caption)] text-[#888] truncate">
              {nodeData.apiEndpoint}
            </span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-[#22D3EE] !w-[8px] !h-[8px] !border-[1.5px] !border-[#1A2E38]" />
    </div>
  )
}

export default memo(ApiCallNode)
