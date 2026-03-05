import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import Text from '../../../library/foundations/Text'
import Amount from '../../../library/display/Amount'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import GroupHeader from '../../../library/navigation/GroupHeader'

import { MOCK_BALANCE, TAX_DESCRIPTION } from '../shared/data'

export default function Screen2_WithdrawReview({ onNext, onBack }: FlowScreenProps) {
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
              { label: 'De', value: 'Caixinha do Dólar' },
              { label: 'Para', value: 'Saldo USD' },
              { label: 'Valor', value: 'US$ 1.243,57' },
              { label: 'Disponibilidade', value: 'Imediata' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Impostos" />
          <DataList
            data={[
              { label: 'Ganho de capital', value: 'US$ 43,57' },
              { label: 'Alíquota IR', value: '15%' },
              { label: 'IR estimado', value: 'US$ 6,54' },
            ]}
          />
        </Stack>

        <Banner
          variant="neutral"
          title="Informações fiscais"
          description={TAX_DESCRIPTION}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Confirmar resgate
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
