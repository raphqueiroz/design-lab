/**
 * Screen5_Processing — Buy order processing with LoadingScreen.
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import LoadingScreen from '@/library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Verificando saldo...', progress: 20 },
  { title: 'Processando ordem de compra', progress: 50 },
  { title: 'Executando operação', progress: 80 },
  { title: 'Pronto!', progress: 100 },
]

export default function Screen5_Processing({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen steps={STEPS} autoAdvance autoAdvanceInterval={1500} onComplete={onNext} />
  )
}
