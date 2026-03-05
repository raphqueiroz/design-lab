/**
 * Screen-only parts for the Caixinha Hub (Version A).
 * Do not import from other screens — extract to src/library/ if reused.
 */

import Stack from '../../../library/layout/Stack'
import Text from '../../../library/foundations/Text'
import Badge from '../../../library/display/Badge'
import Amount from '../../../library/display/Amount'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
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
        <Text variant="caption" className="text-[#8a8a8a]">Caixinha do Dólar</Text>
        <Badge variant="lime" size="sm">5% a.a.</Badge>
      </Stack>

      <Amount value={balance} currency="US$" size="lg" className="text-white" />

      <Text variant="caption" className="text-[#a5f20c]">
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

/* ── NewUserPromo ── */

interface NewUserPromoProps {
  onActivate: () => void
}

export function NewUserPromo({ onActivate }: NewUserPromoProps) {
  return (
    <div
      style={{
        borderRadius: 20,
        background: 'linear-gradient(135deg, #a5f20c 0%, #7bc600 100%)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer',
      }}
      onClick={onActivate}
    >
      <Badge variant="neutral" size="sm">5% a.a.</Badge>
      <Text variant="heading-md" className="text-[#1b1b1b]">
        Comece a render seus dólares
      </Text>
      <Text variant="body-sm" className="text-[#1b1b1b] opacity-80">
        Deposite qualquer valor e ganhe 5% ao ano. Sem prazo mínimo, resgate quando quiser.
      </Text>
    </div>
  )
}
