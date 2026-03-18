/**
 * @screen Deposit Success
 * @description Deposit confirmed with USD summary and instant redemption.
 */
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import FeedbackLayout from '../../../library/layout/FeedbackLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import DataList from '../../../library/display/DataList'
import GroupHeader from '../../../library/navigation/GroupHeader'
import Banner from '../../../library/display/Banner'
import Text from '../../../library/foundations/Text'
import { type CaixinhaCurrency, CURRENCIES } from '../shared/data'

export default function Screen4_Success({ onBack, onElementTap }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const curr = CURRENCIES[currency]

  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Seu dinheiro começa a render em breve</Text>
        <Text variant="body-md" color="content-secondary">
          Seu depósito está sendo processado e deve ser concluído em até 3 minutos.
        </Text>
      </Stack>

      <Stack gap="default">
        <Stack gap="none">
          <GroupHeader text="Resumo da operação" />
          <DataList data={[
            { label: 'Valor guardado', value: `${curr.symbol} 100,00` },
            { label: 'Rendimento atual', value: curr.apyDisplay },
            {
              label: 'Resgate',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Imediato</span>,
            },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        </Stack>

        <Banner
          variant="neutral"
          title="Seu saldo está protegido"
          description="Seu rendimento é coberto por um seguro automático contra falhas técnicas — sem custo adicional."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Entendi')
          if (!handled) onBack()
        }}>Entendi</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
