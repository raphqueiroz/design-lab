import { RiArrowDownLine, RiArrowRightUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import FeatureLayout from '../../../library/layout/FeatureLayout'
import Stack from '../../../library/layout/Stack'
import Text from '../../../library/foundations/Text'
import GroupHeader from '../../../library/navigation/GroupHeader'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Banner from '../../../library/display/Banner'
import { CaixinhaCard } from './Screen1_Dashboard.parts'
import { BalanceDisplay } from '../../savings-reviewed/manage/Screen2_Hub.parts'
import { formatBrlEquivalent, formatCurrency } from '../../savings-reviewed/shared/data'

interface ScreenData {
  hasBalance?: boolean
  [key: string]: unknown
}

export default function Screen1_Dashboard({ onNext, onElementTap }: FlowScreenProps) {
  const data = useScreenData<ScreenData>()
  const hasBalance = data.hasBalance ?? true

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
      imageBgColor="linear-gradient(225deg, #F2B5D4 0%, #E891B0 50%, #D4739A 100%)"
      imageMaxHeight={260}
      imageHeader={
        <Stack gap="none">
          <Text variant="heading-lg" className="!text-white">Caixinhas</Text>
          <Text variant="body-md" className="!text-white/80 leading-[140%]">
            Rendimento automático e simples
          </Text>
        </Stack>
      }
    >
      <Stack gap="lg">
        {/* Total balance */}
        <Stack gap="none" className="gap-[var(--token-spacing-2)]">
          <Text variant="body-sm" color="content-secondary">Total guardado</Text>
          <BalanceDisplay value={usdBalance} symbol="US$" />
          {hasBalance && (
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
            <CaixinhaCard
              currency="USD"
              name="Caixinha em Dólar"
              balance={usdBalance}
              yieldToday={usdYield}
              onPress={handleTapDolar}
            />
            <CaixinhaCard
              currency="EUR"
              name="Caixinha em Euro"
              balance={0}
              yieldToday={0}
              disabled
            />
            <CaixinhaCard
              currency="BRL"
              name="Caixinha em reais"
              balance={0}
              yieldToday={0}
              disabled
            />
          </Stack>
        </Stack>
      </Stack>
    </FeatureLayout>
  )
}
