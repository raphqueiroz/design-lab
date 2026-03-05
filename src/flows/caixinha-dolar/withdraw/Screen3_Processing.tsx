import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import LoadingScreen from '../../../library/feedback/LoadingScreen'

import { WITHDRAW_PROCESSING_STEPS } from '../shared/data'

export default function Screen3_Processing({ onNext }: FlowScreenProps) {
  return <LoadingScreen steps={WITHDRAW_PROCESSING_STEPS} autoAdvance autoAdvanceInterval={1200} onComplete={onNext} />
}
