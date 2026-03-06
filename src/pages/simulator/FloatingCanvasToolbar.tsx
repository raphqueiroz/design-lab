import { RiComputerLine, RiGitBranchLine, RiErrorWarningLine, RiExternalLinkLine, RiCursorLine, RiStackLine, RiArrowGoBackLine, RiArrowGoForwardLine, RiServerLine, RiTimerLine, RiStickyNoteLine, RiLoginBoxLine } from '@remixicon/react'
import type { CreatableNodeType } from './flowGraph.types'

interface FloatingCanvasToolbarProps {
  onAddNode: (type: CreatableNodeType) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

function ToolbarButton({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        flex items-center justify-center w-[32px] h-[32px] rounded-[var(--token-radius-sm)]
        transition-colors cursor-pointer
        ${disabled
          ? 'text-shell-text-tertiary/40 cursor-not-allowed'
          : 'text-shell-text-secondary hover:bg-shell-hover hover:text-shell-text'
        }
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-[1px] h-[20px] bg-shell-border mx-[2px]" />
}

export default function FloatingCanvasToolbar({
  onAddNode,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: FloatingCanvasToolbarProps) {
  return (
    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-[2px] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] bg-shell-surface border border-shell-border rounded-[var(--token-radius-full)] shadow-lg">
      {/* UI nodes */}
      <ToolbarButton onClick={() => onAddNode('screen')} title="Add Screen (S)">
        <RiComputerLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('overlay')} title="Add Overlay (O)">
        <RiStackLine size={14} />
      </ToolbarButton>

      <Divider />

      {/* Logic nodes */}
      <ToolbarButton onClick={() => onAddNode('decision')} title="Add Decision (D)">
        <RiGitBranchLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('error')} title="Add Error State (E)">
        <RiErrorWarningLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('api-call')} title="Add API Call (C) — Synchronous request the app makes">
        <RiServerLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('delay')} title="Add Delay (W) — Async wait (webhook, polling, timer)">
        <RiTimerLine size={14} />
      </ToolbarButton>

      <Divider />

      {/* Meta nodes */}
      <ToolbarButton onClick={() => onAddNode('action')} title="Add Action (A)">
        <RiCursorLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('flow-reference')} title="Add Flow Reference (F)">
        <RiExternalLinkLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('note')} title="Add Note (N)">
        <RiStickyNoteLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAddNode('entry-point')} title="Add Entry Point (P)">
        <RiLoginBoxLine size={14} />
      </ToolbarButton>

      <Divider />

      {/* Undo / Redo */}
      <ToolbarButton onClick={() => onUndo?.()} title="Undo (Ctrl+Z)" disabled={!canUndo}>
        <RiArrowGoBackLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onRedo?.()} title="Redo (Ctrl+Y)" disabled={!canRedo}>
        <RiArrowGoForwardLine size={14} />
      </ToolbarButton>
    </div>
  )
}
