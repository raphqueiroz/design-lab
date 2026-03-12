import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import DataList from '../../library/display/DataList'
import Text from '../../library/foundations/Text'
export default function Screen4_Success({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Resgate concluído</Text>
        <Text variant="body-md" color="content-secondary">
          O valor foi creditado no saldo do seu cartão.
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Detalhes do resgate" />
        <DataList
          data={[
            { label: 'Valor resgatado', value: 'US$ 100,00' },
            { label: 'Destino', value: 'Saldo do Cartão' },
            { label: 'Taxa', value: 'Grátis' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onBack}>
          Concluir
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
