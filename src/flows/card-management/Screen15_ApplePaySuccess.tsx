import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen15_ApplePaySuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Adicionado ao Apple Pay!</Text>
        <Text variant="body-md" color="content-secondary">
          Seu cartão já está disponível na carteira do seu iPhone para pagamentos por aproximação.
        </Text>
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={onBack}>Entendi</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
