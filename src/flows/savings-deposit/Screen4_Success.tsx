import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import savingsAnimation from '../../assets/lottie/savings-success.json'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'

export default function Screen4_Success({ onBack, onElementTap }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack} animation={savingsAnimation}>
      <Stack gap="sm">
        <Text variant="display">Seu dinheiro já está rendendo</Text>
        <Text variant="body-md" color="content-secondary">
          O depósito foi concluído e o rendimento começa a ser aplicado hoje mesmo.
        </Text>
      </Stack>

      <Stack gap="default">
        <Stack gap="none">
          <GroupHeader text="Resumo da operação" />
          <DataList data={[
            { label: 'Valor guardado', value: 'US$ 100,00' },
            { label: 'Pagamento', value: 'Saldo do Cartão' },
            { label: 'Rendimento atual', value: '5% a.a.' },
            { label: 'Rendimento a partir de', value: 'Hoje' },
            {
              label: 'Nossa taxa',
              value: (
                <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>
              ),
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
