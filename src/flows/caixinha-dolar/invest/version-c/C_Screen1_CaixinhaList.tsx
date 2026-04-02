import { RiAddLine, RiSafeLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../../lib/ScreenDataContext'
import Header from '../../../../library/navigation/Header'
import BaseLayout from '../../../../library/layout/BaseLayout'
import Stack from '../../../../library/layout/Stack'
import Button from '../../../../library/inputs/Button'
import Amount from '../../../../library/display/Amount'
import Badge from '../../../../library/display/Badge'
import Text from '../../../../library/foundations/Text'
import EmptyState from '../../../../library/feedback/EmptyState'

import { CaixinhaListItem } from './C_Screen1_CaixinhaList.parts'
import { MOCK_CAIXINHAS, formatUsd } from '../../shared/data'

export default function C_Screen1_CaixinhaList({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()

  const caixinhas = isNewUser ? [] : MOCK_CAIXINHAS
  const totalBalance = caixinhas.reduce((sum, c) => sum + c.balance, 0)
  const totalYield = caixinhas.reduce((sum, c) => sum + c.yieldToday, 0)

  const handleTapCaixinha = (id: string) => {
    const resolved = onElementTap?.(`ListItem: ${id}`)
    if (!resolved) onNext()
  }

  const handleCreate = () => {
    const resolved = onElementTap?.('Button: Nova Caixinha')
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Minhas Caixinhas" onBack={onBack} />

      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Stack direction="row" gap="sm" align="center">
            <Text variant="caption" color="content-secondary">Total investido</Text>
            <Badge variant="lime" size="sm">5% a.a.</Badge>
          </Stack>
          <Amount value={totalBalance} currency="US$" size="lg" />
          {totalYield > 0 && (
            <Text variant="caption" className="text-[#22c55e]">
              +{formatUsd(totalYield)} hoje
            </Text>
          )}
        </Stack>

        {caixinhas.length > 0 ? (
          <Stack gap="sm">
            {caixinhas.map((c) => (
              <CaixinhaListItem
                key={c.id}
                caixinha={c}
                onPress={() => handleTapCaixinha(c.id)}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            icon={<RiSafeLine size={40} />}
            title="Comece a guardar seus dólares"
            description="Crie caixinhas para organizar seus objetivos e ganhe 5% ao ano em cada uma."
          />
        )}

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
    </BaseLayout>
  )
}
