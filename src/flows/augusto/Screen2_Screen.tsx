/**
 * @screen Sobre essa namorada
 * @description Foto grande com descrição do que ela gosta e detalhes sobre
 *   personalidade. Ações: deletar e namorar, cada uma com BottomSheet de confirmação.
 */
import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import FeatureLayout from '@/library/layout/FeatureLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Badge from '@/library/display/Badge'
import Tag from '@/library/display/Tag'
import BottomSheet from '@/library/layout/BottomSheet'
import Button from '@/library/inputs/Button'

export default function Screen({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [deleteSheet, setDeleteSheet] = useState(false)
  const [dateSheet, setDateSheet] = useState(false)

  return (
    <FeatureLayout
      imageSrc="https://i.pravatar.cc/600?img=5"
      imageMaxHeight={320}
      onClose={onBack}
      imageOverlay={<Badge variant="success">Ótimo match</Badge>}
    >
      <Stack>
        <Text variant="heading-lg">Maria Clara</Text>
        <Text variant="body-md" color="content-secondary">
          26 anos · São Paulo, SP
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Interesses" />
        <div className="flex flex-wrap gap-[var(--token-spacing-2)] px-[var(--token-spacing-4)] py-[var(--token-spacing-3)]">
          <Tag label="Viagens" />
          <Tag label="Culinária japonesa" />
          <Tag label="Fotografia" />
          <Tag label="Yoga" />
          <Tag label="Filmes indie" />
        </div>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Personalidade" />
        <DataList
          data={[
            { label: 'Comunicação', value: 'Direta e transparente' },
            { label: 'Energia', value: 'Extrovertida e acolhedora' },
            { label: 'Valores', value: 'Família, honestidade, aventura' },
            { label: 'Compatibilidade', value: <span className="text-[var(--color-feedback-success)] font-medium">92%</span> },
          ]}
        />
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button variant="accent" fullWidth onPress={() => setDateSheet(true)}>
            Namorar
          </Button>
          <Button variant="ghost" fullWidth onPress={() => setDeleteSheet(true)}>
            Remover da lista
          </Button>
        </Stack>
      </StickyFooter>

      {/* Confirm date */}
      <BottomSheet open={dateSheet} onClose={() => setDateSheet(false)} title="Começar a namorar?">
        <Stack>
          <Text variant="body-md" color="content-secondary">
            Você e Maria Clara vão iniciar um relacionamento. Tem certeza?
          </Text>
          <Button variant="accent" fullWidth onPress={() => {
            setDateSheet(false)
            const handled = onElementTap?.('Button: Confirmar namoro')
            if (!handled) onNext()
          }}>
            Confirmar
          </Button>
        </Stack>
      </BottomSheet>

      {/* Confirm delete */}
      <BottomSheet open={deleteSheet} onClose={() => setDeleteSheet(false)} title="Remover candidata?">
        <Stack>
          <Text variant="body-md" color="content-secondary">
            Maria Clara será removida da sua lista. Essa ação não pode ser desfeita.
          </Text>
          <Button variant="accent" fullWidth onPress={() => {
            setDeleteSheet(false)
            const handled = onElementTap?.('Button: Confirmar remoção')
            if (!handled) onNext()
          }}>
            Remover
          </Button>
        </Stack>
      </BottomSheet>
    </FeatureLayout>
  )
}
