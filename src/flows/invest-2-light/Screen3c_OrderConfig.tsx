/**
 * Screen3c_OrderConfig — Programmed order configuration.
 * Edge-to-edge chart with draggable price lines (Entry, TP, SL).
 * Toggle rows with descriptions show configured values. No DataList summary.
 */
import { useState, useMemo, useCallback } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import Toggle from '@/library/inputs/Toggle'
import Text from '@/library/foundations/Text'
import GroupHeader from '@/library/navigation/GroupHeader'
import LineChart from '@/library/display/LineChart'
import {
  getAsset, isVolatile, generatePriceChartData,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import {
  DraggablePriceLine, TimeRangePills, ChartPriceLabels, PriceEditSheet,
  TIME_RANGES, pctFromPrice, priceToY, formatPriceInt,
} from './Screen3c_OrderConfig.parts'

export default function Screen3c_OrderConfig({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{
    assetTicker?: AssetTicker
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100

  // Programmed buy toggle (on by default)
  const [programmedEnabled, setProgrammedEnabled] = useState(true)

  // Entry price (draggable)
  const [entryPrice, setEntryPrice] = useState(currentPrice)

  // TP/SL state
  const [tpEnabled, setTpEnabled] = useState(false)
  const [slEnabled, setSlEnabled] = useState(false)
  const [tpPrice, setTpPrice] = useState(() => Math.round(currentPrice * 1.1))
  const [slPrice, setSlPrice] = useState(() => Math.round(currentPrice * 0.9))
  const [entrySheetOpen, setEntrySheetOpen] = useState(false)
  const [tpSheetOpen, setTpSheetOpen] = useState(false)
  const [slSheetOpen, setSlSheetOpen] = useState(false)

  // Time range
  const [activeRange, setActiveRange] = useState(2)

  // Chart data
  const chartData = useMemo(
    () => generatePriceChartData(TIME_RANGES[activeRange].days, currentPrice, 0.025),
    [currentPrice, activeRange],
  )

  const chartMinPrice = useMemo(
    () => Math.min(...chartData.map(d => d.value)),
    [chartData],
  )

  const chartRange = useMemo(() => {
    const values = chartData.map(d => d.value)
    const dataMin = Math.min(...values)
    const dataMax = Math.max(...values)
    const tenPctAbove = currentPrice * 1.1
    const min = Math.min(dataMin, slEnabled ? slPrice : dataMin)
    const max = Math.max(dataMax, tpEnabled ? tpPrice : dataMax, tenPctAbove)
    const padding = (max - min) * 0.12
    return { min: min - padding, max: max + padding }
  }, [chartData, tpEnabled, slEnabled, tpPrice, slPrice, currentPrice])

  const yToPrice = useCallback((yPct: number) => {
    const normalized = 1 - (yPct / 100)
    return chartRange.min + normalized * (chartRange.max - chartRange.min)
  }, [chartRange])

  const handleEntryDrag = useCallback((yPct: number) => {
    const price = Math.round(yToPrice(yPct))
    if (price > 0) setEntryPrice(price)
  }, [yToPrice])

  const handleTpDrag = useCallback((yPct: number) => {
    const price = Math.round(yToPrice(yPct))
    if (price > entryPrice) setTpPrice(price)
  }, [yToPrice, entryPrice])

  const handleSlDrag = useCallback((yPct: number) => {
    const price = Math.round(yToPrice(yPct))
    if (price < entryPrice && price > 0) setSlPrice(price)
  }, [yToPrice, entryPrice])

  const handleEntryConfirm = useCallback((price: number) => {
    setEntryPrice(Math.round(price))
  }, [])

  const handleTpConfirm = useCallback((price: number) => {
    setTpPrice(Math.round(price))
  }, [])

  const handleSlConfirm = useCallback((price: number) => {
    setSlPrice(Math.round(price))
  }, [])

  return (
    <BaseLayout>
      <Header title="Configurar ordem" onBack={onBack} />

      {/* Edge-to-edge chart */}
      <div className="relative -mx-[var(--token-spacing-6)]">
        <LineChart
          data={chartData}
          height={280}
          variant="area"
          color={palette.accent}
          smooth
          lineWidth={2}
          showTimeScale
          noInteraction
        />

        <ChartPriceLabels
          currentPrice={currentPrice}
          minPrice={chartMinPrice}
          accentColor={palette.accent}
        />

        {/* Draggable price line overlays — constrained to chart area */}
        <div className="absolute left-0 right-0 top-0" style={{ bottom: 32 }}>
          <DraggablePriceLine
            price={entryPrice}
            label="Entrada"
            color="#000000"
            y={priceToY(entryPrice, chartRange)}
            onDrag={handleEntryDrag}
            onTap={() => setEntrySheetOpen(true)}
            solid
            dark
          />
          {tpEnabled && (
            <DraggablePriceLine
              price={tpPrice}
              label="TP"
              color="#10B981"
              y={priceToY(tpPrice, chartRange)}
              onDrag={handleTpDrag}
              onTap={() => setTpSheetOpen(true)}
            />
          )}
          {slEnabled && (
            <DraggablePriceLine
              price={slPrice}
              label="SL"
              color="#EF4444"
              y={priceToY(slPrice, chartRange)}
              onDrag={handleSlDrag}
              onTap={() => setSlSheetOpen(true)}
            />
          )}
        </div>

        <TimeRangePills activeIndex={activeRange} onChange={setActiveRange} />
      </div>

      {/* Toggle rows */}
      <Stack gap="lg">
        <GroupHeader text="Configurações" />

        {/* Compra programada */}
        <div className="flex items-center justify-between gap-[var(--token-spacing-3)]">
          <div className="flex flex-col gap-[var(--token-spacing-1)] flex-1">
            <span className="text-[18px] font-bold text-content-primary">Compra programada</span>
            <Text variant="caption" color="content-secondary">
              {programmedEnabled
                ? <>Preço de entrada <span className="font-semibold text-content-primary">{formatPriceInt(entryPrice)}</span></>
                : 'Executa ao atingir o preço definido'}
            </Text>
          </div>
          <Toggle checked={programmedEnabled} onChange={setProgrammedEnabled} />
        </div>

        {/* Realizar lucro */}
        <div className="flex items-center justify-between gap-[var(--token-spacing-3)]">
          <div className="flex flex-col gap-[var(--token-spacing-1)] flex-1">
            <span className="text-[18px] font-bold text-content-primary">Realizar lucro</span>
            <Text variant="caption" color="content-secondary">
              {tpEnabled
                ? <>Vende ao atingir <span className="font-semibold text-[var(--color-feedback-success)]">{formatPriceInt(tpPrice)}</span> ({pctFromPrice(entryPrice, tpPrice)})</>
                : 'Vende ao atingir o preço alvo'}
            </Text>
          </div>
          <Toggle checked={tpEnabled} onChange={setTpEnabled} />
        </div>

        {/* Stop Loss */}
        <div className="flex items-center justify-between gap-[var(--token-spacing-3)]">
          <div className="flex flex-col gap-[var(--token-spacing-1)] flex-1">
            <span className="text-[18px] font-bold text-content-primary">Stop Loss</span>
            <Text variant="caption" color="content-secondary">
              {slEnabled
                ? <>Vende ao atingir <span className="font-semibold text-[var(--color-feedback-critical)]">{formatPriceInt(slPrice)}</span> ({pctFromPrice(entryPrice, slPrice)})</>
                : 'Limita perdas ao preço mínimo'}
            </Text>
          </div>
          <Toggle checked={slEnabled} onChange={setSlEnabled} />
        </div>
      </Stack>

      <StickyFooter>
        <Button
          fullWidth
          onPress={() => {
            const handled = onElementTap?.('Button: Revisar ordem')
            if (!handled) onNext()
          }}
        >
          Revisar ordem
        </Button>
      </StickyFooter>

      <PriceEditSheet
        open={entrySheetOpen}
        onClose={() => setEntrySheetOpen(false)}
        title="Preço de entrada"
        currentValue={entryPrice}
        onConfirm={handleEntryConfirm}
      />
      <PriceEditSheet
        open={tpSheetOpen}
        onClose={() => setTpSheetOpen(false)}
        title="Take Profit"
        currentValue={tpPrice}
        onConfirm={handleTpConfirm}
      />
      <PriceEditSheet
        open={slSheetOpen}
        onClose={() => setSlSheetOpen(false)}
        title="Stop Loss"
        currentValue={slPrice}
        onConfirm={handleSlConfirm}
      />
    </BaseLayout>
  )
}
