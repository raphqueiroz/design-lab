import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Check, FileText, GitBranch, Package } from 'lucide-react'
import type { Node } from '@xyflow/react'
import type { Page } from './pageRegistry'
import type { PageNodeData } from './pageGallery.types'
import { setPageName, setPageDescription } from './pageStore'
import { getFlowsForPage, type PageFlowRef } from './pageFlowIndex'

const PHONE_W = 393
const PHONE_H = 852
const SIDEBAR_W = 300
const PREVIEW_PADDING = 24
const PREVIEW_CONTENT_W = SIDEBAR_W - PREVIEW_PADDING * 2
const PREVIEW_SCALE = PREVIEW_CONTENT_W / PHONE_W
const PREVIEW_VISIBLE_H = Math.round(PHONE_H * PREVIEW_SCALE)

const noop = () => {}

interface PageDetailPanelProps {
  page?: Page
  selectedNode: Node | null
  onPageChanged?: () => void
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

export default function PageDetailPanel({ page, selectedNode, onPageChanged }: PageDetailPanelProps) {
  const nodeData = selectedNode?.data as PageNodeData | undefined

  const handleNameSave = useCallback(
    (name: string) => {
      if (!page) return
      setPageName(page.id, name).then(() => onPageChanged?.())
    },
    [page, onPageChanged],
  )

  const handleDescriptionSave = useCallback(
    (description: string) => {
      if (!page) return
      setPageDescription(page.id, description).then(() => onPageChanged?.())
    },
    [page, onPageChanged],
  )

  const flowRefs: PageFlowRef[] = page ? getFlowsForPage(page.id) : []
  const PageComponent = page?.component

  return (
    <aside className="w-[300px] h-full shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface">
      <div className="p-[var(--token-spacing-md)] border-b border-shell-border">
        <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider">
          Page Properties
        </h2>
      </div>

      {page && nodeData ? (
        <div className="p-[var(--token-spacing-md)]">
          {/* Page type badge */}
          <div className="mb-[var(--token-spacing-lg)]">
            <div className="flex items-center gap-[var(--token-spacing-2)] text-shell-selected-text">
              <FileText size={14} />
              <span className="text-[length:var(--token-font-size-caption)] font-semibold uppercase tracking-wider">
                Page
              </span>
              {page.isDynamic && (
                <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">(dynamic)</span>
              )}
            </div>
          </div>

          {/* Live preview */}
          {PageComponent && (
            <div className="mb-[var(--token-spacing-lg)]">
              <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
                Preview
              </p>
              <div
                className="relative overflow-hidden rounded-[var(--token-radius-md)] border border-shell-border bg-surface-primary text-content-primary"
                style={{ width: PREVIEW_CONTENT_W, height: PREVIEW_VISIBLE_H }}
              >
                <div
                  className="origin-top-left pointer-events-none select-none"
                  style={{
                    width: PHONE_W,
                    height: PHONE_H,
                    transform: `scale(${PREVIEW_SCALE})`,
                  }}
                >
                  <PageComponent onNext={noop} onBack={noop} />
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="mb-[var(--token-spacing-md)]">
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Name
            </p>
            <div className="text-[length:var(--token-font-size-body-sm)] text-shell-text leading-[var(--token-line-height-body-sm)]">
              <EditableField value={page.name} onSave={handleNameSave} label="name" />
            </div>
          </div>

          {/* Description */}
          <div className="mb-[var(--token-spacing-md)]">
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Description
            </p>
            <div className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary leading-[var(--token-line-height-body-sm)]">
              <EditableField value={page.description} onSave={handleDescriptionSave} multiline label="description" />
            </div>
          </div>

          {/* Area */}
          <div className="mb-[var(--token-spacing-md)]">
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Area
            </p>
            <span className="px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary">
              {page.area}
            </span>
          </div>

          {/* Components used */}
          {page.componentsUsed.length > 0 && (
            <div className="mb-[var(--token-spacing-md)]">
              <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                Components
              </p>
              <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
                {page.componentsUsed.map((comp) => (
                  <Link
                    key={comp}
                    to={`/components?selected=${encodeURIComponent(comp)}`}
                    className="flex items-center gap-[2px] px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:text-shell-selected-text cursor-pointer transition-colors no-underline"
                  >
                    <Package size={10} />
                    {comp}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Flows using this page */}
          <div className="mb-[var(--token-spacing-md)]">
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Used in Flows
            </p>
            {flowRefs.length > 0 ? (
              <div className="flex flex-col gap-[var(--token-spacing-1)]">
                {flowRefs.map((ref) => (
                  <Link
                    key={`${ref.flowId}-${ref.screenId}`}
                    to={`/flows?flow=${encodeURIComponent(ref.flowId)}`}
                    className="flex items-center gap-[var(--token-spacing-2)] px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] hover:bg-shell-hover text-left transition-colors no-underline"
                  >
                    <GitBranch size={12} className="text-shell-text-tertiary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text truncate">
                        {ref.flowName}
                      </p>
                      <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary truncate">
                        as &ldquo;{ref.screenTitle}&rdquo;
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary italic">
                Not used in any flow
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-[var(--token-spacing-md)]">
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary">
            Select a page to view its properties
          </p>
        </div>
      )}
    </aside>
  )
}
