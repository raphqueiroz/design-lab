import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'

export default function Screen({ onNext, onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="New Screen" onBack={onBack} />
      <Stack>
        <Text variant="body-md">TODO: build this screen</Text>
      </Stack>
      <StickyFooter>
        <Button variant="accent" size="lg" onPress={onNext} fullWidth>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
