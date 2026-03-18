/**
 * @screen Dashboard
 * @description Three pre-existing currency caixinhas. Only USD active, EUR/BRL disabled
 *   with "Em breve" tag.
 */
import { RiArrowDownLine, RiArrowRightUpLine } from '@remixicon/react'
import savingsPiggy from '../../../assets/images/savings-piggy-3d.jpg'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import FeatureLayout from '../../../library/layout/FeatureLayout'
import Stack from '../../../library/layout/Stack'
import Text from '../../../library/foundations/Text'
import GroupHeader from '../../../library/navigation/GroupHeader'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Banner from '../../../library/display/Banner'
import { motion } from 'framer-motion'
import { CaixinhaCard } from './Screen1_Dashboard.parts'
import { BalanceDisplay } from '../../savings-reviewed/manage/Screen2_Hub.parts'
import { formatBrlEquivalent, formatCurrency } from '../../savings-reviewed/shared/data'

interface ScreenData {
  hasBalance?: boolean
  hasPending?: boolean
  [key: string]: unknown
}

export default function Screen1_Dashboard({ onNext, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const hasBalance = data.hasBalance ?? true
  const hasPending = data.hasPending ?? false

  const usdBalance = hasBalance ? 9894.89 : 0
  const usdYield = hasBalance ? 80.32 : 0

  const handleTapDolar = () => {
    const resolved = onElementTap?.('CaixinhaCard: Caixinha em Dólar')
    if (!resolved) onNext()
  }

  const handleTapAdicionar = () => {
    const resolved = onElementTap?.('ShortcutButton: Adicionar')
    if (!resolved) onNext()
  }

  const handleTapResgatar = () => {
    const resolved = onElementTap?.('ShortcutButton: Resgatar')
    if (!resolved) onNext()
  }

  return (
    <FeatureLayout
      imageBgColor="#F2C0CB"
      imageMaxHeight={300}
      imageHeader={
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${savingsPiggy})`,
              backgroundSize: '130%',
              backgroundPosition: '48% 92%',
              backgroundRepeat: 'no-repeat',
              transform: 'scaleX(-1)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(180,60,100,0.75) 0%, rgba(180,60,100,0.35) 30%, transparent 55%)' }} />
          <Stack gap="none" className="relative z-10">
            <Text variant="heading-lg" className="!text-white">Caixinhas</Text>
            <Text variant="body-md" className="!text-white/95 leading-[140%]">
              Rendimento automático e simples
            </Text>
          </Stack>
        </>
      }
    >
      <Stack gap="lg">
        {/* Total balance */}
        <Stack gap="none" className="gap-[var(--token-spacing-2)]">
          <Text variant="body-sm" color="content-secondary">Total guardado</Text>
          <div className={hasPending ? 'opacity-40' : ''}>
            <BalanceDisplay value={usdBalance} symbol="US$" />
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
            <Stack direction="row" gap="sm" align="center">
              {usdYield > 0 && (
                <Text variant="body-md" className="text-[var(--color-feedback-success)] font-medium tracking-tight">
                  ↑ {formatCurrency(usdYield, 'USD')}
                </Text>
              )}
              <Text variant="body-md" color="content-tertiary" className="font-medium tracking-tight">
                {formatBrlEquivalent(usdBalance, 'USD')}
              </Text>
            </Stack>
          )}
        </Stack>

        {!hasBalance && (
          <Banner
            variant="neutral"
            title="Seu dinheiro rende em moeda forte"
            description="Planeje sua próxima viagem, monte uma reserva em dólar ou euro e veja seu saldo crescer com rendimento automático."
          />
        )}

        {/* Shortcuts */}
        <Stack direction="row" gap="default" align="start">
          <ShortcutButton
            icon={<RiArrowDownLine size={22} />}
            label="Adicionar"
            variant="primary"
            onPress={handleTapAdicionar}
          />
          <ShortcutButton
            icon={<RiArrowRightUpLine size={22} />}
            label="Resgatar"
            variant="secondary"
            disabled={!hasBalance}
            onPress={handleTapResgatar}
          />
        </Stack>

        {/* Caixinhas list */}
        <Stack gap="none">
          <GroupHeader text="Suas caixinhas" />
          <Stack gap="none" className="mt-[var(--token-spacing-2)]">
            <CaixinhaCard currency="USD" name="Caixinha em Dólar" balance={usdBalance} yieldToday={usdYield} onPress={handleTapDolar} />
            <CaixinhaCard currency="EUR" name="Caixinha em Euro" balance={0} yieldToday={0} disabled />
            <CaixinhaCard currency="BRL" name="Caixinha em reais" balance={0} yieldToday={0} disabled />
          </Stack>
        </Stack>
      </Stack>
    </FeatureLayout>
  )
}
