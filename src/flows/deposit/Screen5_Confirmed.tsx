import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import ResultLayout from '../../library/layout/ResultLayout'
import SuccessAnimation from '../../library/feedback/SuccessAnimation'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Button from '../../library/inputs/Button'
import Spacer from '../../library/foundations/Spacer'

export default function Screen5_Confirmed({ onBack }: FlowScreenProps) {
  return (
    <ResultLayout
      animation={<SuccessAnimation size={80} />}
      actions={
        <>
          <Button fullWidth onPress={onBack}>
            Done
          </Button>
          <Button variant="ghost" fullWidth>
            Share receipt
          </Button>
        </>
      }
    >
      <Text variant="heading-md" align="center">
        Deposit confirmed!
      </Text>
      <Spacer size="sm" />
      <Amount value={150} currency="R$" size="lg" />
      <Spacer size="xs" />
      <Text variant="body-md" color="text-secondary" align="center">
        Your balance has been updated
      </Text>
      <Spacer size="sm" />
      <Text variant="caption" color="text-tertiary" align="center">
        Balance: $ 1,279.30
      </Text>
    </ResultLayout>
  )
}
