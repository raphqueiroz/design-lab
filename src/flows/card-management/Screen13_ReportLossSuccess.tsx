import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'

export default function Screen13_ReportLossSuccess({ onBack, onNext, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Cartão desativado</Text>
        <Text variant="body-md" color="content-secondary">
          Seu cartão físico foi desativado e um novo cartão está a caminho.
          Você pode continuar usando seus cartões virtuais normalmente.
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Detalhes" />
        <DataList
          data={[
            { label: 'Cartão cancelado', value: '•••• 4521' },
            { label: 'Novo cartão', value: 'Em produção' },
            { label: 'Prazo de entrega', value: '5-7 dias úteis' },
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
