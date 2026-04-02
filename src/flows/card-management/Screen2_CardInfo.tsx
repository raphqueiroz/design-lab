import { useState, useCallback } from 'react'
import {
  RiEditLine, RiSnowflakeLine, RiFireLine,
  RiDeleteBinLine, RiAppleLine, RiLockLine, RiAlarmWarningLine,
} from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import BaseLayout from '../../library/layout/BaseLayout'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Modal from '../../library/layout/Modal'
import Header from '../../library/navigation/Header'
import DataList from '../../library/display/DataList'
import type { DataListEntry } from '../../library/display/DataList'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'
import ShortcutButton from '../../library/inputs/ShortcutButton'
import Toast from '../../library/feedback/Toast'

interface CardInfoData {
  cardType?: 'virtual' | 'physical'
  frozen?: boolean
  name?: string
  last4?: string
  number?: string
  expiry?: string
  cvv?: string
  [key: string]: unknown
}

export default function Screen2_CardInfo({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const data = useScreenData<CardInfoData>()
  const cardType = data.cardType ?? 'virtual'
  const initialFrozen = data.frozen ?? false
  const name = data.name ?? 'Cartão Virtual'
  const number = data.number ?? '5432 8901 2345 7328'
  const expiry = data.expiry ?? '12/28'
  const cvv = data.cvv ?? '421'

  const [frozen, setFrozen] = useState(initialFrozen)
  const [showFreezeModal, setShowFreezeModal] = useState(false)
  const [showPinSheet, setShowPinSheet] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const isVirtual = cardType === 'virtual'

  const showToastFeedback = useCallback((message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleCopyNumber = useCallback(() => {
    navigator.clipboard.writeText(number.replace(/\s/g, ''))
    showToastFeedback('Número do cartão copiado!')
  }, [number, showToastFeedback])

  const handleFreeze = () => {
    setShowFreezeModal(true)
  }

  const confirmFreeze = () => {
    const wasFrozen = frozen
    setFrozen(!wasFrozen)
    setShowFreezeModal(false)
    showToastFeedback(wasFrozen ? 'Cartão descongelado' : 'Cartão congelado')
  }

  const handleShortcut = (label: string) => {
    const handled = onElementTap?.(`ShortcutButton: ${label}`)
    if (!handled) onNext()
  }

  const handleEditLimits = () => {
    const handled = onElementTap?.('Button: Limites diários')
    if (!handled) onNext()
  }

  return (
    <BaseLayout>
      <Header title={name} onBack={onBack} />

      <div className={frozen ? 'opacity-30' : ''}>
        <DataList
          variant="vertical"
          data={[
            { label: 'Nome', value: name },
            {
              label: 'Número',
              value: number,
              ...(frozen ? {} : { copyable: true, onCopy: handleCopyNumber }),
            },
            [
              { label: 'Data de Validade', value: expiry },
              { label: 'CVV', value: cvv },
            ],
          ] as DataListEntry[]}
        />
      </div>

      <DataList
        variant="vertical"
        data={[
          {
            label: 'Limite diário de gastos',
            value: 'US$ 5.000,00',
            action: (
              <Button variant="primary" size="sm" onPress={handleEditLimits}>
                Editar
              </Button>
            ),
          },
          { label: 'Limite por transação', value: 'US$ 5.000,00' },
          {
            label: 'Instruções para uso',
            value: 'Escolha sempre o método crédito e a moeda local ao realizar compras.',
          },
        ] as DataListEntry[]}
      />

      {/* Shortcuts — different for virtual vs physical */}
      <Stack direction="row" align="between">
        {isVirtual ? (
          <>
            <ShortcutButton
              icon={<RiEditLine size={22} />}
              label="Renomear"
              variant="secondary"
              onPress={() => handleShortcut('Renomear')}
            />
            <ShortcutButton
              icon={frozen ? <RiFireLine size={22} /> : <RiSnowflakeLine size={22} />}
              label={frozen ? 'Descongelar' : 'Congelar'}
              variant="secondary"
              onPress={handleFreeze}
            />
            <ShortcutButton
              icon={<RiDeleteBinLine size={22} />}
              label="Remover"
              variant="secondary"
              onPress={() => handleShortcut('Remover')}
            />
            <ShortcutButton
              icon={<RiAppleLine size={22} />}
              label="Apple Pay"
              variant="secondary"
              onPress={() => handleShortcut('Apple Pay')}
            />
          </>
        ) : (
          <>
            <ShortcutButton
              icon={<RiLockLine size={22} />}
              label="Ver senha"
              variant="secondary"
              onPress={() => {
                onElementTap?.('ShortcutButton: Ver senha')
                setShowPinSheet(true)
              }}
            />
            <ShortcutButton
              icon={frozen ? <RiFireLine size={22} /> : <RiSnowflakeLine size={22} />}
              label={frozen ? 'Descongelar' : 'Congelar'}
              variant="secondary"
              onPress={handleFreeze}
            />
            <ShortcutButton
              icon={<RiAlarmWarningLine size={22} />}
              label="Reportar perda"
              variant="secondary"
              onPress={() => handleShortcut('Reportar perda')}
            />
            <ShortcutButton
              icon={<RiAppleLine size={22} />}
              label="Apple Pay"
              variant="secondary"
              onPress={() => handleShortcut('Apple Pay')}
            />
          </>
        )}
      </Stack>

      {/* Freeze/Unfreeze confirmation modal */}
      <Modal
        isVisible={showFreezeModal}
        variant="regular"
        buttonOneText={frozen ? 'Descongelar' : 'Congelar'}
        onButtonOnePress={confirmFreeze}
        onBackdropPress={() => setShowFreezeModal(false)}
      >
        <Stack gap="sm">
          <Text variant="heading-md">
            {frozen ? 'Descongelar cartão?' : 'Congelar cartão?'}
          </Text>
          <Text variant="body-md" color="content-secondary">
            {frozen
              ? 'O cartão voltará a funcionar normalmente para compras e pagamentos.'
              : 'O cartão ficará temporariamente inativo. Você poderá descongelar a qualquer momento.'}
          </Text>
        </Stack>
      </Modal>

      {/* PIN BottomSheet (physical only) */}
      <BottomSheet
        open={showPinSheet}
        onClose={() => setShowPinSheet(false)}
        title="Senha do cartão"
      >
        <Stack align="center" gap="default">
          <Text variant="display">1 2 3 4</Text>
          <Text variant="body-sm" color="content-tertiary">
            Use esta senha para compras presenciais
          </Text>
        </Stack>
      </BottomSheet>

      <Toast variant="success" message={toastMessage} visible={showToast} />
    </BaseLayout>
  )
}
