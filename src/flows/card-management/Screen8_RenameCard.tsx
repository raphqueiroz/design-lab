import { useState } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import TextInput from '../../library/inputs/TextInput'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'

export default function Screen8_RenameCard({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [name, setName] = useState('Cartão Virtual')
  const isValid = name.trim().length >= 2

  return (
    <BaseLayout>
      <Header title="Renomear cartão" onBack={onBack} />
      <Stack>
        <Text variant="body-md" color="content-secondary">
          Escolha um novo nome para identificar este cartão.
        </Text>
        <TextInput
          label="Nome do cartão"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Stack>
      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={() => {
          const handled = onElementTap?.('Button: Salvar')
          if (!handled) onNext()
        }}>
          Salvar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
