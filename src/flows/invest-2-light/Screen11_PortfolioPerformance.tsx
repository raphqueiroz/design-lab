/**
 * Portfolio Performance — full-screen interactive chart with time ranges.
 * States: '3-day' (early portfolio) and 'full' (mature 30-day portfolio).
 */
import { useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import Header from '@/library/navigation/Header'
import DataList from '@/library/display/DataList'
import {
  getPortfolioTotal, formatBRL,
} from './shared/data'
import {
  BG, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY,
  GREEN, RED, SAFE_BOTTOM, fadeUp,
} from './shared/theme'
import { buildSmoothPath, formatChartDate } from './shared/chartUtils'
import type { ChartDataPoint } from './shared/chartUtils'

// ── Chart data generators ──

function generate3DayData(base: number): ChartDataPoint[] {
  const pts: ChartDataPoint[] = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 0, 0, 0)
  for (let i = 0; i < 9; i++) {
    const timestamp = new Date(start.getTime() + i * 8 * 60 * 60 * 1000)
    const noise = Math.sin(i * 1.2) * (base * 0.003) + Math.cos(i * 2.8) * (base * 0.002)
    const drift = i * (base * 0.0008)
    pts.push({ value: base + noise + drift, timestamp })
  }
  return pts
}

function generate30DayData(base: number): ChartDataPoint[] {
  const pts: ChartDataPoint[] = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0)
  for (let i = 0; i < 90; i++) {
    const timestamp = new Date(start.getTime() + i * 8 * 60 * 60 * 1000)
    const dip = -1800 * Math.exp(-0.5 * ((i - 30) / 12) ** 2)
    const trend = i * 18
    const noise = Math.sin(i * 0.45) * 200 + Math.cos(i * 1.7) * 120 + Math.sin(i * 7.3) * 60
    pts.push({ value: (base - 8000) + trend + dip + noise, timestamp })
  }
  return pts
}

// ── Time ranges ──

const TIME_RANGES = [
  { label: '24h', days: 1 },
  { label: '1S', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1A', days: 365 },
] as const

const CHART_WIDTH = 400
const CHART_HEIGHT = 280

export default function Screen11_PortfolioPerformance({ onBack }: FlowScreenProps) {
  const { chartMode = 'full' } = useScreenData<{ chartMode?: '3-day' | 'full' }>()
  const portfolioTotal = getPortfolioTotal()
  const is3Day = chartMode === '3-day'

  const [activeRange, setActiveRange] = useState(is3Day ? 1 : 2) // 1S for 3-day, 1M for full

  const chartData = useMemo(() => {
    if (is3Day) return generate3DayData(portfolioTotal)
    return generate30DayData(portfolioTotal)
  }, [is3Day, portfolioTotal])

  const { path: chartPath, points: chartPoints } = useMemo(
    () => buildSmoothPath(chartData, CHART_WIDTH, CHART_HEIGHT),
    [chartData],
  )

  // Scrub interaction
  const chartRef = useRef<SVGSVGElement>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)

  const handleChartInteraction = useCallback((clientX: number) => {
    const svg = chartRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setActivePointIndex(Math.round(pct * (chartPoints.length - 1)))
  }, [chartPoints])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    handleChartInteraction(e.clientX)
  }, [handleChartInteraction])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons > 0) handleChartInteraction(e.clientX)
  }, [handleChartInteraction])

  const handlePointerUp = useCallback(() => {
    setActivePointIndex(null)
  }, [])

  // Values
  const firstValue = chartPoints[0]?.value ?? portfolioTotal
  const displayValue = activePointIndex !== null ? chartPoints[activePointIndex].value : portfolioTotal
  const changePct = ((displayValue - firstValue) / firstValue) * 100
  const changeAbs = displayValue - firstValue

  // Active point for indicator
  const activePoint = activePointIndex !== null ? chartPoints[activePointIndex] : null

  // Chart value range for dot Y
  const chartValueRange = useMemo(() => {
    const values = chartData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min, max, range: max - min || 1 }
  }, [chartData])

  // Stats
  const maxValue = Math.max(...chartData.map(d => d.value))
  const minValue = Math.min(...chartData.map(d => d.value))

  const statsData = is3Day
    ? [
        { label: 'Retorno total', value: <span style={{ color: changeAbs >= 0 ? GREEN : RED }}>{changeAbs >= 0 ? '+' : ''}{formatBRL(changeAbs)} ({Math.abs(changePct).toFixed(2)}%)</span> },
        { label: 'Valor investido', value: formatBRL(firstValue) },
        { label: 'Início', value: '3 dias atrás' },
      ]
    : [
        { label: 'Retorno total', value: <span style={{ color: changeAbs >= 0 ? GREEN : RED }}>{changeAbs >= 0 ? '+' : ''}{formatBRL(changeAbs)} ({Math.abs(changePct).toFixed(2)}%)</span> },
        { label: 'Maior valor', value: formatBRL(maxValue) },
        { label: 'Menor valor', value: formatBRL(minValue) },
        { label: 'Início do período', value: '30 dias atrás' },
      ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      <div style={{ height: 'var(--safe-area-top)' }} />

      <div className="flex-1 overflow-y-auto">
        <div className="page-pad">
          <Header title="Evolução do patrimônio" onBack={onBack} />
        </div>

        {/* Value display */}
        <motion.div {...fadeUp(0)} className="page-pad pb-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-0.5">
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                fontWeight: 600, letterSpacing: -0.5, color: TEXT_PRIMARY, fontSize: 24,
              }}>R$</span>
              <span style={{
                color: TEXT_PRIMARY, fontSize: 36, fontWeight: 800, lineHeight: 1,
                letterSpacing: -1.5, fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
              }}>
                {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 mt-1" style={{ fontSize: 14, fontWeight: 500 }}>
              <span className="inline-flex items-center" style={{ color: changePct >= 0 ? GREEN : RED }}>
                <span style={{ fontSize: 16, lineHeight: 1, paddingBottom: 2 }}>{changePct >= 0 ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(changePct).toFixed(2)}%
              </span>
              <span style={{ color: TEXT_SECONDARY }}>
                {activePointIndex !== null ? formatChartDate(chartPoints[activePointIndex].timestamp) : is3Day ? '3 dias' : 'no último mês'}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Interactive chart */}
        <motion.div {...fadeUp(0.05)} className="relative mb-2">
          <svg
            ref={chartRef}
            width="100%"
            height={CHART_HEIGHT}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="cursor-crosshair"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <path
              d={chartPath}
              fill="none"
              stroke={is3Day ? TEXT_TERTIARY : TEXT_PRIMARY}
              strokeWidth={is3Day ? 2 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={is3Day ? 0.5 : 1}
            />

            {activePoint && (
              <>
                <line
                  x1={activePoint.x} y1={0} x2={activePoint.x} y2={CHART_HEIGHT}
                  stroke={TEXT_TERTIARY} strokeWidth={1} strokeDasharray="4 3"
                />
                <circle
                  cx={activePoint.x} cy={activePoint.y} r={5}
                  fill={TEXT_PRIMARY} stroke="#FFFFFF" strokeWidth={2}
                />
              </>
            )}
          </svg>
        </motion.div>

        {/* Time range pills */}
        <motion.div {...fadeUp(0.1)} className="flex items-center justify-center gap-2 px-4 mb-6">
          {TIME_RANGES.map((range, i) => {
            const disabled = is3Day && i > 1 // Only 24h and 1S for 3-day
            return (
              <button
                key={range.label}
                onClick={() => !disabled && setActiveRange(i)}
                disabled={disabled}
                className="relative border-none rounded-full px-4 py-2"
                style={{
                  background: 'transparent',
                  color: disabled ? TEXT_TERTIARY : i === activeRange ? TEXT_PRIMARY : TEXT_SECONDARY,
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: disabled ? 0.4 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {i === activeRange && !disabled && (
                  <motion.div
                    layoutId="perfTimeRange"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.08)', zIndex: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative" style={{ zIndex: 1 }}>{range.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.15)} className="page-pad">
          <DataList data={statsData} />
        </motion.div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>
    </div>
  )
}
