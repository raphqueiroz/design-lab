/**
 * @screen Asset Page
 * @description Detail page for a single asset. Has invested and not-invested states
 *   with chart, details, shortcuts, and transaction history.
 */
import { useState, useCallback, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import type { LineChartCrosshairData } from '@/library/display/LineChart'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Header from '@/library/navigation/Header'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import GroupHeader from '@/library/navigation/GroupHeader'
import ShortcutButton from '@/library/inputs/ShortcutButton'
import Button from '@/library/inputs/Button'
import Avatar from '@/library/display/Avatar'
import Badge from '@/library/display/Badge'
import LineChart from '@/library/display/LineChart'
import Text from '@/library/foundations/Text'
import { RiArrowDownLine, RiArrowUpLine, RiHistoryLine } from '@remixicon/react'

import { BalanceDisplay, DetailsTab, HistoryTab, InfoTab } from './Screen4_AssetPage.parts'
import {
  type AssetTicker,
  getAsset,
  getPosition,
  isVolatile,
  formatPercentChange,
  CATEGORY_INFO,
  CATEGORY_BADGE_VARIANT,
  getCurrencySymbol,
  generatePriceChartData,
  generateYieldChartData,
  getMockTransactions,
} from './shared/data'

interface ScreenData {
  ticker?: AssetTicker
  invested?: boolean
  [key: string]: unknown
}

const TIME_RANGES = ['24h', '1S', '1M', '1A', '5A'] as const
const RANGE_DAYS: Record<string, number> = { '24h': 1, '1S': 7, '1M': 30, '1A': 365, '5A': 1825 }

export default function Screen4_AssetPage({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const ticker = data.ticker ?? 'BTC'
  const asset = getAsset(ticker)
  const vol = isVolatile(asset)
  const position = data.invested !== false ? getPosition(ticker) : undefined
  const hasPosition = !!position

  const [activeTab, setActiveTab] = useState(0)
  const [timeRange, setTimeRange] = useState(2) // default 1M
  const [crosshairPoint, setCrosshairPoint] = useState<LineChartCrosshairData | null>(null)
  const handleCrosshairMove = useCallback((p: LineChartCrosshairData | null) => setCrosshairPoint(p), [])

  const chartData = useMemo(() => {
    const days = RANGE_DAYS[TIME_RANGES[timeRange]]
    if (vol) return generatePriceChartData(days, asset.price!, 0.03)
    const balance = position ? position.currentValue : 1000
    return generateYieldChartData(days, balance, asset.apy!)
  }, [timeRange, vol, asset, position])

  const transactions = useMemo(() => getMockTransactions(ticker), [ticker])

  const displayValue = crosshairPoint
    ? crosshairPoint.value
    : hasPosition
      ? position!.currentValue
      : (vol ? asset.price! : 0)

  const symbol = vol ? 'R$' : getCurrencySymbol(ticker)

  const handleBuy = () => {
    const label = vol ? 'ShortcutButton: Comprar' : 'ShortcutButton: Adicionar'
    const resolved = onElementTap?.(label)
    if (!resolved) onNext()
  }

  const handleSell = () => {
    const label = vol ? 'ShortcutButton: Vender' : 'ShortcutButton: Resgatar'
    const resolved = onElementTap?.(label)
    if (!resolved) onNext()
  }

  const handleHistorico = () => {
    const resolved = onElementTap?.('ShortcutButton: Histórico')
    if (!resolved) onNext()
  }

  const handleBuyButton = () => {
    const label = vol ? 'Button: Comprar' : 'Button: Investir'
    const resolved = onElementTap?.(label)
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="" onBack={onBack} />

      <Stack gap="lg">
        {/* Gradient header card */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--color-brand-core-500)] to-[var(--color-brand-core-300)] p-5">
          <Stack gap="default">
            <Stack direction="row" gap="default" align="center">
              <Avatar src={asset.icon} size="lg" />
              <Stack gap="none" className="flex-1">
                <Text variant="heading-md" className="text-white">{asset.name}</Text>
                <Stack direction="row" gap="sm" align="center" className="mt-1">
                  <Badge variant={CATEGORY_BADGE_VARIANT[asset.category]} size="md">
                    {CATEGORY_INFO[asset.category].label}
                  </Badge>
                  {!vol && (
                    <Badge variant="lime" size="md">{asset.apyDisplay}</Badge>
                  )}
                </Stack>
              </Stack>
            </Stack>

            {hasPosition ? (
              <Stack gap="none">
                <Text variant="body-sm" className="text-white/70">
                  {vol ? 'Valor em carteira' : 'Saldo investido'}
                </Text>
                <BalanceDisplay value={displayValue} symbol={symbol} inverted />
                {vol && asset.change24h !== undefined && (
                  <Text
                    variant="body-sm"
                    className={asset.change24h >= 0 ? 'text-white/80' : 'text-[#ff9999]'}
                  >
                    {formatPercentChange(asset.change24h)} hoje
                  </Text>
                )}
              </Stack>
            ) : (
              <Stack gap="none">
                <Text variant="body-sm" className="text-white/70">
                  {vol ? 'Preço atual' : 'Rendimento'}
                </Text>
                {vol ? (
                  <>
                    <BalanceDisplay value={asset.price!} symbol="R$" inverted />
                    <Text
                      variant="body-sm"
                      className={asset.change24h! >= 0 ? 'text-white/80' : 'text-[#ff9999]'}
                    >
                      {formatPercentChange(asset.change24h!)} nas últimas 24h
                    </Text>
                  </>
                ) : (
                  <Text variant="heading-lg" className="text-white">{asset.apyDisplay}</Text>
                )}
              </Stack>
            )}
          </Stack>
        </div>

        {/* Chart */}
        <LineChart data={chartData} height={180} onCrosshairMove={handleCrosshairMove} />

        {/* Time range selector (volatile only) */}
        {vol && (
          <SegmentedControl
            segments={[...TIME_RANGES]}
            activeIndex={timeRange}
            onChange={setTimeRange}
          />
        )}

        {hasPosition ? (
          <>
            {/* Shortcuts */}
            <Stack direction="row" gap="default" align="center">
              <ShortcutButton
                icon={<RiArrowDownLine size={22} />}
                label={vol ? 'Comprar' : 'Adicionar'}
                variant="primary"
                onPress={handleBuy}
              />
              <ShortcutButton
                icon={<RiArrowUpLine size={22} />}
                label={vol ? 'Vender' : 'Resgatar'}
                variant="secondary"
                onPress={handleSell}
              />
              <ShortcutButton
                icon={<RiHistoryLine size={22} />}
                label="Histórico"
                variant="secondary"
                onPress={handleHistorico}
                disabled
              />
            </Stack>

            {/* Tabs */}
            <SegmentedControl
              segments={['Detalhes', 'Histórico']}
              activeIndex={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === 0 && <DetailsTab asset={asset} position={position!} />}
            {activeTab === 1 && <HistoryTab transactions={transactions} />}
          </>
        ) : (
          <>
            {/* Not invested — description + info */}
            <Text variant="body-md" color="content-secondary">{asset.description}</Text>

            <Stack gap="none">
              <GroupHeader text="Informações" />
              <InfoTab asset={asset} />
            </Stack>
          </>
        )}
      </Stack>

      {/* CTA for not-invested state */}
      {!hasPosition && (
        <StickyFooter>
          <Button variant="accent" size="lg" fullWidth onPress={handleBuyButton}>
            {vol ? 'Comprar' : 'Investir'}
          </Button>
        </StickyFooter>
      )}
    </BaseLayout>
  )
}
