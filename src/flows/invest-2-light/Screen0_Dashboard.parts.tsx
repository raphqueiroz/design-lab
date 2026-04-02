/**
 * Dashboard parts — light-themed sub-components for the visual investments dashboard.
 * Pure custom Tailwind + inline styles + Framer Motion. NO library components.
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RiShieldCheckLine, RiCheckLine } from '@remixicon/react'
import {
  BG_CARD, BORDER, BORDER_LIGHT, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, TEXT_MUTED, GREEN, RED,
} from './shared/theme'
import { formatBRL, formatPercentChange, formatQuantity, isVolatile, getAsset, getSparkline } from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogo, TokenLogoCircle, TokenIconBare } from './shared/TokenLogo'

// ── Currency symbol styling (Barlow Condensed, smaller) ──

const SYMBOL_STYLE: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontFeatureSettings: "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0",
  fontWeight: 600,
  letterSpacing: -0.5,
}

const DIGIT_FEATURES = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

// ── Sparkline ──

interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
  strokeWidth?: number
}

export function Sparkline({ data, color, width = 60, height = 24, strokeWidth = 1.5 }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padY = 2

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - padY - ((v - min) / range) * (height - padY * 2),
  }))

  // Build smooth cubic bezier path using Catmull-Rom → Bezier conversion
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ── Portfolio Value ──

interface PortfolioValueProps {
  value: number
  change: number
}

export function PortfolioValue({ value, change }: PortfolioValueProps) {
  const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const isPositive = change >= 0
  const changeColor = isPositive ? GREEN : RED

  return (
    <div className="flex flex-col gap-1">
      <span style={{ color: TEXT_SECONDARY, fontSize: 13, fontWeight: 500 }}>
        Patrimônio total
      </span>
      <div className="flex items-baseline gap-0.5">
        <span style={{
          ...SYMBOL_STYLE,
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
          fontFeatureSettings: DIGIT_FEATURES,
        }}>
          {formatted}
        </span>
      </div>
      <span
        className="inline-flex items-center self-start rounded-full px-2.5 py-0.5 mt-1"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: changeColor,
          background: `${changeColor}18`,
        }}
      >
        {formatPercentChange(change)} (24h)
      </span>
    </div>
  )
}

// ── Holding Row (bigger fonts for mobile readability) ──

interface HoldingRowProps {
  icon: string
  name: string
  ticker: AssetTicker
  value: number
  quantity: number
  color: string
  sparkline: number[]
  onPress?: () => void
}

export function HoldingRow({ icon, name, ticker, value, quantity, color, sparkline, onPress }: HoldingRowProps) {
  const asset = getAsset(ticker)
  const volatile = isVolatile(asset)
  const change = asset.change24h ?? 0
  const isPositive = change >= 0

  return (
    <motion.button
      onClick={onPress}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-3 w-full px-5 py-4 text-left cursor-pointer border-none"
      style={{
        background: 'transparent',
        borderBottom: `1px solid ${BORDER_LIGHT}`,
      }}
    >
      {/* Icon */}
      <TokenLogoCircle ticker={ticker} fallbackUrl={icon} size={44} color={color} className="flex-shrink-0" />

      {/* Name + subtitle */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="truncate block" style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 500 }}>
          {name}
        </span>
        <span className="inline-flex items-center" style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
          {volatile ? (
            <>
              24h{'\u2009'}<span style={{ fontSize: 17, lineHeight: 1, verticalAlign: 'text-top', paddingBottom: 2 }}>{isPositive ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(change).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </>
          ) : (
            `Rende ${asset.apyDisplay?.replace(' a.a.', '')} ao ano`
          )}
        </span>
      </div>

      {/* Sparkline — only for volatile assets */}
      {volatile && <Sparkline data={sparkline} color={TEXT_PRIMARY} width={60} height={24} />}

      {/* Value + Quantity */}
      <div className="flex flex-col items-end flex-shrink-0 ml-2">
        <span style={{
          color: TEXT_PRIMARY,
          fontSize: 16,
          fontWeight: 500,
        }}>
          {formatBRL(value)}
        </span>
        <span style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
          {volatile ? formatQuantity(quantity, ticker) : ''}
        </span>
      </div>
    </motion.button>
  )
}

// ── FavoriteCard — asset-colored card ──

interface FavoriteCardProps {
  ticker: AssetTicker
  onPress?: () => void
}

export function FavoriteCard({ ticker, onPress }: FavoriteCardProps) {
  const asset = getAsset(ticker)
  const palette = getAssetPalette(ticker)
  const color = palette.bg
  const change = asset.change24h ?? 0
  const sparkData = getSparkline(ticker)
  const displayValue = isVolatile(asset) ? formatBRL(asset.price!) : (asset.apyDisplay ?? '')

  const isPositive = change >= 0
  const arrow = isPositive ? '↗' : '↘'

  return (
    <motion.div
      className="flex-shrink-0 relative overflow-hidden"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      // @ts-expect-error corner-shape is a valid CSS property (CSS Shapes L2, WebKit)
      style={{ width: 160, height: 180, borderRadius: 40, cornerShape: 'squircle' }}
    >
    <button
      onClick={onPress}
      className="w-full h-full border-none cursor-pointer text-left relative"
      style={{ background: color }}
    >
      <div className="flex flex-col justify-between h-full px-4 pt-4 pb-6 relative">
        {/* Top: asset name + icon centered vertically */}
        <div className="flex items-center justify-between">
          <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>
            {asset.name}
          </span>
          <TokenIconBare ticker={ticker} fallbackUrl={asset.icon} size={28} color="#FFFFFF" />
        </div>

        {/* Middle: sparkline */}
        <Sparkline data={sparkData} color="#FFFFFF" width={128} height={36} strokeWidth={2} />

        {/* Bottom: price + variation */}
        <div className="flex flex-col">
          <span style={{
            color: '#FFFFFF',
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -0.5,
          }}>
            {displayValue}
          </span>
          <span className="inline-flex items-center" style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1,
            marginTop: 4,
          }}>
            <span style={{ fontSize: 15, lineHeight: 1, paddingBottom: 2 }}>{arrow}</span>{'\u2009'}{Math.abs(change).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </span>
        </div>
      </div>
    </button>
    </motion.div>
  )
}

// Keep FavChip for backwards compatibility (other screens may use it)
interface FavChipProps {
  icon: string
  ticker: string
  change: number
  color: string
  onPress?: () => void
}

export function FavChip({ icon, ticker, change, color, onPress }: FavChipProps) {
  const isPositive = change >= 0

  return (
    <motion.button
      onClick={onPress}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 border-none cursor-pointer"
      style={{
        background: BG_CARD,
        border: `1px solid ${BORDER_LIGHT}`,
      }}
    >
      <TokenLogo ticker={ticker} fallbackUrl={icon} size={18} color={color} className="rounded-full" />
      <span style={{ color: TEXT_PRIMARY, fontSize: 12, fontWeight: 600 }}>{ticker}</span>
      <span style={{
        color: isPositive ? GREEN : RED,
        fontSize: 11,
        fontWeight: 600,
      }}>
        {formatPercentChange(change)}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE PARTS — Psychology-driven onboarding
// ═══════════════════════════════════════════════════════════════

// ── Growing Plant Animation (Fresh Start + Delight) ──

export function GrowthAnimation() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      {/* Glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 120, height: 120, background: `radial-gradient(circle, ${GREEN}20 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Pot */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="relative">
        {/* Pot body */}
        <motion.rect
          x="38" y="82" width="44" height="24" rx="4"
          fill={`${GREEN}30`}
          stroke={GREEN}
          strokeWidth="1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        {/* Stem */}
        <motion.line
          x1="60" y1="82" x2="60" y2="35"
          stroke={GREEN}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        />
        {/* Left leaf */}
        <motion.path
          d="M60 55 C50 45, 35 48, 38 58 C40 50, 52 48, 60 55Z"
          fill={GREEN}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1.0 }}
          style={{ transformOrigin: '60px 55px' }}
        />
        {/* Right leaf */}
        <motion.path
          d="M60 45 C70 35, 85 38, 82 48 C80 40, 68 38, 60 45Z"
          fill={GREEN}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1.2 }}
          style={{ transformOrigin: '60px 45px' }}
        />
        {/* Top leaf / sprout */}
        <motion.circle
          cx="60" cy="30" r="6"
          fill={GREEN}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 1.4 }}
        />
      </svg>
    </div>
  )
}

// ── Social Proof Counter (Bandwagon + Social Proof) ──

const SOCIAL_AVATARS = [
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=25',
  'https://i.pravatar.cc/80?img=33',
  'https://i.pravatar.cc/80?img=47',
]

export function SocialProofCounter() {
  const target = 12847
  const [count, setCount] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const duration = 1500
    const steps = 40
    const increment = target / steps
    let current = 0
    ref.current = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        if (ref.current) clearInterval(ref.current)
      } else {
        setCount(Math.round(current))
      }
    }, duration / steps)
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [])

  const formatted = count.toLocaleString('pt-BR')

  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar stack with real photos */}
      <div className="flex -space-x-2">
        {SOCIAL_AVATARS.map((src, i) => (
          <motion.div
            key={i}
            className="rounded-full overflow-hidden flex-shrink-0"
            style={{
              width: 28, height: 28,
              border: '2px solid #FFFFFF',
              zIndex: SOCIAL_AVATARS.length - i,
            }}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 + i * 0.1 }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
      <span style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 600 }}>
        {formatted} pessoas negociando
      </span>
    </div>
  )
}

// ── Mini Portfolio Simulator (Aha! Moment + Anchoring) ──

interface SimResult {
  ticker: AssetTicker
  name: string
  icon: string
  returnPct: number
  returnValue: number
  color: string
  sparklineColor?: string
  sparkline: number[]
}

export function MiniSimulator({ results }: { results: SimResult[] }) {
  return (
    <div
      className="rounded-2xl p-4 w-full"
      style={{ background: BG_CARD, border: `1px solid ${BORDER}` }}
    >
      <span style={{ color: TEXT_TERTIARY, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
        Se você tivesse investido R$ 100 há 1 ano
      </span>
      <div className="flex flex-col gap-3 mt-3">
        {results.map((r, i) => (
          <motion.div
            key={r.ticker}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.12 }}
          >
            <TokenLogo ticker={r.ticker} fallbackUrl={r.icon} size={24} color={r.color} className="rounded-full" />
            <span className="flex-1" style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 500 }}>
              {r.name}
            </span>
            <Sparkline data={r.sparkline} color={r.sparklineColor ?? r.color} width={40} height={16} />
            <div className="flex flex-col items-end">
              <CountUpValue target={r.returnValue} delay={1.0 + i * 0.15} />
              <span style={{ color: GREEN, fontSize: 11, fontWeight: 600 }}>
                +{r.returnPct}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CountUpValue({ target, delay }: { target: number; delay: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const steps = 30
      const duration = 800
      const inc = target / steps
      let current = 0
      const iv = setInterval(() => {
        current += inc
        if (current >= target) { setValue(target); clearInterval(iv) }
        else setValue(Math.round(current * 100) / 100)
      }, duration / steps)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [target, delay])

  return (
    <span style={{ color: TEXT_PRIMARY, fontSize: 14, fontWeight: 700, fontFeatureSettings: "'tnum' 1" }}>
      {formatBRL(value)}
    </span>
  )
}

// ── Step Tracker (Goal Gradient + Zeigarnik) ──

export function StepTracker() {
  const steps = [
    { label: 'Explorar', done: true },
    { label: 'Favoritar', done: false },
    { label: 'Investir', done: false },
  ]

  return (
    <div className="w-full">
      <span style={{ color: TEXT_TERTIARY, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
        Seu primeiro investimento
      </span>
      <div className="flex items-center gap-2 mt-3">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 28, height: 28,
                background: step.done ? GREEN : BG_CARD,
                border: `1.5px solid ${step.done ? GREEN : BORDER}`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 + i * 0.15 }}
            >
              {step.done && <RiCheckLine size={14} color="#000" />}
              {!step.done && (
                <span style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              )}
            </motion.div>
            <span style={{ color: step.done ? GREEN : TEXT_TERTIARY, fontSize: 11, fontWeight: 500 }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-3 rounded-full overflow-hidden" style={{ height: 4, background: BG_CARD }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: GREEN }}
          initial={{ width: '0%' }}
          animate={{ width: '33%' }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ── Trust Bar (Authority + Noble Edge) ──

export function TrustBar() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: BG_CARD, border: `1px solid ${BORDER_LIGHT}` }}>
      <RiShieldCheckLine size={18} color={GREEN} />
      <span style={{ color: TEXT_SECONDARY, fontSize: 12, lineHeight: 1.4 }}>
        Investimentos regulados e custodiados por instituições autorizadas
      </span>
    </div>
  )
}

