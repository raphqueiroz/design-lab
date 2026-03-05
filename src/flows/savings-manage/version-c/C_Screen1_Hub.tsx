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
const GOAL_AMOUNT = 5000.00

// ── Radial Progress Ring ──

const RING_SIZE = 240
const STROKE_WIDTH = 8
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Barlow Condensed for currency symbol */
const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"
/** Inter variable: open 4, 6, 9 (ss01) + flat-top 3 (cv05) */
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

const fmtUSD = (v: number) =>
  v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function RadialProgress({ progress }: { progress: number }) {
  const offset = CIRCUMFERENCE - (Math.min(progress, 100) / 100) * CIRCUMFERENCE

  return (
    <svg width={RING_SIZE} height={RING_SIZE} className="rotate-[-90deg]">
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-border-default)"
        strokeWidth={STROKE_WIDTH}
        opacity={0.15}
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-feedback-success)"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  )
}

// ── Goal Card (Radial) ──

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
      className="flex flex-col items-center gap-[16px]"
    >
      {/* Ring with balance centered inside */}
      <div className="relative flex items-center justify-center">
        <RadialProgress progress={progress} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {reached ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 15 }}
              className="flex flex-col items-center gap-[2px]"
            >
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
                  {fmtUSD(goalAmount)}
                </span>
              </div>
              <div className="flex items-center gap-[6px] mt-[2px]">
                <div className="w-[20px] h-[20px] rounded-full bg-[var(--color-feedback-success)] flex items-center justify-center">
                  <RiCheckLine size={14} className="text-white" />
                </div>
                <span className="text-[14px] font-semibold text-[var(--color-feedback-success)]">
                  Meta atingida!
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col items-center gap-[2px]"
            >
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
              <span className="text-[14px] text-[var(--color-feedback-success)] font-semibold mt-[2px]">
                {Math.round(progress)}% da meta
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Goal info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex items-center justify-between px-[16px] py-[12px] rounded-[16px] bg-surface-secondary w-full"
      >
        <div className="flex flex-col gap-[2px]">
          <span className="text-[14px] font-semibold text-content-primary leading-[18px]">
            {reached ? 'Parabéns!' : `Meta: US$ ${fmtUSD(goalAmount)}`}
          </span>
          <span className="text-[13px] text-content-tertiary leading-[16px]">
            {reached
              ? `US$ ${fmtUSD(goalAmount)} guardados`
              : `Faltam US$ ${fmtUSD(goalAmount - balance)}`}
          </span>
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

export default function C_Screen1_Hub({ onNext, onElementTap }: FlowScreenProps) {
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

  return (
    <div className="flex flex-col h-full bg-surface-primary overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Hero — 3D piggy bank on gradient */}
        <div
          className="relative w-full shrink-0 overflow-hidden flex items-center justify-center"
          style={{
            height: 200,
            background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 40%, #f48fb1 100%)',
          }}
        >
          <img src={HERO_IMAGE} alt="" className="h-[140px] w-[140px] object-contain drop-shadow-lg" />
        </div>

        {/* White container with rounded top */}
        <div className="relative -mt-[24px] rounded-t-[35px] bg-surface-primary">
          <Stack gap="lg" className="px-[var(--token-spacing-6)] pt-[24px] pb-[48px]">
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
