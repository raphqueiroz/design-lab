import { useMemo } from 'react'
import { RiAddLine, RiBankCardLine, RiSmartphoneLine, RiSnowflakeLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import BaseLayout from '../../library/layout/BaseLayout'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import Badge from '../../library/display/Badge'

interface CardData {
  id: string
  type: 'physical' | 'virtual'
  name: string
  last4: string
  frozen: boolean
}

const DEFAULT_CARDS: CardData[] = [
  { id: 'v1', type: 'virtual', name: 'Cartão Virtual', last4: '7328', frozen: false },
]

export default function Screen1_CardsList({ onNext, onElementTap }: FlowScreenProps) {
  const { cards: injectedCards } = useScreenData<{ cards?: CardData[] }>()
  const cards = injectedCards ?? DEFAULT_CARDS

  const physicalCards = useMemo(() => cards.filter((c) => c.type === 'physical'), [cards])
  const virtualCards = useMemo(() => cards.filter((c) => c.type === 'virtual'), [cards])
  const hasPhysical = physicalCards.length > 0
  const virtualCount = virtualCards.length

  const handleCardTap = () => {
    const handled = onElementTap?.('ListItem: Card Item')
    if (!handled) onNext()
  }

  const handleAction = (label: string) => {
    const handled = onElementTap?.(`ListItem: ${label}`)
    if (!handled) onNext()
  }

  const renderCard = (card: CardData) => (
    <ListItem
      key={card.id}
      title={card.name}
      subtitle={`•••• ${card.last4}`}
      left={
        <Avatar
          icon={card.frozen ? <RiSnowflakeLine size={20} /> : <RiBankCardLine size={20} />}
          size="md"
        />
      }
      right={card.frozen ? <Badge variant="neutral">Congelado</Badge> : undefined}
      onPress={handleCardTap}
      className={card.frozen ? 'opacity-50' : ''}
    />
  )

  return (
    <BaseLayout>
      <Header title="Meus Cartões" />

      {hasPhysical && (
        <Stack gap="none">
          <GroupHeader text="Cartão físico" />
          {physicalCards.map(renderCard)}
        </Stack>
      )}

      <Stack gap="none">
        <GroupHeader text="Cartões virtuais" />
        {virtualCards.map(renderCard)}
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Ações" />
        <ListItem
          title="Criar cartão virtual"
          subtitle="Crie um cartão para compras online"
          left={<Avatar icon={<RiAddLine size={20} />} size="md" />}
          onPress={() => handleAction('Criar cartão virtual')}
          disabled={virtualCount >= 10}
        />
        <ListItem
          title="Pedir cartão físico"
          subtitle="Receba um cartão em seu endereço"
          left={<Avatar icon={<RiBankCardLine size={20} />} size="md" />}
          onPress={() => handleAction('Pedir cartão físico')}
          disabled={hasPhysical}
        />
        <ListItem
          title="Atualizar meu telefone"
          subtitle="Altere o número vinculado aos seus cartões"
          left={<Avatar icon={<RiSmartphoneLine size={20} />} size="md" />}
          onPress={() => handleAction('Atualizar meu telefone')}
        />
      </Stack>
    </BaseLayout>
  )
}
