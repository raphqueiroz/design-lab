import { useState, useMemo } from 'react'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Header from '../../library/navigation/Header'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Badge from '../../library/display/Badge'
import Banner from '../../library/display/Banner'
import DataList from '../../library/display/DataList'
import ShortcutButton from '../../library/inputs/ShortcutButton'

import { CoverageBottomSheet } from './Screen1_Hub.parts'
import {
  MOCK_BALANCE,
  YIELD_TODAY,
  YIELD_MONTH,
  NET_APY,
  formatPct,
  formatUsd,
  generateYieldChartData,
} from '../yields2/shared/data'

export default function Screen1_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [coverageOpen, setCoverageOpen] = useState(false)
  const _chartData = useMemo(() => generateYieldChartData(30), [])

  return (
    <BaseLayout>
      <Header title="Renda Protegida" onBack={onBack} />

      <Stack gap="default">
        {/* Balance Hero (inline — no parts import from yields2) */}
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

          <Amount value={MOCK_BALANCE} currency="US$" size="lg" className="text-white" />

          <Text variant="caption" className="text-[var(--color-feedback-success)]">
            +US$ {YIELD_TODAY.toFixed(2).replace('.', ',')} hoje
          </Text>
        </div>

        <Stack direction="row" gap="lg" align="center" className="justify-center">
          <ShortcutButton
            icon={<RiArrowDownLine size={20} />}
            label="Depositar"
            variant="primary"
            onPress={() => {
              const resolved = onElementTap?.('ShortcutButton: Depositar')
              if (!resolved) onNext()
            }}
          />
          <ShortcutButton
            icon={<RiArrowUpLine size={20} />}
            label="Resgatar"
            variant="secondary"
            onPress={() => {
              const resolved = onElementTap?.('ShortcutButton: Resgatar')
              if (!resolved) onNext()
            }}
          />
        </Stack>

        <Banner
          variant="success"
          collapsable
          title="Seus fundos são segurados"
          linkText="Saiba mais"
          onLinkPress={() => setCoverageOpen(true)}
        />

        <DataList
          data={[
            { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
            { label: 'Rendimento diário', value: formatUsd(YIELD_TODAY) },
            { label: 'Rendimento mensal', value: formatUsd(YIELD_MONTH) },
          ]}
        />
      </Stack>

      <CoverageBottomSheet open={coverageOpen} onClose={() => setCoverageOpen(false)} />
    </BaseLayout>
  )
}
