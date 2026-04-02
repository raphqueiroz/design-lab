/**
 * Screen4_Review — Slide-to-confirm review screen.
 * Dark-themed, glassmorphism, Framer Motion. NO library components.
 */
import { useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'framer-motion'
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
import { listContainer, listItemY } from '../invest-2-light/shared/animations'
import { playConfirm } from '../invest-2-light/shared/sounds'
import {
  BG,
  BORDER,
  BG_GLASS,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  GREEN,
  RED,
  SAFE_TOP,
  SAFE_BOTTOM,
  fadeUp,
  glowBg,
  glass,
} from '../invest-2-light/shared/theme'
import { TokenLogoCircle } from '../invest-2-light/shared/TokenLogo'

// ── Types ──

interface ScreenData {
  assetTicker?: string
  mode?: 'buy' | 'sell'
  [key: string]: unknown
}

interface SummaryRow {
  label: string
  value: string
  color?: string
}

// ── Component ──

export default function Screen4_Review({
  onBack,
  onNext,
  onElementTap,
}: FlowScreenProps) {
  const { assetTicker = 'BTC', mode = 'buy' } = useScreenData<ScreenData>()
  const asset = getAsset(assetTicker as AssetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const isBuy = mode === 'buy'

  // Slide-to-confirm state
  const trackRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)
  const [confirmed, setConfirmed] = useState(false)
  const [trackWidth, setTrackWidth] = useState(300)

  // Derived transforms
  const thumbTravel = trackWidth - 56 // track minus padding
  const progress = useTransform(dragX, [0, thumbTravel], [0, 1])
  const trackFillOpacity = useTransform(progress, [0, 1], [0, 0.3])
  const labelOpacity = useTransform(progress, [0, 0.4], [1, 0])
  const confirmTextOpacity = useTransform(progress, [0.6, 1], [0, 1])

  // Summary rows
  const rows: SummaryRow[] = [
    { label: 'Ativo', value: asset.name },
    { label: 'Valor', value: formatBRL(100) },
    ...(volatile
      ? [
          {
            label: 'Quantidade estimada',
            value: formatQuantity(
              asset.price ? 100 / asset.price : 0,
              asset.ticker,
            ),
          },
        ]
      : []),
    { label: 'Taxa', value: 'Gratis', color: GREEN },
    ...(volatile
      ? [
          {
            label: 'Take Profit',
            value: formatBRL((asset.price ?? 0) * 1.15),
            color: GREEN,
          },
          {
            label: 'Stop Loss',
            value: formatBRL((asset.price ?? 0) * 0.9),
            color: RED,
          },
        ]
      : []),
  ]

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (confirmed) return
    const pct = info.point.x ? dragX.get() / thumbTravel : 0
    if (pct > 0.75) {
      playConfirm()
      setConfirmed(true)
      dragX.set(thumbTravel)
      const label = isBuy
        ? 'Button: Confirmar compra'
        : 'Button: Confirmar venda'
      const handled = onElementTap?.(label)
      if (!handled) onNext()
    }
  }

  return (
    <div
      className="relative flex flex-col h-full w-full overflow-hidden"
      style={{ background: BG }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: glowBg(palette.accent, 0.12) }}
      />

      <motion.div
        className="relative z-10 flex flex-col flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
      {/* Safe area top + header */}
      <div className="flex-shrink-0" style={{ paddingTop: SAFE_TOP }}>
        <div className="flex items-center gap-3 px-5 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
            style={{ background: BG_GLASS, backdropFilter: 'blur(12px)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEXT_PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <span style={{ color: TEXT_PRIMARY, fontSize: 17, fontWeight: 600 }}>
            Confirmar operacao
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-4">
        {/* Asset header */}
        <motion.div
          className="flex items-center gap-3 mt-2 mb-6"
          {...fadeUp(0.1)}
        >
          <TokenLogoCircle ticker={asset.ticker} fallbackUrl={asset.icon} size={44} color={palette.iconBg} className="flex-shrink-0" />
          <div className="flex flex-col">
            <span style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 700 }}>
              {asset.name}
            </span>
            <span style={{ color: TEXT_SECONDARY, fontSize: 13 }}>
              {asset.ticker}
            </span>
          </div>
          <div
            className="ml-auto rounded-full px-3 py-1"
            style={{
              ...glass,
              border: `1px solid ${BORDER}`,
            }}
          >
            <span
              style={{
                color: isBuy ? GREEN : RED,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {isBuy ? 'Compra' : 'Venda'}
            </span>
          </div>
        </motion.div>

        {/* Summary card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{
            ...glass,
            border: `1px solid ${BORDER}`,
          }}
          {...fadeUp(0.2)}
        >
          <motion.div variants={listContainer} initial="hidden" animate="visible">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              variants={listItemY}
              className="flex items-center justify-between px-4 py-3.5"
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? `1px solid rgba(0,0,0,0.03)`
                    : undefined,
              }}
            >
              <span style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                {row.label}
              </span>
              <span
                style={{
                  color: row.color ?? TEXT_PRIMARY,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {row.value}
              </span>
            </motion.div>
          ))}
          </motion.div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          className="mt-4 leading-relaxed"
          style={{ color: TEXT_TERTIARY, fontSize: 12 }}
          {...fadeUp(0.35)}
        >
          O valor final pode variar de acordo com a cotacao no momento da
          execucao. A ordem sera executada ao melhor preco disponivel.
        </motion.p>
      </div>

      {/* Slide-to-confirm */}
      <div
        className="relative z-10 flex-shrink-0 px-5"
        style={{ paddingBottom: SAFE_BOTTOM }}
      >
        <motion.div
          ref={(el: HTMLDivElement | null) => {
            (trackRef as React.MutableRefObject<HTMLDivElement | null>).current = el
            if (el) setTrackWidth(el.offsetWidth)
          }}
          className="relative rounded-full overflow-hidden"
          style={{
            height: 56,
            ...glass,
            border: `1px solid ${BORDER}`,
          }}
          {...fadeUp(0.45)}
        >
          {/* Fill overlay */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: palette.bg,
              opacity: trackFillOpacity,
            }}
          />

          {/* Label — fades as thumb moves */}
          <motion.span
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              color: TEXT_SECONDARY,
              fontSize: 14,
              fontWeight: 500,
              opacity: confirmed ? 0 : labelOpacity,
            }}
          >
            Deslize para confirmar
          </motion.span>

          {/* Confirmed text */}
          <motion.span
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              color: GREEN,
              fontSize: 14,
              fontWeight: 600,
              opacity: confirmed ? 1 : confirmTextOpacity,
            }}
          >
            Confirmado ✓
          </motion.span>

          {/* Draggable thumb */}
          <motion.div
            drag={confirmed ? false : 'x'}
            dragConstraints={{ left: 0, right: thumbTravel }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{
              x: dragX,
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: palette.bg,
              position: 'absolute',
              top: 4,
              left: 4,
              cursor: confirmed ? 'default' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${palette.bg}55`,
            }}
            whileDrag={{ scale: 1.05 }}
          >
            {confirmed ? (
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
                />
              </motion.svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </motion.div>
        </motion.div>
      </div>
      </motion.div>
    </div>
  )
}
