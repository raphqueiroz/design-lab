import { useState, useMemo } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import FormLayout from '../../library/layout/FormLayout'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import Card from '../../library/display/Card'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Button from '../../library/inputs/Button'

const MOCK_RATE = 5.12

export default function Screen2_PixDeposit({ onNext, onBack }: FlowScreenProps) {
  const [value, setValue] = useState('')

  const brlAmount = parseInt(value || '0', 10) / 100
  const usdAmount = useMemo(() => brlAmount / MOCK_RATE, [brlAmount])
  const isValid = brlAmount >= 10
  const error = value && brlAmount > 0 && brlAmount < 10 ? 'Minimum deposit is R$ 10.00' : undefined

  return (
    <FormLayout
      header={<Header title="PIX Deposit" onBack={onBack} />}
      submitButton={
        <Button fullWidth disabled={!isValid} onPress={onNext}>
          Continue
        </Button>
      }
    >
      <CurrencyInput
        label="Amount in BRL"
        value={value}
        onChange={setValue}
        error={error}
        helperText="Min R$ 10.00 · Max R$ 100,000.00"
      />

      {isValid && (
        <Card variant="outlined">
          <Text variant="body-sm" color="text-secondary">
            You'll receive approximately
          </Text>
          <div className="mt-[var(--token-spacing-2)]">
            <Amount value={usdAmount} currency="$" size="lg" />
          </div>
          <Text variant="caption" color="text-tertiary" className="mt-[var(--token-spacing-2)]">
            Rate: 1 USD = {MOCK_RATE.toFixed(2)} BRL
          </Text>
        </Card>
      )}
    </FormLayout>
  )
}
