import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiRefreshLine,
  RiSmartphoneLine, RiComputerLine,
  RiHomeLine, RiBankCardLine,
  RiLineChartLine, RiGiftLine,
} from '@remixicon/react'
import { getFlow } from './flowRegistry'
import { ScreenDataProvider } from '../../lib/ScreenDataContext'
import { getFlowGraph } from './flowGraphStore'
import { deriveNavigationPath, getNextScreenOptions, getOverlaysForScreen, resolveScreenElementTarget, resolveOverlayElementTarget } from './flowGraphNavigation'
import type { FlowNodeData } from './flowGraph.types'
import BottomSheet from '../../library/layout/BottomSheet'
import PhoneFrame from './PhoneFrame'
import DesktopFrame from './DesktopFrame'
import AnnotationsPanel from './AnnotationsPanel'
import { LayoutProvider } from '../../library/layout/LayoutProvider'
import AppShell from '../../library/layout/AppShell'
import Sidebar from '../../library/navigation/Sidebar'
import TabBar from '../../library/navigation/TabBar'
import Text from '../../library/foundations/Text'

type DeviceMode = 'phone' | 'desktop'

const navItems = [
  { id: 'home', label: 'Início', icon: <RiHomeLine size={20} /> },
  { id: 'cards', label: 'Cartão', icon: <RiBankCardLine size={20} /> },
  { id: 'invest', label: 'Caixinha', icon: <RiLineChartLine size={20} /> },
  { id: 'perks', label: 'Benefícios', icon: <RiGiftLine size={20} /> },
]

interface FlowPlayerProps {
  flowId: string
  initialScreenId?: string | null
  onNavigateToFlow?: (flowId: string) => void
}

export default function FlowPlayer({ flowId, initialScreenId, onNavigateToFlow }: FlowPlayerProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [navHistory, setNavHistory] = useState<string[]>([])
  const [direction, setDirection] = useState(1)
  const [editVersion, setEditVersion] = useState(0)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone')
  const [activeNavId, setActiveNavId] = useState('home')
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null)
  const [localActiveStateId, setLocalActiveStateId] = useState<string | null>(null)
  const [stateKey, setStateKey] = useState(0) // incremented on pill click to force remount

  // Re-read flow from registry + localStorage on each render / edit
  const flow = getFlow(flowId)

  // Resolve the graph from store
  const graph = useMemo(() => {
    const stored = getFlowGraph(flowId)
    return stored ? { nodes: stored.nodes, edges: stored.edges } : null
  }, [flowId, editVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // Derive the linear navigation path from the graph
  const navPath = useMemo(() => {
    if (!graph) return []
    return deriveNavigationPath(graph.nodes, graph.edges)
  }, [graph])

  // Initialize or update currentNodeId when flow/graph changes
  useEffect(() => {
    if (navPath.length === 0) {
      setCurrentNodeId(null)
      return
    }

    // If initialScreenId provided, find its node
    if (initialScreenId) {
      const step = navPath.find(s => s.screenId === initialScreenId)
      if (step) {
        setDirection(1)
        setCurrentNodeId(step.nodeId)
        setNavHistory([])
        return
      }
    }

    // Default: start at first step (only if currentNodeId isn't already valid)
    setCurrentNodeId((prev) => {
      if (prev && navPath.some(s => s.nodeId === prev)) return prev
      return navPath[0].nodeId
    })
  }, [navPath, initialScreenId])

  // Find current position in navPath
  const currentStepIndex = useMemo(() => {
    if (!currentNodeId) return 0
    const idx = navPath.findIndex(s => s.nodeId === currentNodeId)
    return idx >= 0 ? idx : 0
  }, [navPath, currentNodeId])

  // Reset local state selection when node changes
  useEffect(() => {
    setLocalActiveStateId(null)
    setStateKey(0)
  }, [currentNodeId])

  // Called by screen components to report internal state changes (e.g. idle → loading → ready)
  // Only update the pill selection if the reported state ID exists in the screen's state definitions;
  // otherwise it's an internal state (e.g. loading) that shouldn't affect pill selection.
  const handleScreenStateChange = useCallback((stateId: string) => {
    const screen = flow.screens.find(s => {
      const step = navPath[currentStepIndex]
      return step && s.id === step.screenId
    })
    if (!screen?.states || screen.states.some(s => s.id === stateId)) {
      setLocalActiveStateId(stateId)
    }
  }, [flow.screens, navPath, currentStepIndex])

  // Overlays connected to the current screen node
  const screenOverlays = useMemo(() => {
    if (!graph || !currentNodeId) return []
    return getOverlaysForScreen(currentNodeId, graph.nodes, graph.edges)
  }, [graph, currentNodeId])

  // Resolve activeStateId from current node data
  const currentNodeData = useMemo(() => {
    if (!graph || !currentNodeId) return null
    const node = graph.nodes.find((n) => n.id === currentNodeId)
    return node?.data as FlowNodeData | null
  }, [graph, currentNodeId])

  const activeOverlay = useMemo(() => {
    if (!activeOverlayId) return null
    return screenOverlays.find((o) => o.nodeId === activeOverlayId) ?? null
  }, [activeOverlayId, screenOverlays])

  // Get the overlay node's interactiveElements from graph data
  const activeOverlayElements = useMemo(() => {
    if (!graph || !activeOverlayId) return undefined
    const node = graph.nodes.find((n) => n.id === activeOverlayId)
    const d = node?.data as FlowNodeData | undefined
    return d?.interactiveElements
  }, [graph, activeOverlayId])

  const handleOverlayElementClick = useCallback((element: { id: string; component: string; label: string }) => {
    if (!graph || !activeOverlayId) return
    const elementLabel = `${element.component}: ${element.label}`
    const target = resolveOverlayElementTarget(activeOverlayId, elementLabel, graph.nodes, graph.edges)
    if (!target) return

    if (target.type === 'flow' && onNavigateToFlow) {
      setActiveOverlayId(null)
      onNavigateToFlow(target.flowId)
    } else if (target.type === 'screen') {
      setDirection(1)
      setNavHistory((h) => [...h, currentNodeId!])
      setCurrentNodeId(target.nodeId)
      setActiveOverlayId(null)
    }
  }, [graph, activeOverlayId, currentNodeId, onNavigateToFlow])

  // Called by screen components when a user interacts with an element (e.g. tapping a Button, ListItem).
  // First resolves screen→action→destination paths, then overlay paths.
  // Returns true if a graph-based navigation target was found and executed.
  const handleElementTap = useCallback((elementLabel: string): boolean => {
    if (!graph || !currentNodeId) return false

    // 1. Check screen → action → destination paths
    const screenTarget = resolveScreenElementTarget(currentNodeId, elementLabel, graph.nodes, graph.edges)
    if (screenTarget) {
      if (screenTarget.type === 'flow' && onNavigateToFlow) {
        onNavigateToFlow(screenTarget.flowId)
        return true
      } else if (screenTarget.type === 'screen') {
        setDirection(1)
        setNavHistory((h) => [...h, currentNodeId])
        setCurrentNodeId(screenTarget.nodeId)
        return true
      }
    }

    // 2. Check overlay → action → destination paths
    for (const overlay of screenOverlays) {
      const target = resolveOverlayElementTarget(overlay.nodeId, elementLabel, graph.nodes, graph.edges)
      if (!target) continue

      if (target.type === 'flow' && onNavigateToFlow) {
        onNavigateToFlow(target.flowId)
        return true
      } else if (target.type === 'screen') {
        setDirection(1)
        setNavHistory((h) => [...h, currentNodeId])
        setCurrentNodeId(target.nodeId)
        return true
      }
    }

    return false
  }, [graph, currentNodeId, screenOverlays, onNavigateToFlow])

  const goNext = useCallback(() => {
    if (!graph || !currentNodeId) return

    const nextOptions = getNextScreenOptions(currentNodeId, graph.nodes, graph.edges)
    if (nextOptions.length === 0) return

    // Navigate to first option (branching UI is future work)
    const next = nextOptions[0]
    setDirection(1)
    setNavHistory((h) => [...h, currentNodeId])
    setCurrentNodeId(next.nodeId)
    setActiveOverlayId(null)
  }, [graph, currentNodeId])

  const goBack = useCallback(() => {
    if (navHistory.length === 0) return

    setDirection(-1)
    const prev = navHistory[navHistory.length - 1]
    setNavHistory((h) => h.slice(0, -1))
    setCurrentNodeId(prev)
    setActiveOverlayId(null)
  }, [navHistory])

  const restart = useCallback(() => {
    if (navPath.length === 0) return
    setDirection(-1)
    setCurrentNodeId(navPath[0].nodeId)
    setNavHistory([])
    setActiveOverlayId(null)
  }, [navPath])

  const handleFlowEdited = useCallback(() => {
    setEditVersion((v) => v + 1)
  }, [])

  if (!flow) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        Select a flow from the sidebar
      </div>
    )
  }

  // Resolve the current screen from navPath + flow.screens
  const currentStep = navPath[currentStepIndex]
  const current = currentStep
    ? flow.screens.find(s => s.id === currentStep.screenId) ?? flow.screens[0]
    : flow.screens[0]

  if (!current) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        No screens in this flow
      </div>
    )
  }

  // Check if next/back are possible
  const hasNext = graph && currentNodeId
    ? getNextScreenOptions(currentNodeId, graph.nodes, graph.edges).length > 0
    : false
  const hasBack = navHistory.length > 0

  const isStateSwap = stateKey > 0

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  const fadeVariants = {
    enter: () => ({ opacity: 0 }),
    center: { opacity: 1 },
    exit: () => ({ opacity: 0 }),
  }

  const _version = editVersion
  const isDesktop = deviceMode === 'desktop'
  const Frame = isDesktop ? DesktopFrame : PhoneFrame

  // Determine navigation level: flow can override (e.g. level 2 = no TabBar for all screens)
  const defaultLevel = currentStepIndex === 0 ? 1 : 2
  const level = flow.level ? Math.max(flow.level, defaultLevel) : defaultLevel

  // Build breadcrumbs for desktop level 2+
  const breadcrumbs = level >= 2
    ? [
        { label: flow.domain, onClick: restart },
        { label: flow.screens[0].title, onClick: restart },
        { label: current.title },
      ]
    : []

  const sidebarNode = (
    <Sidebar
      items={navItems}
      activeId={activeNavId}
      onChange={setActiveNavId}
      header={<Text variant="heading-sm">Picnic</Text>}
    />
  )

  const tabBarNode = (
    <TabBar
      items={navItems}
      activeId={activeNavId}
      onChange={setActiveNavId}
    />
  )

  // Resolve state data for current screen
  const screenStates = current.states
  const resolvedStateId = localActiveStateId ?? currentNodeData?.activeStateId as string | undefined
  const activeState = screenStates?.find(s => s.id === resolvedStateId)
    ?? screenStates?.find(s => s.isDefault)
  const stateData = activeState?.data ?? {}

  const animatedScreen = (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={`${currentStep?.nodeId ?? currentStepIndex}-s${stateKey}`}
        custom={direction}
        variants={isStateSwap ? fadeVariants : slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: isStateSwap ? 0.15 : 0.25, ease: 'easeOut' }}
        className="h-full"
      >
        <ScreenDataProvider data={stateData}>
          <current.component onNext={goNext} onBack={goBack} overlays={screenOverlays} onOpenOverlay={setActiveOverlayId} onElementTap={handleElementTap} onStateChange={handleScreenStateChange} />
        </ScreenDataProvider>
      </motion.div>
    </AnimatePresence>
  )

  const screenContent = (
    <LayoutProvider isDesktop={isDesktop} level={level} breadcrumbs={breadcrumbs}>
      <AppShell sidebar={sidebarNode} tabBar={tabBarNode}>
        {animatedScreen}
      </AppShell>
    </LayoutProvider>
  )

  return (
    <div className="flex-1 flex overflow-hidden" data-version={_version}>
      {/* Center: Device + controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-[var(--token-spacing-lg)] bg-shell-bg py-[var(--token-spacing-md)] overflow-auto">
        {/* Device mode toggle */}
        <div className="flex items-center p-[2px] bg-shell-surface border border-shell-border rounded-lg">
          <button
            type="button"
            onClick={() => setDeviceMode('phone')}
            className={`
              flex items-center gap-[6px] px-3 py-[6px] rounded-md text-[13px] font-medium transition-colors cursor-pointer
              ${deviceMode === 'phone'
                ? 'bg-shell-hover text-shell-text'
                : 'text-shell-text-secondary hover:text-shell-text'
              }
            `}
          >
            <RiSmartphoneLine size={14} />
            Phone
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`
              flex items-center gap-[6px] px-3 py-[6px] rounded-md text-[13px] font-medium transition-colors cursor-pointer
              ${deviceMode === 'desktop'
                ? 'bg-shell-hover text-shell-text'
                : 'text-shell-text-secondary hover:text-shell-text'
              }
            `}
          >
            <RiComputerLine size={14} />
            Desktop
          </button>
        </div>

        {/* State switcher pills */}
        {screenStates && screenStates.length > 1 && (
          <div className="flex items-center gap-[var(--token-spacing-1)]">
            {screenStates.map((state) => {
              const isActive = activeState?.id === state.id
              return (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => { setLocalActiveStateId(state.id); setStateKey(k => k + 1) }}
                  className={`
                    px-3 py-[4px] rounded-[var(--token-radius-full)] text-[13px] font-medium transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-shell-selected text-shell-selected-text'
                      : 'bg-shell-surface border border-shell-border text-shell-text-secondary hover:text-shell-text hover:bg-shell-hover'
                    }
                  `}
                >
                  {state.name}
                </button>
              )
            })}
          </div>
        )}

        <Frame>
          {screenContent}
          <BottomSheet open={!!activeOverlay} onClose={() => setActiveOverlayId(null)} title={activeOverlay?.label}>
            {activeOverlayElements && activeOverlayElements.length > 0 ? (
              <div className="flex flex-col">
                {activeOverlayElements.map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => handleOverlayElementClick(el)}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer border-b border-[var(--color-border-primary)] last:border-b-0"
                  >
                    <span className="text-[14px] font-medium text-[var(--color-content-primary)]">{el.label}</span>
                    <span className="text-[12px] text-[var(--color-content-tertiary)] ml-auto">{el.component}</span>
                  </button>
                ))}
              </div>
            ) : (
              <Text variant="body-md" color="content-secondary">
                {activeOverlay?.description || 'Overlay placeholder'}
              </Text>
            )}
          </BottomSheet>
        </Frame>

        {/* Controls */}
        <div className="flex items-center gap-[var(--token-spacing-3)]">
          <button
            type="button"
            onClick={goBack}
            disabled={!hasBack}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
          >
            <RiArrowLeftSLine size={18} />
          </button>
          <span className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary min-w-[80px] text-center">
            {currentStepIndex + 1} / {navPath.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
          >
            <RiArrowRightSLine size={18} />
          </button>
          <button
            type="button"
            onClick={restart}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer ml-[var(--token-spacing-2)] text-shell-text"
          >
            <RiRefreshLine size={16} />
          </button>
        </div>
      </div>

      {/* Right: Annotations */}
      <AnnotationsPanel
        flow={flow}
        currentScreen={current}
        screenIndex={currentStepIndex}
        onFlowEdited={handleFlowEdited}
      />
    </div>
  )
}
