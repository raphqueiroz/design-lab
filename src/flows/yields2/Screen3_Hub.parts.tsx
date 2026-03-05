/**
 * Screen-only parts for the Yields2 Hub.
 * Do not import from other screens — extract to src/library/ if reused.
 */

import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import Amount from '../../library/display/Amount'
import ShortcutButton from '../../library/inputs/ShortcutButton'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'

/* ── BalanceHero ── */

interface BalanceHeroProps {
  balance: number
  yieldToday: number
}

export function BalanceHero({ balance, yieldToday }: BalanceHeroProps) {
  return (
    <div
      style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, #1b1b1b 0%, #2d2d2d 100%)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Stack direction="row" align="between">
        <Text variant="caption" className="text-[#8a8a8a]">Renda Protegida</Text>
        <Badge variant="success" size="sm">Protegido</Badge>
      </Stack>

      <Amount value={balance} currency="US$" size="lg" className="text-white" />

      <Text variant="caption" className="text-[var(--color-feedback-success)]">
        +US$ {yieldToday.toFixed(2).replace('.', ',')} hoje
      </Text>
    </div>
  )
}

/* ── HubActions ── */

interface HubActionsProps {
  onDeposit: () => void
  onWithdraw: () => void
  onElementTap?: (label: string) => boolean
}

export function HubActions({ onDeposit, onWithdraw, onElementTap }: HubActionsProps) {
  return (
    <Stack direction="row" gap="lg" align="center" className="justify-center">
      <ShortcutButton
        icon={<RiArrowDownLine size={20} />}
        label="Depositar"
        variant="primary"
        onPress={() => {
          const resolved = onElementTap?.('ShortcutButton: Depositar')
          if (!resolved) onDeposit()
        }}
      />
      <ShortcutButton
        icon={<RiArrowUpLine size={20} />}
        label="Resgatar"
        variant="secondary"
        onPress={() => {
          const resolved = onElementTap?.('ShortcutButton: Resgatar')
          if (!resolved) onWithdraw()
        }}
      />
    </Stack>
  )
}
