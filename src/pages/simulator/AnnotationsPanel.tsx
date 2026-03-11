import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiFileCopyLine, RiCheckLine, RiPencilLine, RiExternalLinkLine } from '@remixicon/react'
import type { FlowScreen, Flow } from './flowRegistry'
import EditableFlowSlug from './EditableFlowSlug'

function CopyableSlug({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  return (
    <div className="flex items-center gap-[var(--token-spacing-1)] mb-[var(--token-spacing-1)]">
      <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary font-mono">
        {value}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 flex items-center justify-center text-shell-text-tertiary hover:text-shell-text transition-colors cursor-pointer p-0 bg-transparent border-none"
        title="Copy page ID"
      >
        {copied
          ? <RiCheckLine size={12} className="text-[#6EE7A0]" />
          : <RiFileCopyLine size={12} />
        }
      </button>
    </div>
  )
}

function EditableDescription({
  value,
  onSave,
}: {
  value: string
  onSave: (val: string) => void
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
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-[var(--token-spacing-1)]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          autoFocus
          className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-shell-text bg-shell-input border border-shell-selected-text rounded-[var(--token-radius-sm)] outline-none resize-y"
        />
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
      title="Click to edit description"
      className="w-full text-left cursor-pointer flex items-start gap-[var(--token-spacing-1)] px-[var(--token-spacing-1)] py-[2px] -mx-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] hover:bg-shell-hover transition-colors border border-transparent hover:border-shell-border text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary"
    >
      <span className="flex-1">{value || '(no description)'}</span>
      <RiPencilLine size={12} className="shrink-0 mt-[3px] text-shell-text-tertiary" />
    </div>
  )
}

function EditableTitle({
  value,
  onSave,
}: {
  value: string
  onSave: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleEdit = () => {
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
        className="w-full px-[var(--token-spacing-2)] py-[2px] text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text bg-shell-input border border-shell-selected-text rounded-[var(--token-radius-sm)] outline-none mb-[var(--token-spacing-1)]"
      />
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleEdit}
      onKeyDown={(e) => { if (e.key === 'Enter') handleEdit() }}
      title="Click to edit page name"
      className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-1)] py-[2px] -mx-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] hover:bg-shell-hover transition-colors border border-transparent hover:border-shell-border cursor-pointer mb-[var(--token-spacing-1)]"
    >
      <span className="flex-1 text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text">{value}</span>
      <RiPencilLine size={12} className="shrink-0 text-shell-text-tertiary" />
    </div>
  )
}

interface AnnotationsPanelProps {
  flow: Flow
  currentScreen: FlowScreen
  screenIndex: number
  onFlowEdited: () => void
  onRenameFlow?: (newId: string) => Promise<boolean>
  onFlowDescriptionUpdate?: (description: string) => void
  onScreenTitleUpdate?: (screenId: string, title: string) => void
}

export default function AnnotationsPanel({
  flow,
  currentScreen,
  screenIndex,
  onRenameFlow,
  onFlowDescriptionUpdate,
  onScreenTitleUpdate,
}: AnnotationsPanelProps) {
  const navigate = useNavigate()

  const handleExport = () => {
    const lines = [
      `# ${flow.id} — Flow Handoff`,
      '',
      flow.description ? `> ${flow.description}` : '',
      '',
      `## Spec`,
      flow.specContent ?? '_No spec available_',
      '',
      `## Screens (${flow.screens.length})`,
      ...flow.screens.map(
        (s, i) => `${i + 1}. **${s.title}** — ${s.description}`,
      ),
      '',
      `## Components Used`,
      ...Array.from(
        new Set(flow.screens.flatMap((s) => s.componentsUsed)),
      ).map((c) => `- ${c}`),
      '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flow.id}-handoff.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="w-[300px] h-full shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface">
      <div className="p-[var(--token-spacing-md)] border-b border-shell-border flex items-center justify-between">
        <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider">
          Annotations
        </h2>
        <button
          type="button"
          onClick={handleExport}
          className="text-[length:var(--token-font-size-caption)] text-shell-selected-text hover:text-[#6EE7A0] font-medium cursor-pointer"
        >
          Export
        </button>
      </div>

      <div className="p-[var(--token-spacing-md)]">
        {/* Flow name */}
        <div className="mb-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Flow Name
          </p>
          {onRenameFlow ? (
            <EditableFlowSlug value={flow.id} onSave={onRenameFlow} variant="block" />
          ) : (
            <p className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text font-mono">
              {flow.id}
            </p>
          )}
        </div>

        {/* Flow description */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Overview
          </p>
          {onFlowDescriptionUpdate ? (
            <EditableDescription
              value={flow.description ?? ''}
              onSave={onFlowDescriptionUpdate}
            />
          ) : (
            <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
              {flow.description}
            </p>
          )}
        </div>

        {/* Current screen info */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Screen {screenIndex + 1} of {flow.screens.length}
          </p>
          {onScreenTitleUpdate ? (
            <EditableTitle
              value={currentScreen.title}
              onSave={(title) => onScreenTitleUpdate(currentScreen.id, title)}
            />
          ) : (
            <p className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text mb-[var(--token-spacing-1)]">
              {currentScreen.title}
            </p>
          )}
          <CopyableSlug value={currentScreen.id} />
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary mb-[var(--token-spacing-2)]">
            {currentScreen.description}
          </p>
          <a
            href={`/preview/${flow.id}?screen=${encodeURIComponent(currentScreen.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[4px] text-[length:var(--token-font-size-caption)] text-shell-selected-text hover:text-[#6EE7A0] font-medium transition-colors no-underline"
          >
            <RiExternalLinkLine size={12} />
            Open standalone
          </a>
        </div>

        {/* Components used */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
            Components
          </p>
          <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
            {currentScreen.componentsUsed.map((c) => (
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

        {/* Flow metadata */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
            Flow Info
          </p>
          <div className="flex flex-col gap-[var(--token-spacing-1)]">
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">Domain</span>
              <span className="text-shell-text">{flow.domain}</span>
            </div>
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">Total screens</span>
              <span className="text-shell-text">{flow.screens.length}</span>
            </div>
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">ID</span>
              <span className="text-shell-text font-mono">{flow.id}</span>
            </div>
          </div>
        </div>

        {/* Spec content */}
        {flow.specContent && (
          <div>
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
              Spec
            </p>
            <pre className="text-[length:var(--token-font-size-caption)] text-shell-text-secondary whitespace-pre-wrap bg-shell-input p-[var(--token-spacing-3)] rounded-[var(--token-radius-md)] max-h-[300px] overflow-y-auto">
              {flow.specContent}
            </pre>
          </div>
        )}

      </div>
    </aside>
  )
}
