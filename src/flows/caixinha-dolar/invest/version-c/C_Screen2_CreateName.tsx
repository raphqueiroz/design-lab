import { useState } from 'react'
import type { FlowScreenProps } from '../../../../pages/simulator/flowRegistry'
import Header from '../../../../library/navigation/Header'
import BaseLayout from '../../../../library/layout/BaseLayout'
import StickyFooter from '../../../../library/layout/StickyFooter'
import Stack from '../../../../library/layout/Stack'
import Button from '../../../../library/inputs/Button'
import TextInput from '../../../../library/inputs/TextInput'
import Text from '../../../../library/foundations/Text'
import Card from '../../../../library/display/Card'

import { EMOJI_OPTIONS } from '../../shared/data'

export default function C_Screen2_CreateName({ onNext, onBack }: FlowScreenProps) {
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('✈️')

  const isValid = name.trim().length >= 2

  return (
    <BaseLayout>
      <Header title="Nova Caixinha" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm">
          <Text variant="heading-sm">Escolha um ícone</Text>
          <Stack direction="row" gap="sm" className="flex-wrap">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant={selectedEmoji === emoji ? 'accent' : 'primary'}
                size="sm"
                onPress={() => setSelectedEmoji(emoji)}
              >
                <span style={{ fontSize: 20 }}>{emoji}</span>
              </Button>
            ))}
          </Stack>
        </Stack>

        <Card variant="flat">
          <Stack gap="sm" align="center">
            <span style={{ fontSize: 48 }}>{selectedEmoji}</span>
            <Text variant="heading-md" align="center">
              {name || 'Minha Caixinha'}
            </Text>
          </Stack>
        </Card>

        <TextInput
          label="Nome da caixinha"
          placeholder="Ex: Viagem, Reserva, iPhone..."
          value={name}
          onChange={setName}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid} onPress={onNext}>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
