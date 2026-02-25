import { useState, useMemo } from 'react'
import { Info } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import FormLayout from '../../library/layout/FormLayout'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import Card from '../../library/display/Card'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Button from '../../library/inputs/Button'

const MOCK_RATE = 5.12

export default function Screen4_Conversion({ onNext, onBack }: FlowScreenProps) {
  const [value, setValue] = useState('25089')

  const brlAmount = parseInt(value || '0', 10) / 100
  const usdAmount = useMemo(() => brlAmount / MOCK_RATE, [brlAmount])
  const isValid = brlAmount >= 10

  return (
    <FormLayout
      header={<Header title="Converter" onBack={onBack} />}
      submitButton={
        <Button fullWidth size="lg" disabled={!isValid} onPress={onNext}>
          Converter agora
        </Button>
      }
    >
      <CurrencyInput
        label="Valor em BRL"
        value={value}
        onChange={setValue}
        helperText="Mín R$ 10,00 · Máx R$ 100.000,00"
      />

      {isValid && (
        <Card variant="outlined">
          <Text variant="body-sm" color="text-secondary">
            Você receberá aproximadamente
          </Text>
          <div className="mt-[var(--token-spacing-2)]">
            <Amount value={usdAmount} currency="$" size="lg" />
          </div>
          <div className="flex items-center gap-[var(--token-spacing-1)] mt-[var(--token-spacing-2)]">
            <Text variant="caption" color="text-tertiary">
              Câmbio: 1 USD = {MOCK_RATE.toFixed(2)} BRL
            </Text>
          </div>
        </Card>
      )}

      <button
        type="button"
        className="flex items-center gap-[var(--token-spacing-2)] cursor-pointer"
        onClick={onNext}
      >
        <Info size={14} className="text-interactive-foreground" />
        <Text variant="body-sm" className="text-interactive-foreground">
          Como calculamos sua economia
        </Text>
      </button>

      <Text variant="caption" color="text-tertiary" align="center">
        Consultar os Termos de Serviço
      </Text>
    </FormLayout>
  )
}
