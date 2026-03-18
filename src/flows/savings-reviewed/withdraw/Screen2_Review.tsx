/**
 * @screen Withdraw Review
 * @description Withdrawal review with "Prazo: Imediato" in green.
 */
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import DataList from '../../../library/display/DataList'
import GroupHeader from '../../../library/navigation/GroupHeader'
import Banner from '../../../library/display/Banner'
import { type CaixinhaCurrency, CURRENCIES } from '../shared/data'

export default function Screen2_Review({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const curr = CURRENCIES[currency]

  return (
    <BaseLayout>
      <Header title="Revise os dados" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="none">
          <GroupHeader text="Detalhes do resgate" />
          <DataList data={[
            { label: 'Você está resgatando', value: `${curr.symbol} 100,00` },
            { label: 'Destino', value: 'Saldo do Cartão' },
            {
              label: 'Prazo',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Imediato</span>,
            },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Sobre a caixinha" />
          <DataList data={[
            { label: 'Saldo após resgate', value: `${curr.symbol} 2.400,00` },
          ]} />
        </Stack>

        <Banner
          variant="neutral"
          title="Resgate imediato"
          description="O valor é creditado direto no saldo do seu cartão, sem carência."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Confirmar resgate')
          if (!handled) onNext()
        }}>
          Confirmar resgate
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
