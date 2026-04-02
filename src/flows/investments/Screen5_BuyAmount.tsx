import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { BRL_FLAG } from '@/lib/flags'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import Text from '@/library/foundations/Text'

const PAYMENT_METHODS = ['Saldo', 'Pix']

export default function Screen5_BuyAmount({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [value, setValue] = useState('')
  const [methodIndex, setMethodIndex] = useState(0)

  const amount = parseInt(value || '0', 10) / 100
  const isValid = amount >= 10

  return (
    <BaseLayout>
      <Header title="Quanto quer investir?" onBack={onBack} />

      <SegmentedControl
        segments={PAYMENT_METHODS}
        activeIndex={methodIndex}
        onChange={setMethodIndex}
      />

      <CurrencyInput
        value={value}
        onChange={setValue}
        currencySymbol="R$"
        tokenIcon={BRL_FLAG}
        balance={methodIndex === 0 ? 'R$ 12.450,00' : undefined}
        helperText={methodIndex === 1 ? 'Via Pix' : undefined}
      />

      {amount > 0 && amount < 10 && (
        <Text variant="body-sm" className="text-[var(--color-feedback-error)]">
          Valor mínimo: R$ 10,00
        </Text>
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={() => {
          const handled = onElementTap?.('Button: Continuar')
          if (!handled) onNext()
        }}>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
