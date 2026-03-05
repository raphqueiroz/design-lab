import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import LoadingScreen from '../../../library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Processando depósito...', progress: 20 },
  { title: 'Alocando em sDAI', progress: 50 },
  { title: 'Ativando seguro', progress: 80 },
  { title: 'Pronto!', progress: 100 },
]

export default function SharedProcessing({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen
      steps={STEPS}
      autoAdvance
      autoAdvanceInterval={1500}
      onComplete={onNext}
    />
  )
}
