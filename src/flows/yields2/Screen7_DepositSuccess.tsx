import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'

import { NET_APY, COVERAGE_PERCENT, formatPct } from './shared/data'

export default function Screen7_DepositSuccess({ onBack, onElementTap, onNext }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm" align="center">
        <Text variant="display">Depósito protegido!</Text>
        <Badge variant="success" size="md">Protegido</Badge>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Dados do depósito" />
        <DataList
          data={[
            { label: 'Depositado', value: 'US$ 500,00' },
            { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
            { label: 'Mensal (est.)', value: 'US$ 1,73' },
            { label: 'Cobertura', value: `${COVERAGE_PERCENT}%` },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth onPress={() => {
            const handled = onElementTap?.('Button: Ver rendimentos')
            if (!handled) onNext()
          }}>
            Ver rendimentos
          </Button>
          <Button variant="ghost" fullWidth onPress={onBack}>
            Início
          </Button>
        </Stack>
      </StickyFooter>
    </FeedbackLayout>
  )
}
