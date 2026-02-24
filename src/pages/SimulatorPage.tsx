import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Monitor, GitBranch } from 'lucide-react'

/* Force flow registrations */
import '../flows/deposit'

import FlowSidebar from './simulator/FlowSidebar'
import FlowPlayer from './simulator/FlowPlayer'
import FlowCanvas from './simulator/FlowCanvas'
import { getAllFlows, getFlow } from './simulator/flowRegistry'
import { hydrateFromSupabase, subscribeToChanges } from './simulator/flowStore'
import { hydrateGraphsFromSupabase, subscribeToGraphChanges } from './simulator/flowGraphStore'
import { isSupabaseConnected } from '../lib/supabase'

type ViewMode = 'prototype' | 'flow'

export default function SimulatorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [, setVersion] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('prototype')
  const [targetScreenId, setTargetScreenId] = useState<string | null>(null)
  const isSimulator = location.pathname.startsWith('/simulator')

  useEffect(() => {
    if (!selectedFlowId) {
      const all = getAllFlows()
      if (all.length > 0) setSelectedFlowId(all[0].id)
    }
  }, [selectedFlowId])

  // Hydrate from Supabase + subscribe to real-time changes
  useEffect(() => {
    Promise.all([
      hydrateFromSupabase(),
      hydrateGraphsFromSupabase(),
    ]).then(([flowOk, graphOk]) => {
      if (flowOk || graphOk) setVersion((v) => v + 1)
    })
    const unsubFlows = subscribeToChanges(() => setVersion((v) => v + 1))
    const unsubGraphs = subscribeToGraphChanges(() => setVersion((v) => v + 1))
    return () => {
      unsubFlows?.()
      unsubGraphs?.()
    }
  }, [])

  // Navigate from flow view to prototype view at a specific screen
  const handleNavigateToScreen = useCallback((screenId: string) => {
    setTargetScreenId(screenId)
    setViewMode('prototype')
  }, [])

  const selectedFlow = selectedFlowId ? getFlow(selectedFlowId) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col bg-shell-bg"
    >
      {/* Top bar */}
      <header className="h-[48px] flex items-center justify-between px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
        <div className="flex items-center gap-[var(--token-spacing-2)]">
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

        {/* View toggle + nav */}
        <div className="flex items-center gap-[var(--token-spacing-3)]">
          {/* Prototype / Flow toggle */}
          <div className="relative flex p-[2px] bg-shell-bg rounded-[var(--token-radius-sm)]">
            <motion.div
              className="absolute top-[2px] bottom-[2px] bg-shell-hover rounded-[6px]"
              initial={false}
              animate={{
                left: viewMode === 'prototype' ? '2px' : 'calc(50% + 0px)',
                width: 'calc(50% - 4px)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setViewMode('prototype')}
              className={`
                relative z-10 flex items-center gap-[var(--token-spacing-1)]
                px-[var(--token-spacing-3)] py-[var(--token-spacing-1)]
                text-[length:var(--token-font-size-caption)] font-medium
                transition-colors cursor-pointer rounded-[6px]
                ${viewMode === 'prototype' ? 'text-shell-text' : 'text-shell-text-tertiary hover:text-shell-text-secondary'}
              `}
            >
              <Monitor size={12} />
              Prototype
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`
                relative z-10 flex items-center gap-[var(--token-spacing-1)]
                px-[var(--token-spacing-3)] py-[var(--token-spacing-1)]
                text-[length:var(--token-font-size-caption)] font-medium
                transition-colors cursor-pointer rounded-[6px]
                ${viewMode === 'flow' ? 'text-shell-text' : 'text-shell-text-tertiary hover:text-shell-text-secondary'}
              `}
            >
              <GitBranch size={12} />
              Flow
            </button>
          </div>

          {/* Page nav */}
          <nav className="flex gap-[var(--token-spacing-1)]">
            <Link
              to="/library"
              className={`px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] font-medium transition-colors no-underline ${
                !isSimulator
                  ? 'bg-shell-selected text-shell-selected-text'
                  : 'text-shell-text-secondary hover:bg-shell-hover'
              }`}
              onClick={(e) => {
                e.preventDefault()
                navigate('/library')
              }}
            >
              Library
            </Link>
            <Link
              to="/simulator"
              className={`px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] font-medium transition-colors no-underline ${
                isSimulator
                  ? 'bg-shell-selected text-shell-selected-text'
                  : 'text-shell-text-secondary hover:bg-shell-hover'
              }`}
            >
              Simulator
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <FlowSidebar selectedFlowId={selectedFlowId} onSelect={setSelectedFlowId} />
        {selectedFlowId && selectedFlow ? (
          viewMode === 'prototype' ? (
            <FlowPlayer flowId={selectedFlowId} initialScreenId={targetScreenId} />
          ) : (
            <FlowCanvas
              flow={selectedFlow}
              onNavigateToScreen={handleNavigateToScreen}
            />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
            Select a flow from the sidebar
          </div>
        )}
      </div>
    </motion.div>
  )
}
