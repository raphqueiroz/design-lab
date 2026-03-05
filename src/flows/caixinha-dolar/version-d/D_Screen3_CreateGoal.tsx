import { useState } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import RadioGroup from '../../../library/inputs/RadioGroup'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import Text from '../../../library/foundations/Text'

import { USD_ICON, TIME_HORIZONS, formatUsd } from '../shared/data'

export default function D_Screen3_CreateGoal({ onNext, onBack }: FlowScreenProps) {
  const [targetValue, setTargetValue] = useState('')
  const [selectedHorizon, setSelectedHorizon] = useState('1y')

  const target = parseInt(targetValue || '0', 10) / 100
  const isValid = target >= 10

  // Calculate monthly deposit needed
  const horizonMonths = selectedHorizon === '6m' ? 6 : selectedHorizon === '1y' ? 12 : selectedHorizon === '2y' ? 24 : 0
  const monthlyDeposit = horizonMonths > 0 ? target / horizonMonths : 0

  return (
    <BaseLayout>
      <Header title="Definir meta" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm">
          <Text variant="heading-sm">Quanto você quer guardar?</Text>
          <CurrencyInput label="Meta" value={targetValue} onChange={setTargetValue} tokenIcon={USD_ICON} currencySymbol="US$" />
        </Stack>

        <Stack gap="sm">
          <Text variant="heading-sm">Até quando?</Text>
          <RadioGroup
            value={selectedHorizon}
            onChange={(v) => setSelectedHorizon(String(v))}
            options={TIME_HORIZONS.map((h) => ({
              value: h.id,
              title: h.label,
            }))}
          />
        </Stack>

        {isValid && horizonMonths > 0 && (
          <DataList
            data={[
              { label: 'Depósito mensal sugerido', value: formatUsd(monthlyDeposit) },
              { label: 'Rendimento estimado', value: formatUsd(target * 0.05 * (horizonMonths / 12)) },
              { label: 'Taxa', value: '5,00% a.a.' },
            ]}
          />
        )}

        <Banner
          variant="neutral"
          title="A meta é flexível"
          description="Você pode alterar o valor e o prazo a qualquer momento. A caixinha continua rendendo independente da meta."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={onNext}>
          Criar Caixinha
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
