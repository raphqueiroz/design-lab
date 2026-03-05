import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen7_LimitsSuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Limites atualizados!</Text>
        <Text variant="body-md" color="content-secondary">
          Seus novos limites já estão ativos.
        </Text>
      </Stack>
      <Stack gap="none">
        <GroupHeader text="Novos limites" />
        <DataList
          data={[
            { label: 'Limite de compras', value: 'R$ 10.000,00' },
          ]}
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={onBack}>Voltar</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
