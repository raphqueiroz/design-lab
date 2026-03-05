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

import { MOCK_BALANCE, TAX_DESCRIPTION } from '../yields2/shared/data'

export default function Screen9_WithdrawReview({ onNext, onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Confirmar resgate" onBack={onBack} />
      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Text variant="body-sm" color="content-secondary">Você está resgatando</Text>
          <Amount value={MOCK_BALANCE} currency="US$" size="display" />
        </Stack>
        <Stack gap="none">
          <GroupHeader text="Detalhes do resgate" />
          <DataList
            data={[
              { label: 'De', value: 'Renda Protegida (sDAI)' },
              { label: 'Para', value: 'Saldo USD' },
              { label: 'Valor', value: 'US$ 2.150,00' },
              { label: 'Disponibilidade', value: 'Imediata' },
            ]}
          />
        </Stack>
        <Stack gap="none">
          <GroupHeader text="Impostos" />
          <DataList
            data={[
              { label: 'Ganho de capital', value: 'US$ 89,24' },
              { label: 'Alíquota IR', value: '15%' },
              { label: 'IR estimado', value: 'US$ 13,39' },
              { label: 'Valor líquido', value: 'US$ 2.136,61' },
            ]}
          />
        </Stack>
        <Banner variant="neutral" title="Informações fiscais" description={TAX_DESCRIPTION} />
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={onNext}>Confirmar resgate</Button>
      </StickyFooter>
    </BaseLayout>
  )
}
