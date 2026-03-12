import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiComputerLine, RiGitBranchLine, RiPaintBrushLine, RiAddLine } from '@remixicon/react'

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
    return searchParams.get('flow') || null
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
  const createTriggerRef = useRef<(() => void) | null>(null)

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
        <FlowSidebar selectedFlowId={selectedFlowId} onSelect={setSelectedFlowId} onFlowCreated={() => setVersion((v) => v + 1)} onFlowDeleted={() => setVersion((v) => v + 1)} createTriggerRef={createTriggerRef} />
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
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Decorative illustration — abstract flow nodes */}
            <div className="relative w-[200px] h-[120px] mb-6 opacity-25">
              {/* Simulated floating cards like the reference */}
              <div className="absolute top-0 left-[50%] -translate-x-1/2 w-[140px] h-[28px] rounded-[8px] bg-shell-text/10" />
              <div className="absolute top-[20px] left-[10px] w-[100px] h-[28px] rounded-[8px] bg-shell-text/15" />
              <div className="absolute top-[20px] right-[10px] w-[60px] h-[28px] rounded-[8px] bg-shell-text/8" />
              <div className="absolute top-[52px] left-[30px] w-[80px] h-[28px] rounded-[8px] bg-shell-text/12" />
              <div className="absolute top-[52px] right-[20px] w-[90px] h-[28px] rounded-[8px] bg-shell-text/10" />
              <div className="absolute top-[84px] left-[50%] -translate-x-1/2 w-[120px] h-[28px] rounded-[8px] bg-shell-text/8" />
              {/* Colored dots on some cards */}
              <div className="absolute top-[6px] right-[42px] w-[8px] h-[8px] rounded-full bg-[#4ade80]/60" />
              <div className="absolute top-[26px] left-[86px] w-[8px] h-[8px] rounded-full bg-[#60a5fa]/60" />
              <div className="absolute top-[58px] right-[34px] w-[8px] h-[8px] rounded-full bg-[#f472b6]/50" />
              <div className="absolute top-[90px] left-[calc(50%+30px)] w-[8px] h-[8px] rounded-full bg-[#facc15]/50" />
            </div>

            <h3 className="text-[15px] font-medium text-shell-text-secondary mb-1.5">
              No flow selected
            </h3>
            <p className="text-[13px] text-shell-text-tertiary mb-5 text-center max-w-[260px] leading-relaxed">
              Pick a flow from the sidebar to preview, edit its graph, or tweak the design.
            </p>
            <button
              type="button"
              onClick={() => createTriggerRef.current?.()}
              className="flex items-center gap-1.5 text-[13px] text-shell-text-tertiary hover:text-shell-selected-text transition-colors cursor-pointer"
            >
              <RiAddLine size={14} />
              Create a new flow
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
