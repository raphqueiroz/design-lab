import { useEffect } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import ResultLayout from '../../library/layout/ResultLayout'
import LoadingSpinner from '../../library/feedback/LoadingSpinner'
import Text from '../../library/foundations/Text'
import Spacer from '../../library/foundations/Spacer'

export default function Screen4_Processing({ onNext }: FlowScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onNext, 2500)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <ResultLayout
      animation={<LoadingSpinner size="lg" />}
    >
      <Text variant="heading-md" align="center">
        Confirming your payment...
      </Text>
      <Spacer size="sm" />
      <Text variant="body-md" color="text-secondary" align="center">
        This usually takes a few seconds
      </Text>
    </ResultLayout>
  )
}
