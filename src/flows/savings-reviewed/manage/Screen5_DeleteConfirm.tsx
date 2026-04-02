import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Header from '../../../library/navigation/Header'
import Banner from '../../../library/display/Banner'
import DataList from '../../../library/display/DataList'
import GroupHeader from '../../../library/navigation/GroupHeader'
import Button from '../../../library/inputs/Button'
import Text from '../../../library/foundations/Text'

export default function Screen5_DeleteConfirm({ onBack, onElementTap }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="" onBack={onBack} />

      <Stack gap="lg">
        <Stack gap="sm">
          <Text variant="heading-lg">Excluir caixinha?</Text>
          <Text variant="body-md" color="content-secondary">
            Esta ação não pode ser desfeita. Você poderá criar uma nova caixinha a qualquer momento.
          </Text>
        </Stack>

        <Banner
          variant="warning"
          title="Atenção"
          description="Ao excluir, o histórico de rendimentos desta caixinha será perdido."
        />

        <Stack gap="none">
          <GroupHeader text="Caixinha a excluir" />
          <DataList data={[
            { label: 'Nome', value: 'Reserva de emergência' },
            { label: 'Moeda', value: 'Dólar americano (USD)' },
            { label: 'Saldo', value: 'US$ 0,00' },
          ]} />
        </Stack>
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth variant="destructive" onPress={() => {
            const handled = onElementTap?.('Button: Excluir caixinha')
            if (!handled) onBack()
          }}>
            Excluir caixinha
          </Button>
          <Button fullWidth variant="primary" onPress={onBack}>
            Cancelar
          </Button>
        </Stack>
      </StickyFooter>
    </BaseLayout>
  )
}
