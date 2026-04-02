import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import DataList from '../../library/display/DataList'

import { MOCK_BALANCE, USD_ICON, WITHDRAW_QUICK_PICKS, rawDigitsFromAmount, TAX_DESCRIPTION } from '../yields2/shared/data'

export default function Screen8_WithdrawAmount({ onNext, onBack }: FlowScreenProps) {
  const [value, setValue] = useState(rawDigitsFromAmount(MOCK_BALANCE))
  const amount = parseInt(value || '0', 10) / 100
  const isValid = amount >= 1 && amount <= MOCK_BALANCE

  return (
    <BaseLayout>
      <Header title="Resgatar" onBack={onBack} />
      <Stack gap="default">
        <CurrencyInput label="Valor do resgate" value={value} onChange={setValue} tokenIcon={USD_ICON} currencySymbol="US$" />
        <Stack direction="row" gap="sm">
          {WITHDRAW_QUICK_PICKS.map((pick) => (
            <Button key={pick.label} variant="primary" size="sm" onPress={() => setValue(rawDigitsFromAmount(MOCK_BALANCE * pick.pct))}>
              {pick.label}
            </Button>
          ))}
          <Button variant="primary" size="sm" onPress={() => setValue('')}>Outro</Button>
        </Stack>
        <DataList
          data={[
            { label: 'Destino', value: 'Saldo USD' },
            { label: 'Disponibilidade', value: 'Imediata' },
            { label: 'Impostos', value: TAX_DESCRIPTION },
          ]}
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={onNext}>Continuar</Button>
      </StickyFooter>
    </BaseLayout>
  )
}
