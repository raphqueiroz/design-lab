import type { FlowScreenProps } from '../../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../../lib/ScreenDataContext'
import Header from '../../../../library/navigation/Header'
import BaseLayout from '../../../../library/layout/BaseLayout'
import StickyFooter from '../../../../library/layout/StickyFooter'
import Stack from '../../../../library/layout/Stack'
import Button from '../../../../library/inputs/Button'
import DataList from '../../../../library/display/DataList'
import Banner from '../../../../library/display/Banner'
import LineChart from '../../../../library/display/LineChart'
import Text from '../../../../library/foundations/Text'

import { BalanceHero, HubActions } from './A_Screen1_Hub.parts'
import {
  MOCK_BALANCE, YIELD_TODAY, TAX_DESCRIPTION,
  generateYieldChartData, formatUsd,
} from '../../shared/data'

const chartData = generateYieldChartData(30)

export default function A_Screen1_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()

  if (isNewUser) {
    return (
      <BaseLayout>
        <Header title="Investir" onBack={onBack} />

        <Stack gap="default">
          <Banner
            variant="success"
            title="Ganhe 5% ao ano sobre seus dólares"
            description="Deposite qualquer valor e comece a render. Sem prazo mínimo, resgate quando quiser."
          />

          <DataList
            data={[
              { label: 'Rendimento anual', value: '5,00% a.a.' },
              { label: 'Depósito mínimo', value: 'US$ 1,00' },
              { label: 'Prazo mínimo', value: 'Nenhum' },
              { label: 'Resgate', value: 'Imediato' },
            ]}
          />

          <Banner
            variant="neutral"
            title="Seus fundos são protegidos"
            description="Depósitos são mantidos por nosso parceiro regulado e lastreados em títulos do Tesouro americano."
          />
        </Stack>

        <StickyFooter>
          <Button fullWidth onPress={onNext}>
            Começar
          </Button>
        </StickyFooter>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <Header title="Caixinha do Dólar" onBack={onBack} />

      <Stack gap="default">
        <BalanceHero balance={MOCK_BALANCE} yieldToday={YIELD_TODAY} />

        <HubActions
          onDeposit={onNext}
          onWithdraw={onNext}
          onElementTap={onElementTap}
        />

        <Stack gap="sm">
          <Text variant="caption" color="content-secondary">Rendimento (últimos 30 dias)</Text>
          <LineChart data={chartData} variant="area" height={140} />
        </Stack>

        <DataList
          data={[
            { label: 'Rendimento anual', value: '5,00% a.a.' },
            { label: 'Rendimento diário (est.)', value: formatUsd(MOCK_BALANCE * 0.05 / 365) },
            { label: 'Rendimento mensal (est.)', value: formatUsd(MOCK_BALANCE * 0.05 / 12) },
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
