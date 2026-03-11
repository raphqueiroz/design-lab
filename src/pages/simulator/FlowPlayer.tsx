import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiRefreshLine,
  RiSmartphoneLine, RiComputerLine,
} from '@remixicon/react'
import { getFlow, updateFlowMeta } from './flowRegistry'
import { getDynamicFlow, saveDynamicFlow, updateScreenInFlow } from './dynamicFlowStore'
import { syncScreenTitleToNode } from './flowGraphSync'
import { getFlowGraph } from './flowGraphStore'
import { deriveNavigationPath, getNextScreenOptions, getOverlaysForScreen, resolveOverlayElementTarget } from './flowGraphNavigation'
import type { FlowNodeData } from './flowGraph.types'
import PhoneFrame, { type PhoneSize } from './PhoneFrame'
import DesktopFrame from './DesktopFrame'
import AnnotationsPanel from './AnnotationsPanel'
import { useIframeBridge, type IframeBridgeRenderData } from './useIframeBridge'

type DeviceMode = 'phone-sm' | 'phone-lg' | 'desktop'

interface FlowPlayerProps {
  flowId: string
  initialScreenId?: string | null
  onNavigateToFlow?: (flowId: string) => void
  onRenameFlow?: (newId: string) => Promise<boolean>
}

export default function FlowPlayer({ flowId, initialScreenId, onNavigateToFlow, onRenameFlow }: FlowPlayerProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [navHistory, setNavHistory] = useState<string[]>([])
  const [direction, setDirection] = useState(1)
  const [editVersion, setEditVersion] = useState(0)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone-lg')
  const [activeNavId] = useState('home')
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null)
  const [localActiveStateId, setLocalActiveStateId] = useState<string | null>(null)
  const [stateKey, setStateKey] = useState(0)

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

  // Reset to first screen when switching flows
  const prevFlowIdForReset = useRef(flowId)
  useEffect(() => {
    if (navPath.length === 0) {
      setCurrentNodeId(null)
      return
    }

    // Flow changed — always reset to the beginning
    if (prevFlowIdForReset.current !== flowId) {
      prevFlowIdForReset.current = flowId
      setDirection(1)
      setCurrentNodeId(navPath[0].nodeId)
      setNavHistory([])
      return
    }

    if (initialScreenId) {
      const step = navPath.find(s => s.screenId === initialScreenId)
      if (step) {
        setDirection(1)
        setCurrentNodeId(step.nodeId)
        setNavHistory([])
        return
      }
    }

    setCurrentNodeId((prev) => {
      if (prev && navPath.some(s => s.nodeId === prev)) return prev
      return navPath[0].nodeId
    })
  }, [flowId, navPath, initialScreenId])

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

  const handleScreenStateChange = useCallback((stateId: string) => {
    const screen = flow?.screens.find(s => {
      const step = navPath[currentStepIndex]
      return step && s.id === step.screenId
    })
    if (!screen?.states || screen.states.some(s => s.id === stateId)) {
      setLocalActiveStateId(stateId)
    }
  }, [flow?.screens, navPath, currentStepIndex])

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

  const goNext = useCallback(() => {
    if (!graph || !currentNodeId) return

    const nextOptions = getNextScreenOptions(currentNodeId, graph.nodes, graph.edges)
    if (nextOptions.length === 0) return

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

  const handleFlowDescriptionUpdate = useCallback((description: string) => {
    updateFlowMeta(flowId, { description })
    const dynFlow = getDynamicFlow(flowId)
    if (dynFlow) {
      dynFlow.description = description
      saveDynamicFlow(dynFlow)
    }
    setEditVersion((v) => v + 1)
  }, [flowId])

  const handleScreenTitleUpdate = useCallback((screenId: string, title: string) => {
    updateScreenInFlow(flowId, screenId, { title })
    syncScreenTitleToNode(flowId, screenId, title)
    // Update in-memory flow registry
    const f = getFlow(flowId)
    if (f) {
      const screen = f.screens.find(s => s.id === screenId)
      if (screen) (screen as { title: string }).title = title
    }
    setEditVersion((v) => v + 1)
  }, [flowId])

  // ── iframe bridge ──

  const bridgeCallbacks = useMemo(() => ({
    onNavigate: (nodeId: string, _screenId: string) => {
      setDirection(1)
      setNavHistory((h) => currentNodeId ? [...h, currentNodeId] : h)
      setCurrentNodeId(nodeId)
      setActiveOverlayId(null)
    },
    onBack: goBack,
    onNext: goNext,
    onNavigateFlow: (fId: string) => {
      if (onNavigateToFlow) onNavigateToFlow(fId)
    },
    onStateChange: handleScreenStateChange,
    onOpenOverlay: (overlayId: string) => setActiveOverlayId(overlayId),
    onCloseOverlay: () => setActiveOverlayId(null),
    onOverlayElementClick: handleOverlayElementClick,
  }), [currentNodeId, goBack, goNext, onNavigateToFlow, handleScreenStateChange, handleOverlayElementClick])

  const { iframeRef, keyboardType, sendRender, sendSafeAreas, resetReady } = useIframeBridge(bridgeCallbacks)

  // Reset iframe bridge when flowId changes (iframe reloads with new src)
  const prevFlowIdRef = useRef(flowId)
  useEffect(() => {
    if (prevFlowIdRef.current !== flowId) {
      prevFlowIdRef.current = flowId
      resetReady()
    }
  }, [flowId, resetReady])

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

  const _version = editVersion
  const isDesktop = deviceMode === 'desktop'
  const phoneSize: PhoneSize = deviceMode === 'phone-sm' ? 'sm' : 'lg'

  // Determine navigation level
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

  // Resolve state data for current screen
  const screenStates = current.states
  const resolvedStateId = localActiveStateId ?? currentNodeData?.activeStateId as string | undefined
  const activeState = screenStates?.find(s => s.id === resolvedStateId)
    ?? screenStates?.find(s => s.isDefault)
  const stateData = activeState?.data ?? {}

  // ── Send render command to iframe ──
  // We call sendRender as a side effect during render. This is intentional:
  // we need it to fire on every state change that affects what the iframe shows.
  // Using useEffect would add a frame delay and cause visual glitches.
  const iframeSrc = `/preview/${flowId}`

  // Build render data for the bridge — strip non-serializable values (functions)
  const serializableBreadcrumbs = breadcrumbs.map(({ label }) => ({ label }))
  const serializableOverlays = screenOverlays.map(o => ({
    nodeId: o.nodeId,
    label: o.label,
    description: o.description,
    overlayType: o.overlayType,
    triggerLabel: o.triggerLabel,
    triggerActionType: o.triggerActionType,
  }))
  const serializableStates = current.states?.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    isDefault: s.isDefault,
    data: s.data,
  }))

  const renderData = {
    flowId,
    screenId: current.id,
    screenTitle: current.title,
    screenDescription: current.description,
    stateData,
    direction,
    stateKey,
    level,
    breadcrumbs: serializableBreadcrumbs,
    overlays: serializableOverlays,
    activeOverlayId,
    overlayElements: activeOverlayElements as { id: string; component: string; label: string }[] | undefined,
    activeNavId,
    states: serializableStates,
  }

  // Send safe areas based on device mode
  const safeAreaTop = isDesktop ? '0px' : '62px'
  const safeAreaBottom = isDesktop ? '0px' : (keyboardType ? '0px' : '34px')

  const deviceModeButtons: { mode: DeviceMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'phone-sm', label: 'Phone sm', icon: <RiSmartphoneLine size={13} /> },
    { mode: 'phone-lg', label: 'Phone lg', icon: <RiSmartphoneLine size={15} /> },
    { mode: 'desktop', label: 'Desktop', icon: <RiComputerLine size={14} /> },
  ]

  return (
    <div className="flex-1 flex overflow-hidden" data-version={_version}>
      {/* Center: Device + controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-shell-bg py-[var(--token-spacing-md)] overflow-auto">
        {/* Pagination controls — top */}
        <div className="flex items-center gap-[var(--token-spacing-3)]">
          <button
            type="button"
            onClick={goBack}
            disabled={!hasBack}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
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
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
          >
            <RiArrowRightSLine size={18} />
          </button>
          <button
            type="button"
            onClick={restart}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer ml-[var(--token-spacing-2)] text-shell-text"
          >
            <RiRefreshLine size={16} />
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

        {/* Device frame with iframe */}
        {isDesktop ? (
          <DesktopFrame
            iframeSrc={iframeSrc}
            iframeRef={iframeRef}
          />
        ) : (
          <PhoneFrame
            size={phoneSize}
            iframeSrc={iframeSrc}
            iframeRef={iframeRef}
            controlledKeyboardType={keyboardType}
          />
        )}

        {/* Device mode toggle — below simulator */}
        <div className="flex items-center p-[2px] bg-shell-surface border border-shell-border rounded-lg">
          {deviceModeButtons.map(({ mode, label, icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setDeviceMode(mode); resetReady() }}
              className={`
                flex items-center gap-[5px] px-2.5 py-[5px] rounded-md text-[12px] font-medium transition-colors cursor-pointer
                ${deviceMode === mode
                  ? 'bg-shell-hover text-shell-text'
                  : 'text-shell-text-secondary hover:text-shell-text'
                }
              `}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Annotations */}
      <AnnotationsPanel
        flow={flow}
        currentScreen={current}
        screenIndex={currentStepIndex}
        onFlowEdited={handleFlowEdited}
        onRenameFlow={onRenameFlow}
        onFlowDescriptionUpdate={handleFlowDescriptionUpdate}
        onScreenTitleUpdate={handleScreenTitleUpdate}
      />

      {/* Send render data to iframe via effect */}
      <IframeRenderEffect
        sendRender={sendRender}
        sendSafeAreas={sendSafeAreas}
        renderData={renderData}
        safeAreaTop={safeAreaTop}
        safeAreaBottom={safeAreaBottom}
      />
    </div>
  )
}

/**
 * Component that sends render commands to the iframe as an effect.
 * Separated to avoid calling hooks conditionally in the main component.
 */
function IframeRenderEffect({
  sendRender,
  sendSafeAreas,
  renderData,
  safeAreaTop,
  safeAreaBottom,
}: {
  sendRender: (data: IframeBridgeRenderData) => void
  sendSafeAreas: (top: string, bottom: string) => void
  renderData: IframeBridgeRenderData
  safeAreaTop: string
  safeAreaBottom: string
}) {
  useEffect(() => {
    sendRender(renderData)
  }, [sendRender, renderData.flowId, renderData.screenId, renderData.stateKey, renderData.direction, renderData.level, renderData.activeOverlayId, renderData.activeNavId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    sendSafeAreas(safeAreaTop, safeAreaBottom)
  }, [sendSafeAreas, safeAreaTop, safeAreaBottom])

  return null
}
