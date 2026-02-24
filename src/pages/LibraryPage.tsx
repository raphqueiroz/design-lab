import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useLocation } from 'react-router-dom'

/* Force side-effect registration of all components */
import '../library/foundations'
import '../library/inputs'
import '../library/display'
import '../library/feedback'
import '../library/navigation'
import '../library/layout'

import ComponentSidebar from './library/ComponentSidebar'
import ComponentDetail from './library/ComponentDetail'
import TokenEditor from './library/TokenEditor'
import { getAllComponents } from '../library/registry'
import { isSupabaseConnected } from '../lib/supabase'

export default function LibraryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  /* Pick first component as default on mount */
  useEffect(() => {
    if (!selected) {
      const all = getAllComponents()
      if (all.length > 0) {
        setSelected(all[0].name)
      }
    }
  }, [selected])

  const handleSelect = (name: string) => {
    setSelected(name)
  }

  const isLibrary = location.pathname.startsWith('/library')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col bg-background"
    >
      {/* Top bar */}
      <header className="h-[48px] flex items-center justify-between px-[var(--token-spacing-md)] border-b border-border-default bg-surface-primary shrink-0">
        <div className="flex items-center gap-[var(--token-spacing-2)]">
          <h1 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-text-primary">
            Picnic Design Lab
          </h1>
          <span
            title={isSupabaseConnected() ? 'Connected to Supabase' : 'Local only — configure .env for Supabase'}
            className={`w-[6px] h-[6px] rounded-[var(--token-radius-full)] ${isSupabaseConnected() ? 'bg-success' : 'bg-neutral-300'}`}
          />
        </div>
        <nav className="flex gap-[var(--token-spacing-1)]">
          <Link
            to="/library"
            className={`px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] font-medium transition-colors no-underline ${
              isLibrary
                ? 'bg-brand-50 text-interactive-default'
                : 'text-text-secondary hover:bg-surface-secondary'
            }`}
          >
            Library
          </Link>
          <Link
            to="/simulator"
            className={`px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] font-medium transition-colors no-underline ${
              !isLibrary
                ? 'bg-brand-50 text-interactive-default'
                : 'text-text-secondary hover:bg-surface-secondary'
            }`}
            onClick={(e) => {
              e.preventDefault()
              navigate('/simulator')
            }}
          >
            Simulator
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentSidebar selected={selected} onSelect={handleSelect} />
        {selected ? (
          <ComponentDetail componentName={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-tertiary">
            Select a component
          </div>
        )}
        <TokenEditor />
      </div>
    </motion.div>
  )
}
