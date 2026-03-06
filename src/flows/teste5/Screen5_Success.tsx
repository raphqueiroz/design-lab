/**
 * @screen Success
 * @description Account created confirmation with success animation
 */
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'

export default function Screen5_Success({ onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout>
      <Stack gap="sm">
        <Text variant="display" align="center">Conta criada!</Text>
        <Text variant="body-md" color="content-secondary" align="center">
          Sua conta foi criada com sucesso. Agora você pode explorar tudo o que a Picnic tem para oferecer.
        </Text>
      </Stack>

      <StickyFooter>
        <Button
          variant="primary"
          fullWidth
          onPress={() => {
            const handled = onElementTap?.('Button: Ir para o início')
            if (!handled) onNext()
          }}
        >
          Ir para o início
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
