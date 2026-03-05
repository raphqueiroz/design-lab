import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import DataList from '../../library/display/DataList'
import Text from '../../library/foundations/Text'

export default function Screen2_Review({ onNext, onBack, onElementTap }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="" onBack={onBack} />

      <Text variant="heading-lg">Confirme o resgate</Text>

      <Stack gap="none">
        <GroupHeader text="Detalhes do resgate" />
        <DataList
          data={[
            { label: 'Valor', value: 'US$ 100,00' },
            { label: 'Destino', value: 'Saldo do Cartão' },
            { label: 'Taxa', value: 'Grátis' },
            { label: 'Prazo', value: 'Instantâneo' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button
          fullWidth
          onPress={() => {
            const handled = onElementTap?.('Button: Confirmar resgate')
            if (!handled) onNext()
          }}
        >
          Confirmar resgate
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
