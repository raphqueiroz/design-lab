import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Slider from '../../library/inputs/Slider'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

export default function Screen6_EditLimits({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [dailyLimit, setDailyLimit] = useState(5000)

  return (
    <BaseLayout>
      <Header title="Limites diários" onBack={onBack} />

      <Stack>
        <Text variant="body-md" color="content-secondary">
          Os limites são compartilhados entre todos os seus cartões.
        </Text>

        <Stack gap="sm">
          <Text variant="heading-sm">Limite de compras</Text>
          <Slider
            value={dailyLimit}
            minimumValue={500}
            maximumValue={20000}
            step={500}
            onValueChange={setDailyLimit}
          />
          <Text variant="body-md">{formatCurrency(dailyLimit)}</Text>
        </Stack>
      </Stack>

      <DataList
        data={[
          { label: 'Limite atual', value: 'R$ 5.000,00' },
          { label: 'Novo limite', value: formatCurrency(dailyLimit) },
        ]}
      />

      <Banner
        variant="neutral"
        title="Limites compartilhados"
        description="O limite diário vale para a soma de todas as compras em todos os seus cartões."
      />

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Salvar alterações')
          if (!handled) onNext()
        }}>
          Salvar alterações
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
