import { RiArrowGoBackLine, RiArrowGoForwardLine } from '@remixicon/react'
import type { CreatableNodeType } from './flowGraph.types'
import { NODE_TYPE_CONFIG } from './nodeTypeConfig'

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
        flex items-center justify-center w-[28px] h-[28px] rounded-[6px]
        transition-colors cursor-pointer
        ${disabled
          ? 'text-[#555] cursor-not-allowed'
          : 'text-[#aaa] hover:bg-[#3a3a3a] hover:text-white'
        }
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-[1px] h-[20px] bg-[#444] mx-[4px]" />
}

// Group node types for the toolbar layout
const UI_TYPES: CreatableNodeType[] = ['screen', 'overlay']
const LOGIC_TYPES: CreatableNodeType[] = ['decision', 'error', 'api-call', 'delay']
const META_TYPES: CreatableNodeType[] = ['action', 'flow-reference', 'note', 'entry-point']

const configMap = new Map(NODE_TYPE_CONFIG.map((e) => [e.type, e]))

function NodeTypeButtons({ types, onAddNode }: { types: CreatableNodeType[]; onAddNode: (type: CreatableNodeType) => void }) {
  return (
    <>
      {types.map((type) => {
        const cfg = configMap.get(type)!
        const Icon = cfg.icon
        // Build tooltip with extra context for ambiguous types
        let tooltip = `Add ${cfg.label} (${cfg.shortcut.toUpperCase()})`
        if (type === 'api-call') tooltip += ' — Synchronous request the app makes'
        if (type === 'delay') tooltip += ' — Async wait (webhook, polling, timer)'
        return (
          <ToolbarButton key={type} onClick={() => onAddNode(type)} title={tooltip}>
            <Icon size={16} />
          </ToolbarButton>
        )
      })}
    </>
  )
}

export default function FloatingCanvasToolbar({
  onAddNode,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: FloatingCanvasToolbarProps) {
  return (
    <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-[2px] h-[40px] px-[6px] bg-[#2c2c2c] border border-[#3a3a3a] rounded-[12px] shadow-2xl">
      <NodeTypeButtons types={UI_TYPES} onAddNode={onAddNode} />
      <Divider />
      <NodeTypeButtons types={LOGIC_TYPES} onAddNode={onAddNode} />
      <Divider />
      <NodeTypeButtons types={META_TYPES} onAddNode={onAddNode} />
      <Divider />
      <ToolbarButton onClick={() => onUndo?.()} title="Undo (Ctrl+Z)" disabled={!canUndo}>
        <RiArrowGoBackLine size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onRedo?.()} title="Redo (Ctrl+Y)" disabled={!canRedo}>
        <RiArrowGoForwardLine size={14} />
      </ToolbarButton>
    </div>
  )
}
