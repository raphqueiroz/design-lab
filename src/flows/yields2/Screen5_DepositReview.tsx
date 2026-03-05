import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'

import { GROSS_APY, INSURANCE_COST, NET_APY, COVERAGE_PERCENT, INSURANCE_PROVIDER, formatPct } from './shared/data'

export default function Screen5_DepositReview({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const depositAmount = 500
  const monthlyEst = depositAmount * NET_APY / 12
  const annualEst = depositAmount * NET_APY

  return (
    <BaseLayout>
      <Header title="Confirmar depósito" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Amount value={depositAmount} currency="US$" size="display" />
          <Text variant="body-sm" color="content-secondary">
            na Renda Protegida a ~{formatPct(NET_APY)} a.a.
          </Text>
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Detalhes" />
          <DataList
            data={[
              { label: 'De', value: 'Saldo USD' },
              { label: 'Para', value: 'Renda Protegida (sDAI)' },
              { label: 'Valor', value: 'US$ 500,00' },
              { label: 'Taxa', value: 'Grátis' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Rendimento e seguro" />
          <DataList
            data={[
              { label: 'Rendimento bruto', value: `${formatPct(GROSS_APY)} a.a.` },
              { label: 'Custo do seguro', value: `-${formatPct(INSURANCE_COST)} a.a.` },
              { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
              { label: 'Mensal (est.)', value: `US$ ${monthlyEst.toFixed(2).replace('.', ',')}` },
              { label: 'Anual (est.)', value: `US$ ${annualEst.toFixed(2).replace('.', ',')}` },
            ]}
          />
        </Stack>

        <Banner
          variant="neutral"
          title={`Protegido por seguro — ${COVERAGE_PERCENT}% via ${INSURANCE_PROVIDER}`}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Confirmar')
          if (!handled) onNext()
        }}>
          Confirmar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
