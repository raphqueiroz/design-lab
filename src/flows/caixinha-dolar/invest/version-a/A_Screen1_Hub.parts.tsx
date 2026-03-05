/**
 * Screen-only parts for the Caixinha Hub (Version A).
 * Do not import from other screens — extract to src/library/ if reused.
 */

import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import Stack from '../../../../library/layout/Stack'
import Card from '../../../../library/display/Card'
import Text from '../../../../library/foundations/Text'
import Badge from '../../../../library/display/Badge'
import Amount from '../../../../library/display/Amount'
import ShortcutButton from '../../../../library/inputs/ShortcutButton'

/* ── BalanceHero ── */

interface BalanceHeroProps {
  balance: number
  yieldToday: number
}

export function BalanceHero({ balance, yieldToday }: BalanceHeroProps) {
  return (
    <Card variant="elevated">
      <Stack gap="sm">
        <Stack direction="row" align="between">
          <Text variant="caption" color="content-secondary">Caixinha do Dólar</Text>
          <Badge variant="lime" size="sm">5% a.a.</Badge>
        </Stack>
        <Amount value={balance} currency="US$" size="lg" />
        <Text variant="caption" className="text-[#22c55e]">
          +US$ {yieldToday.toFixed(2).replace('.', ',')} hoje
        </Text>
      </Stack>
    </Card>
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
