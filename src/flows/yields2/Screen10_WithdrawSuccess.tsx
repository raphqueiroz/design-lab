import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'
export default function Screen10_WithdrawSuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Resgate concluído!</Text>
        <Text variant="body-md" color="content-secondary">
          O valor foi transferido para seu saldo disponível e pode ser utilizado imediatamente.
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Dados do resgate" />
        <DataList
          data={[
            { label: 'Valor resgatado', value: 'US$ 2.150,00' },
            { label: 'Destino', value: 'Saldo USD' },
            { label: 'Disponibilidade', value: 'Imediata' },
            { label: 'IR retido', value: 'US$ 13,39' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onBack}>
          Entendi
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
