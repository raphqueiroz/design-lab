import { useState } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { getAllDomains } from './flowRegistry'
import { getGroupsForDomain } from './flowGroupStore'

interface NewFlowDialogProps {
  onClose: () => void
  onCreate: (name: string, domain: string, description: string, groupId?: string) => void
}

export default function NewFlowDialog({ onClose, onCreate }: NewFlowDialogProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState('')
  const domains = getAllDomains()

  const groups = domain ? getGroupsForDomain(domain) : []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !domain.trim()) return
    onCreate(name.trim(), domain.trim(), description.trim(), groupId || undefined)
  }

  const handleDomainChange = (newDomain: string) => {
    setDomain(newDomain)
    setGroupId('') // reset group when domain changes
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
            New Flow
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[var(--token-radius-sm)] text-shell-text-tertiary hover:text-shell-text hover:bg-shell-hover transition-colors cursor-pointer"
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="p-[var(--token-spacing-md)] flex flex-col gap-[var(--token-spacing-3)]">
          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Flow Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Withdrawal via PIX"
              autoFocus
              className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
            />
          </div>

          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Domain *
            </label>
            <select
              value={domain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
            >
              <option value="">Select a domain...</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {groups.length > 0 && (
            <div>
              <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
                Group
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-text bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] outline-none focus:border-shell-selected-text"
              >
                <option value="">No group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this flow does..."
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
            disabled={!name.trim() || !domain.trim()}
            className="px-[var(--token-spacing-4)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] text-shell-bg bg-shell-selected-text rounded-[var(--token-radius-sm)] font-medium cursor-pointer hover:bg-[#6EE7A0] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Flow
          </button>
        </div>
      </form>
    </div>
  )
}
