/**
 * Screen5_Processing — Orbital animation processing screen.
 * Dark-themed, immersive, auto-advancing. NO library components.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import { getAsset } from '../invest-2-light/shared/data'
import type { AssetTicker } from '../invest-2-light/shared/data'
import { getAssetPalette } from '../invest-2-light/shared/assetPalette'
import { BG, TEXT_PRIMARY, TEXT_TERTIARY, BG_GLASS, BORDER } from '../invest-2-light/shared/theme'
import { TokenLogo } from '../invest-2-light/shared/TokenLogo'
import { playSuccess } from '../invest-2-light/shared/sounds'

// ── Types ──

interface ScreenData {
  assetTicker?: string
  [key: string]: unknown
}

// ── Processing steps ──

const STEPS = [
  'Verificando saldo...',
  'Processando ordem...',
  'Atualizando portfolio...',
  'Pronto!',
]

const STEP_INTERVAL = 1500

// ── Component ──

export default function Screen5_Processing({ onNext }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<ScreenData>()
  const asset = getAsset(assetTicker as AssetTicker)
  const palette = getAssetPalette(assetTicker)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(timer)
          return prev
        }
        return prev + 1
      })
    }, STEP_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // Auto-advance after last step
  useEffect(() => {
    if (step === STEPS.length - 1) {
      playSuccess()
      const timeout = setTimeout(onNext, 800)
      return () => clearTimeout(timeout)
    }
  }, [step, onNext])

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div
      className="relative flex flex-col items-center justify-center h-full w-full"
      style={{ background: BG }}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* Subtle glow behind orbital */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 240,
          height: 240,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${palette.accent}15 0%, transparent 70%)`,
        }}
      />

      {/* Orbital animation */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 160, height: 160, marginBottom: 48 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 160,
            height: 160,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            border: `1px solid ${palette.accent}4D`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Orbiting dot */}
        <motion.div
          className="absolute"
          style={{
            width: 160,
            height: 160,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: palette.bg,
              boxShadow: `0 0 12px ${palette.bg}, 0 0 24px ${palette.bg}66`,
            }}
          />
        </motion.div>

        {/* Center icon */}
        <motion.div
          className="relative rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: BG_GLASS,
            border: `1px solid ${BORDER}`,
            backdropFilter: 'blur(12px)',
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <TokenLogo ticker={asset.ticker} fallbackUrl={asset.icon} size={32} color={palette.iconBg} className="rounded-full" />
        </motion.div>
      </div>

      {/* Step text */}
      <div className="relative h-8 flex items-center justify-center w-full px-8">
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              color: step === STEPS.length - 1 ? palette.bg : TEXT_PRIMARY,
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {STEPS[step]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-56 mt-6 px-8">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 4,
            background: BG_GLASS,
            border: `1px solid ${BORDER}`,
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: palette.bg }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Step counter */}
      <div className="mt-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ color: TEXT_TERTIARY, fontSize: 12 }}
          >
            {step + 1} / {STEPS.length}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Completion pulse */}
      <AnimatePresence>
        {step === STEPS.length - 1 && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 200,
              height: 200,
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-60%',
              border: `2px solid ${palette.bg}`,
            }}
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  )
}
