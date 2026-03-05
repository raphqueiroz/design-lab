import { useState, useCallback } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import DataList from '../../library/display/DataList'

const BALANCE_RAW = 125000 // US$ 1,250.00 in cents
const BALANCE_DISPLAY = 'US$ 1.250,00'

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [amount, setAmount] = useState('')
  const [balanceError, setBalanceError] = useState(false)

  const cents = parseInt(amount || '0', 10)
  const isValid = cents >= 100 && cents <= BALANCE_RAW // min US$ 1.00
  const isOverBalance = cents > BALANCE_RAW

  const handleBalanceTap = useCallback(() => {
    setAmount(BALANCE_RAW.toString())
    setBalanceError(false)
  }, [])

  const handleChange = useCallback((value: string) => {
    setAmount(value)
    const v = parseInt(value || '0', 10)
    setBalanceError(v > BALANCE_RAW)
  }, [])

  return (
    <BaseLayout>
      <Header title="Resgatar" onClose={onBack} />

      <Stack gap="default">
        <CurrencyInput
          currencySymbol="US$"
          value={amount}
          onChange={handleChange}
          balance={BALANCE_DISPLAY}
          onBalanceTap={handleBalanceTap}
          balanceError={isOverBalance || balanceError}
        />

        <DataList
          data={[
            { label: 'Destino', value: 'Saldo do Cartão' },
            { label: 'Taxa', value: 'Grátis' },
            { label: 'Prazo', value: 'Instantâneo' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button
          fullWidth
          disabled={!isValid}
          onPress={() => {
            const handled = onElementTap?.('Button: Continuar')
            if (!handled) onNext()
          }}
        >
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
