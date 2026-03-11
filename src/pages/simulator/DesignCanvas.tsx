/**
 * DesignCanvas — Infinite canvas rendering ALL screens in a flow side by side.
 *
 * Pan/zoom like Figma/Framer. Components render inline (not iframe) so
 * Cursor's browser inspector can edit TSX directly.
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  RiCursorFill, RiDragMoveFill, RiChat3Line,
  RiSmartphoneLine, RiExpandUpDownLine,
  RiAddLine, RiSubtractLine, RiDeleteBinLine,
  RiFileCopyLine, RiCheckLine,
} from '@remixicon/react'
import { getFlowGraph } from './flowGraphStore'
import { deriveNavigationPath } from './flowGraphNavigation'
import type { FlowNodeData } from './flowGraph.types'
import type { Flow, FlowScreen } from './flowRegistry'
import { getFlow } from './flowRegistry'
import { updateScreenInFlow } from './dynamicFlowStore'
import { syncScreenTitleToNode } from './flowGraphSync'
import { ScreenDataProvider } from '../../lib/ScreenDataContext'
import { LayoutProvider } from '../../library/layout/LayoutProvider'
import AppShell from '../../library/layout/AppShell'
import {
  type CanvasComment,
  getComments,
  addComment,
  deleteComment,
  updateCommentText,
} from './canvasCommentStore'

type FrameMode = 'device' | 'full-height'
type CanvasTool = 'select' | 'pan' | 'comment'

interface DesignCanvasProps {
  flow: Flow
  initialScreenId?: string | null
}

/** Resolve default state data for a screen */
function getDefaultStateData(
  screen: FlowScreen,
  graphNodes: { id: string; data: unknown }[],
  nodeId?: string,
): Record<string, unknown> {
  const nodeData = nodeId
    ? graphNodes.find(n => n.id === nodeId)?.data as FlowNodeData | undefined
    : undefined
  const stateId = nodeData?.activeStateId as string | undefined
  const state = screen.states?.find(s => s.id === stateId)
    ?? screen.states?.find(s => s.isDefault)
  return state?.data ?? {}
}

const ZOOM_MIN = 0.1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.1

export default function DesignCanvas({ flow }: DesignCanvasProps) {
  const [frameMode, setFrameMode] = useState<FrameMode>('device')
  const [tool, setTool] = useState<CanvasTool>('select')

  // Pan/zoom state
  const [pan, setPan] = useState({ x: 48, y: 48 })
  const [zoom, setZoom] = useState(0.85)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Screen title editing
  const [, setEditVersion] = useState(0)

  const handleScreenTitleUpdate = useCallback((screenId: string, title: string) => {
    updateScreenInFlow(flow.id, screenId, { title })
    syncScreenTitleToNode(flow.id, screenId, title)
    const f = getFlow(flow.id)
    if (f) {
      const screen = f.screens.find(s => s.id === screenId)
      if (screen) (screen as { title: string }).title = title
    }
    setEditVersion((v) => v + 1)
  }, [flow.id])

  // Comments state
  const [comments, setComments] = useState<CanvasComment[]>([])
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)
  const [draftPin, setDraftPin] = useState<{ x: number; y: number } | null>(null)

  const graph = useMemo(() => {
    const stored = getFlowGraph(flow.id)
    return stored ? { nodes: stored.nodes, edges: stored.edges } : null
  }, [flow.id])

  const navPath = useMemo(() => {
    if (!graph) return []
    return deriveNavigationPath(graph.nodes, graph.edges)
  }, [graph])

  type ScreenFrame = { screen: FlowScreen; nodeId: string; stateId?: string; stateName?: string }
  type ScreenGroup = { screenId: string; frames: ScreenFrame[] }

  const screenGroups = useMemo(() => {
    const seen = new Set<string>()
    const groups: ScreenGroup[] = []

    const addScreenWithStates = (screen: FlowScreen, nodeId: string) => {
      const states = screen.states
      const frames: ScreenFrame[] = []
      if (states && states.length > 1) {
        for (const state of states) {
          frames.push({ screen, nodeId, stateId: state.id, stateName: state.name })
        }
      } else {
        frames.push({ screen, nodeId })
      }
      groups.push({ screenId: screen.id, frames })
    }

    for (const step of navPath) {
      if (seen.has(step.screenId)) continue
      seen.add(step.screenId)
      const screen = flow.screens.find(s => s.id === step.screenId)
      if (screen) addScreenWithStates(screen, step.nodeId)
    }
    for (const screen of flow.screens) {
      if (!seen.has(screen.id)) {
        addScreenWithStates(screen, '')
      }
    }
    return groups
  }, [navPath, flow.screens])

  // Load comments when flow changes
  useEffect(() => {
    setPan({ x: 48, y: 48 })
    setZoom(0.85)
    setComments(getComments(flow.id))
    setActiveCommentId(null)
    setDraftPin(null)
  }, [flow.id])

  // Wheel handler — zoom only with ctrl/meta (no scroll-to-pan, it conflicts with screen content scroll)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      // Zoom toward cursor
      const rect = canvasRef.current!.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top

      setZoom(prev => {
        const delta = -e.deltaY * 0.005
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta))
        const scale = next / prev
        setPan(p => ({
          x: cursorX - (cursorX - p.x) * scale,
          y: cursorY - (cursorY - p.y) * scale,
        }))
        return next
      })
    }
  }, [])

  // Mouse drag to pan (when pan tool or middle-click or space+drag)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Pan on middle click, or when pan tool selected, or space held
    if (e.button === 1 || tool === 'pan') {
      e.preventDefault()
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
    }
  }, [tool, pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    })
  }, [isPanning])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Click handler for placing comment pins
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (tool !== 'comment') return
    // Don't place pins when clicking on existing pins or popovers
    if ((e.target as HTMLElement).closest('[data-comment-pin]')) return

    const rect = canvasRef.current!.getBoundingClientRect()
    const canvasX = (e.clientX - rect.left - pan.x) / zoom
    const canvasY = (e.clientY - rect.top - pan.y) / zoom

    setDraftPin({ x: canvasX, y: canvasY })
    setActiveCommentId(null)
  }, [tool, pan, zoom])

  const handleDraftSubmit = useCallback((text: string) => {
    if (!draftPin || !text.trim()) {
      setDraftPin(null)
      return
    }
    const comment: CanvasComment = {
      id: crypto.randomUUID(),
      flowId: flow.id,
      x: draftPin.x,
      y: draftPin.y,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    addComment(comment)
    setComments(prev => [...prev, comment])
    setDraftPin(null)
  }, [draftPin, flow.id])

  const handleDeleteComment = useCallback((commentId: string) => {
    deleteComment(flow.id, commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
    setActiveCommentId(null)
  }, [flow.id])

  const handleEditComment = useCallback((commentId: string, text: string) => {
    updateCommentText(flow.id, commentId, text)
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, text } : c))
  }, [flow.id])

  // Keyboard shortcuts
  useEffect(() => {
    let prevTool: CanvasTool | null = null
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in a textarea
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return

      if (e.code === 'Space' && !e.repeat && tool !== 'pan') {
        prevTool = tool
        setTool('pan')
      }
      if (e.code === 'Digit0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setZoom(1)
      }
      if (e.code === 'KeyC' && !e.metaKey && !e.ctrlKey && document.activeElement === document.body) {
        setTool('comment')
      }
      if (e.code === 'KeyV' && !e.metaKey && !e.ctrlKey && document.activeElement === document.body) {
        setTool('select')
      }
      if (e.code === 'KeyH' && !e.metaKey && !e.ctrlKey && document.activeElement === document.body) {
        setTool('pan')
      }
      if (e.code === 'Escape') {
        setDraftPin(null)
        setActiveCommentId(null)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && prevTool) {
        setTool(prevTool)
        prevTool = null
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [tool])

  const zoomIn = useCallback(() => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP)), [])
  const zoomToFit = useCallback(() => {
    setZoom(0.85)
    setPan({ x: 48, y: 48 })
  }, [])

  const isDevice = frameMode === 'device'
  const zoomPercent = Math.round(zoom * 100)

  const cursorClass = tool === 'pan'
    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab')
    : tool === 'comment' ? 'cursor-crosshair' : 'cursor-default'

  if (screenGroups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        No screens in this flow
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Safe area simulation */}
      <style>{`
        :root {
          --safe-area-top: 54px;
          --safe-area-bottom: 34px;
        }
      `}</style>

      {/* Bottom toolbars — Figma style */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-[8px]">
        {/* Main toolbar */}
        <div className="flex items-center gap-[2px] h-[40px] px-[6px] bg-[#2c2c2c] border border-[#3a3a3a] rounded-[12px] shadow-2xl">
          <ToolbarBtn
            active={tool === 'select'}
            onClick={() => setTool('select')}
            title="Select (V)"
          >
            <RiCursorFill size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            active={tool === 'pan'}
            onClick={() => setTool('pan')}
            title="Pan (H / Space)"
          >
            <RiDragMoveFill size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            active={tool === 'comment'}
            onClick={() => setTool('comment')}
            title="Comment (C)"
          >
            <RiChat3Line size={16} />
          </ToolbarBtn>

          <div className="w-[1px] h-[20px] bg-[#444] mx-[4px]" />

          {/* Zoom controls */}
          <ToolbarBtn onClick={zoomOut} title="Zoom out">
            <RiSubtractLine size={14} />
          </ToolbarBtn>
          <button
            type="button"
            onClick={zoomToFit}
            title="Reset zoom"
            className="px-[6px] h-[28px] text-[12px] font-medium text-[#aaa] hover:text-white transition-colors cursor-pointer rounded-[6px] hover:bg-[#3a3a3a] min-w-[44px] text-center"
          >
            {zoomPercent}%
          </button>
          <ToolbarBtn onClick={zoomIn} title="Zoom in">
            <RiAddLine size={14} />
          </ToolbarBtn>
        </div>

        {/* Frame mode toolbar */}
        <div className="flex items-center gap-[2px] h-[40px] px-[6px] bg-[#2c2c2c] border border-[#3a3a3a] rounded-[12px] shadow-2xl">
          <ToolbarBtn
            active={isDevice}
            onClick={() => setFrameMode('device')}
            title="Device frame"
          >
            <RiSmartphoneLine size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            active={!isDevice}
            onClick={() => setFrameMode('full-height')}
            title="Full"
          >
            <RiExpandUpDownLine size={16} />
          </ToolbarBtn>
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className={`flex-1 overflow-hidden ${cursorClass}`}
        style={{
          backgroundColor: '#1a1a1a',
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="flex items-start gap-[80px] min-w-min">
            {screenGroups.map((group, groupIndex) => (
              <div key={group.screenId} className="flex items-start gap-[28px] shrink-0">
                {group.frames.map(({ screen, nodeId, stateId, stateName }) => {
                  let stateData: Record<string, unknown>
                  if (stateId) {
                    const state = screen.states?.find(s => s.id === stateId)
                    stateData = state?.data ?? {}
                  } else {
                    stateData = graph ? getDefaultStateData(screen, graph.nodes, nodeId) : {}
                  }
                  const ScreenComponent = screen.component
                  const frameKey = stateId ? `${screen.id}-${stateId}` : screen.id

                  return (
                    <div key={frameKey} className="flex flex-col items-center gap-3 shrink-0">
                      {/* Screen label */}
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-shell-text-tertiary">
                            {groupIndex + 1}
                          </span>
                          <EditableScreenLabel
                            value={screen.title}
                            onSave={(title) => handleScreenTitleUpdate(screen.id, title)}
                          />
                          <CopySlugButton screenId={screen.id} stateName={stateName} />
                        </div>
                        {stateName && (
                          <span className="text-[13px] text-shell-text-tertiary">
                            {stateName}
                          </span>
                        )}
                      </div>

                      {/* Phone artboard */}
                      <div
                        className={`w-[390px] bg-[var(--color-surface-primary)] text-[var(--color-content-primary)] shadow-2xl relative flex flex-col ${
                          isDevice
                            ? 'h-[844px] rounded-[32px] overflow-hidden'
                            : 'min-h-[840px] rounded-[32px] overflow-hidden'
                        }`}
                      >
                        <LayoutProvider level={1} breadcrumbs={[]} isDesktop={false}>
                          <AppShell>
                            <ScreenDataProvider data={stateData}>
                              <ScreenComponent
                                onNext={() => {}}
                                onBack={() => {}}
                                onElementTap={() => false}
                                screenTitle={screen.title}
                                screenDescription={screen.description}
                              />
                            </ScreenDataProvider>
                          </AppShell>
                        </LayoutProvider>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Comment pins */}
          {comments.map((comment, i) => (
            <div
              key={comment.id}
              data-comment-pin
              className="absolute"
              style={{ left: comment.x, top: comment.y }}
            >
              <CommentPin
                number={i + 1}
                isActive={activeCommentId === comment.id}
                onClick={() => setActiveCommentId(
                  activeCommentId === comment.id ? null : comment.id
                )}
              />
              {activeCommentId === comment.id && (
                <CommentPopover
                  comment={comment}
                  zoom={zoom}
                  onEdit={(text) => handleEditComment(comment.id, text)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onClose={() => setActiveCommentId(null)}
                />
              )}
            </div>
          ))}

          {/* Draft pin (placing a new comment) */}
          {draftPin && (
            <div
              data-comment-pin
              className="absolute"
              style={{ left: draftPin.x, top: draftPin.y }}
            >
              <CommentPin number={comments.length + 1} isActive />
              <DraftCommentInput
                zoom={zoom}
                onSubmit={handleDraftSubmit}
                onCancel={() => setDraftPin(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Copy screen slug + state to clipboard */
function CopySlugButton({ screenId, stateName }: { screenId: string; stateName?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const text = stateName ? `${screenId} / ${stateName}` : screenId
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [screenId, stateName])

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy: ${screenId}${stateName ? ` / ${stateName}` : ''}`}
      className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] text-shell-text-tertiary hover:text-shell-text hover:bg-[#333] transition-colors cursor-pointer shrink-0"
    >
      {copied
        ? <RiCheckLine size={12} className="text-[#6EE7A0]" />
        : <RiFileCopyLine size={12} />
      }
    </button>
  )
}

/** Editable screen title above each artboard */
function EditableScreenLabel({
  value,
  onSave,
}: {
  value: string
  onSave: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleStart = () => {
    setDraft(value)
    setEditing(true)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave() }
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        autoFocus
        className="text-[14px] font-medium text-shell-text bg-[#2c2c2c] border border-[#555] rounded-[4px] px-[6px] py-[1px] outline-none max-w-[240px] text-center"
      />
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleStart}
      onKeyDown={(e) => { if (e.key === 'Enter') handleStart() }}
      title="Click to edit page name"
      className="text-[14px] font-medium text-shell-text-secondary max-w-[240px] truncate cursor-pointer hover:text-shell-text transition-colors px-[4px] py-[1px] rounded-[4px] hover:bg-[#333]"
    >
      {value}
    </span>
  )
}

/** Numbered pin marker */
function CommentPin({
  number,
  isActive,
  onClick,
}: {
  number: number
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      data-comment-pin
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      className={`
        flex items-center justify-center
        w-[24px] h-[24px] rounded-full
        text-[11px] font-bold text-white
        shadow-lg cursor-pointer
        transition-transform hover:scale-110
        -translate-x-1/2 -translate-y-1/2
        ${isActive ? 'bg-[#4a90d9] scale-110' : 'bg-[#e74c3c]'}
      `}
    >
      {number}
    </button>
  )
}

/** Popover showing an existing comment with edit support */
function CommentPopover({
  comment,
  zoom,
  onEdit,
  onDelete,
  onClose,
}: {
  comment: CanvasComment
  zoom: number
  onEdit: (text: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)
        && !(e.target as HTMLElement).closest('[data-comment-pin]')) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  const handleSaveEdit = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== comment.text) {
      onEdit(trimmed)
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      setEditText(comment.text)
      setIsEditing(false)
    }
  }

  const date = new Date(comment.createdAt)
  const timeStr = date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      ref={ref}
      data-comment-pin
      className="absolute left-[16px] top-[4px] z-50 w-[240px] bg-shell-surface border border-shell-border rounded-[8px] shadow-2xl overflow-hidden"
      style={{
        transform: `scale(${1 / zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <div className="p-[12px] flex flex-col gap-[8px]">
        {isEditing ? (
          <>
            <textarea
              ref={textareaRef}
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full resize-none bg-transparent text-[13px] text-shell-text outline-none leading-[1.4] border border-shell-border rounded-[4px] p-[6px]"
            />
            <div className="flex items-center justify-end gap-[4px]">
              <button
                type="button"
                onClick={() => { setEditText(comment.text); setIsEditing(false) }}
                className="px-[8px] py-[3px] text-[11px] text-shell-text-secondary hover:text-shell-text cursor-pointer rounded-[4px] hover:bg-shell-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-[8px] py-[3px] text-[11px] text-white bg-[#4a90d9] hover:bg-[#3a7bc8] cursor-pointer rounded-[4px] transition-colors"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              className="text-[13px] text-shell-text whitespace-pre-wrap leading-[1.4] cursor-pointer hover:bg-shell-hover/50 rounded-[4px] -m-[4px] p-[4px] transition-colors"
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to edit"
            >
              {comment.text}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-shell-text-tertiary">{timeStr}</span>
              <div className="flex items-center gap-[2px]">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
                  className="px-[6px] py-[2px] text-[11px] text-shell-text-secondary hover:text-shell-text hover:bg-shell-hover rounded-[4px] cursor-pointer transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="flex items-center gap-[4px] px-[6px] py-[2px] text-[11px] text-[#F87171] hover:bg-[#F87171]/10 rounded-[4px] cursor-pointer transition-colors"
                >
                  <RiDeleteBinLine size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Input for typing a new comment */
function DraftCommentInput({
  zoom,
  onSubmit,
  onCancel,
}: {
  zoom: number
  onSubmit: (text: string) => void
  onCancel: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Focus after a tick so the click event doesn't steal focus
    const t = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(textareaRef.current?.value ?? '')
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      data-comment-pin
      className="absolute left-[16px] top-[4px] z-50 w-[240px] bg-shell-surface border border-shell-border rounded-[8px] shadow-2xl overflow-hidden"
      style={{
        transform: `scale(${1 / zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <div className="p-[8px] flex flex-col gap-[6px]">
        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="Add a comment…"
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-transparent text-[13px] text-shell-text placeholder:text-shell-text-tertiary outline-none leading-[1.4]"
        />
        <div className="flex items-center justify-end gap-[4px]">
          <button
            type="button"
            onClick={onCancel}
            className="px-[8px] py-[3px] text-[11px] text-shell-text-secondary hover:text-shell-text cursor-pointer rounded-[4px] hover:bg-shell-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(textareaRef.current?.value ?? '')}
            className="px-[8px] py-[3px] text-[11px] text-white bg-[#4a90d9] hover:bg-[#3a7bc8] cursor-pointer rounded-[4px] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/** Single toolbar button — dark Figma-style */
function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center w-[28px] h-[28px] rounded-[6px]
        transition-colors cursor-pointer
        ${active
          ? 'bg-[#4a4a4a] text-white'
          : 'text-[#999] hover:text-white hover:bg-[#3a3a3a]'
        }
      `}
    >
      {children}
    </button>
  )
}
