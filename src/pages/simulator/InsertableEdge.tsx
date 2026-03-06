import { useState, useCallback, useRef, useEffect } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import {
  RiCursorLine, RiComputerLine, RiGitBranchLine, RiErrorWarningLine,
  RiExternalLinkLine, RiStackLine, RiServerLine, RiTimerLine, RiLoginBoxLine,
} from '@remixicon/react'
import type { CreatableNodeType } from './flowGraph.types'

const nodeTypeOptions: { type: CreatableNodeType; label: string; icon: typeof RiCursorLine; color: string }[] = [
  { type: 'action', label: 'Action', icon: RiCursorLine, color: '#A78BFA' },
  { type: 'screen', label: 'Screen', icon: RiComputerLine, color: '#4ADE80' },
  { type: 'decision', label: 'Decision', icon: RiGitBranchLine, color: '#FBBF24' },
  { type: 'api-call', label: 'API Call', icon: RiServerLine, color: '#22D3EE' },
  { type: 'delay', label: 'Delay', icon: RiTimerLine, color: '#FB923C' },
  { type: 'error', label: 'Error', icon: RiErrorWarningLine, color: '#F87171' },
  { type: 'overlay', label: 'Overlay', icon: RiStackLine, color: '#2DD4BF' },
  { type: 'flow-reference', label: 'Flow Ref', icon: RiExternalLinkLine, color: '#60A5FA' },
  { type: 'entry-point', label: 'Entry Point', icon: RiLoginBoxLine, color: '#F472B6' },
]

interface InsertableEdgeData {
  onInsertNode?: (edgeId: string, nodeType: CreatableNodeType, position: { x: number; y: number }) => void
  onEdgeLabelChange?: (edgeId: string, label: string) => void
  isDecisionEdge?: boolean
  [key: string]: unknown
}

export default function InsertableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const edgeData = data as InsertableEdgeData | undefined
  const isDecisionEdge = edgeData?.isDecisionEdge ?? false

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2

  const handleInsert = useCallback(
    (nodeType: FlowNodeType) => {
      edgeData?.onInsertNode?.(id, nodeType, { x: midX - 100, y: midY - 30 })
      setMenuOpen(false)
      setHovered(false)
    },
    [id, edgeData, midX, midY],
  )

  const handleLabelClick = useCallback(() => {
    setDraft(typeof label === 'string' ? label : '')
    setEditing(true)
  }, [label])

  const handleLabelSave = useCallback(() => {
    edgeData?.onEdgeLabelChange?.(id, draft.trim())
    setEditing(false)
  }, [id, edgeData, draft])

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Close label editor on outside click
  useEffect(() => {
    if (!editing) return
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as HTMLElement)) {
        handleLabelSave()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [editing, handleLabelSave])

  const showButton = hovered || menuOpen

  return (
    <>
      {/* Render base edge — hide built-in label for decision edges (we render our own) */}
      <BaseEdge
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        label={isDecisionEdge ? undefined : label}
        labelX={labelX}
        labelY={labelY}
        labelStyle={labelStyle}
        labelBgStyle={labelBgStyle}
        labelBgPadding={[4, 6]}
        labelBgBorderRadius={4}
      />
      {/* Invisible wider hit area for hover */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { if (!menuOpen) setHovered(false) }}
        style={{ cursor: 'default' }}
      />

      {/* Decision edge: clickable label / inline editor */}
      {isDecisionEdge && !editing && label && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 12}
          width={80}
          height={24}
          className="overflow-visible pointer-events-auto"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleLabelClick() }}
            className="px-[6px] py-[2px] rounded-[4px] text-[11px] font-semibold cursor-pointer transition-colors whitespace-nowrap"
            style={{
              color: '#FBBF24',
              backgroundColor: 'rgba(44, 44, 44, 0.9)',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#FBBF24') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'transparent') }}
          >
            {label}
          </button>
        </foreignObject>
      )}
      {/* Decision edge with no label: show + on hover to add one */}
      {isDecisionEdge && !editing && !label && hovered && (
        <foreignObject
          x={labelX - 10}
          y={labelY - 10}
          width={20}
          height={20}
          className="overflow-visible pointer-events-auto"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleLabelClick() }}
            onMouseEnter={() => setHovered(true)}
            className="w-[20px] h-[20px] flex items-center justify-center rounded-full cursor-pointer text-[12px] font-bold leading-none transition-colors"
            style={{
              color: '#FBBF24',
              backgroundColor: 'rgba(44, 44, 44, 0.9)',
              border: '1px solid #FBBF24',
            }}
          >
            +
          </button>
        </foreignObject>
      )}

      {/* Decision edge: inline input */}
      {isDecisionEdge && editing && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 13}
          width={100}
          height={26}
          className="overflow-visible pointer-events-auto"
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') handleLabelSave()
              if (e.key === 'Escape') setEditing(false)
            }}
            placeholder="condition"
            className="w-full px-[6px] py-[2px] text-[11px] font-semibold text-[#FBBF24] rounded-[4px] outline-none"
            style={{
              backgroundColor: '#2C2C2C',
              border: '1px solid #FBBF24',
              caretColor: '#FBBF24',
            }}
          />
        </foreignObject>
      )}

      {/* Non-decision edges: + insert button */}
      {!isDecisionEdge && showButton && (
        <foreignObject
          x={midX - 12}
          y={midY - 12}
          width={24}
          height={24}
          className="overflow-visible pointer-events-auto"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            onMouseEnter={() => setHovered(true)}
            className="w-[24px] h-[24px] flex items-center justify-center rounded-full bg-shell-surface border-2 border-shell-selected-text text-shell-selected-text hover:bg-shell-selected-text hover:text-shell-bg transition-colors cursor-pointer text-[14px] font-bold leading-none"
          >
            +
          </button>
        </foreignObject>
      )}
      {!isDecisionEdge && menuOpen && (
        <foreignObject
          x={midX - 72}
          y={midY + 16}
          width={144}
          height={nodeTypeOptions.length * 30 + 8}
          className="overflow-visible pointer-events-auto"
        >
          <div
            ref={menuRef}
            className="bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] shadow-lg py-[var(--token-spacing-1)] overflow-hidden"
            onMouseLeave={() => { setMenuOpen(false); setHovered(false) }}
          >
            {nodeTypeOptions.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={(e) => { e.stopPropagation(); handleInsert(opt.type) }}
                className="w-full flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-shell-text hover:bg-shell-hover transition-colors cursor-pointer"
              >
                <opt.icon size={12} style={{ color: opt.color }} className="shrink-0" />
                {opt.label}
              </button>
            ))}
          </div>
        </foreignObject>
      )}
    </>
  )
}
