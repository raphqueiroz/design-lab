import { useState, useCallback, useEffect } from 'react'
import { tokenCategories, type TokenMeta } from '../../tokens/tokenMeta'
import { setTokenVar, resetTokenVar } from '../../tokens'
import {
  getLocalTokenOverrides,
  setTokenOverride,
  resetTokenOverride,
  resetTokenCategory,
  hydrateTokensFromSupabase,
  subscribeToTokenChanges,
} from '../../lib/tokenStore'
import { isSupabaseConnected } from '../../lib/supabase'

function TokenInput({ token, initialValue }: { token: TokenMeta; initialValue: string }) {
  const [value, setValue] = useState(initialValue)

  const handleChange = useCallback(
    (newVal: string) => {
      setValue(newVal)
      setTokenVar(token.cssVar, newVal)
      setTokenOverride(token.cssVar, newVal)
    },
    [token.cssVar],
  )

  const handleReset = useCallback(() => {
    setValue(token.defaultValue)
    resetTokenVar(token.cssVar)
    resetTokenOverride(token.cssVar)
  }, [token.cssVar, token.defaultValue])

  if (token.type === 'color') {
    return (
      <div className="flex items-center gap-[var(--token-spacing-2)]">
        <input
          type="color"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-[28px] h-[28px] rounded-[var(--token-radius-sm)] border border-border-default cursor-pointer shrink-0 p-0"
        />
        <span className="flex-1 text-[length:var(--token-font-size-caption)] text-text-secondary font-mono truncate">
          {token.label}
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-[length:var(--token-font-size-caption)] text-text-tertiary hover:text-text-secondary cursor-pointer shrink-0"
        >
          Reset
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-[var(--token-spacing-2)]">
      <span className="flex-1 text-[length:var(--token-font-size-caption)] text-text-secondary truncate">
        {token.label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-[64px] px-[var(--token-spacing-2)] py-[1px] text-[length:var(--token-font-size-caption)] text-text-primary bg-surface-secondary border border-border-default rounded-[var(--token-radius-sm)] text-right"
      />
      <button
        type="button"
        onClick={handleReset}
        className="text-[length:var(--token-font-size-caption)] text-text-tertiary hover:text-text-secondary cursor-pointer shrink-0"
      >
        Reset
      </button>
    </div>
  )
}

function exportTokens() {
  const style = document.documentElement.style
  const cssLines: string[] = [':root {']
  const tsLines: string[] = ['export const tokens = {']

  for (const cat of tokenCategories) {
    for (const t of cat.tokens) {
      const val = style.getPropertyValue(`--token-${t.cssVar}`)?.trim() || t.defaultValue
      cssLines.push(`  --token-${t.cssVar}: ${val};`)
      const key = t.cssVar.replace(/-/g, '_')
      tsLines.push(`  '${key}': '${val}',`)
    }
  }

  cssLines.push('}')
  tsLines.push('} as const')

  const content = `/* CSS Custom Properties */\n${cssLines.join('\n')}\n\n/* TypeScript Constants */\n${tsLines.join('\n')}\n`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'design-tokens.txt'
  a.click()
  URL.revokeObjectURL(url)
}

export default function TokenEditor() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, string>>(getLocalTokenOverrides)

  // On mount: apply persisted overrides to CSS and hydrate from Supabase
  useEffect(() => {
    // Apply localStorage overrides immediately
    const local = getLocalTokenOverrides()
    for (const [cssVar, value] of Object.entries(local)) {
      document.documentElement.style.setProperty(`--token-${cssVar}`, value)
    }

    // Then hydrate from Supabase (may overwrite localStorage)
    hydrateTokensFromSupabase().then((hydrated) => {
      if (hydrated) setOverrides(getLocalTokenOverrides())
    })

    // Subscribe to real-time changes
    const unsub = subscribeToTokenChanges(() => {
      setOverrides(getLocalTokenOverrides())
    })

    return () => { unsub?.() }
  }, [])

  const handleResetCategory = (label: string) => {
    const cat = tokenCategories.find((c) => c.label === label)
    if (cat) {
      const vars = cat.tokens.map((t) => t.cssVar)
      cat.tokens.forEach((t) => resetTokenVar(t.cssVar))
      resetTokenCategory(vars)
      setOverrides(getLocalTokenOverrides())
    }
  }

  const supabaseStatus = isSupabaseConnected()

  return (
    <aside className="w-[280px] h-full shrink-0 overflow-y-auto border-l border-border-default bg-surface-primary">
      <div className="p-[var(--token-spacing-md)] flex items-center justify-between">
        <div className="flex items-center gap-[var(--token-spacing-2)]">
          <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-text-tertiary uppercase tracking-wider">
            Tokens
          </h2>
          <span
            title={supabaseStatus ? 'Syncing with Supabase' : 'Local only — configure .env for Supabase sync'}
            className={`w-[6px] h-[6px] rounded-[var(--token-radius-full)] ${supabaseStatus ? 'bg-success' : 'bg-neutral-300'}`}
          />
        </div>
        <button
          type="button"
          onClick={exportTokens}
          className="text-[length:var(--token-font-size-caption)] text-interactive-default hover:text-interactive-hover font-medium cursor-pointer"
        >
          Export
        </button>
      </div>

      {tokenCategories.map((cat) => (
        <div key={cat.label} className="border-t border-border-default">
          <button
            type="button"
            onClick={() => setExpanded(expanded === cat.label ? null : cat.label)}
            className="w-full flex items-center justify-between px-[var(--token-spacing-md)] py-[var(--token-spacing-3)] text-left cursor-pointer hover:bg-surface-secondary transition-colors"
          >
            <span className="text-[length:var(--token-font-size-body-sm)] font-medium text-text-primary">
              {cat.label}
            </span>
            <span className="text-[length:var(--token-font-size-caption)] text-text-tertiary">
              {cat.tokens.length}
            </span>
          </button>
          {expanded === cat.label && (
            <div className="px-[var(--token-spacing-md)] pb-[var(--token-spacing-3)]">
              <div className="flex justify-end mb-[var(--token-spacing-2)]">
                <button
                  type="button"
                  onClick={() => handleResetCategory(cat.label)}
                  className="text-[length:var(--token-font-size-caption)] text-text-tertiary hover:text-error cursor-pointer"
                >
                  Reset all
                </button>
              </div>
              <div className="flex flex-col gap-[var(--token-spacing-2)]">
                {cat.tokens.map((t) => (
                  <TokenInput
                    key={t.cssVar}
                    token={t}
                    initialValue={overrides[t.cssVar] ?? t.defaultValue}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}
