/**
 * @screen Error State
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeedbackLayout from '@/library/layout/FeedbackLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'

export default function Screen({ onNext, onBack, screenTitle, screenDescription }: FlowScreenProps) {
  return (
    <FeedbackLayout animation={null} onClose={onBack}>
      <Stack>
        <Text variant="heading-lg">{screenTitle ?? 'Error'}</Text>
        <Text variant="body-md" color="content-secondary">
          {screenDescription ?? 'Something went wrong. Please try again.'}
        </Text>
      </Stack>
      <StickyFooter>
        <Button variant="accent" size="lg" onPress={onNext} fullWidth>
          Tentar novamente
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
