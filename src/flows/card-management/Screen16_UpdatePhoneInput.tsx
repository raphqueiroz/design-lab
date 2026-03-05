import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import TextInput from '../../library/inputs/TextInput'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'

export default function Screen16_UpdatePhoneInput({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [phone, setPhone] = useState('')
  const isValid = phone.replace(/\D/g, '').length >= 10

  return (
    <BaseLayout>
      <Header title="Atualizar telefone" onBack={onBack} />
      <Stack>
        <Text variant="body-md" color="content-secondary">
          Informe seu novo número de telefone. Enviaremos um código de verificação por SMS.
        </Text>
        <TextInput
          label="Novo telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          prefix="+55"
          helperText="Informe o DDD + número"
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={() => {
          const handled = onElementTap?.('Button: Continuar')
          if (!handled) onNext()
        }}>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
