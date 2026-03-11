import { type ReactNode, useState, useEffect, useCallback, useRef } from 'react'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import { isSupabaseConnected } from '../lib/supabase'
import { getSyncStatus, subscribeSyncStatus, pullFromSupabase, pushAllToSupabase, type SyncStatus } from '../lib/syncStore'

interface AppHeaderProps {
  center?: ReactNode
  actions?: ReactNode
  onSynced?: () => void
}

const statusConfig: Record<SyncStatus, { color: string; label: string; title: string }> = {
  idle: { color: 'bg-shell-active', label: 'Not synced', title: 'Connected to Supabase — not yet synced' },
  syncing: { color: 'bg-[#FBBF24]', label: 'Syncing…', title: 'Syncing with Supabase…' },
  synced: { color: 'bg-[#16A34A]', label: 'Synced', title: 'All data synced with Supabase' },
  unsynced: { color: 'bg-[#FBBF24]', label: 'Unsynced', title: 'Local changes not yet synced' },
  error: { color: 'bg-[#F87171]', label: 'Sync error', title: 'Sync failed — try again' },
  local: { color: 'bg-shell-active', label: 'Local', title: 'Local only (Supabase not configured)' },
}

export default function AppHeader({ center, actions, onSynced }: AppHeaderProps) {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus)
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => subscribeSyncStatus(setStatus), [])

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPopover])

  const handlePull = useCallback(async () => {
    const ok = await pullFromSupabase()
    if (ok) onSynced?.()
    setShowPopover(false)
  }, [onSynced])

  const handlePush = useCallback(async () => {
    await pushAllToSupabase()
    setShowPopover(false)
  }, [])

  const cfg = statusConfig[status]
  const isBusy = status === 'syncing'

  return (
    <header className="h-[48px] flex items-center justify-between px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
      {/* Left: sync status */}
      <div className="flex items-center gap-[var(--token-spacing-2)] min-w-[120px]">
        {isSupabaseConnected() ? (
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setShowPopover((p) => !p)}
              disabled={isBusy}
              title={cfg.title}
              className="flex items-center gap-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-tertiary hover:text-shell-text transition-colors cursor-pointer disabled:cursor-default"
            >
              <span className={`inline-block w-[8px] h-[8px] rounded-[var(--token-radius-full)] ${cfg.color} ${isBusy ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </button>

            {/* Pull/Push popover */}
            {showPopover && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-50 flex gap-[4px] p-[4px] bg-shell-surface border border-shell-border rounded-[var(--token-radius-sm)] shadow-lg">
                <button
                  type="button"
                  onClick={handlePull}
                  disabled={isBusy}
                  title="Pull from Supabase (remote → local)"
                  className="flex items-center gap-[4px] px-[8px] py-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-hover rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-default whitespace-nowrap"
                >
                  <RiArrowDownLine size={12} />
                  Pull
                </button>
                <button
                  type="button"
                  onClick={handlePush}
                  disabled={isBusy}
                  title="Push to Supabase (local → remote)"
                  className="flex items-center gap-[4px] px-[8px] py-[4px] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-hover rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-default whitespace-nowrap"
                >
                  <RiArrowUpLine size={12} />
                  Push
                </button>
              </div>
            )}
          </div>
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

      {/* Center: page-specific content (view toggle, etc.) */}
      <div className="flex items-center">
        {center}
      </div>

      {/* Right: page-specific actions */}
      <div className="flex items-center gap-[var(--token-spacing-2)] min-w-[200px] justify-end">
        {actions}
      </div>
    </header>
  )
}
