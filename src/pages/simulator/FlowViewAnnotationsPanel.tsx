import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiPencilLine, RiCheckLine, RiPlayLine, RiComputerLine, RiGitBranchLine, RiErrorWarningLine, RiExternalLinkLine, RiCursorLine, RiStackLine, RiRefreshLine, RiFileTextLine, RiServerLine, RiTimerLine, RiStickyNoteLine, RiLoginBoxLine, RiCloseLine, RiAddLine } from '@remixicon/react'
import type { Node, Edge } from '@xyflow/react'
import type { Flow } from './flowRegistry'
import { getAllFlows, getLinkedFlows, getFlowsLinkingTo } from './flowRegistry'
import type { FlowNodeData } from './flowGraph.types'
import { findParentInteractiveNode } from './flowGraphNavigation'
import { getPage } from '../gallery/pageRegistry'

interface FlowViewAnnotationsPanelProps {
  flow: Flow
  selectedNode: Node | null
  nodes: Node[]
  edges: Edge[]
  onOpenInPrototype: () => void
  onNodeUpdate: (nodeId: string, updates: Record<string, unknown>) => void
  onScreenDescriptionUpdate?: (screenId: string, description: string) => void
  onAlignNodes?: () => void
  onFlowMetaUpdate?: (updates: { name?: string; description?: string }) => void
}

function EditableField({
  value,
  onSave,
  multiline,
  label,
}: {
  value: string
  onSave: (val: string) => void
  multiline?: boolean
  label: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleEdit = () => {
    setDraft(value)
    setEditing(true)
  }

  const handleSave = () => {
    onSave(draft)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !multiline)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-[var(--token-spacing-1)]">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            autoFocus
            className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-shell-text bg-shell-input border border-shell-selected-text rounded-[var(--token-radius-sm)] outline-none resize-y"
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-shell-text bg-shell-input border border-shell-selected-text rounded-[var(--token-radius-sm)] outline-none"
          />
        )}
        <div className="flex gap-[var(--token-spacing-1)] justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text-secondary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-shell-selected-text hover:text-[#6EE7A0] font-medium cursor-pointer flex items-center gap-[2px]"
          >
            <RiCheckLine size={12} />
            Save
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleEdit}
      onKeyDown={(e) => { if (e.key === 'Enter') handleEdit() }}
      title={`Click to edit ${label}`}
      className="w-full text-left cursor-pointer flex items-start gap-[var(--token-spacing-1)] px-[var(--token-spacing-1)] py-[2px] -mx-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] hover:bg-shell-hover transition-colors border border-transparent hover:border-shell-border"
    >
      <span className="flex-1">{value || '(empty)'}</span>
      <RiPencilLine
        size={12}
        className="shrink-0 mt-[3px] text-shell-text-tertiary"
      />
    </div>
  )
}

const nodeTypeConfig = {
  screen: { label: 'Screen', icon: RiComputerLine, color: 'text-shell-selected-text', description: '' },
  page: { label: 'Page', icon: RiComputerLine, color: 'text-shell-selected-text', description: '' },
  decision: { label: 'Decision', icon: RiGitBranchLine, color: 'text-[#FBBF24]', description: 'A branching condition that routes to different paths' },
  error: { label: 'Error State', icon: RiErrorWarningLine, color: 'text-[#F87171]', description: 'An error or failure path in the flow' },
  'flow-reference': { label: 'Flow Reference', icon: RiExternalLinkLine, color: 'text-[#60A5FA]', description: 'Navigation to another flow' },
  action: { label: 'Action', icon: RiCursorLine, color: 'text-[#A78BFA]', description: 'A user interaction that triggers navigation or state change' },
  overlay: { label: 'Overlay', icon: RiStackLine, color: 'text-[#2DD4BF]', description: 'A modal, bottom sheet, or popover on top of a screen' },
  'api-call': { label: 'API Call', icon: RiServerLine, color: 'text-[#22D3EE]', description: 'Synchronous HTTP request the app makes' },
  delay: { label: 'Delay', icon: RiTimerLine, color: 'text-[#FB923C]', description: 'Async wait for an external event (webhook, polling, timer)' },
  note: { label: 'Note', icon: RiStickyNoteLine, color: 'text-[#78716C]', description: '' },
  'entry-point': { label: 'Entry Point', icon: RiLoginBoxLine, color: 'text-[#F472B6]', description: 'Where users enter this flow — other flows, deep links, or dashboard actions' },
}

const actionTypeLabels: Record<string, string> = {
  tap: 'Tap',
  swipe: 'Swipe',
  input: 'Input',
  scroll: 'Scroll',
  'long-press': 'Long Press',
}

function EntryPointSection({
  flow,
  nodeData,
  selectedNodeId,
  onNodeUpdate,
}: {
  flow: Flow
  nodeData: FlowNodeData
  selectedNodeId: string
  onNodeUpdate: (nodeId: string, updates: Record<string, unknown>) => void
}) {
  const [newEntry, setNewEntry] = useState('')
  const autoEntries = flow.entryPoints ?? []
  const linkedFrom = getFlowsLinkingTo(flow.id)
  const manualEntries = nodeData.manualEntryPoints ?? []

  const handleAdd = () => {
    const trimmed = newEntry.trim()
    if (!trimmed || manualEntries.includes(trimmed)) return
    onNodeUpdate(selectedNodeId, { manualEntryPoints: [...manualEntries, trimmed] })
    setNewEntry('')
  }

  const handleRemove = (entry: string) => {
    onNodeUpdate(selectedNodeId, { manualEntryPoints: manualEntries.filter((e) => e !== entry) })
  }

  return (
    <div className="mb-[var(--token-spacing-lg)]">
      {/* Auto entries */}
      {autoEntries.length > 0 && (
        <div className="mb-[var(--token-spacing-3)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Entry Points
          </p>
          <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
            {autoEntries.map((entry) => (
              <span
                key={entry}
                className="px-[var(--token-spacing-2)] py-[1px] bg-[#F472B6]/15 text-[#F472B6] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
              >
                {entry}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Linked from flows */}
      {linkedFrom.length > 0 && (
        <div className="mb-[var(--token-spacing-3)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Linked From
          </p>
          <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
            {linkedFrom.map((f) => (
              <span
                key={f.id}
                className="px-[var(--token-spacing-2)] py-[1px] bg-[#60A5FA]/15 text-[#60A5FA] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
              >
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manual entries */}
      <div>
        <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
          Custom Entries
        </p>
        {manualEntries.length > 0 && (
          <div className="flex flex-wrap gap-[var(--token-spacing-1)] mb-[var(--token-spacing-2)]">
            {manualEntries.map((entry) => (
              <span
                key={entry}
                className="inline-flex items-center gap-[2px] px-[var(--token-spacing-2)] py-[1px] border border-[#F472B6]/40 text-[#F472B6] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
              >
                {entry}
                <button
                  type="button"
                  onClick={() => handleRemove(entry)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  <RiCloseLine size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-[var(--token-spacing-1)]">
          <input
            type="text"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Add entry..."
            className="flex-1 px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#F472B6]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[#F472B6] hover:bg-[#F472B6]/15 rounded-[var(--token-radius-sm)] transition-colors cursor-pointer"
          >
            <RiAddLine size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FlowViewAnnotationsPanel({
  flow,
  selectedNode,
  nodes,
  edges,
  onOpenInPrototype,
  onNodeUpdate,
  onScreenDescriptionUpdate,
  onAlignNodes,
  onFlowMetaUpdate,
}: FlowViewAnnotationsPanelProps) {
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleLabelSave = useCallback(
    (label: string) => {
      if (selectedNode) {
        onNodeUpdate(selectedNode.id, { label })
      }
    },
    [selectedNode, onNodeUpdate],
  )

  const handleDescriptionSave = useCallback(
    (description: string) => {
      if (selectedNode) {
        onNodeUpdate(selectedNode.id, { description })
      }
    },
    [selectedNode, onNodeUpdate],
  )

  const nodeData = selectedNode?.data as FlowNodeData | undefined
  const typeConfig = nodeData ? nodeTypeConfig[nodeData.nodeType as keyof typeof nodeTypeConfig] : null
  const isAction = nodeData?.nodeType === 'action'

  // Find linked screen info
  const linkedScreen = nodeData?.screenId
    ? flow.screens.find(s => s.id === nodeData.screenId)
    : null

  // ── Shared sections ──

  const connectionsSection = (() => {
    const linksTo = getLinkedFlows(flow.id)
    const linksFrom = getFlowsLinkingTo(flow.id)
    if (linksTo.length === 0 && linksFrom.length === 0) return null
    return (
      <div className="p-[var(--token-spacing-md)] border-t border-shell-border">
        <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
          Connections
        </p>
        {linksTo.length > 0 && (
          <div className="mb-[var(--token-spacing-2)]">
            <p className="text-[length:10px] text-shell-text-tertiary mb-[var(--token-spacing-1)]">Links to</p>
            <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
              {linksTo.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/flows?flow=${f.id}`)}
                  className="px-[var(--token-spacing-2)] py-[1px] bg-[#4ADE80]/15 text-[#4ADE80] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] hover:bg-[#4ADE80]/25 transition-colors cursor-pointer"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {linksFrom.length > 0 && (
          <div>
            <p className="text-[length:10px] text-shell-text-tertiary mb-[var(--token-spacing-1)]">Linked from</p>
            <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
              {linksFrom.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => navigate(`/flows?flow=${f.id}`)}
                  className="px-[var(--token-spacing-2)] py-[1px] bg-[#60A5FA]/15 text-[#60A5FA] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] hover:bg-[#60A5FA]/25 transition-colors cursor-pointer"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  })()

  const flowInfoSection = (
    <div className="p-[var(--token-spacing-md)] border-t border-shell-border">
      <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
        Flow Info
      </p>
      <div className="flex flex-col gap-[var(--token-spacing-1)]">
        <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
          <span className="text-shell-text-secondary">Domain</span>
          <span className="text-shell-text">{flow.domain}</span>
        </div>
        <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
          <span className="text-shell-text-secondary">Screens</span>
          <span className="text-shell-text">{flow.screens.length}</span>
        </div>
        <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
          <span className="text-shell-text-secondary">Nodes</span>
          <span className="text-shell-text">{nodes.length}</span>
        </div>
      </div>

      {/* Align nodes */}
      {onAlignNodes && (
        <div className="mt-[var(--token-spacing-3)]">
          {confirmReset ? (
            <div className="flex flex-col gap-[var(--token-spacing-2)]">
              <p className="text-[length:var(--token-font-size-caption)] text-error">
                Align all nodes in a centered layout? This will reposition nodes but keep all connections.
              </p>
              <div className="flex gap-[var(--token-spacing-2)]">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text-secondary rounded-[var(--token-radius-sm)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAlignNodes()
                    setConfirmReset(false)
                  }}
                  className="flex-1 py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-error bg-error/10 border border-error/30 rounded-[var(--token-radius-sm)] font-medium hover:bg-error/20 cursor-pointer flex items-center justify-center gap-[4px]"
                >
                  <RiRefreshLine size={11} />
                  Align
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full flex items-center justify-center gap-[4px] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-error rounded-[var(--token-radius-sm)] transition-colors cursor-pointer"
            >
              <RiRefreshLine size={11} />
              Align nodes
            </button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <aside className="w-[300px] h-full shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface flex flex-col">

      {selectedNode && nodeData && typeConfig ? (
        /* ═══════════ NODE SELECTED ═══════════ */
        <>
          <div className="p-[var(--token-spacing-md)] border-b border-shell-border">
            <div className={`flex items-center gap-[var(--token-spacing-2)] ${typeConfig.color}`}>
              <typeConfig.icon size={14} />
              <span className="text-[length:var(--token-font-size-body-sm)] font-medium">
                {typeConfig.label}
              </span>
            </div>
            {typeConfig.description && (
              <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mt-[var(--token-spacing-1)]">
                {typeConfig.description}
              </p>
            )}
          </div>

          <div className="p-[var(--token-spacing-md)] flex-1">

            {/* ── Screen / Page nodes ── */}
            {(nodeData.nodeType === 'screen' || nodeData.nodeType === 'page') && (
              <>
                <div className="mb-[var(--token-spacing-lg)]">
                  <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                    Link to Screen
                  </p>
                  <select
                    value={nodeData.screenId ?? ''}
                    onChange={(e) => {
                      onNodeUpdate(selectedNode.id, { screenId: e.target.value || null })
                    }}
                    className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text cursor-pointer"
                  >
                    <option value="">(Placeholder)</option>
                    {flow.screens.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Active State selector */}
                {(() => {
                  const pid = (nodeData as { pageId?: string }).pageId ?? (linkedScreen?.pageId)
                  const page = pid ? getPage(pid) : null
                  if (!page?.states?.length) return null
                  return (
                    <div className="mb-[var(--token-spacing-lg)]">
                      <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                        Active State
                      </p>
                      <select
                        value={(nodeData as { activeStateId?: string }).activeStateId ?? ''}
                        onChange={(e) => {
                          onNodeUpdate(selectedNode.id, { activeStateId: e.target.value || undefined })
                        }}
                        className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text cursor-pointer"
                      >
                        <option value="">(Default)</option>
                        {page.states.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  )
                })()}
              </>
            )}

            {/* ── Action nodes: type + target define the label, no separate Label field ── */}
            {isAction && (() => {
              const parentNode = findParentInteractiveNode(selectedNode.id, nodes, edges)
              const parentData = parentNode?.data as FlowNodeData | undefined
              const elements = (() => {
                // 1. Overlay nodes: use interactiveElements from graph node data
                if (parentData?.nodeType === 'overlay') return parentData.interactiveElements

                // 2. Screen/page nodes: check interactiveElements on graph node data first (like overlays)
                if (parentData?.interactiveElements?.length) return parentData.interactiveElements

                // 3. Look up from current flow's screens array
                const parentScreenId = parentData?.screenId ?? parentData?.pageId
                if (!parentScreenId) return undefined
                const fromFlow = flow.screens.find(s => s.id === parentScreenId)?.interactiveElements
                if (fromFlow) return fromFlow

                // 4. Fallback: search all registered flows (cross-flow screen references)
                const allFlows = getAllFlows()
                for (const f of allFlows) {
                  const found = f.screens.find(s => s.id === parentScreenId)?.interactiveElements
                  if (found) return found
                }
                return undefined
              })()

              const actionType = (nodeData as { actionType?: string }).actionType ?? 'tap'
              const actionTarget = (nodeData as { actionTarget?: string }).actionTarget ?? ''

              return (
                <div className="mb-[var(--token-spacing-lg)]">
                  <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                    Action Type
                  </p>
                  <select
                    value={actionType}
                    onChange={(e) => {
                      const newType = e.target.value
                      const updates: Record<string, unknown> = { actionType: newType }
                      // Auto-update label
                      if (actionTarget) {
                        const targetLabel = actionTarget.includes(': ') ? actionTarget.split(': ').slice(1).join(': ') : actionTarget
                        updates.label = `User ${actionTypeLabels[newType]?.toLowerCase() ?? newType}s ${targetLabel}`
                      }
                      onNodeUpdate(selectedNode.id, updates)
                    }}
                    className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#A78BFA] cursor-pointer mb-[var(--token-spacing-2)]"
                  >
                    <option value="tap">Tap</option>
                    <option value="swipe">Swipe</option>
                    <option value="input">Input</option>
                    <option value="scroll">Scroll</option>
                    <option value="long-press">Long Press</option>
                  </select>

                  <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                    Target
                  </p>
                  {elements && elements.length > 0 ? (
                    <select
                      value={actionTarget}
                      onChange={(e) => {
                        const newTarget = e.target.value
                        const updates: Record<string, unknown> = { actionTarget: newTarget }
                        // Auto-update label from type + target
                        if (newTarget) {
                          const targetLabel = newTarget.includes(': ') ? newTarget.split(': ').slice(1).join(': ') : newTarget
                          updates.label = `User ${actionTypeLabels[actionType]?.toLowerCase() ?? actionType}s ${targetLabel}`
                        }
                        onNodeUpdate(selectedNode.id, updates)
                      }}
                      className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#A78BFA] cursor-pointer"
                    >
                      <option value="">(Select target)</option>
                      {elements.map((el) => (
                        <option key={el.id} value={`${el.component}: ${el.label}`}>
                          {el.component}: {el.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <EditableField
                      value={actionTarget}
                      onSave={(val) => {
                        const updates: Record<string, unknown> = { actionTarget: val }
                        if (val) {
                          const targetLabel = val.includes(': ') ? val.split(': ').slice(1).join(': ') : val
                          updates.label = `User ${actionTypeLabels[actionType]?.toLowerCase() ?? actionType}s ${targetLabel}`
                        }
                        onNodeUpdate(selectedNode.id, updates)
                      }}
                      label="action target"
                    />
                  )}

                  {/* Auto-generated label preview */}
                  <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mt-[var(--token-spacing-2)]">
                    {nodeData.label}
                  </p>
                </div>
              )
            })()}

            {/* ── Non-action nodes: editable Label ── */}
            {!isAction && (
              <div className="mb-[var(--token-spacing-2)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Label
                </p>
                <div className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text">
                  <EditableField value={nodeData.label} onSave={handleLabelSave} label="node label" />
                </div>
              </div>
            )}

            {/* ── Entry-point node: auto + manual entries ── */}
            {nodeData.nodeType === 'entry-point' && (
              <EntryPointSection
                flow={flow}
                nodeData={nodeData}
                selectedNodeId={selectedNode.id}
                onNodeUpdate={onNodeUpdate}
              />
            )}

            {/* ── Flow-reference: target flow ── */}
            {nodeData.nodeType === 'flow-reference' && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Target Flow
                </p>
                <select
                  value={(nodeData as { targetFlowId?: string }).targetFlowId ?? ''}
                  onChange={(e) => {
                    onNodeUpdate(selectedNode.id, { targetFlowId: e.target.value || null })
                  }}
                  className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text cursor-pointer"
                >
                  <option value="">(None)</option>
                  {getAllFlows().filter(f => f.id !== flow.id).map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Overlay node properties ── */}
            {nodeData.nodeType === 'overlay' && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Overlay Type
                </p>
                <select
                  value={(nodeData as { overlayType?: string }).overlayType ?? 'bottom-sheet'}
                  onChange={(e) => {
                    onNodeUpdate(selectedNode.id, { overlayType: e.target.value })
                  }}
                  className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#2DD4BF] cursor-pointer mb-[var(--token-spacing-2)]"
                >
                  <option value="bottom-sheet">Bottom Sheet</option>
                  <option value="modal">Modal</option>
                  <option value="dialog">Dialog</option>
                  <option value="popover">Popover</option>
                  <option value="toast">Toast</option>
                </select>

                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Parent Screen
                </p>
                <select
                  value={(nodeData as { parentScreenNodeId?: string }).parentScreenNodeId ?? ''}
                  onChange={(e) => {
                    onNodeUpdate(selectedNode.id, { parentScreenNodeId: e.target.value || null })
                  }}
                  className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#2DD4BF] cursor-pointer"
                >
                  <option value="">(None)</option>
                  {flow.screens.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>

                {/* Interactive elements */}
                {(nodeData as FlowNodeData).interactiveElements && (nodeData as FlowNodeData).interactiveElements!.length > 0 && (
                  <div className="mt-[var(--token-spacing-3)]">
                    <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
                      Interactive Elements
                    </p>
                    <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
                      {(nodeData as FlowNodeData).interactiveElements!.map((el) => (
                        <span
                          key={el.id}
                          className="px-[var(--token-spacing-2)] py-[1px] bg-[#2DD4BF]/15 text-[#2DD4BF] rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)]"
                        >
                          {el.component}: {el.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── API Call node properties ── */}
            {nodeData.nodeType === 'api-call' && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Method
                </p>
                <select
                  value={(nodeData as { apiMethod?: string }).apiMethod ?? 'GET'}
                  onChange={(e) => {
                    onNodeUpdate(selectedNode.id, { apiMethod: e.target.value })
                  }}
                  className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#22D3EE] cursor-pointer mb-[var(--token-spacing-2)]"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Endpoint
                </p>
                <EditableField
                  value={(nodeData as { apiEndpoint?: string }).apiEndpoint ?? ''}
                  onSave={(val) => onNodeUpdate(selectedNode.id, { apiEndpoint: val })}
                  label="API endpoint"
                />
              </div>
            )}

            {/* ── Delay node properties ── */}
            {nodeData.nodeType === 'delay' && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Delay Type
                </p>
                <select
                  value={(nodeData as { delayType?: string }).delayType ?? 'timer'}
                  onChange={(e) => {
                    onNodeUpdate(selectedNode.id, { delayType: e.target.value })
                  }}
                  className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-[#FB923C] cursor-pointer mb-[var(--token-spacing-2)]"
                >
                  <option value="timer">Timer</option>
                  <option value="polling">Polling</option>
                  <option value="webhook">Webhook</option>
                  <option value="event">Event</option>
                </select>

                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                  Duration
                </p>
                <EditableField
                  value={(nodeData as { delayDuration?: string }).delayDuration ?? ''}
                  onSave={(val) => onNodeUpdate(selectedNode.id, { delayDuration: val })}
                  label="delay duration"
                />
              </div>
            )}

            {/* ── Description (always visible so users can add/edit) ── */}
            <div className="mb-[var(--token-spacing-lg)]">
              <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                Description
              </p>
              <div className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
                <EditableField
                  value={nodeData.description ?? ''}
                  onSave={handleDescriptionSave}
                  multiline
                  label="node description"
                />
              </div>
            </div>

            {/* ── Linked screen info ── */}
            {linkedScreen && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
                  Linked Screen
                </p>
                <div className="flex flex-col gap-[var(--token-spacing-1)]">
                  <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
                    <span className="text-shell-text-secondary">Screen</span>
                    <span className="text-shell-text">{linkedScreen.title}</span>
                  </div>
                  <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
                    <span className="text-shell-text-secondary">Components</span>
                    <span className="text-shell-text">{linkedScreen.componentsUsed.length}</span>
                  </div>
                </div>

                {/* Page Description — editable for dynamic flows */}
                <div className="mt-[var(--token-spacing-3)]">
                  <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                    Page Description
                  </p>
                  <div className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
                    {flow.isDynamic && onScreenDescriptionUpdate ? (
                      <EditableField
                        value={linkedScreen.description ?? ''}
                        onSave={(val) => onScreenDescriptionUpdate(linkedScreen.id, val)}
                        multiline
                        label="page description"
                      />
                    ) : (
                      <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
                        {linkedScreen.description || '(no description)'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Components used */}
            {linkedScreen && linkedScreen.componentsUsed.length > 0 && (
              <div className="mb-[var(--token-spacing-lg)]">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
                  Components
                </p>
                <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
                  {linkedScreen.componentsUsed.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => navigate(`/components?selected=${encodeURIComponent(c)}`)}
                      className="px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-active hover:text-shell-text transition-colors cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Open in Prototype button */}
            {nodeData.screenId && (
              <div className="flex flex-col gap-[var(--token-spacing-2)]">
                <button
                  type="button"
                  onClick={onOpenInPrototype}
                  className="w-full flex items-center justify-center gap-[var(--token-spacing-2)] py-[var(--token-spacing-2)] px-[var(--token-spacing-3)] bg-shell-selected-text/10 border border-shell-selected-text/30 text-shell-selected-text rounded-[var(--token-radius-md)] text-[length:var(--token-font-size-body-sm)] font-medium hover:bg-shell-selected-text/20 transition-colors cursor-pointer"
                >
                  <RiPlayLine size={14} />
                  Open in Prototype
                </button>
                {linkedScreen?.pageId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/pages?selected=${encodeURIComponent(linkedScreen.pageId!)}`)}
                    className="w-full flex items-center justify-center gap-[var(--token-spacing-2)] py-[var(--token-spacing-2)] px-[var(--token-spacing-3)] bg-shell-hover border border-shell-border text-shell-text-secondary rounded-[var(--token-radius-md)] text-[length:var(--token-font-size-body-sm)] font-medium hover:text-shell-text hover:border-shell-active transition-colors cursor-pointer"
                  >
                    <RiFileTextLine size={14} />
                    View Page
                  </button>
                )}
              </div>
            )}

            {/* Placeholder notice */}
            {!nodeData.screenId && nodeData.nodeType === 'screen' && (
              <div className="py-[var(--token-spacing-3)] px-[var(--token-spacing-3)] border border-dashed border-shell-border rounded-[var(--token-radius-md)] text-center">
                <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">
                  This is a placeholder screen. Build the screen component and link it to see it in the prototype view.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ═══════════ NO NODE SELECTED — FLOW OVERVIEW ═══════════ */
        <>
          {/* Flow name + description */}
          <div className="p-[var(--token-spacing-md)]">
            <div className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text mb-[var(--token-spacing-1)]">
              {onFlowMetaUpdate ? (
                <EditableField value={flow.name} onSave={(val) => onFlowMetaUpdate({ name: val })} label="flow name" />
              ) : (
                <h2>{flow.name}</h2>
              )}
            </div>
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mb-[var(--token-spacing-1)] font-mono select-all">{flow.id}</p>
            <div className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary leading-[var(--token-line-height-body-sm)]">
              {onFlowMetaUpdate ? (
                <EditableField value={flow.description ?? ''} onSave={(val) => onFlowMetaUpdate({ description: val })} multiline label="flow description" />
              ) : (
                flow.description && <p>{flow.description}</p>
              )}
            </div>
          </div>

          {connectionsSection}
          {flowInfoSection}
        </>
      )}

    </aside>
  )
}
