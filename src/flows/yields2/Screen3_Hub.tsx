import { useMemo } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import BaseLayout from '../../library/layout/BaseLayout'
import Header from '../../library/navigation/Header'
import Stack from '../../library/layout/Stack'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import LineChart from '../../library/display/LineChart'

import { BalanceHero, HubActions } from './Screen3_Hub.parts'
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
} from './shared/data'

export default function Screen3_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()
  const chartData = useMemo(() => generateYieldChartData(30), [])

  const balance = isNewUser ? 0 : MOCK_BALANCE
  const yieldToday = isNewUser ? 0 : YIELD_TODAY

  return (
    <BaseLayout>
      <Header title="Renda Protegida" onBack={onBack} />

      <Stack gap="default">
        <BalanceHero balance={balance} yieldToday={yieldToday} />

        <HubActions
          onDeposit={onNext}
          onWithdraw={onNext}
          onElementTap={onElementTap}
        />

        {!isNewUser && (
          <>
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
          </>
        )}
      </Stack>
    </BaseLayout>
  )
}
