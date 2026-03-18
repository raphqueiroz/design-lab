/**
 * @screen Withdraw Success
 * @description Withdrawal confirmed with USD summary.
 */
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import FeedbackLayout from '../../../library/layout/FeedbackLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import GroupHeader from '../../../library/navigation/GroupHeader'
import Button from '../../../library/inputs/Button'
import DataList from '../../../library/display/DataList'
import Text from '../../../library/foundations/Text'
import { type CaixinhaCurrency, CURRENCIES } from '../shared/data'

export default function Screen4_Success({ onBack, onElementTap }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const curr = CURRENCIES[currency]

  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Resgate concluído</Text>
        <Text variant="body-md" color="content-secondary">
          O valor foi creditado no saldo do seu cartão.
        </Text>
      </Stack>

      <Stack gap="default">
        <Stack gap="none">
          <GroupHeader text="Resumo do resgate" />
          <DataList data={[
            { label: 'Valor resgatado', value: `${curr.symbol} 100,00` },
            { label: 'Destino', value: 'Saldo do Cartão' },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        </Stack>
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Entendi')
          if (!handled) onBack()
        }}>
          Entendi
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
