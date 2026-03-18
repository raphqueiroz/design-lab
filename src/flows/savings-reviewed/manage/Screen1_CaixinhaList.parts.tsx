/**
 * Screen-only parts for the multi-currency Caixinha List.
 * CaixinhaListCard — pressable card with Avatar icon, currency badge, and BRL equivalent.
 * Created because no library component handles currency-aware savings cards with press interaction.
 */

import {
  RiPlaneLine, RiHomeLine, RiCarLine, RiSmartphoneLine,
  RiShieldLine, RiGiftLine, RiGraduationCapLine, RiHeartLine,
  RiGamepadLine, RiMoneyDollarCircleLine, RiBearSmileLine, RiMusicLine,
  RiArrowRightSLine,
} from '@remixicon/react'
import Stack from '../../../library/layout/Stack'
import Text from '../../../library/foundations/Text'
import Avatar from '../../../library/display/Avatar'
import Badge from '../../../library/display/Badge'

import LoadingSpinner from '../../../library/feedback/LoadingSpinner'
import { type CaixinhaData, type CaixinhaIconId, CURRENCIES, formatCurrency, formatBrlEquivalent } from '../shared/data'

const ICON_MAP: Record<CaixinhaIconId, typeof RiPlaneLine> = {
  plane: RiPlaneLine,
  home: RiHomeLine,
  car: RiCarLine,
  phone: RiSmartphoneLine,
  shield: RiShieldLine,
  gift: RiGiftLine,
  graduation: RiGraduationCapLine,
  heart: RiHeartLine,
  game: RiGamepadLine,
  money: RiMoneyDollarCircleLine,
  pet: RiBearSmileLine,
  music: RiMusicLine,
}

/* ── PendingDepositBanner ── */

export function PendingDepositBanner() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-[var(--token-radius-lg)] bg-surface-secondary">
      <LoadingSpinner size="sm" />
      <Stack gap="none">
        <Text variant="body-md" className="font-semibold">Processando seu depósito</Text>
        <Text variant="body-sm" color="content-secondary">
          Seu saldo será atualizado em breve
        </Text>
      </Stack>
    </div>
  )
}

/* ── CaixinhaListCard ── */

interface CaixinhaListCardProps {
  caixinha: CaixinhaData
  onPress: () => void
}

export function CaixinhaListCard({ caixinha, onPress }: CaixinhaListCardProps) {
  const IconComp = ICON_MAP[caixinha.iconId]
  const curr = CURRENCIES[caixinha.currency]
  const brlEquiv = formatBrlEquivalent(caixinha.balance, caixinha.currency)

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center gap-3 w-full text-left p-3 rounded-[var(--token-radius-lg)] bg-surface-secondary hover:bg-surface-shade transition-colors cursor-pointer"
    >
      <Avatar
        icon={<IconComp size={20} />}
        size="lg"
        bgColor="var(--color-brand-core-500)"
        iconColor="#ffffff"
      />
      <Stack gap="none" className="flex-1 min-w-0">
        <Stack direction="row" gap="sm" align="center">
          <Text variant="body-md" className="font-semibold truncate">{caixinha.name}</Text>
          <Badge variant="neutral" size="sm">{curr.apyDisplay}</Badge>
        </Stack>
        <Text variant="body-sm" color="content-secondary">
          {formatCurrency(caixinha.balance, caixinha.currency)}
        </Text>
        {brlEquiv && (
          <Text variant="caption" color="content-tertiary">{brlEquiv}</Text>
        )}
      </Stack>
      <Stack gap="none" align="end" className="shrink-0">
        <Text variant="caption" className="text-[var(--color-feedback-success)]">
          +{formatCurrency(caixinha.yieldToday, caixinha.currency)}
        </Text>
        <RiArrowRightSLine size={18} className="text-content-tertiary mt-0.5" />
      </Stack>
    </button>
  )
}

/* ── EmptyState ── */

export function EmptyState() {
  return (
    <Stack gap="sm" align="center" className="py-8">
      <Avatar
        icon={<RiMoneyDollarCircleLine size={32} />}
        size="xl"
        bgColor="var(--color-surface-shade)"
        iconColor="var(--color-content-tertiary)"
      />
      <Text variant="heading-sm" align="center">Organize suas economias</Text>
      <Text variant="body-sm" color="content-secondary" align="center">
        Crie caixinhas em dólar, real ou euro. Cada uma rende automaticamente com seguro incluso.
      </Text>
    </Stack>
  )
}
