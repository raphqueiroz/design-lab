import { useState, useMemo } from 'react'
import { RiInformationLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import Card from '../../library/display/Card'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Button from '../../library/inputs/Button'
import Link from '../../library/foundations/Link'

const MOCK_RATE = 5.12

export default function Screen4_Conversion({ onNext, onBack }: FlowScreenProps) {
  const [value, setValue] = useState('25089')

  const brlAmount = parseInt(value || '0', 10) / 100
  const usdAmount = useMemo(() => brlAmount / MOCK_RATE, [brlAmount])
  const isValid = brlAmount >= 10

  return (
    <BaseLayout>
      <Header title="Converter" onBack={onBack} />
      <Stack>
        <CurrencyInput
          label="Valor em BRL"
          value={value}
          onChange={setValue}
          currencySymbol="R$"
          helperText="Mín R$ 10,00 · Máx R$ 100.000,00"
        />

        {isValid && (
          <Card variant="flat">
            <Stack gap="sm">
              <Text variant="body-sm" color="content-secondary">
                Você receberá aproximadamente
              </Text>
              <Amount value={usdAmount} currency="$" size="lg" />
              <Text variant="caption" color="content-tertiary">
                Câmbio: 1 USD = {MOCK_RATE.toFixed(2)} BRL
              </Text>
            </Stack>
          </Card>
        )}

        <Link
          linkText="Como calculamos sua economia"
          leadingIcon={<RiInformationLine size={14} className="text-interactive-foreground" />}
          onLinkPress={onNext}
        />

        <Text variant="caption" color="content-tertiary" align="center">
          Consultar os Termos de Serviço
        </Text>
      </Stack>

      <StickyFooter>
        <Button fullWidth size="lg" disabled={!isValid} onPress={onNext}>
          Converter agora
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
