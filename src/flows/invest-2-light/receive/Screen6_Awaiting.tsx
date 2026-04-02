/**
 * Awaiting Deposit — FeedbackLayout matching Figma "Crypto Deposit Pending" pattern.
 * Illustration, processing message, warning banner, "Entendi" CTA.
 * After 30 seconds, simulates deposit confirmation via Toast.
 */
import { useState, useEffect } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import FeedbackLayout from '@/library/layout/FeedbackLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import Banner from '@/library/display/Banner'
import Toast from '@/library/feedback/Toast'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import { getAsset } from '../shared/data'
import type { AssetTicker } from '../shared/data'
import pendingImg from '@/assets/images/deposit-pending.png'

export default function Screen6_Awaiting({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{ assetTicker?: AssetTicker }>()
  const asset = getAsset(assetTicker)
  const [toastVisible, setToastVisible] = useState(false)

  // Simulate deposit notification after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => setToastVisible(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!toastVisible) return
    const timer = setTimeout(() => setToastVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [toastVisible])

  return (
    <FeedbackLayout animation={null} onClose={onBack}>
      <Stack gap="default">
        {/* Illustration — cover, fills container width */}
        <div className="rounded-full overflow-hidden" style={{ width: 240, height: 240 }}>
          <img src={pendingImg} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Title + description */}
        <Stack gap="sm">
          <Text variant="display">Estamos processando seu depósito...</Text>
          <Text variant="body-md" color="content-secondary">
            Avisaremos quando seu depósito for reconhecido. Você pode acompanhar o progresso no{' '}
            <span className="font-semibold text-content-primary">Histórico de Transações</span>.
          </Text>
        </Stack>

        {/* Warning banner */}
        <Banner
          variant="warning"
          title="Importante"
          description="Risco de perda permanente ao enviar criptomoedas não suportadas ou usar redes diferentes da selecionada."
        />
      </Stack>

      <StickyFooter>
        <Button
          variant="accent"
          size="lg"
          fullWidth
          onPress={() => {
            const handled = onElementTap?.('Button: Entendi')
            if (!handled) onNext()
          }}
        >
          Entendi
        </Button>
      </StickyFooter>

      <Toast
        variant="success"
        message={`Depósito de ${asset.name} confirmado com sucesso!`}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </FeedbackLayout>
  )
}
