/**
 * Screen3c_OrderConfig.parts — DraggablePriceLine, TimeRangePills, ChartPriceLabels, PriceEditSheet.
 */
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RiPencilFill } from '@remixicon/react'
import BottomSheet from '@/library/layout/BottomSheet'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'

// ── Integer price formatter (no cents) ──

export function formatPriceInt(amount: number): string {
  return `US$ ${Math.round(amount).toLocaleString('pt-BR')}`
}

// ── Time Range Pills ──

export const TIME_RANGES = [
  { label: '1D', days: 1 },
  { label: '1S', days: 7 },
  { label: '1M', days: 30 },
  { label: '1A', days: 365 },
  { label: '5A', days: 1825 },
] as const

interface TimeRangePillsProps {
  activeIndex: number
  onChange: (index: number) => void
}

export function TimeRangePills({ activeIndex, onChange }: TimeRangePillsProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {TIME_RANGES.map((range, i) => (
        <button
          key={range.label}
          onClick={() => onChange(i)}
          className="relative border-none cursor-pointer rounded-full px-4 py-2"
          style={{
            background: 'transparent',
            color: i === activeIndex
              ? 'var(--token-content-primary)'
              : 'var(--token-content-secondary)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {i === activeIndex && (
            <motion.div
              layoutId="orderConfigTimeRange"
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(0,0,0,0.08)', zIndex: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative" style={{ zIndex: 1 }}>{range.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Chart Price Labels ──

interface ChartPriceLabelsProps {
  currentPrice: number
  minPrice: number
  accentColor: string
}

export function ChartPriceLabels({ currentPrice, minPrice, accentColor }: ChartPriceLabelsProps) {
  const plusTenPct = Math.round(currentPrice * 1.1)

  return (
    <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pr-2 pointer-events-none" style={{ width: 90 }}>
      <span className="text-right text-[10px] font-medium text-content-tertiary">
        {formatPriceInt(plusTenPct)}
      </span>
      <span className="text-right text-[10px] font-semibold" style={{ color: accentColor }}>
        {formatPriceInt(currentPrice)}
      </span>
      <span className="text-right text-[10px] font-medium text-content-tertiary">
        {formatPriceInt(minPrice)}
      </span>
    </div>
  )
}

// ── Price Edit Sheet ──

interface PriceEditSheetProps {
  open: boolean
  onClose: () => void
  title: string
  currentValue: number
  onConfirm: (price: number) => void
}

export function PriceEditSheet({ open, onClose, title, currentValue, onConfirm }: PriceEditSheetProps) {
  const [value, setValue] = useState('')

  // Pre-fill when sheet opens
  useEffect(() => {
    if (open) setValue(Math.round(currentValue * 100).toString())
  }, [open, currentValue])

  const parsed = parseInt(value || '0', 10) / 100
  const isValid = parsed > 0

  const handleConfirm = useCallback(() => {
    if (isValid) {
      onConfirm(parsed)
      onClose()
    }
  }, [isValid, parsed, onConfirm, onClose])

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <Stack gap="default">
        <CurrencyInput
          label="Valor"
          value={value}
          onChange={setValue}
          currencySymbol="US$"
        />
        <Button fullWidth disabled={!isValid} onPress={handleConfirm}>
          Confirmar
        </Button>
      </Stack>
    </BottomSheet>
  )
}

// ── Helpers ──

export function pctFromPrice(base: number, target: number): string {
  const pct = ((target - base) / base) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

export function priceToY(target: number, range: { min: number; max: number }): number {
  const total = range.max - range.min
  if (total <= 0) return 50
  const normalized = (target - range.min) / total
  return Math.max(5, Math.min(95, (1 - normalized) * 100))
}

// ── DraggablePriceLine ──

export interface DraggablePriceLineProps {
  price: number
  label: string
  color: string
  y: number
  onDrag?: (yPercent: number) => void
  onTap?: () => void
  /** Solid line instead of dashed */
  solid?: boolean
  /** Dark variant: black bg, white text on badges */
  dark?: boolean
}

export function DraggablePriceLine({ price, label, color, y, onDrag, onTap, solid, dark }: DraggablePriceLineProps) {
  const isDraggable = !!onDrag

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onDrag) return
    e.preventDefault()
    e.stopPropagation()
    const container = e.currentTarget.parentElement!

    let moved = false
    const startY = e.clientY

    const move = (ev: PointerEvent) => {
      if (Math.abs(ev.clientY - startY) > 3) moved = true
      const rect = container.getBoundingClientRect()
      const relY = ev.clientY - rect.top
      const pct = Math.max(5, Math.min(95, (relY / rect.height) * 100))
      onDrag(pct)
    }

    const up = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      if (!moved && onTap) onTap()
    }

    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  const badgeBg = dark ? color : `${color}30`
  const badgeText = dark ? '#ffffff' : color
  const priceBg = dark ? color : `${color}20`

  return (
    <div
      className="absolute left-0 right-0 flex items-center transition-[top] duration-150 ease-out"
      style={{
        top: `${y}%`,
        cursor: isDraggable ? 'ns-resize' : 'default',
        pointerEvents: isDraggable ? 'auto' : 'none',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
    >
      {isDraggable && (
        <div className="absolute inset-x-0" style={{ top: -14, bottom: -14 }} />
      )}

      {/* Label badge (left) */}
      <span
        className="flex-shrink-0 rounded-md px-2 py-0.5 z-10 flex items-center gap-1"
        style={{ background: badgeBg, color: badgeText, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}
      >
        {label}
      </span>

      {/* Line */}
      <div
        className="flex-1 mx-1"
        style={{
          height: 2,
          background: solid
            ? `${color}80`
            : `repeating-linear-gradient(to right, ${color}80 0px, ${color}80 5px, transparent 5px, transparent 9px)`,
        }}
      />

      {/* Price badge + edit icon (right) */}
      <span
        className="flex-shrink-0 rounded-md px-2 py-0.5 z-10 flex items-center gap-1"
        style={{ background: priceBg, color: badgeText, fontSize: 12, fontWeight: 700 }}
      >
        {formatPriceInt(price)}
        {onTap && <RiPencilFill size={11} />}
      </span>
    </div>
  )
}
