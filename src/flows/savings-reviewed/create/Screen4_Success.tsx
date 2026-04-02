import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../../library/layout/FeedbackLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import Text from '../../../library/foundations/Text'

export default function Screen4_Success({ onBack, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Caixinha criada!</Text>
        <Text variant="body-md" color="content-secondary">
          Sua caixinha "Viagem Europa" está pronta. Adicione fundos para começar a render.
        </Text>
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth onPress={() => {
            const handled = onElementTap?.('Button: Adicionar fundos')
            if (!handled) onBack()
          }}>
            Adicionar fundos
          </Button>
          <Button fullWidth variant="primary" onPress={() => {
            const handled = onElementTap?.('Button: Ver caixinhas')
            if (!handled) onBack()
          }}>
            Ver caixinhas
          </Button>
        </Stack>
      </StickyFooter>
    </FeedbackLayout>
  )
}
