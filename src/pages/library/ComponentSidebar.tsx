import { useState } from 'react'
import { getComponentsByCategory, type ComponentMeta } from '../../library/registry'
import type { LibraryTab } from '../LibraryPage'

interface ComponentSidebarProps {
  selected: string | null
  onSelect: (name: string) => void
  activeTab: LibraryTab
}

const foundations = [
  { key: 'Colors', label: 'Colors' },
  { key: 'Typography', label: 'Typography' },
  { key: 'Spacing', label: 'Spacing' },
  { key: 'Radii', label: 'Radius' },
  { key: 'Icons', label: 'Icons' },
  { key: 'VoiceAndTone', label: 'Voice & Tone' },
] as const

const componentCategories: { key: ComponentMeta['category']; label: string }[] = [
  { key: 'presentation', label: 'Presentation' },
  { key: 'navigation', label: 'Navigation' },
  { key: 'actions', label: 'Actions' },
  { key: 'inputs', label: 'Inputs' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'layout', label: 'Layout' },
]

const patterns = [
  { key: 'FormWithValidation', label: 'Form with Validation' },
  { key: 'ListWithSearch', label: 'List with Search' },
  { key: 'ConfirmationFlow', label: 'Confirmation Flow' },
  { key: 'EmptyToLoaded', label: 'Empty → Loaded' },
  { key: 'SettingsGroup', label: 'Settings Group' },
  { key: 'CurrencyConversion', label: 'Currency Conversion' },
] as const

const sidebarTitles: Record<LibraryTab, string> = {
  foundations: 'Foundations',
  components: 'Components',
  patterns: 'Patterns',
}

export default function ComponentSidebar({ selected, onSelect, activeTab }: ComponentSidebarProps) {
  const [search, setSearch] = useState('')
  const query = search.toLowerCase()

  return (
    <aside className="w-[240px] h-full shrink-0 overflow-y-auto border-r border-shell-border bg-shell-surface">
      <div className="p-[var(--token-spacing-md)]">
        <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-3)]">
          {sidebarTitles[activeTab]}
        </h2>
      </div>

      {/* Foundations */}
      {activeTab === 'foundations' && (
        <>
          {foundations.map((f) => {
            const id = `foundation:${f.key}`
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onSelect(id)}
                className={`
                  w-full text-left px-[var(--token-spacing-md)] py-[var(--token-spacing-2)]
                  text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)]
                  transition-colors duration-[var(--token-transition-fast)] cursor-pointer
                  ${
                    selected === id
                      ? 'bg-shell-selected text-shell-selected-text font-medium'
                      : 'text-shell-text hover:bg-shell-hover'
                  }
                `}
              >
                {f.label}
              </button>
            )
          })}
        </>
      )}

      {/* Components */}
      {activeTab === 'components' && (
        <>
          <div className="px-[var(--token-spacing-md)] pb-[var(--token-spacing-3)]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              className="w-full px-[var(--token-spacing-2)] py-[var(--token-spacing-1)] bg-shell-input border border-shell-border rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-caption)] text-shell-text placeholder:text-shell-text-tertiary outline-none focus:border-shell-selected-text transition-colors"
            />
          </div>
          {componentCategories.map(({ key, label }) => {
            const components = getComponentsByCategory(key).filter((c) => !query || c.name.toLowerCase().includes(query))
            if (components.length === 0) return null
            return (
              <div key={key} className="mb-[var(--token-spacing-2)]">
                <p className="px-[var(--token-spacing-md)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">
                  {label}
                </p>
                {components.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onSelect(c.name)}
                    className={`
                      w-full text-left px-[var(--token-spacing-md)] py-[var(--token-spacing-2)]
                      text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)]
                      transition-colors duration-[var(--token-transition-fast)] cursor-pointer
                      ${
                        selected === c.name
                          ? 'bg-shell-selected text-shell-selected-text font-medium'
                          : 'text-shell-text hover:bg-shell-hover'
                      }
                    `}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )
          })}

          {/* Screen Parts */}
          <div className="mb-[var(--token-spacing-2)]">
            <button
              type="button"
              onClick={() => onSelect('screen-parts')}
              className={`
                w-full text-left px-[var(--token-spacing-md)] py-[var(--token-spacing-1)]
                text-[length:var(--token-font-size-caption)] font-medium uppercase tracking-wider
                transition-colors duration-[var(--token-transition-fast)] cursor-pointer
                ${
                  selected === 'screen-parts'
                    ? 'text-shell-selected-text'
                    : 'text-shell-text-tertiary hover:text-shell-text-secondary'
                }
              `}
            >
              Screen Parts
            </button>
          </div>
        </>
      )}

      {/* Patterns */}
      {activeTab === 'patterns' && (
        <>
          {patterns.map((p) => {
            const id = `pattern:${p.key}`
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => onSelect(id)}
                className={`
                  w-full text-left px-[var(--token-spacing-md)] py-[var(--token-spacing-2)]
                  text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)]
                  transition-colors duration-[var(--token-transition-fast)] cursor-pointer
                  ${
                    selected === id
                      ? 'bg-shell-selected text-shell-selected-text font-medium'
                      : 'text-shell-text hover:bg-shell-hover'
                  }
                `}
              >
                {p.label}
              </button>
            )
          })}
        </>
      )}
    </aside>
  )
}
