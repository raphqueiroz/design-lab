import type { FlowScreenProps } from '../pages/simulator/flowRegistry'
import ScreenLayout from '../library/layout/ScreenLayout'
import Header from '../library/navigation/Header'
import EmptyState from '../library/feedback/EmptyState'
import Button from '../library/inputs/Button'
import { Monitor } from 'lucide-react'

interface PlaceholderScreenProps extends FlowScreenProps {
  screenTitle: string
  screenDescription: string
}

export default function PlaceholderScreen({
  screenTitle,
  screenDescription,
  onNext,
  onBack,
}: PlaceholderScreenProps) {
  return (
    <ScreenLayout
      header={<Header title={screenTitle} onBack={onBack} />}
      bottomCTA={
        <Button variant="primary" size="lg" onPress={onNext} fullWidth>Next</Button>
      }
    >
      <div className="flex-1 flex items-center justify-center px-[var(--token-spacing-md)]">
        <EmptyState
          icon={<Monitor size={32} className="text-interactive-foreground" />}
          title={screenTitle}
          description={screenDescription || 'This screen is a placeholder. Build the actual screen component to replace it.'}
        />
      </div>
    </ScreenLayout>
  )
}

/**
 * Creates a bound PlaceholderScreen component for a specific screen's metadata.
 * This is used by the dynamic flow system to create screen components on the fly.
 */
export function createPlaceholderComponent(title: string, description: string) {
  return function BoundPlaceholderScreen(props: FlowScreenProps) {
    return (
      <PlaceholderScreen
        {...props}
        screenTitle={title}
        screenDescription={description}
      />
    )
  }
}
