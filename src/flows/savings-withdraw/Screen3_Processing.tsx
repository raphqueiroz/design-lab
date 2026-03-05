import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import LoadingScreen from '../../library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Processando resgate...', progress: 20 },
  { title: 'Transferindo para o cartão', progress: 55 },
  { title: 'Confirmando transação', progress: 85 },
  { title: 'Pronto!', progress: 100 },
]

export default function Screen3_Processing({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen
      steps={STEPS}
      autoAdvance
      autoAdvanceInterval={1200}
      onComplete={onNext}
    />
  )
}
