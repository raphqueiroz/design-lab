import { useState } from 'react'
import { X } from 'lucide-react'

interface NewPageDialogProps {
  onClose: () => void
  onCreate: (name: string, area: string, description: string) => void
}

export default function NewPageDialog({ onClose, onCreate }: NewPageDialogProps) {
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !area.trim()) return
    onCreate(name.trim(), area.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        role="button"
        tabIndex={0}
      />

      {/* Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-[400px] bg-shell-surface border border-shell-border rounded-[var(--token-radius-lg)] shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[var(--token-spacing-md)] border-b border-shell-border">
          <h2 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text">
            New Page
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-text hover:bg-shell-hover transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-[var(--token-spacing-md)] flex flex-col gap-[var(--token-spacing-3)]">
          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Page Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dashboard, Settings"
              autoFocus
              className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
            />
          </div>

          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Area *
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Transactions, Onboarding, Settings"
              className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
            />
          </div>

          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this page displays..."
              rows={3}
              className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text resize-y"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-[var(--token-spacing-2)] p-[var(--token-spacing-md)] border-t border-shell-border">
          <button
            type="button"
            onClick={onClose}
            className="px-[var(--token-spacing-4)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary hover:text-shell-text rounded-[var(--token-radius-sm)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !area.trim()}
            className="px-[var(--token-spacing-4)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-bg bg-shell-selected-text rounded-[var(--token-radius-sm)] font-medium cursor-pointer hover:bg-[#6EE7A0] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Page
          </button>
        </div>
      </form>
    </div>
  )
}
