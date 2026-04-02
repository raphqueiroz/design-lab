/**
 * TP/SL Config — Shared Parts
 * Used by both buy and sell TP/SL config screens.
 */
import { useState } from 'react'
import { cn } from '@/lib/cn'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import BottomSheet from '@/library/layout/BottomSheet'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import { BRL_FLAG } from '@/lib/flags'
import { formatBRL, rawDigitsFromAmount } from '../shared/data'

// ── PriceLevelLine ──

interface PriceLevelLineProps {
  price: number
  label: string
  color: string
  position: 'above' | 'below'
}

export function PriceLevelLine({ price, label, color, position }: PriceLevelLineProps) {
  const positionStyle = position === 'above'
    ? { top: '18%' }
    : { bottom: '18%' }

  return (
    <div
      className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
      style={positionStyle}
    >
      {/* Label badge */}
      <div
        className="shrink-0 px-[6px] py-[2px] rounded-[4px] ml-[8px]"
        style={{ backgroundColor: color }}
      >
        <span className="text-[11px] font-bold text-white leading-[16px]">
          {label}
        </span>
      </div>

      {/* Dashed line */}
      <div
        className="flex-1 h-0 mx-[6px]"
        style={{ borderTop: `1.5px dashed ${color}` }}
      />

      {/* Price label */}
      <div
        className="shrink-0 px-[6px] py-[2px] rounded-[4px] mr-[8px]"
        style={{ backgroundColor: `${color}20` }}
      >
        <span
          className="text-[11px] font-semibold leading-[16px]"
          style={{ color }}
        >
          {formatBRL(price)}
        </span>
      </div>
    </div>
  )
}

// ── PriceInputSheet ──

interface PriceInputSheetProps {
  open: boolean
  onClose: () => void
  title: string
  currentPrice: number
  direction: 'up' | 'down'
  onConfirm: (price: number) => void
}

const UP_PERCENTAGES = [0.05, 0.10, 0.15, 0.20]
const DOWN_PERCENTAGES = [-0.05, -0.10, -0.15, -0.20]

export function PriceInputSheet({
  open,
  onClose,
  title,
  currentPrice,
  direction,
  onConfirm,
}: PriceInputSheetProps) {
  const percentages = direction === 'up' ? UP_PERCENTAGES : DOWN_PERCENTAGES
  const [rawValue, setRawValue] = useState(() =>
    rawDigitsFromAmount(
      currentPrice * (1 + (direction === 'up' ? 0.10 : -0.10))
    )
  )

  const parsedPrice = parseInt(rawValue || '0', 10) / 100
  const isValid = parsedPrice > 0 && (
    direction === 'up' ? parsedPrice > currentPrice : parsedPrice < currentPrice
  )

  const handlePercentTap = (pct: number) => {
    const target = currentPrice * (1 + pct)
    setRawValue(rawDigitsFromAmount(target))
  }

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(parsedPrice)
      onClose()
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <Stack gap="default">
        {/* Current price reference */}
        <div className="flex items-center justify-between py-[var(--token-spacing-2)]">
          <Text variant="body-sm" className="text-content-secondary">
            Preço atual
          </Text>
          <Text variant="body-sm" className="font-semibold text-content-primary">
            {formatBRL(currentPrice)}
          </Text>
        </div>

        {/* Quick-fill percentage buttons */}
        <Stack direction="row" gap="sm">
          {percentages.map((pct) => {
            const label = pct > 0 ? `+${Math.round(pct * 100)}%` : `${Math.round(pct * 100)}%`
            const targetPrice = currentPrice * (1 + pct)
            const isSelected = Math.abs(parsedPrice - targetPrice) < 1

            return (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentTap(pct)}
                className={cn(
                  'flex-1 py-[var(--token-spacing-2)] rounded-[var(--token-radius-md)] text-center cursor-pointer',
                  'text-[length:var(--token-font-size-body-sm)] font-medium leading-[var(--token-line-height-body-sm)]',
                  isSelected
                    ? 'bg-[var(--color-interactive-default)] text-[var(--color-content-primary)]'
                    : 'bg-[var(--color-surface-shade)] text-[var(--color-content-secondary)]',
                )}
              >
                {label}
              </button>
            )
          })}
        </Stack>

        {/* Manual price entry */}
        <CurrencyInput
          label="Preço alvo"
          value={rawValue}
          onChange={setRawValue}
          currencySymbol="R$"
          tokenIcon={BRL_FLAG}
        />

        {/* Distance from current price */}
        {parsedPrice > 0 && (
          <div className="flex items-center justify-center">
            <Text
              variant="caption"
              className={cn(
                'font-medium',
                direction === 'up'
                  ? 'text-[var(--color-feedback-success)]'
                  : 'text-[var(--color-feedback-critical)]',
              )}
            >
              {direction === 'up' ? '+' : ''}
              {(((parsedPrice - currentPrice) / currentPrice) * 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              % do preço atual
            </Text>
          </div>
        )}

        {/* Confirm button */}
        <Button fullWidth disabled={!isValid} onPress={handleConfirm}>
          Confirmar
        </Button>
      </Stack>
    </BottomSheet>
  )
}

// ── TpSlSummaryCard ──

interface TpSlSummaryCardProps {
  tp?: number
  sl?: number
  currentPrice: number
}

function formatPctDistance(target: number, current: number): string {
  const pct = ((target - current) / current) * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function TpSlSummaryCard({ tp, sl, currentPrice }: TpSlSummaryCardProps) {
  if (!tp && !sl) return null

  return (
    <div className="rounded-[var(--token-radius-lg)] bg-[var(--color-surface-shade)] p-[var(--token-spacing-4)]">
      <Stack gap="sm">
        <Text variant="caption" className="font-medium text-content-secondary">
          Ordens configuradas
        </Text>

        {tp != null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--token-spacing-2)]">
              <div className="w-[8px] h-[8px] rounded-full bg-[var(--color-feedback-success)]" />
              <Text variant="body-sm" className="text-content-primary">
                Take Profit
              </Text>
            </div>
            <div className="flex items-center gap-[var(--token-spacing-2)]">
              <Text variant="body-sm" className="font-semibold text-content-primary">
                {formatBRL(tp)}
              </Text>
              <Text variant="caption" className="text-[var(--color-feedback-success)] font-medium">
                {formatPctDistance(tp, currentPrice)}
              </Text>
            </div>
          </div>
        )}

        {sl != null && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[var(--token-spacing-2)]">
              <div className="w-[8px] h-[8px] rounded-full bg-[var(--color-feedback-critical)]" />
              <Text variant="body-sm" className="text-content-primary">
                Stop Loss
              </Text>
            </div>
            <div className="flex items-center gap-[var(--token-spacing-2)]">
              <Text variant="body-sm" className="font-semibold text-content-primary">
                {formatBRL(sl)}
              </Text>
              <Text variant="caption" className="text-[var(--color-feedback-critical)] font-medium">
                {formatPctDistance(sl, currentPrice)}
              </Text>
            </div>
          </div>
        )}
      </Stack>
    </div>
  )
}
