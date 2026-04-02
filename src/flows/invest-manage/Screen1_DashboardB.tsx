/**
 * @screen Investments Dashboard B
 * @description Design iteration of the investments dashboard.
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
import investHeaderBg from '@/assets/images/invest-header-bg.jpg'

import {
  MOCK_POSITIONS,
  getAsset,
  getPortfolioTotal,
  formatUSD,
  formatPercentChange,
  generatePortfolioChartData,
  isVolatile,
  CATEGORY_INFO,
} from './shared/data'

interface ScreenData {
  isEmpty?: boolean
  [key: string]: unknown
}

export default function Screen1_DashboardB({ onNext, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const isEmpty = data.isEmpty ?? false

  const positions = isEmpty ? [] : MOCK_POSITIONS
  const total = getPortfolioTotal()
  const chartData = generatePortfolioChartData(30)

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
        <Header title="Meus Investimentos" />
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
      imageBgColor="#1A4D3D"
      imageBgImage={`url(${investHeaderBg})`}
      imageBgSize="cover"
      imageBgPosition="center top"
      imageMaxHeight={340}
      imageHeader={
        <>
          <Stack gap="default" className="relative z-10 pt-[var(--safe-area-top)]">
            <Header title="Meus Investimentos" />
            <BalanceDisplay value={total} symbol="US$" />
            <Stack direction="row" gap="sm" align="center">
              <Text variant="body-md" className="font-medium tracking-tight">
                {totalPL >= 0 ? '↑' : '↓'} {formatUSD(Math.abs(totalPL))}
              </Text>
              <Text variant="body-md" color="content-secondary" className="font-medium tracking-tight">
                {formatPercentChange(totalPLPct)}
              </Text>
            </Stack>

            {/* Chart inside header — full-bleed */}
            <div className="-mx-6 mt-2">
              <LineChart data={chartData} height={100} variant="line" lastPointMarker lineWidth={3} smooth color="var(--color-content-primary)" />
            </div>
          </Stack>
        </>
      }
    >
      <Stack gap="lg">
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
                    subtitle={pos.asset}
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
