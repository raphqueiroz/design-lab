import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen9_RenameSuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Nome atualizado!</Text>
        <Text variant="body-md" color="content-secondary">
          Seu cartão agora se chama "Compras Online".
        </Text>
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={onBack}>Voltar</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
