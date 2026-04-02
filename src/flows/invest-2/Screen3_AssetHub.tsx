/**
 * Asset Hub — inspired by savings-manage/Screen2_Hub.tsx
 * Gradient header card, balance/price display, chart, shortcuts, tabs.
 * States: invested (has position) vs not-invested (info only).
 */
import { useState, useCallback, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import type { LineChartCrosshairData } from '@/library/display/LineChart'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import BottomSheet from '@/library/layout/BottomSheet'
import Header from '@/library/navigation/Header'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import GroupHeader from '@/library/navigation/GroupHeader'
import ShortcutButton from '@/library/inputs/ShortcutButton'
import Button from '@/library/inputs/Button'
import Badge from '@/library/display/Badge'
import Avatar from '@/library/display/Avatar'
import ListItem from '@/library/display/ListItem'
import LineChart from '@/library/display/LineChart'
import Text from '@/library/foundations/Text'
import Summary from '@/library/display/Summary'
import { RiArrowDownLine, RiArrowUpLine, RiHistoryLine, RiPercentLine, RiTimeLine, RiShieldCheckLine, RiMoreLine, RiStarLine, RiStarFill, RiDownloadLine, RiUploadLine } from '@remixicon/react'
import type { AssetTicker } from './shared/data'
import {
  getAsset, getPosition, isVolatile, isFavorite,
  formatBRL, formatPercentChange,
  generatePriceChartData, generateYieldChartData,
  CATEGORY_BADGE_VARIANT, CATEGORY_INFO,
} from './shared/data'
import { BalanceDisplay, DetailsTabInvested, DetailsTabInfo, HistoryTab } from './Screen3_AssetHub.parts'

const TIME_RANGES = ['24h', '1S', '1M', '1A', '5A']
const DAYS_MAP: Record<string, number> = { '24h': 1, '1S': 7, '1M': 30, '1A': 365, '5A': 1825 }

interface ScreenData extends Record<string, unknown> {
  assetTicker?: AssetTicker
  invested?: boolean
}

export default function Screen3_AssetHub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const ticker = data.assetTicker ?? 'BTC'
  const asset = getAsset(ticker)
  const position = data.invested !== false ? getPosition(ticker) : undefined
  const hasPosition = !!position
  const volatile = isVolatile(asset)

  const [activeTab, setActiveTab] = useState(0)
  const [rangeIndex, setRangeIndex] = useState(2) // 1M default
  const [crosshairPoint, setCrosshairPoint] = useState<LineChartCrosshairData | null>(null)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false)
  const fav = isFavorite(ticker)

  const selectedRange = TIME_RANGES[rangeIndex]
  const days = DAYS_MAP[selectedRange]

  const chartData = useMemo(() => {
    if (volatile) {
      return generatePriceChartData(days, asset.price!, selectedRange === '24h' ? 0.02 : 0.05)
    }
    // Fixed income: yield curve from position balance or mock 1000
    const balance = position?.currentValue ?? 1000
    return generateYieldChartData(days, balance, asset.apy ?? 0.04)
  }, [volatile, days, asset, selectedRange, position])

  const handleCrosshairMove = useCallback((p: LineChartCrosshairData | null) => setCrosshairPoint(p), [])

  const handleDeposit = () => {
    const label = volatile ? 'ShortcutButton: Comprar' : 'ShortcutButton: Adicionar'
    const handled = onElementTap?.(label)
    if (!handled) onNext()
  }
  const handleWithdraw = () => {
    const label = volatile ? 'ShortcutButton: Vender' : 'ShortcutButton: Resgatar'
    const handled = onElementTap?.(label)
    if (!handled) onNext()
  }
  const handleInvest = () => {
    const label = volatile ? 'Button: Comprar' : 'Button: Investir'
    const handled = onElementTap?.(label)
    if (!handled) onNext()
  }
  const handleReceive = () => {
    setMoreSheetOpen(false)
    const handled = onElementTap?.('ListItem: Depositar')
    if (!handled) onNext()
  }
  const handleSend = () => {
    setMoreSheetOpen(false)
    const handled = onElementTap?.('ListItem: Enviar')
    if (!handled) onNext()
  }

  // Gradient colors by category
  const gradientClass = asset.category === 'crypto'
    ? 'from-[#1a1a2e] to-[#16213e]'
    : asset.category === 'commodity'
      ? 'from-[#2d2006] to-[#4a3810]'
      : 'from-[var(--color-brand-core-500)] to-[var(--color-brand-core-300)]'

  return (
    <BaseLayout>
      <Header
        title=""
        onBack={onBack}
        rightAction={
          <button className="p-2 text-content-tertiary">
            {fav
              ? <RiStarFill size={22} className="text-[var(--color-feedback-warning)]" />
              : <RiStarLine size={22} />
            }
          </button>
        }
      />

      <Stack gap="lg">
        {/* ── Gradient Header Card ── */}
        <div className={`rounded-2xl bg-gradient-to-br ${gradientClass} p-5`}>
          <Stack gap="default">
            <Stack direction="row" gap="default" align="center">
              <Avatar src={asset.icon} size="lg" bgColor="rgba(255,255,255,0.15)" />
              <Stack gap="none" className="flex-1">
                <Text variant="heading-md" className="text-white">{asset.name}</Text>
                <Stack direction="row" gap="sm" align="center" className="mt-1">
                  <Badge variant={CATEGORY_BADGE_VARIANT[asset.category]} size="md">
                    {CATEGORY_INFO[asset.category].label}
                  </Badge>
                  {!volatile && (
                    <Badge variant="success" size="md">Resgate imediato</Badge>
                  )}
                </Stack>
              </Stack>
            </Stack>

            {/* Invested — show balance */}
            {hasPosition && (
              <Stack gap="none">
                <Text variant="body-sm" className="text-white/70">
                  {volatile ? 'Valor investido' : 'Saldo atual'}
                </Text>
                <BalanceDisplay value={position.currentValue} symbol="R$" inverted />
                {volatile && asset.change24h !== undefined && (
                  <Badge variant={asset.change24h >= 0 ? 'success' : 'error'} size="sm">
                    {formatPercentChange(asset.change24h)}
                  </Badge>
                )}
              </Stack>
            )}

            {/* Not invested — show price or APY */}
            {!hasPosition && (
              <Stack gap="none">
                {volatile ? (
                  <>
                    <Text variant="body-sm" className="text-white/70">Preço atual</Text>
                    <BalanceDisplay value={asset.price!} symbol="R$" inverted />
                    {asset.change24h !== undefined && (
                      <Badge variant={asset.change24h >= 0 ? 'success' : 'error'} size="sm">
                        {formatPercentChange(asset.change24h)} (24h)
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Text variant="body-sm" className="text-white/70">Rendimento</Text>
                    <Text variant="display" className="text-white">{asset.apyDisplay}</Text>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </div>

        {/* ── Chart + Time Range ── */}
        {(volatile || hasPosition) && (
          <>
            {volatile && (
              <SegmentedControl
                segments={TIME_RANGES}
                activeIndex={rangeIndex}
                onChange={setRangeIndex}
              />
            )}
            <LineChart
              data={chartData}
              height={160}
              variant={volatile ? 'line' : 'baseline'}
              onCrosshairMove={handleCrosshairMove}
            />
            {crosshairPoint && (
              <Text variant="body-sm" color="content-secondary" align="center">
                {formatBRL(crosshairPoint.value)}
              </Text>
            )}
          </>
        )}

        {/* ── Not invested — benefits summary (fixed income) ── */}
        {!hasPosition && !volatile && (
          <Summary
            data={[
              { icon: <RiPercentLine size={20} />, title: 'Rendimento automático', description: 'Seu saldo rende todos os dias' },
              { icon: <RiTimeLine size={20} />, title: 'Resgate imediato', description: 'Retire a qualquer momento' },
              { icon: <RiShieldCheckLine size={20} />, title: 'Proteção', description: 'Cobertura inclusa contra falhas técnicas' },
            ]}
          />
        )}

        {/* ── Shortcut Buttons (invested only) ── */}
        {hasPosition && (
          <Stack direction="row" gap="default" align="center">
            <ShortcutButton
              icon={<RiArrowDownLine size={22} />}
              label={volatile ? 'Comprar' : 'Adicionar'}
              variant="primary"
              onPress={handleDeposit}
            />
            <ShortcutButton
              icon={<RiArrowUpLine size={22} />}
              label={volatile ? 'Vender' : 'Resgatar'}
              variant="secondary"
              onPress={handleWithdraw}
            />
            <ShortcutButton
              icon={<RiHistoryLine size={22} />}
              label="Histórico"
              variant="secondary"
              onPress={() => setActiveTab(1)}
            />
            <ShortcutButton
              icon={<RiMoreLine size={22} />}
              label="Mais"
              variant="secondary"
              onPress={() => setMoreSheetOpen(true)}
            />
          </Stack>
        )}

        {/* ── Tabs (invested: Detalhes / Histórico) ── */}
        {hasPosition && (
          <>
            <SegmentedControl
              segments={['Detalhes', 'Histórico']}
              activeIndex={activeTab}
              onChange={setActiveTab}
            />
            {activeTab === 0 && (
              <>
                <GroupHeader text="Detalhes" />
                <DetailsTabInvested asset={asset} position={position} />
              </>
            )}
            {activeTab === 1 && (
              <>
                <GroupHeader text="Histórico" />
                <HistoryTab asset={asset} />
              </>
            )}
          </>
        )}

        {/* ── Info section (not invested) ── */}
        {!hasPosition && (
          <>
            <GroupHeader text="Sobre" />
            <Text variant="body-md" color="content-secondary">{asset.description}</Text>
            <GroupHeader text="Informações" />
            <DetailsTabInfo asset={asset} />
          </>
        )}
      </Stack>

      {/* ── CTA (not invested) ── */}
      {!hasPosition && (
        <StickyFooter>
          <Stack gap="sm">
            <Button fullWidth onPress={handleInvest}>
              {volatile ? 'Comprar' : 'Investir'}
            </Button>
            <Button fullWidth variant="primary" onPress={handleReceive}>
              Depositar
            </Button>
          </Stack>
        </StickyFooter>
      )}

      {/* ── More BottomSheet (invested) ── */}
      <BottomSheet open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} title="Mais opções">
        <Stack gap="none">
          <ListItem
            title="Enviar"
            subtitle="Transferir para outra carteira"
            left={<Avatar icon={<RiUploadLine size={20} />} size="md" />}
            onPress={handleSend}
          />
          <ListItem
            title="Depositar"
            subtitle="Receber de outra carteira"
            left={<Avatar icon={<RiDownloadLine size={20} />} size="md" />}
            onPress={handleReceive}
          />
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
