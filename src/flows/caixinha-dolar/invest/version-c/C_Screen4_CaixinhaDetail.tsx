import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../../pages/simulator/flowRegistry'
import Header from '../../../../library/navigation/Header'
import BaseLayout from '../../../../library/layout/BaseLayout'
import Stack from '../../../../library/layout/Stack'
import ShortcutButton from '../../../../library/inputs/ShortcutButton'
import Amount from '../../../../library/display/Amount'
import Badge from '../../../../library/display/Badge'
import DataList from '../../../../library/display/DataList'
import Banner from '../../../../library/display/Banner'
import ProgressBar from '../../../../library/display/ProgressBar'
import LineChart from '../../../../library/display/LineChart'
import Text from '../../../../library/foundations/Text'

import { MOCK_CAIXINHAS, generateYieldChartData, formatUsd, TAX_DESCRIPTION } from '../../shared/data'

const caixinha = MOCK_CAIXINHAS[0] // "Viagem Europa"
const chartData = generateYieldChartData(30)
const progress = Math.min(caixinha.balance / caixinha.target, 1)

export default function C_Screen4_CaixinhaDetail({ onNext, onBack, onElementTap }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title={caixinha.name} onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm" align="center">
          <span style={{ fontSize: 40 }}>{caixinha.emoji}</span>
          <Badge variant="lime" size="sm">5% a.a.</Badge>
          <Amount value={caixinha.balance} currency="US$" size="lg" />
          <Text variant="caption" className="text-[#22c55e]">
            +{formatUsd(caixinha.yieldToday)} hoje
          </Text>
        </Stack>

        <Stack gap="sm">
          <ProgressBar value={progress * 100} />
          <Stack direction="row" align="between">
            <Text variant="body-sm" color="content-secondary">Meta: {formatUsd(caixinha.target)}</Text>
            <Text variant="body-sm" color="content-secondary">Faltam {formatUsd(caixinha.target - caixinha.balance)}</Text>
          </Stack>
        </Stack>

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

        <Stack gap="sm">
          <Text variant="caption" color="content-secondary">Rendimento (últimos 30 dias)</Text>
          <LineChart data={chartData} variant="area" height={140} />
        </Stack>

        <DataList
          data={[
            { label: 'Rendimento anual', value: '5,00% a.a.' },
            { label: 'Rendimento hoje', value: formatUsd(caixinha.yieldToday) },
            { label: 'Rendimento total', value: formatUsd(caixinha.balance * 0.05 * (120 / 365)) },
            { label: 'Resgate', value: 'Imediato' },
          ]}
        />

        <Banner
          variant="neutral"
          title="Informações fiscais"
          description={TAX_DESCRIPTION}
          collapsable
          defaultExpanded={false}
        />
      </Stack>
    </BaseLayout>
  )
}
