/**
 * @screen Lista de namoradas
 * @description Uma lista de pessoas com indicação se é um bom match ou não.
 *   Cada item leva para a página de detalhes da namorada.
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeatureLayout from '@/library/layout/FeatureLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import Badge from '@/library/display/Badge'
import GroupHeader from '@/library/navigation/GroupHeader'
import Button from '@/library/inputs/Button'

const MATCHES = [
  {
    id: 'maria',
    name: 'Maria Clara',
    desc: 'Adora viajar e cozinhar comida japonesa',
    avatar: 'https://i.pravatar.cc/150?img=5',
    match: 'high' as const,
  },
  {
    id: 'juliana',
    name: 'Juliana Alves',
    desc: 'Apaixonada por livros e trilhas na natureza',
    avatar: 'https://i.pravatar.cc/150?img=9',
    match: 'high' as const,
  },
  {
    id: 'camila',
    name: 'Camila Souza',
    desc: 'Gosta de séries, jogos de tabuleiro e café',
    avatar: 'https://i.pravatar.cc/150?img=20',
    match: 'medium' as const,
  },
  {
    id: 'fernanda',
    name: 'Fernanda Lima',
    desc: 'Fã de rock alternativo e fotografia analógica',
    avatar: 'https://i.pravatar.cc/150?img=25',
    match: 'low' as const,
  },
  {
    id: 'beatriz',
    name: 'Beatriz Oliveira',
    desc: 'Ama animais, yoga e comida vegana',
    avatar: 'https://i.pravatar.cc/150?img=32',
    match: 'medium' as const,
  },
]

const MATCH_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  high: { label: 'Ótimo match', variant: 'success' },
  medium: { label: 'Match médio', variant: 'warning' },
  low: { label: 'Match baixo', variant: 'error' },
}

export default function Screen({ onNext, onBack, onElementTap }: FlowScreenProps) {
  return (
    <FeatureLayout
      imageBgColor="var(--color-accent-primary)"
      imageMaxHeight={180}
      imageHeader={
        <Stack gap="sm">
          <Text variant="heading-lg" color="content-inverse">Namoradas do Augusto</Text>
          <Text variant="body-md" color="content-inverse">Encontre o match perfeito</Text>
        </Stack>
      }
      onClose={onBack}
    >
      <Stack gap="none">
        <GroupHeader text="Candidatas" />
        {MATCHES.map((person) => {
          const badge = MATCH_BADGE[person.match]
          return (
            <ListItem
              key={person.id}
              title={person.name}
              subtitle={person.desc}
              left={<Avatar src={person.avatar} size="md" />}
              right={<Badge variant={badge.variant} size="sm">{badge.label}</Badge>}
              onPress={() => {
                const handled = onElementTap?.(`ListItem: ${person.name}`)
                if (!handled) onNext()
              }}
            />
          )
        })}
      </Stack>

      <StickyFooter>
        <Button variant="primary" fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Adicionar')
          if (!handled) onNext()
        }}>
          Adicionar candidata
        </Button>
      </StickyFooter>
    </FeatureLayout>
  )
}
