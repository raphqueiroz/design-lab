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

export default function Screen2_DepositReview({ onNext, onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Confirmar depósito" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Text variant="body-sm" color="content-secondary">Você está depositando</Text>
          <Amount value={500} currency="US$" size="display" />
          <Text variant="body-sm" color="content-secondary">na Caixinha do Dólar a 5% a.a.</Text>
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Detalhes do depósito" />
          <DataList
            data={[
              { label: 'De', value: 'Saldo USD' },
              { label: 'Para', value: 'Caixinha do Dólar (5% a.a.)' },
              { label: 'Valor', value: 'US$ 500,00' },
              { label: 'Taxa', value: 'Grátis' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Projeção de rendimento" />
          <DataList
            data={[
              { label: 'Mensal (est.)', value: 'US$ 2,08' },
              { label: 'Anual (est.)', value: 'US$ 25,00' },
              { label: 'Acúmulo', value: 'Diário' },
            ]}
          />
        </Stack>

        <Banner
          variant="neutral"
          title="Sem prazo mínimo"
          description="Você pode resgatar a qualquer momento. Seu saldo e rendimentos estão sempre disponíveis."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Confirmar depósito
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
