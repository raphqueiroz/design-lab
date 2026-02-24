import { useState, useCallback } from 'react'
import { Pencil, Check, Play, Monitor, GitBranch, AlertTriangle } from 'lucide-react'
import type { Node } from '@xyflow/react'
import type { Flow } from './flowRegistry'

interface FlowViewAnnotationsPanelProps {
  flow: Flow
  selectedNode: Node | null
  onOpenInPrototype: () => void
  onNodeUpdate: (nodeId: string, label: string, description: string) => void
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
    if (e.key === 'Enter' && !multiline) {
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
            <Check size={12} />
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
      <Pencil
        size={12}
        className="shrink-0 mt-[3px] text-shell-text-tertiary"
      />
    </div>
  )
}

const nodeTypeConfig = {
  screen: { label: 'Screen', icon: Monitor, color: 'text-shell-selected-text' },
  decision: { label: 'Decision', icon: GitBranch, color: 'text-[#FBBF24]' },
  error: { label: 'Error State', icon: AlertTriangle, color: 'text-[#F87171]' },
}

export default function FlowViewAnnotationsPanel({
  flow,
  selectedNode,
  onOpenInPrototype,
  onNodeUpdate,
}: FlowViewAnnotationsPanelProps) {
  const handleLabelSave = useCallback(
    (label: string) => {
      if (selectedNode) {
        onNodeUpdate(selectedNode.id, label, (selectedNode.data as { description?: string }).description ?? '')
      }
    },
    [selectedNode, onNodeUpdate],
  )

  const handleDescriptionSave = useCallback(
    (description: string) => {
      if (selectedNode) {
        onNodeUpdate(selectedNode.id, (selectedNode.data as { label: string }).label, description)
      }
    },
    [selectedNode, onNodeUpdate],
  )

  const nodeData = selectedNode?.data as { label: string; screenId: string | null; nodeType: string; description?: string } | undefined
  const typeConfig = nodeData ? nodeTypeConfig[nodeData.nodeType as keyof typeof nodeTypeConfig] : null

  // Find linked screen info
  const linkedScreen = nodeData?.screenId
    ? flow.screens.find(s => s.id === nodeData.screenId)
    : null

  return (
    <aside className="w-[300px] h-full shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface">
      <div className="p-[var(--token-spacing-md)] border-b border-shell-border">
        <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider">
          Node Properties
        </h2>
      </div>

      {selectedNode && nodeData && typeConfig ? (
        <div className="p-[var(--token-spacing-md)]">
          {/* Node type badge */}
          <div className="mb-[var(--token-spacing-lg)]">
            <div className={`flex items-center gap-[var(--token-spacing-2)] ${typeConfig.color}`}>
              <typeConfig.icon size={14} />
              <span className="text-[length:var(--token-font-size-body-sm)] font-medium">
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Label (editable) */}
          <div className="mb-[var(--token-spacing-2)]">
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Label
            </p>
            <div className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text">
              <EditableField value={nodeData.label} onSave={handleLabelSave} label="node label" />
            </div>
          </div>

          {/* Description (editable) */}
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

          {/* Linked screen info */}
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
                  <span
                    key={c}
                    className="px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Open in Prototype button */}
          {nodeData.screenId && (
            <button
              type="button"
              onClick={onOpenInPrototype}
              className="w-full flex items-center justify-center gap-[var(--token-spacing-2)] py-[var(--token-spacing-2)] px-[var(--token-spacing-3)] bg-shell-selected-text/10 border border-shell-selected-text/30 text-shell-selected-text rounded-[var(--token-radius-md)] text-[length:var(--token-font-size-body-sm)] font-medium hover:bg-shell-selected-text/20 transition-colors cursor-pointer"
            >
              <Play size={14} />
              Open in Prototype
            </button>
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
      ) : (
        <div className="p-[var(--token-spacing-md)] text-center">
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary mt-[var(--token-spacing-lg)]">
            Select a node to see its properties
          </p>
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mt-[var(--token-spacing-2)]">
            Double-click a screen node to open it in the prototype view
          </p>
        </div>
      )}

      {/* Flow info */}
      <div className="p-[var(--token-spacing-md)] border-t border-shell-border mt-auto">
        <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
          Flow Info
        </p>
        <div className="flex flex-col gap-[var(--token-spacing-1)]">
          <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
            <span className="text-shell-text-secondary">Flow</span>
            <span className="text-shell-text">{flow.name}</span>
          </div>
          <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
            <span className="text-shell-text-secondary">Area</span>
            <span className="text-shell-text">{flow.area}</span>
          </div>
          <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
            <span className="text-shell-text-secondary">Screens</span>
            <span className="text-shell-text">{flow.screens.length}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
