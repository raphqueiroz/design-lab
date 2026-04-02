/**
 * @screen Verify Email
 * @description Email verification screen with 6-digit PIN input and resend option
 */
import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import PinInput from '../../library/inputs/PinInput'
import Banner from '../../library/display/Banner'
import Text from '../../library/foundations/Text'
import Link from '../../library/foundations/Link'
import Stack from '../../library/layout/Stack'

export default function Screen3_VerifyEmail({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [code, setCode] = useState('')

  return (
    <BaseLayout>
      <Header title="Verificar e-mail" onBack={onBack} />

      <Stack gap="default">
        <Banner
          variant="neutral"
          title="Verifique sua caixa de entrada"
          description="Enviamos um código de 6 dígitos para maria@email.com"
        />

        <Stack gap="sm">
          <Text variant="body-md" color="content-secondary" align="center">
            Digite o código de verificação
          </Text>
          <PinInput length={6} value={code} onChange={setCode} />
        </Stack>

        <Link
          linkText="Reenviar código"
          size="base"
          onLinkPress={() => onElementTap?.('Link: Reenviar código')}
        />
      </Stack>

      <StickyFooter>
        <Button
          variant="accent"
          fullWidth
          disabled={code.length < 6}
          onPress={() => {
            const handled = onElementTap?.('Button: Verificar')
            if (!handled) onNext()
          }}
        >
          Verificar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
