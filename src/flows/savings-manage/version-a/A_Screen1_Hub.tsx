import { useState, useCallback } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import type { LineChartCrosshairData } from '../../../library/display/LineChart'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import Header from '../../../library/navigation/Header'
import SegmentedControl from '../../../library/navigation/SegmentedControl'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import ProgressBar from '../../../library/display/ProgressBar'
import LineChart from '../../../library/display/LineChart'
import Text from '../../../library/foundations/Text'
import { RiArrowUpLine, RiArrowDownLine, RiFlagLine, RiEditLine } from '@remixicon/react'
import { MOCK_YIELD_DATA, BalanceDisplay, DetailsTab, HistoryTab } from './A_Screen1_Hub.parts'

const CURRENT_BALANCE = 1250.00
const CURRENT_GAINS = 5.21
const GOAL_AMOUNT = 5000.00

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ScreenData {
  tab?: number
  hasGoal?: boolean
  goalReached?: boolean
}

export default function Screen1_Hub({ onNext, onElementTap }: FlowScreenProps) {
  const { tab: initialTab, hasGoal, goalReached } = useScreenData<ScreenData>()
  const [activeTab, setActiveTab] = useState(initialTab ?? 0)
  const [crosshairPoint, setCrosshairPoint] = useState<LineChartCrosshairData | null>(null)

  const handleCrosshairMove = useCallback((point: LineChartCrosshairData | null) => {
    setCrosshairPoint(point)
  }, [])

  const displayValue = crosshairPoint ? crosshairPoint.value : CURRENT_BALANCE
  const displayGains = crosshairPoint
    ? crosshairPoint.value - MOCK_YIELD_DATA[0].value
    : CURRENT_GAINS
  const displayLabel = crosshairPoint
    ? formatDate(crosshairPoint.time)
    : '+US$ ' + CURRENT_GAINS.toFixed(2).replace('.', ',') + ' este mês'

  const handleAdicionar = () => {
    const resolved = onElementTap?.('ShortcutButton: Adicionar')
    if (!resolved) onNext()
  }

  const handleResgatar = () => {
    const resolved = onElementTap?.('ShortcutButton: Resgatar')
    if (!resolved) onNext()
  }

  const handleGoal = () => {
    const label = hasGoal ? 'ShortcutButton: Editar meta' : 'ShortcutButton: Criar meta'
    const resolved = onElementTap?.(label)
    if (!resolved) onNext()
  }

  const handleViewPolicy = () => {
    const resolved = onElementTap?.('Button: Ver apólice')
    if (!resolved) onNext()
  }

  const effectiveBalance = goalReached ? GOAL_AMOUNT : CURRENT_BALANCE
  const goalProgress = goalReached ? 100 : (CURRENT_BALANCE / GOAL_AMOUNT) * 100

  return (
    <BaseLayout>
      <Header title="Caixinha" description="Seus dólares rendendo até a sua próxima viagem." />

      <Stack gap="lg">
        <Stack gap="none">
          <LineChart
            data={MOCK_YIELD_DATA}
            height={180}
            onCrosshairMove={handleCrosshairMove}
          />
          <Stack gap="sm">
            <Text variant="body-sm" color="content-secondary">Total guardado</Text>
            <BalanceDisplay value={displayValue} />
            {hasGoal && !crosshairPoint && (
              <Stack gap="none" className="mt-1">
                <ProgressBar value={goalProgress} className={goalReached ? '[&>div]:bg-[var(--color-feedback-success)]' : ''} />
                <Text variant="caption" color="content-tertiary" className="mt-1.5">
                  {goalReached
                    ? 'Meta atingida!'
                    : `US$ ${CURRENT_BALANCE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de US$ ${GOAL_AMOUNT.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </Text>
              </Stack>
            )}
            <Text
              variant="body-sm"
              className={displayGains >= 0 ? 'text-[var(--color-feedback-success)]' : 'text-[var(--color-feedback-error)]'}
            >
              {crosshairPoint
                ? `${displayGains >= 0 ? '+' : ''}US$ ${Math.abs(displayGains).toFixed(2).replace('.', ',')}`
                : displayLabel}
            </Text>
          </Stack>
        </Stack>

        <Stack direction="row" gap="default" align="center">
          <ShortcutButton
            icon={<RiArrowDownLine size={22} />}
            label="Adicionar"
            variant="primary"
            onPress={handleAdicionar}
          />
          <ShortcutButton
            icon={<RiArrowUpLine size={22} />}
            label="Resgatar"
            variant="secondary"
            onPress={handleResgatar}
          />
          <ShortcutButton
            icon={hasGoal ? <RiEditLine size={22} /> : <RiFlagLine size={22} />}
            label={hasGoal ? 'Editar meta' : 'Criar meta'}
            variant="secondary"
            onPress={handleGoal}
          />
        </Stack>

        <SegmentedControl
          segments={['Detalhes', 'Histórico']}
          activeIndex={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 0 && <DetailsTab onViewPolicy={handleViewPolicy} />}
        {activeTab === 1 && <HistoryTab />}
      </Stack>
    </BaseLayout>
  )
}
