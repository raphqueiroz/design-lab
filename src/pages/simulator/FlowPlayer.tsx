import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { getFlow } from './flowRegistry'
import PhoneFrame from './PhoneFrame'
import AnnotationsPanel from './AnnotationsPanel'

interface FlowPlayerProps {
  flowId: string
  initialScreenId?: string | null
}

export default function FlowPlayer({ flowId, initialScreenId }: FlowPlayerProps) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [editVersion, setEditVersion] = useState(0)

  // Re-read flow from registry + localStorage on each render / edit
  const flow = getFlow(flowId)

  // When navigating from flow view, jump to the target screen
  useEffect(() => {
    if (initialScreenId && flow) {
      const idx = flow.screens.findIndex(s => s.id === initialScreenId)
      if (idx !== -1) {
        setDirection(1)
        setScreenIdx(idx)
      }
    }
  }, [initialScreenId]) // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    if (flow && screenIdx < flow.screens.length - 1) {
      setDirection(1)
      setScreenIdx((i) => i + 1)
    }
  }, [flow, screenIdx])

  const goBack = useCallback(() => {
    if (screenIdx > 0) {
      setDirection(-1)
      setScreenIdx((i) => i - 1)
    }
  }, [screenIdx])

  const restart = useCallback(() => {
    setDirection(-1)
    setScreenIdx(0)
  }, [])

  const handleFlowEdited = useCallback(() => {
    // Bump version to force re-render with fresh localStorage data
    setEditVersion((v) => v + 1)
  }, [])

  if (!flow) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        Select a flow from the sidebar
      </div>
    )
  }

  // Guard against screen index out of range after edits
  const safeIdx = Math.min(screenIdx, flow.screens.length - 1)
  const current = flow.screens[safeIdx]

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  // Use editVersion in key to suppress unused warning
  const _version = editVersion

  return (
    <div className="flex-1 flex overflow-hidden" data-version={_version}>
      {/* Center: Phone + controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-[var(--token-spacing-lg)] bg-shell-bg py-[var(--token-spacing-md)]">
        <PhoneFrame>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={safeIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              <current.component onNext={goNext} onBack={goBack} />
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>

        {/* Controls */}
        <div className="flex items-center gap-[var(--token-spacing-3)]">
          <button
            type="button"
            onClick={goBack}
            disabled={safeIdx === 0}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary min-w-[80px] text-center">
            {safeIdx + 1} / {flow.screens.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={safeIdx === flow.screens.length - 1}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-shell-text"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={restart}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-shell-surface border border-shell-border hover:bg-shell-hover transition-colors cursor-pointer ml-[var(--token-spacing-2)] text-shell-text"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Right: Annotations */}
      <AnnotationsPanel
        flow={flow}
        currentScreen={current}
        screenIndex={safeIdx}
        onFlowEdited={handleFlowEdited}
      />
    </div>
  )
}
