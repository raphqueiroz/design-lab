import { useState, useCallback } from 'react'
import { RiFileCopyLine, RiQrCodeLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Button from '../../library/inputs/Button'
import IconButton from '../../library/inputs/IconButton'
import DataList from '../../library/display/DataList'
import ListItem from '../../library/display/ListItem'
import GroupHeader from '../../library/navigation/GroupHeader'
import Banner from '../../library/display/Banner'
import Text from '../../library/foundations/Text'
import Toast from '../../library/feedback/Toast'
import Countdown from '../../library/feedback/Countdown'

const MOCK_PIX_CODE = '00020126580014br.gov.bcb.pix013636c3a9b2-7e4f-4d8a-b912-3d4c5e6f7a8b5204000053039865802BR5925PICNIC'
const QR_CODE_IMG = 'https://api.qrserver.com/v1/create-qr-code/?size=271x271&data=00020126580014br.gov.bcb.pix'

export default function Screen3_PixPayment({ onNext, onBack }: FlowScreenProps) {
  const [showToast, setShowToast] = useState(false)
  const [showQrSheet, setShowQrSheet] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(MOCK_PIX_CODE)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  return (
    <BaseLayout>
      <Header title="Pague com Pix" onBack={onBack} />

      <Banner
        variant="warning"
        title="Pague de uma conta em seu nome"
        description="Caso contrário o valor será devolvido automaticamente para a mesma conta"
      />

      <Stack>
        <Text variant="body-md" color="content-secondary">
          Copie o código abaixo e use a função{' '}
          <span className="font-semibold text-content-primary">Pix Copia e Cola</span>{' '}
          no aplicativo de seu banco.
        </Text>

        <ListItem
          title={`${MOCK_PIX_CODE.substring(0, 30)}...`}
          right={
            <IconButton
              variant="small"
              icon={<RiFileCopyLine size={16} className="text-content-primary" />}
              onPress={handleCopy}
            />
          }
          trailing={null}
          className="bg-[var(--color-surface-shade)]"
        />

        <Stack direction="row" align="between">
          <Countdown seconds={280} />
          <Button variant="primary" size="sm" onPress={() => setShowQrSheet(true)}>
            <span className="flex items-center gap-[var(--token-spacing-1)]">
              <RiQrCodeLine size={20} />
              Ver QR Code
            </span>
          </Button>
        </Stack>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Dados para pagamento" />
        <DataList
          data={[
            { label: 'Você paga', value: 'R$ 545,83' },
            { label: 'Para', value: 'Brla Digital Ltda' },
            { label: 'Instituição', value: 'Stark Bank SA' },
            { label: 'Você recebe', value: 'US$ 100,00' },
          ]}
        />
      </Stack>

      <Toast variant="success" message="Código PIX copiado!" visible={showToast} />

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth onPress={handleCopy}>
            Copiar código de pagamento
          </Button>
          <Button variant="ghost" fullWidth onPress={onNext}>
            Cancelar pagamento
          </Button>
        </Stack>
      </StickyFooter>

      <BottomSheet
        open={showQrSheet}
        onClose={() => setShowQrSheet(false)}
      >
        <Stack align="center" gap="sm">
          <img
            src={QR_CODE_IMG}
            alt="QR Code PIX"
            className="w-[271px] h-[271px] rounded-[var(--token-radius-sm)]"
          />
          <Text variant="body-sm" color="content-tertiary" className="text-center">
            Leia esse código pelo app do seu banco para fazer o pagamento
          </Text>
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
