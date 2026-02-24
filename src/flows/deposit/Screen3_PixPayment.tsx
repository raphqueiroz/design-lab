import { useState, useEffect, useCallback } from 'react'
import { QrCode } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import ScreenLayout from '../../library/layout/ScreenLayout'
import Card from '../../library/display/Card'
import Text from '../../library/foundations/Text'
import Divider from '../../library/foundations/Divider'
import Badge from '../../library/display/Badge'
import Button from '../../library/inputs/Button'
import Toast from '../../library/feedback/Toast'
import Spacer from '../../library/foundations/Spacer'

const MOCK_PIX_CODE = '00020126580014br.gov.bcb.pix013636c3a9b2-7e4f-4d8a-b912-3d4c5e6f7a8b5204000053039865802BR5925PICNIC'

export default function Screen3_PixPayment({ onNext, onBack }: FlowScreenProps) {
  const [seconds, setSeconds] = useState(600)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(MOCK_PIX_CODE)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }, [])

  return (
    <ScreenLayout
      header={<Header title="PIX Payment" onBack={onBack} />}
      bottomCTA={
        <Button fullWidth onPress={onNext}>
          I already paid
        </Button>
      }
    >
      <div className="flex flex-col items-center px-[var(--token-spacing-md)] py-[var(--token-spacing-lg)]">
        {/* QR Code placeholder */}
        <div className="w-[200px] h-[200px] bg-surface-secondary rounded-[var(--token-radius-lg)] flex items-center justify-center mb-[var(--token-spacing-md)]">
          <QrCode size={80} className="text-text-tertiary" />
        </div>

        <Text variant="body-md" align="center" color="text-secondary">
          Scan this QR code with your bank app
        </Text>

        <Spacer size="md" />
        <Divider />
        <Spacer size="md" />

        {/* Copy code section */}
        <div className="w-full">
          <Text variant="body-sm" color="text-secondary">
            Or copy the PIX code
          </Text>
          <Card variant="flat" className="mt-[var(--token-spacing-2)]">
            <p className="text-[length:var(--token-font-size-caption)] font-mono text-text-primary truncate">
              {MOCK_PIX_CODE}
            </p>
          </Card>
          <div className="mt-[var(--token-spacing-3)]">
            <Button variant="secondary" fullWidth onPress={handleCopy}>
              Copy code
            </Button>
          </div>
        </div>

        <Spacer size="lg" />

        <Badge variant="info" size="md">
          Expires in {timeStr}
        </Badge>
      </div>

      {/* Toast */}
      <div className="fixed top-[var(--token-spacing-lg)] left-1/2 -translate-x-1/2 z-50">
        <Toast variant="success" message="PIX code copied!" visible={showToast} />
      </div>
    </ScreenLayout>
  )
}
