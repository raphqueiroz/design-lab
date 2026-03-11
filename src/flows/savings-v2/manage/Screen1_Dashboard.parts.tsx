/**
 * Screen-only parts for the MVP Dashboard.
 */

import { RiArrowRightSLine, RiLock2Line } from '@remixicon/react'
import Avatar from '../../../library/display/Avatar'
import Badge from '../../../library/display/Badge'
import Text from '../../../library/foundations/Text'
import Stack from '../../../library/layout/Stack'
import type { CaixinhaCurrency } from '../../savings-reviewed/shared/data'
import { CURRENCIES, formatCurrency } from '../../savings-reviewed/shared/data'

// ── Currency Card (disabled only — kept for EUR/BRL) ──

interface CurrencyCardProps {
  currency: CaixinhaCurrency
  balance: number
  yieldToday: number
  disabled?: boolean
  onPress?: () => void
}

export function CurrencyCard({ currency, balance, yieldToday, disabled, onPress }: CurrencyCardProps) {
  const curr = CURRENCIES[currency]
  const hasBalance = balance > 0

  if (disabled) {
    return (
      <div className="flex items-center gap-3 w-full p-4 rounded-[var(--token-radius-lg)] bg-surface-secondary opacity-50">
        <Avatar
          icon={<img src={curr.flagIcon} alt="" className="w-5 h-5 rounded-full object-cover" />}
          size="lg"
        />
        <Stack gap="none" className="flex-1 min-w-0">
          <Stack direction="row" gap="sm" align="center">
            <Text variant="body-md" className="font-medium">{curr.name}</Text>
            <Badge variant="neutral" size="sm">Em breve</Badge>
          </Stack>
          <Text variant="body-sm" color="content-tertiary">{curr.apyDisplay}</Text>
        </Stack>
        <RiLock2Line size={18} className="text-content-tertiary shrink-0" />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center gap-3 w-full text-left p-4 rounded-[var(--token-radius-lg)] bg-surface-secondary hover:bg-surface-shade transition-colors cursor-pointer border-2 border-[var(--color-brand-core-100)]"
    >
      <Avatar
        icon={<img src={curr.flagIcon} alt="" className="w-5 h-5 rounded-full object-cover" />}
        size="lg"
        bgColor="var(--color-brand-core-500)"
        iconColor="#ffffff"
      />
      <Stack gap="none" className="flex-1 min-w-0">
        <Stack direction="row" gap="sm" align="center">
          <Text variant="body-md" className="font-medium">{curr.name}</Text>
          <Badge variant="lime" size="sm">{curr.apyDisplay}</Badge>
        </Stack>
        {hasBalance ? (
          <Text variant="body-md" className="font-semibold tabular-nums">
            {formatCurrency(balance, currency)}
          </Text>
        ) : (
          <Text variant="body-sm" color="content-tertiary">Toque para começar a render</Text>
        )}
      </Stack>
      <Stack gap="none" align="end" className="shrink-0">
        {hasBalance && yieldToday > 0 && (
          <Text variant="caption" className="text-[var(--color-feedback-success)] font-medium tabular-nums">
            +{formatCurrency(yieldToday, currency)}
          </Text>
        )}
        <RiArrowRightSLine size={18} className="text-content-tertiary" />
      </Stack>
    </button>
  )
}

// ── Caixinha Card (rounded square flag, bigger name, no BRL) ──

interface CaixinhaCardProps {
  currency: CaixinhaCurrency
  name: string
  balance: number
  yieldToday: number
  disabled?: boolean
  onPress?: () => void
}

export function CaixinhaCard({ currency, name, balance, yieldToday, disabled, onPress }: CaixinhaCardProps) {
  const curr = CURRENCIES[currency]

  if (disabled) {
    return (
      <div className="flex items-center gap-3 w-full py-4 px-0 opacity-25">
        <div className="w-12 h-12 rounded-[var(--token-radius-md)] overflow-hidden shrink-0 grayscale">
          <img src={curr.flagIcon} alt="" className="w-full h-full object-cover" />
        </div>
        <Stack gap="none" className="flex-1 min-w-0">
          <Text variant="body-lg" className="font-semibold">{name}</Text>
          <Text variant="body-sm" color="content-tertiary">Em breve</Text>
        </Stack>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center gap-3 w-full text-left py-4 px-0 bg-transparent rounded-[var(--token-radius-md)] shadow-[0_0_0_0_transparent] hover:bg-surface-secondary/50 hover:shadow-[12px_0_0_0_rgba(240,241,243,0.5),-12px_0_0_0_rgba(240,241,243,0.5)] active:bg-surface-secondary/70 active:shadow-[12px_0_0_0_rgba(240,241,243,0.7),-12px_0_0_0_rgba(240,241,243,0.7)] transition-all duration-200 ease-out cursor-pointer border-0"
    >
      {/* Rounded square flag */}
      <div className="w-12 h-12 rounded-[var(--token-radius-md)] overflow-hidden shrink-0">
        <img src={curr.flagIcon} alt="" className="w-full h-full object-cover" />
      </div>

      <Stack gap="none" className="flex-1 min-w-0">
        {/* Row 1: title + value aligned */}
        <div className="flex items-baseline justify-between">
          <Text variant="body-lg" className="font-semibold">{name}</Text>
          <Text variant="body-lg" className="font-medium tracking-tight shrink-0">
            {formatCurrency(balance, currency)}
          </Text>
        </div>
        {/* Row 2: subtitle + yield aligned */}
        <div className="flex items-baseline justify-between">
          <Text variant="body-sm" color="content-tertiary">Rende {curr.apyDisplay.replace(' a.a.', '')} ao ano</Text>
          {yieldToday > 0 && (
            <Text variant="body-sm" className="text-[var(--color-feedback-success)] font-semibold tracking-tight shrink-0">
              ↑ {formatCurrency(yieldToday, currency)}
            </Text>
          )}
        </div>
      </Stack>

    </button>
  )
}
