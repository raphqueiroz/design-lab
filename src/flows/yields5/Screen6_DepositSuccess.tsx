import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeedbackLayout from '../../library/layout/FeedbackLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import DataList from '../../library/display/DataList'
import GroupHeader from '../../library/navigation/GroupHeader'

import { NET_APY, formatPct } from '../yields2/shared/data'

export default function Screen6_DepositSuccess({ onBack }: FlowScreenProps) {
  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">Depósito confirmado!</Text>
        <Text variant="body-md" color="content-secondary">
          Seus fundos já estão rendendo com seguro automático.
        </Text>
      </Stack>
      <Stack gap="none">
        <GroupHeader text="Dados do depósito" />
        <DataList
          data={[
            { label: 'Depositado', value: 'US$ 500,00' },
            { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
            { label: 'Mensal (est.)', value: 'US$ 1,73' },
          ]}
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth onPress={onBack}>Entendi</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
