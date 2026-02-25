import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isSupabaseConnected } from '../lib/supabase'

interface AppHeaderProps {
  actions?: ReactNode
}

const navItems = [
  { to: '/components', label: 'Components' },
  { to: '/flows', label: 'Flows' },
  { to: '/pages', label: 'Pages' },
] as const

export default function AppHeader({ actions }: AppHeaderProps) {
  const location = useLocation()
  const activePrefix = navItems.find((item) => location.pathname.startsWith(item.to))?.to ?? '/components'

  return (
    <header className="h-[48px] flex items-center justify-between px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
      {/* Left: identity + sync */}
      <div className="flex items-center gap-[var(--token-spacing-2)] min-w-[200px]">
        <h1 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text">
          Picnic Design Lab
        </h1>
        <span
          title={isSupabaseConnected() ? 'Connected to Supabase' : 'Local only (localStorage)'}
          className="flex items-center gap-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary"
        >
          <span className={`inline-block w-[8px] h-[8px] rounded-[var(--token-radius-full)] ${isSupabaseConnected() ? 'bg-[#16A34A]' : 'bg-shell-active'}`} />
          {isSupabaseConnected() ? 'Synced' : 'Local'}
        </span>
      </div>

      {/* Center: primary navigation */}
      <nav className="flex gap-[var(--token-spacing-1)]">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] font-medium transition-colors no-underline ${
              activePrefix === item.to
                ? 'bg-shell-selected text-shell-selected-text'
                : 'text-shell-text-secondary hover:bg-shell-hover'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right: page-specific actions */}
      <div className="flex items-center gap-[var(--token-spacing-2)] min-w-[200px] justify-end">
        {actions}
      </div>
    </header>
  )
}
