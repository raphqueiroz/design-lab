import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import LoadingScreen from '../../library/feedback/LoadingScreen'

type PaymentMethod = 'card-balance' | 'pix' | 'ach'

const STEPS_BY_METHOD: Record<PaymentMethod, { title: string; progress: number }[]> = {
  'card-balance': [
    { title: 'Verificando saldo do cartão...', progress: 25 },
    { title: 'Processando depósito', progress: 60 },
    { title: 'Confirmando transação', progress: 85 },
    { title: 'Pronto!', progress: 100 },
  ],
  pix: [
    { title: 'Reconhecemos seu pagamento...', progress: 20 },
    { title: 'Processando câmbio BRL → USD', progress: 45 },
    { title: 'Convertendo em dólar', progress: 75 },
    { title: 'Pronto!', progress: 100 },
  ],
  ach: [
    { title: 'Verificando transferência ACH...', progress: 25 },
    { title: 'Processando depósito', progress: 55 },
    { title: 'Confirmando com Noah', progress: 80 },
    { title: 'Pronto!', progress: 100 },
  ],
}

export default function Screen3_Processing({ onNext }: FlowScreenProps) {
  const { paymentMethod } = useScreenData<{ paymentMethod?: PaymentMethod }>()
  const steps = STEPS_BY_METHOD[paymentMethod ?? 'card-balance']

  return (
    <LoadingScreen steps={steps} autoAdvance autoAdvanceInterval={1500} onComplete={onNext} />
  )
}
