import { useMemo } from 'react'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Header from '../../library/navigation/Header'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import Amount from '../../library/display/Amount'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import LineChart from '../../library/display/LineChart'
import ShortcutButton from '../../library/inputs/ShortcutButton'

import {
  MOCK_BALANCE,
  YIELD_TODAY,
  YIELD_MONTH,
  GROSS_APY,
  INSURANCE_COST,
  NET_APY,
  TAX_DESCRIPTION,
  formatPct,
  formatUsd,
  generateYieldChartData,
} from '../yields2/shared/data'

export default function Screen3_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const chartData = useMemo(() => generateYieldChartData(30), [])

  return (
    <BaseLayout>
      <Header title="Renda Protegida" onBack={onBack} />

      <Stack gap="default">
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

        <LineChart data={chartData} height={160} variant="area" />

        <DataList
          data={[
            { label: 'Rendimento bruto', value: `${formatPct(GROSS_APY)} a.a.` },
            { label: 'Custo do seguro', value: `-${formatPct(INSURANCE_COST)} a.a.` },
            { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
            { label: 'Rendimento diário', value: formatUsd(YIELD_TODAY) },
            { label: 'Rendimento mensal', value: formatUsd(YIELD_MONTH) },
          ]}
        />

        <Banner
          variant="neutral"
          collapsable
          title="Informações fiscais"
          description={TAX_DESCRIPTION}
        />
      </Stack>
    </BaseLayout>
  )
}
