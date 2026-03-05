import { useState } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Stack from '../../../library/layout/Stack'
import SegmentedControl from '../../../library/navigation/SegmentedControl'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Text from '../../../library/foundations/Text'
import { RiArrowUpLine, RiArrowDownLine, RiFlagLine, RiEditLine, RiCheckLine } from '@remixicon/react'
import { BalanceDisplay, DetailsTab, HistoryTab } from '../version-a/A_Screen1_Hub.parts'

const HERO_IMAGE = 'https://img.icons8.com/3d-fluency/512/money-box.png'

const CURRENT_BALANCE = 1250.00
const CURRENT_GAINS = 5.21
const GOAL_AMOUNT = 5000.00

// ── Coin Stack Progress ──

const TOTAL_COINS = 8
const COIN_WIDTH = 64
const COIN_HEIGHT = 10
const COIN_GAP = 4
const COIN_DEPTH = 4 // 3D-ish thickness

/** Barlow Condensed for currency symbol */
const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"
/** Inter variable: open 4, 6, 9 (ss01) + flat-top 3 (cv05) */
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

const fmtUSD = (v: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function CoinStack({ progress, reached }: { progress: number; reached: boolean }) {
  const filledCount = Math.round((Math.min(progress, 100) / 100) * TOTAL_COINS)

  return (
    <div className="flex flex-col-reverse items-center" style={{ gap: COIN_GAP }}>
      {Array.from({ length: TOTAL_COINS }, (_, i) => {
        const isFilled = i < filledCount
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
            className="relative"
            style={{ width: COIN_WIDTH, height: COIN_HEIGHT + COIN_DEPTH }}
          >
            {/* Coin depth (bottom edge) */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-[50%]"
              style={{
                height: COIN_HEIGHT,
                background: isFilled
                  ? (reached ? 'var(--color-feedback-success)' : 'var(--color-brand-lime-300, #a3e635)')
                  : 'var(--color-border-default)',
                opacity: isFilled ? 0.5 : 0.1,
              }}
            />
            {/* Coin face (top) */}
            <motion.div
              className="absolute top-0 left-0 right-0 rounded-[50%]"
              style={{
                height: COIN_HEIGHT,
                background: isFilled
                  ? (reached ? 'var(--color-feedback-success)' : 'var(--color-brand-lime-300, #a3e635)')
                  : 'var(--color-border-default)',
                opacity: isFilled ? 1 : 0.15,
              }}
              initial={isFilled ? { scale: 0.8 } : undefined}
              animate={isFilled ? { scale: 1 } : undefined}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 400, damping: 20 }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Goal Card ──

function GoalCard({
  balance,
  goalAmount,
  reached,
}: {
  balance: number
  goalAmount: number
  reached: boolean
}) {
  const progress = reached ? 100 : (balance / goalAmount) * 100
  const displayValue = reached ? goalAmount : balance

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-[16px]"
    >
      {/* Balance + Coin Stack side by side */}
      <div className="flex items-center gap-[24px]">
        {/* Left: balance info */}
        <div className="flex flex-col gap-[2px] flex-1">
          <span className="text-[13px] text-content-tertiary font-medium">Total guardado</span>
          <div className="flex items-center">
            <span
              className="text-[28px] font-medium leading-[40px] tracking-[-0.56px] uppercase text-content-primary"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontFeatureSettings: symbolFeatures }}
            >
              US$
            </span>
            <span
              className="text-[40px] font-bold leading-[40px] text-content-primary ml-1"
              style={{ fontFeatureSettings: digitFeatures }}
            >
              {fmtUSD(displayValue)}
            </span>
          </div>
          <Text variant="body" className="font-medium">
            <span className="text-content-secondary">Rendeu </span>
            <span className="text-[var(--color-feedback-success)] font-semibold">US$ 23,43</span>
          </Text>
        </div>

        {/* Right: coin stack */}
        <CoinStack progress={progress} reached={reached} />
      </div>

      {/* Goal info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center justify-between px-[16px] py-[12px] rounded-[16px] bg-surface-secondary"
      >
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[6px]">
            {reached && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 15 }}
                className="w-[18px] h-[18px] rounded-full bg-[var(--color-feedback-success)] flex items-center justify-center"
              >
                <RiCheckLine size={12} className="text-white" />
              </motion.div>
            )}
            <span className="text-[14px] font-semibold text-content-primary leading-[18px]">
              {reached ? 'Meta atingida!' : `Meta: US$ ${fmtUSD(goalAmount)}`}
            </span>
          </div>
          {!reached && (
            <span className="text-[13px] text-content-tertiary leading-[16px]">
              Faltam US$ {fmtUSD(goalAmount - balance)}
            </span>
          )}
        </div>
        <span className="text-[20px] font-bold text-[var(--color-feedback-success)] tracking-[-0.3px]">
          {Math.round(progress)}%
        </span>
      </motion.div>
    </motion.div>
  )
}

interface ScreenData {
  tab?: number
  hasGoal?: boolean
  goalReached?: boolean
}

export default function B_Screen1_Hub({ onNext, onElementTap }: FlowScreenProps) {
  const { tab: initialTab, hasGoal, goalReached } = useScreenData<ScreenData>()
  const [activeTab, setActiveTab] = useState(initialTab ?? 0)

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

  return (
    <div className="flex flex-col h-full bg-surface-primary overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Hero — 3D piggy bank on gradient, full-bleed behind status bar */}
        <div
          className="relative w-full shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            height: 200,
            background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 40%, #f48fb1 100%)',
          }}
        >
          <img src={HERO_IMAGE} alt="" className="h-[140px] w-[140px] object-contain drop-shadow-lg" />
        </div>

        {/* White container with rounded top — overlaps hero */}
        <div className="relative -mt-[24px] rounded-t-[35px] bg-surface-primary">
          <Stack gap="lg" className="px-[var(--token-spacing-6)] pt-[24px] pb-[48px]">
            {/* Title + Balance + Actions */}
            <Stack gap="lg">
              <Text variant="heading-lg" className="tracking-[-0.6px]">Caixinha</Text>

              {hasGoal ? (
                <GoalCard balance={CURRENT_BALANCE} goalAmount={GOAL_AMOUNT} reached={!!goalReached} />
              ) : (
                <Stack gap="sm">
                  <Text variant="body-sm" color="content-secondary">Total guardado</Text>
                  <BalanceDisplay value={CURRENT_BALANCE} />
                  <Text variant="body" className="font-medium">
                    <span className="text-content-secondary">Rendeu </span>
                    <span className="text-[var(--color-feedback-success)] font-semibold">US$ 23,43</span>
                  </Text>
                </Stack>
              )}

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
            </Stack>

            {/* Tabs + Content */}
            <Stack gap="default">
              <SegmentedControl
                segments={['Sobre a Caixinha', 'Histórico']}
                activeIndex={activeTab}
                onChange={setActiveTab}
                variant="pill"
              />
              {activeTab === 0 && <DetailsTab onViewPolicy={handleViewPolicy} />}
              {activeTab === 1 && <HistoryTab />}
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  )
}
