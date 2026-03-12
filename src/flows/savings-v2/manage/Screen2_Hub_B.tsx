/**
 * Caixinha MVP — Version B Hub (USD)
 *
 * Full-bleed gradient hero with chart flowing behind the balance,
 * circular floating action buttons, and a pull-up white card
 * with tabs for details/history.
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import type { LineChartCrosshairData } from '../../../library/display/LineChart'
import LineChart from '../../../library/display/LineChart'
import Stack from '../../../library/layout/Stack'
import SegmentedControl from '../../../library/navigation/SegmentedControl'
import IconButton from '../../../library/inputs/IconButton'
import Badge from '../../../library/display/Badge'
import Text from '../../../library/foundations/Text'
import {
  RiArrowLeftLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiShieldCheckLine,
} from '@remixicon/react'

import { BalanceDisplay, DetailsTab, HistoryTab } from '../../savings-reviewed/manage/Screen2_Hub.parts'
import {
  CURRENCIES,
  formatBrlEquivalent,
  generateYieldChartData,
} from '../../savings-reviewed/shared/data'

interface ScreenData {
  hasBalance?: boolean
  [key: string]: unknown
}

export default function Screen2_Hub_B({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const hasBalance = data.hasBalance ?? true
  const balance = hasBalance ? 2500.00 : 0

  const currInfo = CURRENCIES.USD
  const [activeTab, setActiveTab] = useState(0)
  const [crosshairPoint, setCrosshairPoint] = useState<LineChartCrosshairData | null>(null)

  const chartData = generateYieldChartData(30, balance || 100, currInfo.apy)
  const handleCrosshairMove = useCallback((p: LineChartCrosshairData | null) => setCrosshairPoint(p), [])

  const displayValue = crosshairPoint ? crosshairPoint.value : balance
  const brlEquiv = formatBrlEquivalent(displayValue, 'USD')

  const handleAdicionar = () => {
    const resolved = onElementTap?.('ShortcutButton: Adicionar')
    if (!resolved) onNext()
  }
  const handleResgatar = () => {
    const resolved = onElementTap?.('ShortcutButton: Resgatar')
    if (!resolved) onNext()
  }
  const handleViewPolicy = () => {
    const resolved = onElementTap?.('Button: Ver certificado')
    if (!resolved) onNext()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-primary">
      <div className="flex-1 overflow-y-auto">
        {/* Dark green hero — brand-core-500 with subtle glow */}
        <div
          className="relative overflow-hidden bg-[var(--color-brand-core-500)]"
        >
          {/* Decorative radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-[30%] right-[10%] w-[60%] h-[60%] rounded-full opacity-[0.12]"
              style={{ background: 'radial-gradient(circle, var(--color-brand-core-100) 0%, transparent 70%)' }}
            />
          </div>

          {/* Back button */}
          <div className="relative pt-[calc(var(--safe-area-top,12px)+8px)] px-[var(--token-spacing-4)]">
            {onBack && (
              <IconButton
                variant="base"
                inverted
                icon={<RiArrowLeftLine size={24} />}
                onPress={onBack}
              />
            )}
          </div>

          {/* Balance section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative px-[var(--token-spacing-6)] pb-2"
          >
            <Stack gap="sm">
              <Stack direction="row" gap="sm" align="center">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                  <img src={currInfo.flagIcon} alt="" className="w-full h-full object-cover" />
                </div>
                <Text variant="heading-sm" className="text-white">Caixinha do dólar</Text>
              </Stack>

              {balance > 0 ? (
                <Stack gap="none">
                  <Text variant="caption" className="text-white/60">Saldo atual</Text>
                  <BalanceDisplay value={displayValue} symbol={currInfo.symbol} inverted />
                  {brlEquiv && (
                    <Text variant="body-sm" className="text-white/60">{brlEquiv}</Text>
                  )}
                </Stack>
              ) : (
                <Stack gap="sm">
                  <Text variant="heading-sm" className="text-white/70">Saldo zerado</Text>
                  <Text variant="body-sm" className="text-white/50">
                    Adicione fundos para começar a render.
                  </Text>
                </Stack>
              )}

              {/* Badges row */}
              <Stack direction="row" gap="sm" align="center" className="mt-1">
                <Badge variant="lime" size="md">{currInfo.apyDisplay}</Badge>
                <Badge variant="success" size="md">Resgate imediato</Badge>
              </Stack>
            </Stack>
          </motion.div>

          {/* Insurance callout — on solid dark bg, before chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative flex items-center gap-2 mx-[var(--token-spacing-6)] mt-3 mb-4 px-3 py-2 rounded-full bg-white/[0.08] border border-white/[0.10]"
          >
            <RiShieldCheckLine size={14} className="text-white/70 shrink-0" />
            <Text variant="caption" className="text-white/70">
              Investimento assegurado — sem custo
            </Text>
          </motion.div>

          {/* Chart fades from dark green into white content below */}
          {balance > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative -mb-1"
            >
              <LineChart
                data={chartData}
                height={120}
                onCrosshairMove={handleCrosshairMove}
                variant="area"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-primary to-transparent" />
            </motion.div>
          )}
        </div>

        {/* White card section — pulls up over gradient */}
        <div className="relative bg-surface-primary px-[var(--token-spacing-6)] pt-6 pb-[48px]">
          <Stack gap="lg">
            {/* Floating action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Stack direction="row" gap="default" align="center" className="justify-center">
                <button
                  type="button"
                  onClick={handleAdicionar}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-interactive-default flex items-center justify-center shadow-lg">
                    <RiArrowDownLine size={24} className="text-white" />
                  </div>
                  <Text variant="caption" className="font-medium">Adicionar</Text>
                </button>

                <button
                  type="button"
                  onClick={handleResgatar}
                  disabled={balance === 0}
                  className="flex flex-col items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <div className="w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center border border-[var(--color-border-default)]">
                    <RiArrowUpLine size={24} className="text-content-primary" />
                  </div>
                  <Text variant="caption" className="font-medium">Resgatar</Text>
                </button>
              </Stack>
            </motion.div>

            {/* Tabs */}
            <SegmentedControl
              segments={['Detalhes', 'Histórico']}
              activeIndex={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === 0 && (
              <DetailsTab
                currency="USD"
                balance={balance}
                onViewPolicy={handleViewPolicy}
              />
            )}
            {activeTab === 1 && <HistoryTab currency="USD" />}
          </Stack>
        </div>
      </div>
    </div>
  )
}
