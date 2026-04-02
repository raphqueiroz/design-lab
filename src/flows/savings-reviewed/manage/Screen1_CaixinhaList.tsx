import { RiAddLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import FeatureLayout from '../../../library/layout/FeatureLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import Text from '../../../library/foundations/Text'
import Amount from '../../../library/display/Amount'
import Badge from '../../../library/display/Badge'

import { CaixinhaListCard, EmptyState, PendingDepositBanner } from './Screen1_CaixinhaList.parts'
import { MOCK_REVIEWED_CAIXINHAS, MOCK_FX_TO_BRL } from '../shared/data'

const PIGGY_BANK_IMG = 'https://images.unsplash.com/photo-1589824783528-fdfccf80ed70?w=800&q=80'

export default function Screen1_CaixinhaList({ onNext, onElementTap }: FlowScreenProps) {
  const { isEmpty, hasPending } = useScreenData<{ isEmpty?: boolean; hasPending?: boolean }>()

  const caixinhas = isEmpty ? [] : MOCK_REVIEWED_CAIXINHAS

  const totalBrl = caixinhas.reduce((sum, c) => sum + c.balance * MOCK_FX_TO_BRL[c.currency], 0)
  const totalYieldBrl = caixinhas.reduce((sum, c) => sum + c.yieldToday * MOCK_FX_TO_BRL[c.currency], 0)

  const handleTapCaixinha = (id: string) => {
    const resolved = onElementTap?.(`ListItem: ${id}`)
    if (!resolved) onNext()
  }

  const handleCreate = () => {
    const resolved = onElementTap?.('Button: Nova Caixinha')
    if (!resolved) onNext()
  }

  return (
    <FeatureLayout
      imageSrc={PIGGY_BANK_IMG}
      imageAlt="Savings illustration"
      imageMaxHeight={200}
      imageOverlay={
        <Badge variant="lime" size="md">Seguro incluso</Badge>
      }
    >
      <Stack gap="default">
        {/* Total in BRL */}
        <Stack gap="sm">
          <Text variant="body-sm" color="content-secondary">Total em reais</Text>
          <div className={hasPending ? 'opacity-40' : ''}>
            <Amount value={totalBrl} currency="R$" size="lg" />
          </div>
          {totalYieldBrl > 0 && !hasPending && (
            <Text variant="caption" className="text-[var(--color-feedback-success)]">
              +R$ {totalYieldBrl.toFixed(2).replace('.', ',')} rendendo hoje
            </Text>
          )}
        </Stack>

        {hasPending && <PendingDepositBanner />}

        {/* Caixinha list */}
        {caixinhas.length > 0 ? (
          <Stack gap="sm">
            {caixinhas.map((c) => (
              <CaixinhaListCard
                key={c.id}
                caixinha={c}
                onPress={() => handleTapCaixinha(c.id)}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState />
        )}

        {/* Create new */}
        <Button
          fullWidth
          variant={caixinhas.length > 0 ? 'primary' : 'accent'}
          onPress={handleCreate}
        >
          <Stack direction="row" gap="sm" align="center">
            <RiAddLine size={18} />
            <Text variant="body-md" className="font-semibold">Nova Caixinha</Text>
          </Stack>
        </Button>
      </Stack>

      <StickyFooter>
        <div>{/* TabBar placeholder — this is a level-1 page */}</div>
      </StickyFooter>
    </FeatureLayout>
  )
}
