import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import LoadingScreen from '../../library/feedback/LoadingScreen'

const STEPS = [
  { title: 'Criando seu cartão...', progress: 30 },
  { title: 'Configurando limites', progress: 65 },
  { title: 'Pronto!', progress: 100 },
]

export default function Screen4_CreateVirtualProcessing({ onNext }: FlowScreenProps) {
  return (
    <LoadingScreen steps={STEPS} autoAdvance autoAdvanceInterval={1200} onComplete={onNext} />
  )
}
