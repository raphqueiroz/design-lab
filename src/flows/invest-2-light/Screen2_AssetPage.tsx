/**
 * Screen2_AssetPage — Light-themed asset detail page (Cash App inspired).
 * Clean layout: back arrow, asset header, chart, time pills, details via DS components.
 * Sticky bottom: accent "Comprar" + black "..." icon button with bottom sheet.
 */
import { useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { RiArrowLeftLine, RiArrowDownLine, RiArrowUpLine, RiMoreFill, RiDownloadLine, RiUploadLine, RiHeartFill, RiHeartLine } from '@remixicon/react'
import { useScreenData } from '@/lib/ScreenDataContext'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import LineChart from '@/library/display/LineChart'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Button from '@/library/inputs/Button'
import IconButton from '@/library/inputs/IconButton'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import BottomSheet from '@/library/layout/BottomSheet'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'
import Badge from '@/library/display/Badge'
import {
  BG, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, BORDER_LIGHT,
  GREEN, RED, SAFE_TOP, SAFE_BOTTOM,
  fadeUp,
} from './shared/theme'
import {
  getAsset, getPosition, isVolatile, isFavorite,
  formatBRL, formatQuantity,
  generatePriceChartData, generateYieldChartData,
  getMockTransactions,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogo } from './shared/TokenLogo'

// ── Time ranges ──

const TIME_RANGES = [
  { label: '24h', days: 1 },
  { label: '1S', days: 7 },
  { label: '1M', days: 30 },
  { label: '1A', days: 365 },
  { label: '5A', days: 1825 },
] as const

function formatScrubDate(timeStr: string, days: number): string {
  const date = new Date(timeStr + 'T12:00:00')
  const day = date.getDate()
  const month = date.toLocaleString('pt-BR', { month: 'long' })
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1)
  if (days <= 1) return `Hoje`
  if (days <= 30) return `${day} de ${monthCap}`
  return `${day} de ${monthCap}, ${date.getFullYear()}`
}

// ── Main screen ──

export default function Screen2_AssetPage({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC', invested = false } = useScreenData<{
    assetTicker?: AssetTicker
    invested?: boolean
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const position = invested ? getPosition(assetTicker) : undefined
  const volatile = isVolatile(asset)
  const [activeRange, setActiveRange] = useState(2) // default 1M
  const [moreOpen, setMoreOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [isFav, setIsFav] = useState(() => isFavorite(assetTicker))
  const change = asset.change24h ?? 0
  // const isPositive = change >= 0

  // Chart data
  const chartData = useMemo(() => {
    const days = TIME_RANGES[activeRange].days
    if (volatile) {
      return generatePriceChartData(days, asset.price ?? 100, 0.03)
    }
    return generateYieldChartData(days, position?.currentValue ?? 1000, asset.apy ?? 0.04)
  }, [activeRange, volatile, asset.price, asset.apy, position?.currentValue])

  // Chart scrub interaction
  const chartOverlayRef = useRef<HTMLDivElement>(null)
  const [scrubIndex, setScrubIndex] = useState<number | null>(null)

  const handleScrub = useCallback((clientX: number) => {
    const el = chartOverlayRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setScrubIndex(Math.round(pct * (chartData.length - 1)))
  }, [chartData])

  const isDragging = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    isDragging.current = true
    handleScrub(e.clientX)
  }, [handleScrub])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) handleScrub(e.clientX)
  }, [handleScrub])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    setScrubIndex(null)
  }, [])

  // Chart value range for dot Y position
  const chartValueRange = useMemo(() => {
    const values = chartData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min, max, range: max - min || 1 }
  }, [chartData])

  // Displayed price: scrubbed or current
  const displayPrice = volatile
    ? (scrubIndex !== null ? chartData[scrubIndex].value : (asset.price ?? 0))
    : null
  const firstChartValue = chartData[0]?.value ?? 0
  const displayChange = scrubIndex !== null && firstChartValue > 0
    ? ((chartData[scrubIndex].value - firstChartValue) / firstChartValue) * 100
    : change
  const displayIsPositive = displayChange >= 0

  // P&L
  const pnl = position
    ? position.currentValue - (position.quantity * position.avgCost)
    : 0
  const pnlPercent = position
    ? ((position.currentValue / (position.quantity * position.avgCost)) - 1) * 100
    : 0

  const transactions = invested ? getMockTransactions(assetTicker) : []

  const handleMoreAction = (label: string) => {
    setMoreOpen(false)
    const handled = onElementTap?.(`ListItem: ${label}`)
    if (!handled) onNext()
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: BG }}>

      {/* Scrollable content */}
      <div className="relative flex-1 overflow-y-auto" style={{ paddingTop: SAFE_TOP }}>

        {/* Top bar — back + favorite */}
        <motion.div className="flex items-center justify-between px-5 pt-2 mb-2" {...fadeUp(0)}>
          <IconButton
            variant="base"
            icon={<RiArrowLeftLine size={24} className="text-content-primary" />}
            onPress={onBack}
          />
          <IconButton
            variant="no_background"
            icon={isFav
              ? <RiHeartFill size={24} color="#F43F5E" />
              : <RiHeartLine size={24} className="text-content-tertiary" />
            }
            onPress={() => setIsFav(!isFav)}
          />
        </motion.div>

        {/* Asset header — name left, icon right */}
        <motion.div className="flex items-center justify-between px-5 mb-2" {...fadeUp(0.05)}>
          <span style={{
            color: TEXT_PRIMARY,
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}>
            {asset.name}
          </span>
          <TokenLogo ticker={asset.ticker} fallbackUrl={asset.icon} size={56} color={palette.bg} className="rounded-full" />
        </motion.div>

        {/* Price + Change */}
        <motion.div className="px-5 mb-2" {...fadeUp(0.1)}>
          {volatile ? (
            <>
              <div className="flex items-baseline gap-1">
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                  fontWeight: 600,
                  letterSpacing: -0.5,
                  color: TEXT_PRIMARY,
                  fontSize: 24,
                }}>
                  R$
                </span>
                <span style={{
                  color: TEXT_PRIMARY,
                  fontSize: 36,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -1.5,
                  fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
                }}>
                  {(displayPrice ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span
                className="inline-flex items-center gap-1.5 mt-1"
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                <span className="inline-flex items-center" style={{ color: displayIsPositive ? GREEN : RED }}>
                  <span style={{ fontSize: 18, lineHeight: 1, paddingBottom: 2 }}>{displayIsPositive ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(displayChange).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </span>
                <span style={{ color: TEXT_SECONDARY }}>
                  {scrubIndex !== null
                    ? formatScrubDate(chartData[scrubIndex].time, TIME_RANGES[activeRange].days)
                    : '24h'}
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="block" style={{
                color: GREEN,
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -1.5,
              }}>
                {asset.apyDisplay}
              </span>
              <span style={{ color: TEXT_SECONDARY, fontSize: 14, marginTop: 4, display: 'block' }}>
                Rendimento anual
              </span>
            </>
          )}
        </motion.div>

        {/* Chart with scrub overlay */}
        <motion.div className="relative mb-2" {...fadeUp(0.15)}>
          <LineChart
            data={chartData}
            height={200}
            variant="area"
            color={palette.bg}
            smooth
            lineWidth={2}
            showPriceScale={false}
            showTimeScale={false}
          />
          {/* Scrub indicator — vertical line + dot */}
          {scrubIndex !== null && (() => {
            const xPct = (scrubIndex / (chartData.length - 1)) * 100
            const val = chartData[scrubIndex].value
            // Map value to Y% (inverted: high value = low Y). Add padding to match chart margins.
            const padTop = 8
            const padBot = 8
            const normalized = (val - chartValueRange.min) / chartValueRange.range
            const yPct = padTop + (1 - normalized) * (100 - padTop - padBot)
            return (
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: `${xPct}%` }}
              >
                {/* Vertical dashed line */}
                <div
                  className="absolute top-0 bottom-0"
                  style={{
                    width: 1,
                    left: 0,
                    background: `repeating-linear-gradient(to bottom, ${TEXT_TERTIARY} 0px, ${TEXT_TERTIARY} 4px, transparent 4px, transparent 7px)`,
                  }}
                />
                {/* Dot */}
                <div
                  className="absolute"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: TEXT_PRIMARY,
                    border: '2px solid #FFFFFF',
                    top: `${yPct}%`,
                    left: -6,
                    marginTop: -6,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            )
          })()}
          {/* Interaction overlay */}
          <div
            ref={chartOverlayRef}
            className="absolute inset-0 cursor-crosshair z-10"
            style={{ touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </motion.div>

        {/* Time range pills */}
        <motion.div className="flex items-center justify-center gap-2 px-4 mb-6" {...fadeUp(0.2)}>
          {TIME_RANGES.map((range, i) => (
            <button
              key={range.label}
              onClick={() => setActiveRange(i)}
              className="relative border-none cursor-pointer rounded-full px-4 py-2"
              style={{
                background: 'transparent',
                color: i === activeRange ? TEXT_PRIMARY : TEXT_SECONDARY,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {i === activeRange && (
                <motion.div
                  layoutId="timeRange"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.08)', zIndex: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative" style={{ zIndex: 1 }}>{range.label}</span>
            </button>
          ))}
        </motion.div>

        {invested ? (
          <motion.div className="px-5" {...fadeUp(0.25)}>
            <SegmentedControl
              segments={['Saldo', 'Informações', 'Histórico']}
              activeIndex={activeTab}
              onChange={setActiveTab}
              className="mb-4"
            />

            {/* Saldo tab */}
            {activeTab === 0 && position && (
              <DataList data={[
                { label: 'Valor em Carteira', value: formatBRL(position.currentValue), secondaryValue: formatQuantity(position.quantity, assetTicker) },
                { label: 'Aportes', value: formatBRL(position.quantity * position.avgCost) },
                { label: 'Retorno total', value: <span style={{ color: pnl >= 0 ? GREEN : RED }}><span style={{ paddingBottom: 2 }}>{pnl >= 0 ? '↗' : '↘'}</span> {formatBRL(Math.abs(pnl))} ({Math.abs(pnlPercent).toFixed(1)}%)</span> },
                { label: 'Custo médio', value: formatBRL(position.avgCost) },
              ]} />
            )}

            {/* Histórico tab — grouped by date */}
            {activeTab === 2 && (() => {
              const groups: { date: string; items: typeof transactions }[] = []
              for (const tx of transactions) {
                const last = groups[groups.length - 1]
                if (last && last.date === tx.date) {
                  last.items.push(tx)
                } else {
                  groups.push({ date: tx.date, items: [tx] })
                }
              }
              return (
                <Stack gap="sm">
                  {groups.map(g => (
                    <Stack gap="none" key={g.date}>
                      <GroupHeader text={g.date} />
                      {g.items.map(tx => (
                        <ListItem
                          key={tx.id}
                          title={tx.title}
                          subtitle={tx.status === 'processing' ? 'Processando...' : undefined}
                          className="[--token-font-size-body-lg:16px]"
                          left={
                            <Avatar
                              icon={tx.type === 'buy' || tx.type === 'yield'
                                ? <RiArrowDownLine size={20} />
                                : <RiArrowUpLine size={20} />}
                              size="md"
                            />
                          }
                          right={
                            <Stack gap="none" align="end">
                              <Text variant="body-md" className={tx.status === 'processing' ? 'text-content-tertiary' : ''}>
                                {tx.amount}
                              </Text>
                              {tx.status === 'processing' && (
                                <Badge variant="warning" size="sm">Processando</Badge>
                              )}
                            </Stack>
                          }
                          trailing={null}
                        />
                      ))}
                    </Stack>
                  ))}
                </Stack>
              )
            })()}

            {/* Informações tab */}
            {activeTab === 1 && (
              <>
                <DataList
                  variant="vertical"
                  className="[&>div:last-child]:border-b [&>div:last-child]:border-[var(--token-neutral-100)]"
                  data={[
                    { label: 'Sobre', value: asset.description },
                  ]}
                />
                <DataList data={[
                  { label: 'Cap. de Mercado', value: asset.marketCap ?? '-' },
                  { label: 'Volume 24h', value: asset.volume24h ?? '-' },
                  { label: 'Máxima histórica', value: asset.ath ?? '-' },
                ]} />
              </>
            )}
          </motion.div>
        ) : (
          /* Non-invested: vertical Sobre + horizontal stats */
          <motion.div className="px-5" {...fadeUp(0.25)}>
            <DataList
              variant="vertical"
              className="[&>div:last-child]:border-b [&>div:last-child]:border-[var(--token-neutral-100)]"
              data={[
                { label: 'Sobre', value: asset.description },
              ]}
            />
            <DataList data={[
              { label: 'Cap. de Mercado', value: asset.marketCap ?? '-' },
              { label: 'Volume 24h', value: asset.volume24h ?? '-' },
              { label: 'Máxima histórica', value: asset.ath ?? '-' },
            ]} />
          </motion.div>
        )}

        {/* Bottom spacer for sticky bar */}
        <div style={{ height: 100 }} />
        <div style={{ height: SAFE_BOTTOM }} />
      </div>

      {/* ── Sticky bottom bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-5"
        style={{
          paddingTop: 12,
          paddingBottom: `calc(${SAFE_BOTTOM} + 8px)`,
          background: BG,
          borderTop: `1px solid ${BORDER_LIGHT}`,
        }}
      >
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onPress={() => {
            const handled = onElementTap?.(`Button: ${volatile ? 'Comprar' : 'Investir'}`)
            if (!handled) onNext()
          }}
          style={{ background: 'var(--color-interactive-accent)' }}
        >
          {volatile ? 'Comprar' : 'Investir'}
        </Button>

        {invested && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => {
              const handled = onElementTap?.('Button: Vender')
              if (!handled) onNext()
            }}
          >
            Vender
          </Button>
        )}

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setMoreOpen(true)}
          className="flex-shrink-0 flex items-center justify-center rounded-full border-none cursor-pointer bg-[var(--color-surface-shade)]"
          style={{
            width: 52,
            height: 52,
          }}
        >
          <RiMoreFill size={22} className="text-content-primary" />
        </motion.button>
      </div>

      {/* ── Bottom Sheet ── */}
      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="flex flex-col">
          <ListItem
            title="Depositar cripto"
            subtitle="Enviar ativos de outra carteira"
            left={<Avatar icon={<RiDownloadLine size={20} />} size="md" />}
            onPress={() => handleMoreAction('Depositar cripto')}
          />
          <ListItem
            title="Sacar cripto"
            subtitle="Enviar para outra carteira"
            left={<Avatar icon={<RiUploadLine size={20} />} size="md" />}
            onPress={() => handleMoreAction('Sacar cripto')}
          />
        </div>
      </BottomSheet>
    </div>
  )
}
