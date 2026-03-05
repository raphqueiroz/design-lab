import { useState, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import DataList from '../../../library/display/DataList'
import { DataListSkeleton } from '../../../library/feedback/Skeleton'
import { MOCK_RATE, USD_ICON, BRL_ICON, rawDigitsFromAmount } from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function A_Screen3_Amount({ onNext, onBack }: FlowScreenProps) {
  const [usdValue, setUsdValue] = useState('')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const isValid = usdAmount >= 1

  const brlDisplay = rawDigitsFromAmount(usdAmount * MOCK_RATE)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isValid, usdValue])

  return (
    <BaseLayout>
      <Header title="Valor do saque" onBack={onBack} />

      <CurrencyInput label="Você envia" value={usdValue} onChange={setUsdValue} tokenIcon={USD_ICON} currencySymbol="US$" />

      <CurrencyInput
        label="Destinatário recebe"
        value={brlDisplay}
        onChange={() => {}}
        tokenIcon={BRL_ICON}
        currencySymbol="R$"
        readOnly
      />

      {calcState === 'loading' && <DataListSkeleton rows={3} />}

      {calcState === 'ready' && (
        <DataList
          data={[
            { label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4).replace('.', ',')}` },
            { label: 'Taxa de saque', value: 'Grátis' },
            { label: 'Prazo estimado', value: '1-2 dias úteis' },
          ]}
        />
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={onNext}>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
