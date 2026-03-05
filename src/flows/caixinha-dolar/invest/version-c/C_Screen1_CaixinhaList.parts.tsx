/**
 * Screen-only parts for the Caixinha List (Version C).
 */

import Stack from '../../../../library/layout/Stack'
import Text from '../../../../library/foundations/Text'
import Card from '../../../../library/display/Card'
import ProgressBar from '../../../../library/display/ProgressBar'

import { type CaixinhaGoal, formatUsd } from '../../shared/data'

/* ── CaixinhaListItem ── */

interface CaixinhaListItemProps {
  caixinha: CaixinhaGoal
  onPress: () => void
}

export function CaixinhaListItem({ caixinha, onPress }: CaixinhaListItemProps) {
  const progress = Math.min(caixinha.balance / caixinha.target, 1)
  const progressPct = Math.round(progress * 100)

  return (
    <Card variant="flat" onPress={onPress}>
      <Stack gap="sm">
        <Stack direction="row" gap="sm" align="center">
          <span style={{ fontSize: 24 }}>{caixinha.emoji}</span>
          <Stack gap="none" className="flex-1 min-w-0">
            <Text variant="body-md" className="font-semibold">{caixinha.name}</Text>
            <Text variant="caption" color="content-secondary">
              {formatUsd(caixinha.balance)} de {formatUsd(caixinha.target)}
            </Text>
          </Stack>
          <Stack gap="none" align="end">
            <Text variant="body-sm" className="font-semibold">{progressPct}%</Text>
            <Text variant="caption" className="text-[#22c55e]">
              +{formatUsd(caixinha.yieldToday)}
            </Text>
          </Stack>
        </Stack>
        <ProgressBar value={progress * 100} />
      </Stack>
    </Card>
  )
}
