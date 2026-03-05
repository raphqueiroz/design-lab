import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen11_RemoveSuccess({ onBack, onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Cartão removido</Text>
        <Text variant="body-md" color="content-secondary">
          O cartão virtual "Cartão Virtual" (•••• 7328) foi removido permanentemente.
        </Text>
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Ver meus cartões')
          if (!handled) onNext()
        }}>
          Ver meus cartões
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
