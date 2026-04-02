/**
 * Screen3b_TpSlConfig — Buy TP/SL configuration screen.
 * Pure custom Tailwind + inline styles + Framer Motion.
 * Only library component: LineChart (for real charting).
 */
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScreenData } from '@/lib/ScreenDataContext'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import LineChart from '@/library/display/LineChart'
import {
  BG, BG_CARD, BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, TEXT_MUTED,
  GREEN, RED, SAFE_TOP, SAFE_BOTTOM,
  fadeUp, glass,
} from '../invest-2-light/shared/theme'
import {
  getAsset, isVolatile,
  formatBRL, generatePriceChartData, generateYieldChartData,
} from '../invest-2-light/shared/data'
import type { AssetTicker } from '../invest-2-light/shared/data'
import { getAssetPalette } from '../invest-2-light/shared/assetPalette'
import { TokenLogo } from '../invest-2-light/shared/TokenLogo'
import { PriceLine, PriceSheet, ToggleRow } from './Screen3b_TpSlConfig.parts'
import { playTick } from '../invest-2-light/shared/sounds'

// ── Helpers ──

function pctFromPrice(base: number, target: number): string {
  const pct = ((target - base) / base) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function priceToY(_base: number, target: number, range: { min: number; max: number }): number {
  // Map price to y% within chart area (inverted: higher price = lower y)
  const total = range.max - range.min
  if (total <= 0) return 50
  const normalized = (target - range.min) / total
  return Math.max(5, Math.min(95, (1 - normalized) * 100))
}

// ── Main screen ──

export default function Screen3b_TpSlConfig({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{
    assetTicker?: AssetTicker
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100

  // TP/SL state
  const [tpEnabled, setTpEnabled] = useState(false)
  const [slEnabled, setSlEnabled] = useState(false)
  const [tpPrice, setTpPrice] = useState(() => Math.round(currentPrice * 1.1))
  const [slPrice, setSlPrice] = useState(() => Math.round(currentPrice * 0.9))
  const [tpSheetOpen, setTpSheetOpen] = useState(false)
  const [slSheetOpen, setSlSheetOpen] = useState(false)

  const hasConfig = tpEnabled || slEnabled

  // Chart data
  const chartData = useMemo(() => {
    if (volatile) {
      return generatePriceChartData(30, currentPrice, 0.025)
    }
    return generateYieldChartData(30, 1000, asset.apy ?? 0.04)
  }, [volatile, currentPrice, asset.apy])

  // Chart price range for PriceLine y calculation
  const chartRange = useMemo(() => {
    const values = chartData.map(d => d.value)
    const dataMin = Math.min(...values)
    const dataMax = Math.max(...values)
    // Extend range to include TP/SL lines
    const min = Math.min(dataMin, slEnabled ? slPrice : dataMin)
    const max = Math.max(dataMax, tpEnabled ? tpPrice : dataMax)
    const padding = (max - min) * 0.1
    return { min: min - padding, max: max + padding }
  }, [chartData, tpEnabled, slEnabled, tpPrice, slPrice])

  // Convert y% back to price (inverse of priceToY)
  const yToPrice = useCallback((yPct: number) => {
    const normalized = 1 - (yPct / 100)
    return chartRange.min + normalized * (chartRange.max - chartRange.min)
  }, [chartRange])

  const handleTpDrag = useCallback((yPct: number) => {
    const price = Math.round(yToPrice(yPct))
    if (price > currentPrice) setTpPrice(price)
  }, [yToPrice, currentPrice])

  const handleSlDrag = useCallback((yPct: number) => {
    const price = Math.round(yToPrice(yPct))
    if (price < currentPrice && price > 0) setSlPrice(price)
  }, [yToPrice, currentPrice])

  const handleTpConfirm = useCallback((price: number) => {
    setTpPrice(Math.round(price))
    setTpSheetOpen(false)
  }, [])

  const handleSlConfirm = useCallback((price: number) => {
    setSlPrice(Math.round(price))
    setSlSheetOpen(false)
  }, [])

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: BG }}>

      {/* Scrollable content */}
      <div className="relative flex-1 overflow-y-auto" style={{ paddingTop: `calc(${SAFE_TOP} + 8px)` }}>

        {/* Top bar */}
        <motion.div className="flex items-center px-4 mb-4" {...fadeUp(0)}>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onBack}
            className="flex items-center justify-center border-none cursor-pointer bg-transparent"
            style={{ width: 40, height: 40 }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          <span className="flex-1 text-center" style={{
            color: TEXT_PRIMARY,
            fontSize: 16,
            fontWeight: 700,
          }}>
            Configurar TP/SL
          </span>
          <div style={{ width: 40 }} />
        </motion.div>

        {/* Asset pill */}
        <motion.div className="flex items-center justify-between px-4 mb-6" {...fadeUp(0.05)}>
          <div className="flex items-center gap-2">
            <TokenLogo ticker={asset.ticker} fallbackUrl={asset.icon} size={28} color={palette.iconBg} className="rounded-full" />
            <span style={{ color: TEXT_PRIMARY, fontSize: 14, fontWeight: 600 }}>
              {asset.name}
            </span>
          </div>
          <span style={{ color: TEXT_SECONDARY, fontSize: 13, fontWeight: 500 }}>
            {formatBRL(currentPrice)}
          </span>
        </motion.div>

        {/* Chart with PriceLine overlays */}
        <motion.div className="relative px-4 mb-6" {...fadeUp(0.1)}>
          <div className="relative">
            <LineChart
              data={chartData}
              height={200}
              variant="area"
              color={palette.accent}
              smooth
              lineWidth={2}
              showPriceScale={false}
              showTimeScale={false}
            />

            {/* TP/SL overlay lines — draggable */}
            <div className="absolute inset-0" style={{ padding: '4px 0' }}>
              {tpEnabled && (
                <PriceLine
                  price={tpPrice}
                  label="TP"
                  color={GREEN}
                  y={priceToY(currentPrice, tpPrice, chartRange)}
                  onDrag={handleTpDrag}
                />
              )}
              {slEnabled && (
                <PriceLine
                  price={slPrice}
                  label="SL"
                  color={RED}
                  y={priceToY(currentPrice, slPrice, chartRange)}
                  onDrag={handleSlDrag}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Toggle rows */}
        <motion.div className="px-4 mb-2" {...fadeUp(0.15)}>
          {/* Take Profit toggle */}
          <div
            className="py-1"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <ToggleRow
              label="Take Profit"
              sublabel="Vender automaticamente ao atingir o alvo"
              checked={tpEnabled}
              onChange={(v) => { playTick(); setTpEnabled(v) }}
            />
            {tpEnabled && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setTpSheetOpen(true)}
                className="flex items-center gap-2 pb-3 border-none cursor-pointer bg-transparent"
              >
                <span style={{ color: GREEN, fontSize: 15, fontWeight: 700 }}>
                  {formatBRL(tpPrice)}
                </span>
                <span style={{ color: TEXT_MUTED, fontSize: 12 }}>
                  ({pctFromPrice(currentPrice, tpPrice)})
                </span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
                  <path d="M9 18l6-6-6-6" stroke={TEXT_MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Stop Loss toggle */}
          <div className="py-1">
            <ToggleRow
              label="Stop Loss"
              sublabel="Limitar perdas vendendo ao preco minimo"
              checked={slEnabled}
              onChange={(v) => { playTick(); setSlEnabled(v) }}
            />
            {slEnabled && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => setSlSheetOpen(true)}
                className="flex items-center gap-2 pb-3 border-none cursor-pointer bg-transparent"
              >
                <span style={{ color: RED, fontSize: 15, fontWeight: 700 }}>
                  {formatBRL(slPrice)}
                </span>
                <span style={{ color: TEXT_MUTED, fontSize: 12 }}>
                  ({pctFromPrice(currentPrice, slPrice)})
                </span>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
                  <path d="M9 18l6-6-6-6" stroke={TEXT_MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Summary card */}
        <AnimatePresence>
        {hasConfig && (
          <motion.div
            className="px-4 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{
              color: TEXT_SECONDARY,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              display: 'block',
            }}>
              Resumo
            </span>
            <div
              className="rounded-2xl p-4"
              style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
            >
              {/* Current price row */}
              <div
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-full" style={{ width: 6, height: 6, background: palette.bg }} />
                  <span style={{ color: TEXT_TERTIARY, fontSize: 12 }}>Preco atual</span>
                </div>
                <span style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 600 }}>
                  {formatBRL(currentPrice)}
                </span>
              </div>

              {/* TP row */}
              {tpEnabled && (
                <div
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: slEnabled ? `1px solid ${BORDER}` : 'none' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-full" style={{ width: 6, height: 6, background: GREEN }} />
                    <span style={{ color: TEXT_TERTIARY, fontSize: 12 }}>Take Profit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>
                      {formatBRL(tpPrice)}
                    </span>
                    <span style={{ color: TEXT_MUTED, fontSize: 11 }}>
                      {pctFromPrice(currentPrice, tpPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* SL row */}
              {slEnabled && (
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full" style={{ width: 6, height: 6, background: RED }} />
                    <span style={{ color: TEXT_TERTIARY, fontSize: 12 }}>Stop Loss</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: RED, fontSize: 13, fontWeight: 600 }}>
                      {formatBRL(slPrice)}
                    </span>
                    <span style={{ color: TEXT_MUTED, fontSize: 11 }}>
                      {pctFromPrice(currentPrice, slPrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Bottom spacer */}
        <div style={{ height: 100 }} />
      </div>

      {/* Bottom CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4"
        style={{
          paddingTop: 12,
          paddingBottom: `calc(${SAFE_BOTTOM} + 4px)`,
          ...glass,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <motion.button
          whileTap={hasConfig ? { scale: 0.97 } : undefined}
          onClick={() => {
            if (!hasConfig) return
            const handled = onElementTap?.('Button: Continuar')
            if (!handled) onNext()
          }}
          className="w-full flex items-center justify-center rounded-xl border-none cursor-pointer"
          style={{
            height: 52,
            background: hasConfig ? GREEN : 'rgba(0,0,0,0.05)',
            fontSize: 16,
            fontWeight: 700,
            color: hasConfig ? '#fff' : TEXT_MUTED,
            opacity: hasConfig ? 1 : 0.5,
            transition: 'background 0.2s, opacity 0.2s',
          }}
        >
          Continuar
        </motion.button>
      </div>

      {/* PriceSheet modals */}
      <PriceSheet
        open={tpSheetOpen}
        onClose={() => setTpSheetOpen(false)}
        title="Take Profit"
        currentPrice={currentPrice}
        direction="up"
        onConfirm={handleTpConfirm}
      />
      <PriceSheet
        open={slSheetOpen}
        onClose={() => setSlSheetOpen(false)}
        title="Stop Loss"
        currentPrice={currentPrice}
        direction="down"
        onConfirm={handleSlConfirm}
      />
    </div>
  )
}
