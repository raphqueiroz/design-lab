import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import PinInput from '../../library/inputs/PinInput'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Link from '../../library/foundations/Link'

export default function Screen17_UpdatePhoneVerify({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [code, setCode] = useState('')
  const isValid = code.length === 6

  return (
    <BaseLayout>
      <Header title="Verificar telefone" onBack={onBack} />
      <Stack>
        <Text variant="body-md" color="content-secondary">
          Digite o código de 6 dígitos enviado para o novo número.
        </Text>
        <PinInput
          length={6}
          value={code}
          onChange={setCode}
        />
        <Link linkText="Reenviar código" onLinkPress={() => {}} size="sm" />
      </Stack>
      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={() => {
          const handled = onElementTap?.('Button: Verificar')
          if (!handled) onNext()
        }}>
          Verificar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
