import { type ReactNode, useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RiRefreshLine } from '@remixicon/react'
import { isSupabaseConnected } from '../lib/supabase'
import { getSyncStatus, subscribeSyncStatus, syncAll, pushAllToSupabase, type SyncStatus } from '../lib/syncStore'

interface AppHeaderProps {
  actions?: ReactNode
  onSynced?: () => void
}

const navItems = [
  { to: '/components', label: 'Design System' },
  { to: '/flows', label: 'Flows' },
  { to: '/map', label: 'Map' },
  { to: '/pages', label: 'Pages' },
] as const

const statusConfig: Record<SyncStatus, { color: string; label: string; title: string }> = {
  idle: { color: 'bg-shell-active', label: 'Not synced', title: 'Connected to Supabase — not yet synced' },
  syncing: { color: 'bg-[#FBBF24]', label: 'Syncing…', title: 'Syncing with Supabase…' },
  synced: { color: 'bg-[#16A34A]', label: 'Synced', title: 'All data synced with Supabase' },
  error: { color: 'bg-[#F87171]', label: 'Sync error', title: 'Sync failed — click to retry' },
  local: { color: 'bg-shell-active', label: 'Local', title: 'Local only (Supabase not configured)' },
}

export default function AppHeader({ actions, onSynced }: AppHeaderProps) {
  const location = useLocation()
  const activePrefix = navItems.find((item) => location.pathname.startsWith(item.to))?.to ?? '/components'
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus)

  useEffect(() => subscribeSyncStatus(setStatus), [])

  const handleSync = useCallback(async () => {
    await pushAllToSupabase()
    const ok = await syncAll()
    if (ok) onSynced?.()
  }, [onSynced])

  const cfg = statusConfig[status]

  return (
    <header className="h-[48px] flex items-center justify-between px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
      {/* Left: identity + sync */}
      <div className="flex items-center gap-[var(--token-spacing-2)] min-w-[200px]">
        <h1 className="text-[length:var(--token-font-size-heading-sm)] font-black text-shell-text-secondary uppercase tracking-tight">
          NAPKIN
        </h1>
        {isSupabaseConnected() ? (
          <button
            type="button"
            onClick={handleSync}
            disabled={status === 'syncing'}
            title={cfg.title}
            className="flex items-center gap-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text transition-colors cursor-pointer disabled:cursor-default"
          >
            <span className={`inline-block w-[8px] h-[8px] rounded-[var(--token-radius-full)] ${cfg.color} ${status === 'syncing' ? 'animate-pulse' : ''}`} />
            {cfg.label}
            {status !== 'syncing' && <RiRefreshLine size={11} className="opacity-50" />}
          </button>
        ) : (
          <span
            title={cfg.title}
            className="flex items-center gap-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary"
          >
            <span className="inline-block w-[8px] h-[8px] rounded-[var(--token-radius-full)] bg-shell-active" />
            Local
          </span>
        )}
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
