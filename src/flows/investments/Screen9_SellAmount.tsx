import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { BRL_FLAG } from '@/lib/flags'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import Text from '@/library/foundations/Text'

export default function Screen9_SellAmount({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [value, setValue] = useState('')

  const amount = parseInt(value || '0', 10) / 100
  const isValid = amount >= 10

  return (
    <BaseLayout>
      <Header title="Quanto quer vender?" onBack={onBack} />

      <CurrencyInput
        value={value}
        onChange={setValue}
        currencySymbol="R$"
        tokenIcon={BRL_FLAG}
        balance="R$ 4.802,50"
        helperText="Saldo disponível em BTC"
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
