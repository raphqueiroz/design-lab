/**
 * @screen Investments Dashboard
 * @description Hub where users see their portfolio total, daily P&L,
 *   positions list, and access to explore new investments.
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import FeatureLayout from '@/library/layout/FeatureLayout'
import Stack from '@/library/layout/Stack'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import GroupHeader from '@/library/navigation/GroupHeader'
import Button from '@/library/inputs/Button'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import LineChart from '@/library/display/LineChart'
import Text from '@/library/foundations/Text'

import { RiRocketLine } from '@remixicon/react'
import { BalanceDisplay } from './Screen4_AssetPage.parts'

import { useCallback, useMemo } from 'react'
import {
  MOCK_POSITIONS,
  getAsset,
  getPortfolioTotal,
  formatUSD,
  formatQuantity,
  formatPercentChange,
  generatePortfolioChartData,
  isVolatile,
  CATEGORY_INFO,
} from './shared/data'

interface ScreenData {
  isEmpty?: boolean
  [key: string]: unknown
}

export default function Screen1_Dashboard({ onNext, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const isEmpty = data.isEmpty ?? false

  const positions = isEmpty ? [] : MOCK_POSITIONS
  const total = getPortfolioTotal()
  const chartData = useMemo(() => generatePortfolioChartData(30), [])
  const chartStart = chartData[0]?.value ?? total

  const chartTooltip = useCallback((value: number) => {
    const pl = value - chartStart
    const sign = pl >= 0 ? '↑ ' : '↓ '
    return `${sign}${formatUSD(Math.abs(pl))}`
  }, [chartStart])

  // Calculate total P&L
  const totalInvested = MOCK_POSITIONS.reduce((sum, p) => sum + p.avgCost * p.quantity, 0)
  const totalPL = total - totalInvested
  const totalPLPct = (totalPL / totalInvested) * 100

  const handleTapPosition = (ticker: string) => {
    const resolved = onElementTap?.(`ListItem: ${ticker}`)
    if (!resolved) onNext()
  }

  const handleExplorarButton = () => {
    const resolved = onElementTap?.('Button: Explorar investimentos')
    if (!resolved) onNext()
  }

  if (isEmpty) {
    return (
      <BaseLayout>
        <Header title="Investimentos" />
        <Stack gap="lg" className="flex-1 items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-interactive-secondary)] flex items-center justify-center">
            <RiRocketLine size={32} className="text-[var(--color-content-secondary)]" />
          </div>
          <Stack gap="sm">
            <Text variant="heading-md">Comece a investir</Text>
            <Text variant="body-md" color="content-secondary">
              Criptomoedas, ouro, prata e renda fixa digital. Tudo em um só lugar, com resgate simples.
            </Text>
          </Stack>
        </Stack>
        <StickyFooter>
          <Button variant="accent" size="lg" fullWidth onPress={handleExplorarButton}>
            Explorar investimentos
          </Button>
        </StickyFooter>
      </BaseLayout>
    )
  }

  return (
    <FeatureLayout
      imageBgColor="#FFFFFF"
      imageMaxHeight={340}
      parallax
      imageHeader={
        <>
          <Stack gap="lg" className="absolute top-[54px] left-[var(--token-spacing-6)] right-[var(--token-spacing-6)] z-10">
            <Header title="Investimentos" />
            <Stack gap="none" className="gap-1.5">
            <Text variant="body-sm" color="content-secondary">Total investido</Text>
            <BalanceDisplay value={total} symbol="US$" />
            <Stack direction="row" gap="sm" align="center">
              <Text variant="body-md" className="font-medium tracking-tight">
                {totalPL >= 0 ? '↑' : '↓'} {formatUSD(Math.abs(totalPL))}
              </Text>
              <Text variant="body-md" color="content-secondary" className="font-medium tracking-tight">
                ({totalPLPct >= 0 ? '+' : ''}{totalPLPct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%)
              </Text>
            </Stack>
            </Stack>
          </Stack>

          {/* Area chart + solid lime base strip — break out of parent padding */}
          <div className="absolute bottom-0 -left-[var(--token-spacing-6)] -right-[var(--token-spacing-6)]">
            <LineChart data={chartData} height={100} variant="area" lineWidth={3} smooth color="#B2FC1C" fillColor="#B2FC1C" tooltipFormatter={chartTooltip} />
            <div className="h-[64px] bg-[#B2FC1C]" />
          </div>
        </>
      }
    >
      <Stack gap="lg">
        <ListItem
          title="Investir"
          subtitle="Explorar mais produtos"
          left={<Avatar icon={<RiRocketLine size={20} />} size="md" />}
          onPress={handleExplorarButton}
        />
        {/* Positions by category */}
        {(['crypto', 'commodity', 'fixed-income'] as const).map((cat) => {
          const catPositions = positions.filter((p) => getAsset(p.asset).category === cat)
          if (catPositions.length === 0) return null
          const catTotal = catPositions.reduce((sum, p) => sum + p.currentValue, 0)
          return (
            <Stack key={cat} gap="none">
              <GroupHeader text={CATEGORY_INFO[cat].label} rightText={formatUSD(catTotal)} />
              {catPositions.map((pos) => {
                const asset = getAsset(pos.asset)
                const plPct = ((pos.currentValue - pos.avgCost * pos.quantity) / (pos.avgCost * pos.quantity)) * 100
                return (
                  <ListItem
                    key={pos.asset}
                    title={asset.name}
                    subtitle={formatQuantity(pos.quantity, pos.asset)}
                    left={<Avatar src={asset.icon} size="md" />}
                    right={
                      <Stack gap="none" align="end">
                        <Text variant="body-md" className="font-medium">{formatUSD(pos.currentValue)}</Text>
                        <Text
                          variant="body-sm"
                          className={`font-medium ${isVolatile(asset)
                            ? (plPct >= 0 ? 'text-[var(--color-feedback-success)]' : 'text-[var(--color-feedback-error)]')
                            : 'text-[var(--color-content-secondary)]'}`}
                        >
                          {isVolatile(asset)
                            ? formatPercentChange(plPct)
                            : (asset.apyDisplay ?? CATEGORY_INFO[asset.category].label)}
                        </Text>
                      </Stack>
                    }
                    trailing={null}
                    className="[&>div>div:first-child>span:first-child]:!font-semibold"
                    onPress={() => handleTapPosition(pos.asset)}
                  />
                )
              })}
            </Stack>
          )
        })}
      </Stack>
    </FeatureLayout>
  )
}
