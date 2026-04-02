/**
 * @screen Second
 * @description Another page
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'

export default function Screen({ onNext, onBack, screenTitle, screenDescription }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title={screenTitle ?? 'New Screen'} onBack={onBack} />
      <Stack>
        {screenDescription ? (
          <Text variant="body-md">{screenDescription}</Text>
        ) : (
          <Text variant="body-md" color="content-tertiary">No description yet. Edit this screen or update the description in the flow canvas sidebar.</Text>
        )}
      </Stack>
      <StickyFooter>
        <Button variant="accent" size="lg" onPress={onNext} fullWidth>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
