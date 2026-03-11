import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiComputerLine, RiGitBranchLine, RiPaintBrushLine } from '@remixicon/react'

/* Auto-discover all flow registrations */
import.meta.glob('../flows/*/index.ts', { eager: true })

import AppHeader from '../components/AppHeader'
import FlowSidebar from './simulator/FlowSidebar'
import FlowPlayer from './simulator/FlowPlayer'
import FlowCanvas from './simulator/FlowCanvas'
import DesignCanvas from './simulator/DesignCanvas'
import { getAllFlows, getFlow, hydrateDynamicFlows, renameFlowIdCascade } from './simulator/flowRegistry'
import EditableFlowSlug from './simulator/EditableFlowSlug'
import { migrateHardcodedFlows, migrateStaleScreenPaths } from './simulator/flowMigration'
import { subscribeToGraphChanges } from './simulator/flowGraphStore'
import { subscribeToDynamicFlowChanges, migrateSavingsToEarnDomain } from './simulator/dynamicFlowStore'
import { seedDefaultGroups, migrateV1Flows, enableUserActions, subscribeToGroupChanges } from './simulator/flowGroupStore'
import { pullFromSupabase, pushAllToSupabase } from '../lib/syncStore'

// Expose push function for console use
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__pushToSupabase = pushAllToSupabase
}

type ViewMode = 'flow' | 'prototype' | 'design'

const viewModes = [
  { key: 'design' as const, label: 'Design', icon: RiPaintBrushLine },
  { key: 'prototype' as const, label: 'Prototype', icon: RiComputerLine },
  { key: 'flow' as const, label: 'Flow', icon: RiGitBranchLine },
]

export default function SimulatorPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive selectedFlowId and viewMode from URL params
  const selectedFlowId = useMemo(() => {
    const param = searchParams.get('flow')
    if (param) return param
    const all = getAllFlows()
    return all.length > 0 ? all[0].id : null
  }, [searchParams])

  const viewMode: ViewMode = (() => {
    const v = searchParams.get('view')
    if (v === 'prototype') return 'prototype'
    if (v === 'flow') return 'flow'
    return 'design'
  })()

  const setSelectedFlowId = useCallback((id: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (id) next.set('flow', id); else next.delete('flow')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setViewMode = useCallback((mode: ViewMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (mode === 'design') next.delete('view'); else next.set('view', mode)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const [, setVersion] = useState(0)
  const [targetScreenId, setTargetScreenId] = useState<string | null>(null)

  useEffect(() => {
    migrateHardcodedFlows()
    migrateStaleScreenPaths()
    migrateSavingsToEarnDomain()
    hydrateDynamicFlows()
    seedDefaultGroups()
    migrateV1Flows()
    setVersion((v) => v + 1)
  }, [])

  const handleSynced = useCallback(() => {
    hydrateDynamicFlows()
    setVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    pullFromSupabase().then((ok) => {
      enableUserActions()
      if (ok) {
        hydrateDynamicFlows()
        setVersion((v) => v + 1)
      }
    })
    const unsubGraphs = subscribeToGraphChanges(() => { setVersion((v) => v + 1) })
    const unsubDynFlows = subscribeToDynamicFlowChanges(() => {
      hydrateDynamicFlows()
      setVersion((v) => v + 1)
    })
    const unsubGroups = subscribeToGroupChanges(() => { setVersion((v) => v + 1) })
    return () => {
      unsubGraphs?.()
      unsubDynFlows?.()
      unsubGroups()
    }
  }, [])

  const handleNavigateToScreen = useCallback((screenId: string) => {
    setTargetScreenId(screenId)
    setViewMode('prototype')
  }, [setViewMode])

  const handleNavigateToFlow = useCallback((flowId: string) => {
    setSelectedFlowId(flowId)
  }, [setSelectedFlowId])

  const handleRenameFlow = useCallback(async (newId: string): Promise<boolean> => {
    if (!selectedFlowId) return false
    const ok = await renameFlowIdCascade(selectedFlowId, newId)
    if (ok) {
      setSelectedFlowId(newId)
      setVersion((v) => v + 1)
    }
    return ok
  }, [selectedFlowId, setSelectedFlowId])

  const selectedFlow = selectedFlowId ? getFlow(selectedFlowId) : null
  const activeIndex = viewModes.findIndex((m) => m.key === viewMode)

  // View toggle for AppHeader center slot
  const viewToggle = (
    <div className="flex items-center gap-[var(--token-spacing-3)]">
      <div className="relative flex w-[300px] p-[2px] bg-shell-bg rounded-[var(--token-radius-sm)]">
        <motion.div
          className="absolute top-[2px] bottom-[2px] bg-shell-hover rounded-[6px]"
          initial={false}
          animate={{
            left: activeIndex === 0 ? '2px' : activeIndex === 1 ? 'calc(33.333%)' : 'calc(66.666%)',
            width: `calc(33.333% - ${activeIndex === 2 ? 2 : activeIndex === 0 ? 2 : 0}px)`,
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
    </div>
  )

  // Flow name for AppHeader right slot
  const flowNameAction = selectedFlow ? (
    <EditableFlowSlug value={selectedFlow.id} onSave={handleRenameFlow} variant="inline" />
  ) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <AppHeader onSynced={handleSynced} center={viewToggle} actions={flowNameAction} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <FlowSidebar selectedFlowId={selectedFlowId} onSelect={setSelectedFlowId} onFlowCreated={() => setVersion((v) => v + 1)} onFlowDeleted={() => setVersion((v) => v + 1)} />
        {selectedFlowId && selectedFlow ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {viewMode === 'prototype' ? (
              <FlowPlayer
                flowId={selectedFlowId}
                initialScreenId={targetScreenId}
                onNavigateToFlow={handleNavigateToFlow}
                onRenameFlow={handleRenameFlow}
              />
            ) : viewMode === 'design' ? (
              <DesignCanvas
                flow={selectedFlow}
                initialScreenId={targetScreenId}
              />
            ) : (
              <FlowCanvas
                flow={selectedFlow}
                onNavigateToScreen={handleNavigateToScreen}
                onNavigateToFlow={handleNavigateToFlow}
                onFlowChanged={() => setVersion((v) => v + 1)}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
            Select a flow from the sidebar
          </div>
        )}
      </div>
    </motion.div>
  )
}
