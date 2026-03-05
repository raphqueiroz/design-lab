import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import TextInput from '../../library/inputs/TextInput'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'

export default function Screen3_CreateVirtualName({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [name, setName] = useState('')
  const isValid = name.trim().length >= 2

  return (
    <BaseLayout>
      <Header title="Novo cartão virtual" onClose={onBack} />
      <Stack>
        <Text variant="body-md" color="content-secondary">
          Escolha um nome para identificar seu cartão. Ele aparecerá na sua lista de cartões.
        </Text>
        <TextInput
          label="Nome do cartão"
          value={name}
          onChange={(e) => setName(e.target.value)}
          helperText="Ex: Compras Online, Assinaturas, Viagem"
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={() => {
          const handled = onElementTap?.('Button: Criar cartão')
          if (!handled) onNext()
        }}>
          Criar cartão
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
