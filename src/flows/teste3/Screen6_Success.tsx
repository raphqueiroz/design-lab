/**
 * @screen Success
 * @description Investment confirmation with summary of the transaction
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeedbackLayout from '@/library/layout/FeedbackLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Text from '@/library/foundations/Text'

import { NET_APY, formatPct, formatUsd } from '../yields2/shared/data'

export default function Screen({ onBack, onElementTap, onNext }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Investimento realizado!</Text>
        <Text variant="body-md" color="content-secondary">
          Seu investimento já está rendendo. Acompanhe a evolução na tela de investimentos.
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Resumo" />
        <DataList
          data={[
            { label: 'Valor investido', value: 'US$ 100,00' },
            { label: 'Produto', value: 'Renda Protegida' },
            { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
            { label: 'Rendimento mensal (est.)', value: formatUsd(100 * NET_APY / 12) },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Ver investimentos')
          if (!handled) onNext()
        }}>
          Ver investimentos
        </Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
