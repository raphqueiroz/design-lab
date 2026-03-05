import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen5_CreateVirtualSuccess({ onBack, onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Cartão criado!</Text>
        <Text variant="body-md" color="content-secondary">
          Seu novo cartão virtual está pronto para uso.
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Detalhes do cartão" />
        <DataList
          data={[
            { label: 'Nome', value: 'Compras Online' },
            { label: 'Número', value: '•••• 9102' },
            { label: 'Limite diário', value: 'R$ 5.000,00' },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Ver meus cartões')
          if (!handled) onNext()
        }}>
          Ver meus cartões
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
