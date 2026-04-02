/**
 * Screen6_Success — Confetti celebration success screen.
 * Dark-themed, glassmorphism, Framer Motion. NO library components.
 */
import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import {
  getAsset,
  isVolatile,
  formatBRL,
  formatQuantity,
} from '../invest-2-light/shared/data'
import type { AssetTicker } from '../invest-2-light/shared/data'
import { getAssetPalette } from '../invest-2-light/shared/assetPalette'
import {
  BG,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  GREEN,
  SAFE_TOP,
  SAFE_BOTTOM,
  fadeUp,
  glowBg,
  glass,
} from '../invest-2-light/shared/theme'
import { stagger } from '../invest-2-light/shared/animations'
import { playSuccess } from '../invest-2-light/shared/sounds'

// ── Types ──

interface ScreenData {
  assetTicker?: string
  mode?: 'buy' | 'sell'
  [key: string]: unknown
}

// ── Confetti particle generator ──

interface Particle {
  id: number
  x: number        // % from left
  color: string
  size: number
  shape: 'circle' | 'rect'
  delay: number
  duration: number
  rotate: number
  drift: number    // horizontal oscillation amplitude
}

function generateParticles(assetColor: string): Particle[] {
  const palette = [assetColor, GREEN, '#ffffff', '#A78BFA', '#FBBF24', assetColor]
  return Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 10 + ((i * 67 + 13) % 80),                           // pseudo-random spread 10-90%
    color: palette[i % palette.length],
    size: 6 + ((i * 3) % 5),                                 // 6-10px
    shape: i % 3 === 0 ? 'rect' as const : 'circle' as const,
    delay: (i * 0.06),                                        // 0 to ~0.84s stagger
    duration: 1.5 + ((i * 7) % 15) / 10,                     // 1.5 to 3s
    rotate: (i * 47) % 360,
    drift: Math.random() * 20 + 5,
  }))
}

// ── Component ──

export default function Screen6_Success({
  onNext,
  onElementTap,
}: FlowScreenProps) {
  const { assetTicker = 'BTC', mode = 'buy' } = useScreenData<ScreenData>()
  const asset = getAsset(assetTicker as AssetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const isBuy = mode === 'buy'

  const particles = useMemo(() => generateParticles(palette.bg), [palette.bg])

  // Play success sound after checkmark entrance
  useEffect(() => {
    const timeout = setTimeout(() => playSuccess(), 300)
    return () => clearTimeout(timeout)
  }, [])

  const now = new Date()
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const summaryRows = [
    { label: 'Ativo', value: asset.name },
    { label: 'Valor', value: formatBRL(100) },
    ...(volatile
      ? [
          {
            label: 'Quantidade',
            value: formatQuantity(
              asset.price ? 100 / asset.price : 0,
              asset.ticker,
            ),
          },
        ]
      : []),
    { label: 'Data/Hora', value: `${dateStr} as ${timeStr}` },
  ]

  const handleEntendi = () => {
    const handled = onElementTap?.('Button: Entendi')
    if (!handled) onNext()
  }

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden"
      style={{ background: BG }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: glowBg(palette.accent, 0.1) }}
      />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              width: p.size,
              height: p.shape === 'rect' ? p.size * 1.4 : p.size,
              borderRadius: p.shape === 'circle' ? '50%' : 2,
              background: p.color,
            }}
            initial={{
              y: '110vh',
              rotate: 0,
              scale: 1,
              opacity: 0.9,
            }}
            animate={{
              y: '-10vh',
              x: [0, p.drift, 0, -p.drift, 0],
              rotate: p.rotate,
              scale: 0.3,
              opacity: 0,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Safe area spacer */}
      <div className="flex-shrink-0" style={{ paddingTop: SAFE_TOP }} />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 flex flex-col items-center overflow-y-auto px-5">
        {/* Spacer */}
        <div className="flex-1 min-h-12" />

        {/* Checkmark circle */}
        <motion.div
          className="relative flex items-center justify-center"
          style={{ width: 96, height: 96 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.3,
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${palette.bg}`,
              boxShadow: `0 0 24px ${palette.bg}33`,
            }}
          />
          {/* Inner check */}
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.6,
            }}
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
            />
          </motion.svg>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="mt-6 text-center"
          style={{
            color: TEXT_PRIMARY,
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 }}
        >
          Operacao realizada!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-2 text-center"
          style={{ color: TEXT_SECONDARY, fontSize: 14 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.65 }}
        >
          Sua {isBuy ? 'compra' : 'venda'} de {asset.name} foi executada
        </motion.p>

        {/* Summary card */}
        <motion.div
          className="w-full rounded-2xl overflow-hidden mt-8"
          style={{
            ...glass,
            border: `1px solid ${BORDER}`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          {summaryRows.map((row, i) => (
            <motion.div
              key={row.label}
              {...stagger(0.8, i)}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                borderBottom:
                  i < summaryRows.length - 1
                    ? '1px solid rgba(0,0,0,0.03)'
                    : undefined,
              }}
            >
              <span style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                {row.label}
              </span>
              <span
                style={{
                  color: TEXT_PRIMARY,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {row.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-6" />
      </div>

      {/* Bottom CTA */}
      <div
        className="relative z-10 flex-shrink-0 px-5"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <motion.button
          onClick={handleEntendi}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-xl border-none cursor-pointer"
          style={{
            height: 52,
            ...glass,
            border: `1px solid ${BORDER}`,
            color: TEXT_PRIMARY,
            fontSize: 16,
            fontWeight: 600,
          }}
          {...fadeUp(1.0)}
        >
          Entendi
        </motion.button>
      </div>
    </div>
  )
}
