/**
 * @screen Savings Details
 * @description Savings details with balance, relevant data and shortcuts to deposit and
 *   withdraw
 */
import { useState } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import Header from '../../../library/navigation/Header'
import SegmentedControl from '../../../library/navigation/SegmentedControl'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Text from '../../../library/foundations/Text'
import Badge from '../../../library/display/Badge'
import { motion } from 'framer-motion'
import { RiArrowDownLine, RiArrowRightUpLine, RiTimeLine, RiShieldCheckLine } from '@remixicon/react'
import { DetailsTab, HistoryTab } from './Screen2_Hub.parts'
import { BalanceDisplay } from '../../savings-reviewed/manage/Screen2_Hub.parts'
import { formatCurrency } from '../../savings-reviewed/shared/data'

const CURRENT_BALANCE = 9894.89
const CURRENT_GAINS = 80.32

interface ScreenData {
  tab?: number
  hasBalance?: boolean
  hasPending?: boolean
  [key: string]: unknown
}

export default function Screen2_Hub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { tab: initialTab, hasBalance: hasBalanceData, hasPending: hasPendingData } = useScreenData<ScreenData>()
  const hasBalance = hasBalanceData ?? true
  const hasPending = hasPendingData ?? false
  const [activeTab, setActiveTab] = useState(initialTab ?? 0)

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
    <BaseLayout>
      <Header title="Caixinha em Dólar" onBack={onBack} />

      <Stack gap="lg">
        <Stack direction="row" gap="sm" align="center" className="-mt-2">
          <Badge variant="lime" size="md" icon={<RiTimeLine size={14} />}>Resgate imediato</Badge>
          <Badge variant="lime" size="md" icon={<RiShieldCheckLine size={14} />}>Cobertura garantida</Badge>
        </Stack>

        <Stack gap="none" className="gap-1">
          <div className={hasPending ? 'opacity-40' : ''}>
            <BalanceDisplay value={hasBalance ? CURRENT_BALANCE : 0} symbol="US$" />
          </div>
          {hasPending && (
            <div className="flex items-center gap-[var(--token-spacing-2)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="shrink-0"
                style={{ width: 16, height: 16 }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <circle cx="12" cy="12" r="10" stroke="var(--token-neutral-200)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--color-content-primary)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.div>
              <span className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium text-[var(--color-content-primary)]">
                Processando depósito...
              </span>
            </div>
          )}
          {hasBalance && !hasPending && (
            <Text variant="body-md" className="text-[var(--color-feedback-success)] font-medium tracking-tight">
              ↑ {formatCurrency(CURRENT_GAINS, 'USD')}
            </Text>
          )}
        </Stack>

        <Stack direction="row" gap="default" align="start">
          <ShortcutButton
            icon={<RiArrowDownLine size={22} />}
            label="Adicionar"
            variant="primary"
            onPress={handleAdicionar}
          />
          <ShortcutButton
            icon={<RiArrowRightUpLine size={22} />}
            label="Resgatar"
            variant="secondary"
            disabled={!hasBalance}
            onPress={handleResgatar}
          />
        </Stack>

        <Stack gap="sm">
          <SegmentedControl
            segments={['Detalhes', 'Histórico']}
            activeIndex={activeTab}
            onChange={setActiveTab}
            className="self-start"
          />

          {activeTab === 0 && <DetailsTab hasBalance={hasBalance} yieldAmount={formatCurrency(CURRENT_GAINS, 'USD')} onViewPolicy={handleViewPolicy} />}
          {activeTab === 1 && <HistoryTab hasBalance={hasBalance} />}
        </Stack>
      </Stack>
    </BaseLayout>
  )
}
