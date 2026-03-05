import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import LoadingScreen from '../../library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Conectando ao Apple Pay...', progress: 30 },
  { title: 'Adicionando cartão', progress: 70 },
  { title: 'Pronto!', progress: 100 },
]

export default function Screen14_ApplePayProcessing({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen steps={STEPS} autoAdvance autoAdvanceInterval={1200} onComplete={onNext} />
  )
}
