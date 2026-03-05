import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Banner from '../../library/display/Banner'
import DataList from '../../library/display/DataList'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen10_RemoveConfirm({ onBack, onNext, onElementTap }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Remover cartão" onBack={onBack} />
      <Stack>
        <Text variant="body-md" color="content-secondary">
          Tem certeza que deseja remover este cartão virtual? Esta ação não pode ser desfeita.
        </Text>
      </Stack>

      <DataList
        data={[
          { label: 'Cartão', value: 'Cartão Virtual' },
          { label: 'Final', value: '•••• 7328' },
        ]}
      />

      <Banner
        variant="warning"
        title="Ação irreversível"
        description="Todas as assinaturas vinculadas a este cartão precisarão ser atualizadas."
      />

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth variant="destructive" onPress={() => {
            const handled = onElementTap?.('Button: Remover cartão')
            if (!handled) onNext()
          }}>
            Remover cartão
          </Button>
          <Button fullWidth variant="ghost" onPress={onBack}>
            Cancelar
          </Button>
        </Stack>
      </StickyFooter>
    </BaseLayout>
  )
}
