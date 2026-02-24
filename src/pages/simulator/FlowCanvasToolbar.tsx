import { Monitor, GitBranch, AlertTriangle, RotateCcw } from 'lucide-react'
import type { FlowNodeType } from './flowGraph.types'

interface FlowCanvasToolbarProps {
  onAddNode: (type: FlowNodeType) => void
  onResetToLinear: () => void
}

export default function FlowCanvasToolbar({ onAddNode, onResetToLinear }: FlowCanvasToolbarProps) {
  return (
    <div className="h-[40px] flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
      <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mr-[var(--token-spacing-2)]">
        Add
      </span>
      <button
        type="button"
        onClick={() => onAddNode('screen')}
        className="flex items-center gap-[4px] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-hover hover:text-shell-text transition-colors cursor-pointer"
      >
        <Monitor size={12} />
        Screen
      </button>
      <button
        type="button"
        onClick={() => onAddNode('decision')}
        className="flex items-center gap-[4px] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-hover hover:text-shell-text transition-colors cursor-pointer"
      >
        <GitBranch size={12} />
        Decision
      </button>
      <button
        type="button"
        onClick={() => onAddNode('error')}
        className="flex items-center gap-[4px] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-hover hover:text-shell-text transition-colors cursor-pointer"
      >
        <AlertTriangle size={12} />
        Error
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onResetToLinear}
        className="flex items-center gap-[4px] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-error hover:bg-shell-hover transition-colors cursor-pointer"
      >
        <RotateCcw size={11} />
        Reset to linear
      </button>
    </div>
  )
}
