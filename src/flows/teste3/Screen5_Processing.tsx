/**
 * @screen Processing
 * @description Animated loading state while investment is being processed
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import LoadingScreen from '@/library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Processando investimento...', progress: 25 },
  { title: 'Verificando saldo', progress: 50 },
  { title: 'Alocando no protocolo', progress: 80 },
  { title: 'Pronto!', progress: 100 },
]

export default function Screen({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen
      steps={STEPS}
      autoAdvance
      autoAdvanceInterval={1200}
      onComplete={onNext}
    />
  )
}
