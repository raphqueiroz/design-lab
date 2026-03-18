/**
 * @screen Deposit Review
 * @description Review deposit with instant redemption callout and insurance mention.
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
          <GroupHeader text="Detalhes da operação" />
          <DataList data={[
            { label: 'Você está guardando', value: `${curr.symbol} 100,00` },
            { label: 'Caixinha', value: 'Reserva de emergência' },
            { label: 'Prazo', value: 'Instantâneo' },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Sobre o rendimento" />
          <DataList data={[
            { label: 'Rendimento atual', value: curr.apyDisplay },
            { label: 'Rendimento a partir de', value: 'Hoje' },
            {
              label: 'Resgate',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Imediato</span>,
            },
            { label: 'Proteção', value: 'Seguro incluso' },
          ]} />
        </Stack>

        <Banner
          variant="neutral"
          title="Resgate imediato"
          description="Você pode resgatar a qualquer momento, sem carência e sem penalidade."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Confirmar depósito')
          if (!handled) onNext()
        }}>
          Confirmar depósito
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
