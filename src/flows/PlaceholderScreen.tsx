import type { FlowScreenProps } from '../pages/simulator/flowRegistry'
import BaseLayout from '../library/layout/BaseLayout'
import StickyFooter from '../library/layout/StickyFooter'
import Header from '../library/navigation/Header'
import EmptyState from '../library/feedback/EmptyState'
import Button from '../library/inputs/Button'
import { RiComputerLine } from '@remixicon/react'

interface PlaceholderScreenProps extends FlowScreenProps {
  screenTitle: string
  screenDescription: string
}

export default function PlaceholderScreen({
  screenTitle,
  screenDescription,
  onNext,
  onBack,
  overlays,
  onOpenOverlay,
}: PlaceholderScreenProps) {
  return (
    <BaseLayout>
      <Header title={screenTitle} onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center gap-[var(--token-spacing-md)]">
        <EmptyState
          icon={<RiComputerLine size={32} className="text-interactive-foreground" />}
          title={screenTitle}
          description={screenDescription || 'This screen is a placeholder. Build the actual screen component to replace it.'}
        />
        {overlays && overlays.length > 0 && (
          <div className="flex flex-col gap-[var(--token-spacing-2)] w-full px-[var(--token-spacing-md)]">
            {overlays.map((overlay) => (
              <Button
                key={overlay.nodeId}
                variant="primary"
                size="md"
                onPress={() => onOpenOverlay?.(overlay.nodeId)}
                fullWidth
              >
                {overlay.triggerLabel ?? overlay.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      <StickyFooter>
        <Button variant="accent" size="lg" onPress={onNext} fullWidth>Next</Button>
      </StickyFooter>
    </BaseLayout>
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
