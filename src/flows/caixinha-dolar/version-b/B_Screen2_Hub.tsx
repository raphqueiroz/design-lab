import { useState } from 'react'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import SegmentedControl from '../../../library/navigation/SegmentedControl'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Badge from '../../../library/display/Badge'
import Amount from '../../../library/display/Amount'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import LineChart from '../../../library/display/LineChart'
import Text from '../../../library/foundations/Text'

import { HistoryTab } from './B_Screen2_Hub.parts'
import {
  MOCK_BALANCE, YIELD_TODAY, YIELD_MONTH, TAX_DESCRIPTION,
  generateYieldChartData, formatUsd,
} from '../shared/data'

const chartData = generateYieldChartData(30)

export default function B_Screen2_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [tabIndex, setTabIndex] = useState(0)

  const handleDeposit = () => {
    const resolved = onElementTap?.('ShortcutButton: Depositar')
    if (!resolved) onNext()
  }

  const handleWithdraw = () => {
    const resolved = onElementTap?.('ShortcutButton: Resgatar')
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Caixinha do Dólar" onBack={onBack} />

      <Stack gap="default">
        {/* Balance section */}
        <Stack gap="sm" align="center">
          <Badge variant="lime" size="sm">5% a.a.</Badge>
          <Amount value={MOCK_BALANCE} currency="US$" size="lg" />
          <Text variant="caption" color="content-secondary">
            +US$ {YIELD_TODAY.toFixed(2).replace('.', ',')} hoje
          </Text>
        </Stack>

        {/* Quick actions */}
        <Stack direction="row" gap="lg" align="center" className="justify-center">
          <ShortcutButton
            icon={<RiArrowDownLine size={20} />}
            label="Depositar"
            variant="primary"
            onPress={handleDeposit}
          />
          <ShortcutButton
            icon={<RiArrowUpLine size={20} />}
            label="Resgatar"
            variant="secondary"
            onPress={handleWithdraw}
          />
        </Stack>

        {/* Tab control */}
        <SegmentedControl
          segments={['Resumo', 'Histórico']}
          activeIndex={tabIndex}
          onChange={setTabIndex}
        />

        {tabIndex === 0 ? (
          <Stack gap="default">
            {/* Chart */}
            <Stack gap="sm">
              <Text variant="caption" color="content-secondary">Rendimento (últimos 30 dias)</Text>
              <LineChart data={chartData} variant="area" height={140} />
            </Stack>

            {/* Metrics */}
            <DataList
              data={[
                { label: 'Rendimento anual', value: '5,00% a.a.' },
                { label: 'Rendimento hoje', value: formatUsd(YIELD_TODAY) },
                { label: 'Rendimento este mês', value: formatUsd(YIELD_MONTH) },
                { label: 'Rendimento diário (est.)', value: formatUsd(MOCK_BALANCE * 0.05 / 365) },
              ]}
            />

            {/* Tax Banner */}
            <Banner
              variant="neutral"
              title="Informações fiscais"
              description={TAX_DESCRIPTION}
              collapsable
              defaultExpanded={false}
            />

            {/* Trust Banner */}
            <Banner
              variant="neutral"
              title="Seus fundos são protegidos"
              description="Depósitos lastreados em títulos do Tesouro americano."
            />
          </Stack>
        ) : (
          <HistoryTab onElementTap={onElementTap} />
        )}
      </Stack>
    </BaseLayout>
  )
}
