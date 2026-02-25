import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Monitor, GitBranch } from 'lucide-react'

/* Force flow registrations */
import '../flows/deposit'
import '../flows/perks'

import AppHeader from '../components/AppHeader'
import FlowSidebar from './simulator/FlowSidebar'
import FlowPlayer from './simulator/FlowPlayer'
import FlowCanvas from './simulator/FlowCanvas'
import { getAllFlows, getFlow, hydrateDynamicFlows } from './simulator/flowRegistry'
import { hydrateFromSupabase, subscribeToChanges } from './simulator/flowStore'
import { hydrateGraphsFromSupabase, subscribeToGraphChanges } from './simulator/flowGraphStore'

type ViewMode = 'flow' | 'prototype'

const viewModes = [
  { key: 'flow' as const, label: 'Flow', icon: GitBranch },
  { key: 'prototype' as const, label: 'Prototype', icon: Monitor },
]

export default function SimulatorPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)
  const [, setVersion] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('flow')
  const [targetScreenId, setTargetScreenId] = useState<string | null>(null)

  useEffect(() => {
    hydrateDynamicFlows()
    setVersion((v) => v + 1)
  }, [])

  // Pick up ?flow= query parameter from deep links (e.g. from Pages sidebar)
  useEffect(() => {
    const flowParam = searchParams.get('flow')
    if (flowParam) {
      setSelectedFlowId(flowParam)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!selectedFlowId) {
      const all = getAllFlows()
      if (all.length > 0) setSelectedFlowId(all[0].id)
    }
  }, [selectedFlowId])

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

  const handleNavigateToScreen = useCallback((screenId: string) => {
    setTargetScreenId(screenId)
    setViewMode('prototype')
  }, [])

  const selectedFlow = selectedFlowId ? getFlow(selectedFlowId) : null
  const activeIndex = viewModes.findIndex((m) => m.key === viewMode)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col bg-shell-bg"
    >
      <AppHeader />

      {/* Sub-header: view toggle + flow name */}
      <div className="h-[40px] flex items-center px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
        <div className="flex-1 min-w-0" />

        {/* 2-way view toggle (centered) */}
        <div className="relative flex w-[200px] p-[2px] bg-shell-bg rounded-[var(--token-radius-sm)] shrink-0">
          <motion.div
            className="absolute top-[2px] bottom-[2px] bg-shell-hover rounded-[6px]"
            initial={false}
            animate={{
              left: activeIndex === 0 ? '2px' : 'calc(50%)',
              width: 'calc(50% - 2px)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setViewMode(mode.key)}
              className={`
                relative z-10 flex items-center justify-center gap-[var(--token-spacing-1)]
                flex-1 min-w-[80px]
                px-[var(--token-spacing-3)] py-[var(--token-spacing-1)]
                text-[length:var(--token-font-size-caption)] font-medium
                transition-colors cursor-pointer rounded-[6px]
                ${viewMode === mode.key ? 'text-shell-text' : 'text-shell-text-tertiary hover:text-shell-text-secondary'}
              `}
            >
              <mode.icon size={12} />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Flow name (right side) */}
        <div className="flex-1 flex items-center justify-end min-w-0">
          {selectedFlow && (
            <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">
              {selectedFlow.name}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <FlowSidebar selectedFlowId={selectedFlowId} onSelect={setSelectedFlowId} onFlowCreated={() => setVersion((v) => v + 1)} />
        {selectedFlowId && selectedFlow ? (
          viewMode === 'prototype' ? (
            <FlowPlayer flowId={selectedFlowId} initialScreenId={targetScreenId} />
          ) : (
            <FlowCanvas
              flow={selectedFlow}
              onNavigateToScreen={handleNavigateToScreen}
              onFlowChanged={() => setVersion((v) => v + 1)}
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
