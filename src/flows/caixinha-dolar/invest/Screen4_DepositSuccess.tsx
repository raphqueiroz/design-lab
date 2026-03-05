import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../../library/layout/FeedbackLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import Text from '../../../library/foundations/Text'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import GroupHeader from '../../../library/navigation/GroupHeader'

export default function Screen4_DepositSuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Seus dólares estão rendendo!</Text>
        <Text variant="body-md" color="content-secondary">
          Seu depósito já está rendendo 5% ao ano. Os juros são calculados diariamente e adicionados ao seu saldo automaticamente.
        </Text>
      </Stack>

      <Banner
        variant="success"
        title="Rendimento estimado: ~US$ 62,18 por ano"
        description="Baseado no seu saldo atual de US$ 1.243,57"
      />

      <Stack gap="none">
        <GroupHeader text="Resumo do depósito" />
        <DataList
          data={[
            { label: 'Depositado', value: 'US$ 500,00' },
            { label: 'Rendimento', value: '5,00% a.a.' },
            { label: 'Rendimento mensal (est.)', value: 'US$ 5,18' },
            { label: 'Próximo crédito', value: 'Amanhã' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth onPress={onBack}>
            Ver meus rendimentos
          </Button>
          <Button fullWidth variant="ghost" onPress={onBack}>
            Voltar ao início
          </Button>
        </Stack>
      </StickyFooter>
    </FeedbackLayout>
  )
}
