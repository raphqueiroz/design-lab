import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Badge from '../../library/display/Badge'
import DataList from '../../library/display/DataList'

import { NET_APY, formatPct } from '../yields2/shared/data'

export default function Screen3_DepositReview({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const depositAmount = 500
  const monthlyEst = depositAmount * NET_APY / 12

  return (
    <BaseLayout>
      <Header title="Confirmar depósito" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Amount value={depositAmount} currency="US$" size="display" />
          <Text variant="body-sm" color="content-secondary">
            na Renda Protegida a ~{formatPct(NET_APY)} a.a.
          </Text>
          <Badge variant="success" size="sm">Protegido por seguro</Badge>
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Detalhes" />
          <DataList
            data={[
              { label: 'De', value: 'Saldo USD' },
              { label: 'Para', value: 'Renda Protegida (sDAI)' },
              { label: 'Valor', value: 'US$ 500,00' },
              { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
              { label: 'Mensal (est.)', value: `US$ ${monthlyEst.toFixed(2).replace('.', ',')}` },
              { label: 'Taxa', value: 'Grátis' },
            ]}
          />
        </Stack>
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
