/**
 * Dashboard — light-themed investments portfolio overview.
 * States: first-access, empty, portfolio.
 * Mixes custom Tailwind + Framer Motion with design system components (Summary, Button, ShortcutButton).
 */
import { useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  RiArrowLeftRightLine, RiHeartFill, RiFileListLine, RiMoreFill,
  RiDownloadLine, RiFileTextLine, RiBarChartBoxLine,
  RiShieldCheckFill, RiFlashlightFill, RiPieChartFill, RiTimerFlashFill,
} from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import Summary from '@/library/display/Summary'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import BottomSheet from '@/library/layout/BottomSheet'
import FeatureLayout from '@/library/layout/FeatureLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import ShortcutButton from '@/library/inputs/ShortcutButton'
import {
  ASSETS, MOCK_POSITIONS, getAsset, getPortfolioTotal, getFavoriteAssets,
} from './shared/data'
import type { AssetTicker } from './shared/data'
// getAssetPalette used transitively via parts/AssetListItem
import {
  BG, TEXT_PRIMARY, TEXT_SECONDARY,
  TEXT_TERTIARY, GREEN, RED, fadeUp,
} from './shared/theme'
import { buildSmoothPath, formatChartDate } from './shared/chartUtils'
import type { ChartDataPoint } from './shared/chartUtils'
import investFirstAccessBg from '@/assets/images/invest-first-access.png'
import {
  FavoriteCard,
  SocialProofCounter,
} from './Screen0_Dashboard.parts'
import AssetListItem from './shared/AssetListItem'
import Subheader from '@/library/navigation/Subheader'
import Header from '@/library/navigation/Header'
// Stack available via library but unused in this screen

interface DashboardState {
  dashboard?: 'portfolio' | 'portfolio-3day' | 'portfolio-new' | 'empty' | 'first-access'
  [key: string]: unknown
}

// Generate 30-day portfolio chart — 1 data point per day = 30 points
// Includes a dip to ~-6% around days 8-12, then recovery and growth

function generateChartPoints(): ChartDataPoint[] {
  const pts: ChartDataPoint[] = []
  const start = 28000
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0)

  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

    // Dip envelope: pulls value down around days 8-12
    const dipCenter = 10
    const dipWidth = 4
    const dipStrength = -1800
    const dip = dipStrength * Math.exp(-0.5 * ((i - dipCenter) / dipWidth) ** 2)

    // Base trend: slight upward after recovery
    const trend = i * 54

    // Noise
    const noise = Math.sin(i * 0.9) * 200 + Math.cos(i * 2.1) * 120

    const v = start + trend + dip + noise
    pts.push({ value: v, timestamp })
  }
  return pts
}

// Generate 30-day chart with 23 flat days + 7 days of real data (1 point/day)
function generate7DayChartPoints(baseValue: number): ChartDataPoint[] {
  const pts: ChartDataPoint[] = []
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0)
  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    if (i < 23) {
      // Flat line — no investment yet
      pts.push({ value: baseValue, timestamp })
    } else {
      // Last 7 days — real data with micro-variations
      const daysSinceInvest = i - 23
      const noise = Math.sin(daysSinceInvest * 1.4) * (baseValue * 0.004) + Math.cos(daysSinceInvest * 2.5) * (baseValue * 0.003)
      const drift = daysSinceInvest * (baseValue * 0.0012)
      pts.push({ value: baseValue + noise + drift, timestamp })
    }
  }
  return pts
}

// ── More Actions (uses BottomSheet + ListItem) ──

// ── Main Dashboard ──

export default function Screen0_Dashboard({ onNext, onElementTap }: FlowScreenProps) {
  const screenData = useScreenData<DashboardState>()
  const stateId = screenData?.dashboard ?? 'portfolio'
  const [moreOpen, setMoreOpen] = useState(false)

  const portfolioTotal = getPortfolioTotal()
  const chartData = useMemo(() => generateChartPoints(), [])
  const favorites = getFavoriteAssets()

  // Chart computed
  const chartWidth = 400
  const chartHeight = 140
  const { path: chartPath, points: chartPoints } = useMemo(
    () => buildSmoothPath(chartData, chartWidth, chartHeight),
    [chartData],
  )

  // Interactive chart state — null means "show current"
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  // Displayed value + P&L based on selected point or latest
  const displayValue = activePointIndex !== null ? chartPoints[activePointIndex].value : portfolioTotal
  const firstValue = chartPoints[0].value
  const referenceValue = activePointIndex !== null ? firstValue : firstValue
  const changePct = ((displayValue - referenceValue) / referenceValue) * 100

  // Chart touch/drag handler
  const handleChartInteraction = useCallback((clientX: number) => {
    const svg = chartRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = clientX - rect.left
    const pct = Math.max(0, Math.min(1, relX / rect.width))
    const idx = Math.round(pct * (chartPoints.length - 1))
    setActivePointIndex(idx)
  }, [chartPoints])

  const handleChartPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    handleChartInteraction(e.clientX)
  }, [handleChartInteraction])

  const handleChartPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons > 0) handleChartInteraction(e.clientX)
  }, [handleChartInteraction])

  const handleChartPointerUp = useCallback(() => {
    setActivePointIndex(null)
  }, [])

  const handleShortcut = (label: string) => {
    const handled = onElementTap?.(`ShortcutButton: ${label}`)
    if (!handled) onNext()
  }

  const handleModalAction = (label: string) => {
    setMoreOpen(false)
    const handled = onElementTap?.(`ListItem: ${label}`)
    if (!handled) onNext()
  }

  const handleAssetTap = (ticker: AssetTicker) => {
    const asset = getAsset(ticker)
    const handled = onElementTap?.(`ListItem: ${asset.name}`)
    if (!handled) onNext()
  }

  const handleExplore = () => {
    const handled = onElementTap?.('Button: Explorar mais')
    if (!handled) onNext()
  }

  // ── First Access State — FeatureLayout + Summary ──
  if (stateId === 'first-access') {
    const summaryData = [
      {
        icon: <RiTimerFlashFill size={24} className="text-content-primary" />,
        title: 'Instantâneo e acessível',
        description: 'Comece com apenas R$ 10. Compre e venda em segundos.',
      },
      {
        icon: <RiPieChartFill size={24} className="text-content-primary" />,
        title: 'Cripto, commodities e renda fixa',
        description: 'Diversifique entre Bitcoin, ouro, dólar digital e rendimentos automáticos.',
      },
      {
        icon: <RiShieldCheckFill size={24} className="text-content-primary" />,
        title: 'Regulado e custodiado',
        description: 'Seus investimentos são custodiados por instituições reguladas e autorizadas.',
      },
      {
        icon: <RiFlashlightFill size={24} className="text-content-primary" />,
        title: 'Operação 24/7',
        description: 'Invista a qualquer hora, todos os dias. Liquidez imediata quando precisar.',
      },
    ]

    return (
      <FeatureLayout
        imageSrc={investFirstAccessBg}
        imageAlt="Ilustração de investimentos crescendo"
        imageMaxHeight={320}
        imageClassName="object-contain"
        imageBgColor="#1a3d2a"
        parallax
      >
        <Header
          title="Uma nova forma de construir seu patrimônio"
          description="Negocie criptomoedas, ativos de renda e outros."
        />
        <Summary data={summaryData} />

        <StickyFooter>
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onPress={() => {
              const handled = onElementTap?.('Button: Conhecer produtos')
              if (!handled) onNext()
            }}
          >
            Conhecer produtos
          </Button>
        </StickyFooter>
      </FeatureLayout>
    )
  }

  // ── Empty State ──
  if (stateId === 'empty') {
    const trending = [...ASSETS]
      .filter(a => a.change24h != null)
      .sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))
      .slice(0, 5)

    const mostTraded = ASSETS.filter(a => a.tags?.includes('popular')).slice(0, 6)

    return (
      <div className="flex flex-col min-h-screen" style={{ background: BG }}>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto relative">

          {/* ── Header area with grid background ── */}
          <div className="relative overflow-hidden">
            {/* Grid pattern — same as portfolio state */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: `calc(-1 * var(--safe-area-top))` }} preserveAspectRatio="none">
              <defs>
                <pattern id="empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D8D8DE" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="empty-grid-fade-v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="empty-grid-fade-l" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="empty-grid-fade-r" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#empty-grid)" />
              <rect width="100%" height="100%" fill="url(#empty-grid-fade-v)" />
              <rect width="100%" height="100%" fill="url(#empty-grid-fade-l)" />
              <rect width="100%" height="100%" fill="url(#empty-grid-fade-r)" />
            </svg>

            <div style={{ height: 'var(--safe-area-top)' }} />

            {/* Patrimônio total — R$ 0,00 */}
            <motion.div {...fadeUp(0)} className="relative page-pad pt-5 pb-2">
              <div className="flex flex-col">
                <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                  Patrimônio total
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                    fontWeight: 600,
                    letterSpacing: -0.5,
                    color: TEXT_PRIMARY,
                    fontSize: 28,
                  }}>
                    R$
                  </span>
                  <span style={{
                    color: TEXT_PRIMARY,
                    fontSize: 42,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: -1.5,
                    fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
                  }}>
                    0,00
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Empty state — message + explore CTA + social proof */}
            <motion.div {...fadeUp(0.05)} className="relative flex flex-col items-center page-pad pt-4 pb-6 gap-4">
              <div className="flex flex-col items-center gap-1.5 max-w-[320px]">
                <h2 className="text-center" style={{ color: TEXT_PRIMARY, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  Seu dinheiro pode fazer mais
                </h2>
                <p className="text-center max-w-[240px]" style={{ color: TEXT_SECONDARY, fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                  Invista em ativos globais. Comece com qualquer quantia.
                </p>
              </div>
              <Button variant="primary" size="sm" onPress={handleExplore}>
                Explorar ativos
              </Button>
              <SocialProofCounter />
            </motion.div>
          </div>

          {/* Shortcuts — Favoritos and Ordens disabled */}
          <motion.div {...fadeUp(0.1)} className="flex justify-between page-pad mt-2 mb-6">
            <ShortcutButton
              icon={<RiArrowLeftRightLine size={22} className="text-[var(--color-interactive-primary)]" />}
              label="Negociar"
              variant="primary"
              onPress={() => handleShortcut('Negociar')}
            />
            <ShortcutButton
              icon={<RiHeartFill size={22} className="text-[var(--color-interactive-primary)]" />}
              label="Favoritos"
              variant="secondary"
              disabled
            />
            <ShortcutButton
              icon={<RiFileListLine size={22} className="text-[var(--color-interactive-primary)]" />}
              label="Ordens"
              variant="secondary"
              disabled
            />
            <ShortcutButton
              icon={<RiMoreFill size={22} className="text-[var(--color-interactive-primary)]" />}
              label="Mais"
              variant="secondary"
              onPress={() => setMoreOpen(true)}
            />
          </motion.div>

          {/* Maiores altas */}
          <motion.div {...fadeUp(0.15)} className="mb-5">
            <Subheader text="Maiores altas" description="Ativos com maior valorização nas últimas 24h" />
            <div className="flex gap-2 px-6 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {trending.map((asset, i) => (
                <motion.div
                  key={asset.ticker}
                  initial={{ opacity: 0, x: 60, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 + i * 0.06 }}
                >
                  <FavoriteCard ticker={asset.ticker} onPress={() => handleAssetTap(asset.ticker)} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Mais negociados */}
          <motion.div {...fadeUp(0.25)} className="mb-6">
            <Subheader text="Mais negociados" description="Os ativos mais comprados pela comunidade" />
            <div className="flex gap-2 px-6 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {mostTraded.map((asset, i) => (
                <motion.div
                  key={asset.ticker}
                  initial={{ opacity: 0, x: 60, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 + i * 0.06 }}
                >
                  <FavoriteCard ticker={asset.ticker} onPress={() => handleAssetTap(asset.ticker)} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fadeUp(0.35)} className="page-pad">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleExplore}
            >
              Explorar mais ativos
            </Button>
          </motion.div>

          {/* Bottom safe area padding */}
          <div style={{ paddingBottom: 'max(var(--safe-area-bottom), 20px)' }} />
        </div>
      </div>
    )
  }

  // ── Portfolio New State (no chart yet — waiting for 3 days) ──
  if (stateId === 'portfolio-new') {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: BG }}>

        <div className="flex-1 overflow-y-auto relative">

          {/* Grid background */}
          <div className="relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: `calc(-1 * var(--safe-area-top))` }} preserveAspectRatio="none">
              <defs>
                <pattern id="new-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D8D8DE" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="new-grid-fade-v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="new-grid-fade-l" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="new-grid-fade-r" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#new-grid)" />
              <rect width="100%" height="100%" fill="url(#new-grid-fade-v)" />
              <rect width="100%" height="100%" fill="url(#new-grid-fade-l)" />
              <rect width="100%" height="100%" fill="url(#new-grid-fade-r)" />
            </svg>

            <div style={{ height: 'var(--safe-area-top)' }} />

            {/* Portfolio Value */}
            <motion.div {...fadeUp(0)} className="relative page-pad pt-5 pb-2">
              <div className="flex flex-col">
                <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                  Patrimônio total
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                    fontWeight: 600, letterSpacing: -0.5, color: TEXT_PRIMARY, fontSize: 28,
                  }}>R$</span>
                  <span style={{
                    color: TEXT_PRIMARY, fontSize: 42, fontWeight: 800, lineHeight: 1,
                    letterSpacing: -1.5, fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
                  }}>
                    {portfolioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Chart placeholder: text + decorative wavy line — outside grid div so fade doesn't cover it */}
          <motion.div {...fadeUp(0.05)} className="flex flex-col items-center px-0" style={{ marginTop: 48, marginBottom: 20 }}>
            <span className="text-center max-w-[220px] text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium text-content-tertiary">
              Gráfico disponível após 7 dias da primeira negociação.
            </span>
            <svg width="100%" height={80} viewBox="0 0 400 80" preserveAspectRatio="none">
              <path
                d="M0,42 C50,34 80,50 130,40 C180,30 210,50 260,40 C310,30 340,48 400,40"
                fill="none"
                stroke={TEXT_TERTIARY}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.3}
              />
            </svg>
          </motion.div>

          {/* Shortcuts — reduced top margin since wavy line provides visual transition */}
          <motion.div {...fadeUp(0.1)} className="flex justify-between page-pad mt-2 mb-8">
            <ShortcutButton icon={<RiArrowLeftRightLine size={22} className="text-[var(--color-interactive-primary)]" />} label="Negociar" variant="primary" onPress={() => handleShortcut('Negociar')} />
            <ShortcutButton icon={<RiHeartFill size={22} className="text-[var(--color-interactive-primary)]" />} label="Favoritos" variant="secondary" onPress={() => handleShortcut('Favoritos')} />
            <ShortcutButton icon={<RiFileListLine size={22} className="text-[var(--color-interactive-primary)]" />} label="Ordens" variant="secondary" onPress={() => handleShortcut('Ordens')} />
            <ShortcutButton icon={<RiMoreFill size={22} className="text-[var(--color-interactive-primary)]" />} label="Mais" variant="secondary" onPress={() => setMoreOpen(true)} />
          </motion.div>

          {/* Holdings */}
          <motion.div {...fadeUp(0.15)} className="mb-4">
            <Subheader text="Minha carteira" />
            <div className="flex flex-col">
              {MOCK_POSITIONS.map((pos, i) => (
                <motion.div key={pos.asset} {...fadeUp(0.17 + i * 0.03)}>
                  <AssetListItem ticker={pos.asset} variant="holding" onPress={() => handleAssetTap(pos.asset)} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <motion.div {...fadeUp(0.3)} className="mb-6">
              <Subheader text="Favoritos" actionLabel="Ver todos" onAction={() => handleShortcut('Favoritos')} />
              <div className="flex gap-2 px-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {favorites.map(asset => (
                  <FavoriteCard key={asset.ticker} ticker={asset.ticker} onPress={() => handleAssetTap(asset.ticker)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Explore */}
          <motion.div {...fadeUp(0.4)} className="page-pad mb-6">
            <Button variant="primary" size="lg" fullWidth onPress={handleExplore}>Explorar mais ativos</Button>
          </motion.div>

          <div style={{ paddingBottom: 'max(var(--safe-area-bottom), 20px)' }} />
        </div>

        <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
          <div className="flex flex-col">
            <ListItem title="Depositar criptomoedas" left={<Avatar icon={<RiDownloadLine size={20} />} size="md" />} onPress={() => handleModalAction('Depositar criptomoedas')} />
            <ListItem title="Documentos" left={<Avatar icon={<RiFileTextLine size={20} />} size="md" />} onPress={() => handleModalAction('Documentos')} />
            <ListItem title="Extrato" left={<Avatar icon={<RiBarChartBoxLine size={20} />} size="md" />} onPress={() => handleModalAction('Extrato')} />
          </div>
        </BottomSheet>
      </div>
    )
  }

  // ── Portfolio 7-Day State (30-day chart: 23 flat + 7 real, with scrub) ──
  if (stateId === 'portfolio-3day') {
    const data7d = useMemo(() => generate7DayChartPoints(portfolioTotal), [portfolioTotal])
    const { path: path7d, points: points7d } = useMemo(
      () => buildSmoothPath(data7d, chartWidth, 140),
      [data7d],
    )
    // First real datapoint is at index 23 (day user started investing)
    const investStartValue = data7d[23].value

    // Scrub interaction (same pattern as portfolio)
    const chart7dRef = useRef<SVGSVGElement>(null)
    const [scrub7dIndex, setScrub7dIndex] = useState<number | null>(null)

    const handle7dInteraction = useCallback((clientX: number) => {
      const svg = chart7dRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      setScrub7dIndex(Math.round(pct * (points7d.length - 1)))
    }, [points7d])

    const display7dValue = scrub7dIndex !== null ? points7d[scrub7dIndex].value : portfolioTotal
    const display7dChange = ((display7dValue - investStartValue) / investStartValue) * 100
    const active7dPoint = scrub7dIndex !== null ? points7d[scrub7dIndex] : null

    return (
      <div className="flex flex-col min-h-screen" style={{ background: BG }}>

        <div className="flex-1 overflow-y-auto relative">

          {/* Grid background */}
          <div className="relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: `calc(-1 * var(--safe-area-top))` }} preserveAspectRatio="none">
              <defs>
                <pattern id="d3-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D8D8DE" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="d3-grid-fade-v" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="d3-grid-fade-l" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="d3-grid-fade-r" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#d3-grid)" />
              <rect width="100%" height="100%" fill="url(#d3-grid-fade-v)" />
              <rect width="100%" height="100%" fill="url(#d3-grid-fade-l)" />
              <rect width="100%" height="100%" fill="url(#d3-grid-fade-r)" />
            </svg>

            <div style={{ height: 'var(--safe-area-top)' }} />

            {/* Portfolio Value */}
            <motion.div {...fadeUp(0)} className="relative page-pad pt-5 pb-2">
              <div className="flex flex-col">
                <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                  Patrimônio total
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                    fontWeight: 600, letterSpacing: -0.5, color: TEXT_PRIMARY, fontSize: 28,
                  }}>R$</span>
                  <span style={{
                    color: TEXT_PRIMARY, fontSize: 42, fontWeight: 800, lineHeight: 1,
                    letterSpacing: -1.5, fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
                  }}>
                    {display7dValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5" style={{ fontSize: 14, fontWeight: 500, marginTop: 1 }}>
                  <span className="inline-flex items-center" style={{ color: display7dChange >= 0 ? GREEN : RED }}>
                    <span style={{ fontSize: 16, lineHeight: 1, paddingBottom: 2 }}>{display7dChange >= 0 ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(display7dChange).toFixed(2)}%
                  </span>
                  <span style={{ color: TEXT_SECONDARY }}>{scrub7dIndex !== null ? formatChartDate(points7d[scrub7dIndex].timestamp) : 'nos últimos 30 dias'}</span>
                </span>
              </div>
            </motion.div>

            {/* Interactive chart — 23 flat days + 7 real days */}
            <motion.div {...fadeUp(0.05)} className="relative px-0 mb-0">
              <svg
                ref={chart7dRef}
                width="100%"
                height={140}
                viewBox={`0 0 ${chartWidth} 140`}
                preserveAspectRatio="none"
                className="cursor-crosshair"
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); handle7dInteraction(e.clientX) }}
                onPointerMove={(e) => { if (e.buttons > 0) handle7dInteraction(e.clientX) }}
                onPointerUp={() => setScrub7dIndex(null)}
                onPointerLeave={() => setScrub7dIndex(null)}
              >
                <path
                  d={path7d}
                  fill="none"
                  stroke={TEXT_PRIMARY}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {active7dPoint && (
                  <>
                    <line x1={active7dPoint.x} y1={0} x2={active7dPoint.x} y2={140} stroke={TEXT_TERTIARY} strokeWidth={1} strokeDasharray="4 3" />
                    <circle cx={active7dPoint.x} cy={active7dPoint.y} r={5} fill={TEXT_PRIMARY} stroke="#FFFFFF" strokeWidth={2} />
                  </>
                )}
              </svg>
            </motion.div>
          </div>

          {/* Shortcuts */}
          <motion.div {...fadeUp(0.1)} className="flex justify-between page-pad mt-6 mb-8">
            <ShortcutButton icon={<RiArrowLeftRightLine size={22} className="text-[var(--color-interactive-primary)]" />} label="Negociar" variant="primary" onPress={() => handleShortcut('Negociar')} />
            <ShortcutButton icon={<RiHeartFill size={22} className="text-[var(--color-interactive-primary)]" />} label="Favoritos" variant="secondary" onPress={() => handleShortcut('Favoritos')} />
            <ShortcutButton icon={<RiFileListLine size={22} className="text-[var(--color-interactive-primary)]" />} label="Ordens" variant="secondary" onPress={() => handleShortcut('Ordens')} />
            <ShortcutButton icon={<RiMoreFill size={22} className="text-[var(--color-interactive-primary)]" />} label="Mais" variant="secondary" onPress={() => setMoreOpen(true)} />
          </motion.div>

          {/* Holdings */}
          <motion.div {...fadeUp(0.15)} className="mb-4">
            <Subheader text="Minha carteira" />
            <div className="flex flex-col">
              {MOCK_POSITIONS.map((pos, i) => (
                <motion.div key={pos.asset} {...fadeUp(0.17 + i * 0.03)}>
                  <AssetListItem ticker={pos.asset} variant="holding" onPress={() => handleAssetTap(pos.asset)} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <motion.div {...fadeUp(0.3)} className="mb-6">
              <Subheader text="Favoritos" actionLabel="Ver todos" onAction={() => handleShortcut('Favoritos')} />
              <div className="flex gap-2 px-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {favorites.map(asset => (
                  <FavoriteCard key={asset.ticker} ticker={asset.ticker} onPress={() => handleAssetTap(asset.ticker)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Explore */}
          <motion.div {...fadeUp(0.4)} className="page-pad mb-6">
            <Button variant="primary" size="lg" fullWidth onPress={handleExplore}>Explorar mais ativos</Button>
          </motion.div>

          <div style={{ paddingBottom: 'max(var(--safe-area-bottom), 20px)' }} />
        </div>

        <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
          <div className="flex flex-col">
            <ListItem title="Depositar criptomoedas" left={<Avatar icon={<RiDownloadLine size={20} />} size="md" />} onPress={() => handleModalAction('Depositar criptomoedas')} />
            <ListItem title="Documentos" left={<Avatar icon={<RiFileTextLine size={20} />} size="md" />} onPress={() => handleModalAction('Documentos')} />
            <ListItem title="Extrato" left={<Avatar icon={<RiBarChartBoxLine size={20} />} size="md" />} onPress={() => handleModalAction('Extrato')} />
          </div>
        </BottomSheet>
      </div>
    )
  }

  // ── Portfolio State (default) ──

  // Active point for cursor indicator
  const activePoint = activePointIndex !== null ? chartPoints[activePointIndex] : null

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto relative">

        {/* ── Header area with grid background (fills safe area too) ── */}
        <div className="relative overflow-hidden">
          {/* Grid pattern — covers safe area + content */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: `calc(-1 * var(--safe-area-top))` }} preserveAspectRatio="none">
            <defs>
              <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D8D8DE" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="grid-fade-v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="grid-fade-l" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grid-fade-r" x1="0" y1="0" x2="1" y2="0">
                <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <rect width="100%" height="100%" fill="url(#grid-fade-v)" />
            <rect width="100%" height="100%" fill="url(#grid-fade-l)" />
            <rect width="100%" height="100%" fill="url(#grid-fade-r)" />
          </svg>

          {/* Safe area spacer inside the grid */}
          <div style={{ height: 'var(--safe-area-top)' }} />

          {/* Portfolio Value */}
          <motion.div {...fadeUp(0)} className="relative page-pad pt-5 pb-2">
            <div className="flex flex-col">
              <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                Patrimônio total
              </span>
              <div className="flex items-baseline gap-0.5">
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
                  fontWeight: 600,
                  letterSpacing: -0.5,
                  color: TEXT_PRIMARY,
                  fontSize: 28,
                }}>
                  R$
                </span>
                <span style={{
                  color: TEXT_PRIMARY,
                  fontSize: 42,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -1.5,
                  fontFeatureSettings: "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1",
                }}>
                  {displayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: 14, fontWeight: 500, marginTop: 1 }}>
                <span className="inline-flex items-center" style={{ color: changePct >= 0 ? GREEN : RED }}>
                  <span style={{ fontSize: 16, lineHeight: 1, verticalAlign: 'text-top', paddingBottom: 2 }}>{changePct >= 0 ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(changePct).toFixed(2)}%
                </span>
                <span style={{ color: TEXT_SECONDARY, fontSize: 14 }}>{activePointIndex !== null ? formatChartDate(chartPoints[activePointIndex].timestamp) : 'nos últimos 30 dias'}</span>
              </span>
            </div>
          </motion.div>

          {/* Interactive Chart — smooth black line, no fill */}
          <motion.div {...fadeUp(0.05)} className="relative px-0 mb-0">
            <svg
              ref={chartRef}
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="cursor-crosshair"
              style={{ touchAction: 'none' }}
              onPointerDown={handleChartPointerDown}
              onPointerMove={handleChartPointerMove}
              onPointerUp={handleChartPointerUp}
              onPointerLeave={handleChartPointerUp}
            >
              {/* Chart line — smooth, black, thick */}
              <path
                d={chartPath}
                fill="none"
                stroke={TEXT_PRIMARY}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active point indicator */}
              {activePoint && (
                <>
                  {/* Vertical line */}
                  <line
                    x1={activePoint.x}
                    y1={0}
                    x2={activePoint.x}
                    y2={chartHeight}
                    stroke={TEXT_TERTIARY}
                    strokeWidth={1}
                    strokeDasharray="4 3"
                  />
                  {/* Dot */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={5}
                    fill={TEXT_PRIMARY}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </>
              )}
            </svg>
          </motion.div>
        </div>

        {/* Shortcut Buttons */}
        <motion.div {...fadeUp(0.1)} className="flex justify-between page-pad mt-6 mb-8">
          <ShortcutButton
            icon={<RiArrowLeftRightLine size={22} className="text-[var(--color-interactive-primary)]" />}
            label="Negociar"
            variant="primary"
            onPress={() => handleShortcut('Negociar')}
          />
          <ShortcutButton
            icon={<RiHeartFill size={22} className="text-[var(--color-interactive-primary)]" />}
            label="Favoritos"
            variant="secondary"
            onPress={() => handleShortcut('Favoritos')}
          />
          <ShortcutButton
            icon={<RiFileListLine size={22} className="text-[var(--color-interactive-primary)]" />}
            label="Ordens"
            variant="secondary"
            onPress={() => handleShortcut('Ordens')}
          />
          <ShortcutButton
            icon={<RiMoreFill size={22} className="text-[var(--color-interactive-primary)]" />}
            label="Mais"
            variant="secondary"
            onPress={() => setMoreOpen(true)}
          />
        </motion.div>

        {/* Holdings */}
        <motion.div {...fadeUp(0.15)} className="mb-4">
          <Subheader text="Minha carteira" />
          <div className="flex flex-col">
            {MOCK_POSITIONS.map((pos, i) => (
              <motion.div key={pos.asset} {...fadeUp(0.17 + i * 0.03)}>
                <AssetListItem
                  ticker={pos.asset}
                  variant="holding"
                  onPress={() => handleAssetTap(pos.asset)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Favorites — Card style */}
        {favorites.length > 0 && (
          <motion.div {...fadeUp(0.3)} className="mb-6">
            <Subheader text="Favoritos" actionLabel="Ver todos" onAction={() => handleShortcut('Favoritos')} />
            <div className="flex gap-2 px-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {favorites.map(asset => (
                <FavoriteCard
                  key={asset.ticker}
                  ticker={asset.ticker}
                  onPress={() => handleAssetTap(asset.ticker)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Explore More */}
        <motion.div {...fadeUp(0.4)} className="page-pad mb-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleExplore}
          >
            Explorar mais ativos
          </Button>
        </motion.div>

        {/* Bottom padding */}
        <div style={{ paddingBottom: 'max(var(--safe-area-bottom), 20px)' }} />
      </div>

      {/* More BottomSheet */}
      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="flex flex-col">
          <ListItem
            title="Depositar criptomoedas"
            left={<Avatar icon={<RiDownloadLine size={20} />} size="md" />}
            onPress={() => handleModalAction('Depositar criptomoedas')}
          />
          <ListItem
            title="Documentos"
            left={<Avatar icon={<RiFileTextLine size={20} />} size="md" />}
            onPress={() => handleModalAction('Documentos')}
          />
          <ListItem
            title="Extrato"
            left={<Avatar icon={<RiBarChartBoxLine size={20} />} size="md" />}
            onPress={() => handleModalAction('Extrato')}
          />
        </div>
      </BottomSheet>
    </div>
  )
}
