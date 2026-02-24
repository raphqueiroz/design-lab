import { QrCode, Landmark, Bitcoin } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import ScreenLayout from '../../library/layout/ScreenLayout'
import ListItem from '../../library/display/ListItem'
import Text from '../../library/foundations/Text'
import Divider from '../../library/foundations/Divider'

export default function Screen1_AddFunds({ onNext, onBack }: FlowScreenProps) {
  return (
    <ScreenLayout header={<Header title="Add funds" onBack={onBack} />}>
      <div className="px-[var(--token-spacing-md)] py-[var(--token-spacing-lg)]">
        <Text variant="heading-sm">Choose a deposit method</Text>
      </div>
      <div className="bg-surface-primary mx-[var(--token-spacing-md)] rounded-[var(--token-radius-lg)] overflow-hidden">
        <ListItem
          icon={<QrCode size={20} className="text-interactive-default" />}
          label="PIX"
          description="Instant transfer"
          rightValue="Free"
          onPress={onNext}
        />
        <Divider spacing="sm" />
        <ListItem
          icon={<Landmark size={20} className="text-text-secondary" />}
          label="TED"
          description="Bank transfer, 1-2 business days"
          rightValue="R$ 8.50"
        />
        <Divider spacing="sm" />
        <ListItem
          icon={<Bitcoin size={20} className="text-text-secondary" />}
          label="Crypto"
          description="BTC, ETH, USDC"
          rightValue="Network fee"
        />
      </div>
    </ScreenLayout>
  )
}
