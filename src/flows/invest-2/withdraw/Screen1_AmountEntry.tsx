/**
 * Investment Withdraw — Amount Entry
 * Follows savings-reviewed withdraw pattern with CalcState machine.
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import DataList from '@/library/display/DataList'
import Banner from '@/library/display/Banner'
import { DataListSkeleton } from '@/library/feedback/Skeleton'
import { BRL_FLAG } from '@/lib/flags'
import type { AssetTicker } from '../shared/data'
import { getAsset, getPosition, isVolatile } from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { assetTicker } = useScreenData<{ assetTicker?: AssetTicker }>()
  const ticker = assetTicker ?? 'BTC'
  const asset = getAsset(ticker)
  const position = getPosition(ticker)
  const volatile = isVolatile(asset)
  const balance = position?.currentValue ?? 0

  const [amount, setAmount] = useState('')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedAmount = parseInt(amount || '0', 10) / 100
  const exceedsBalance = parsedAmount > balance
  const isValid = parsedAmount >= 10 && !exceedsBalance

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1000)
    } else {
      setCalcState('idle')
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isValid, amount])

  useEffect(() => {
    const stateMap: Record<CalcState, string> = { idle: 'default', loading: 'loading', ready: 'ready' }
    onStateChange?.(stateMap[calcState])
  }, [calcState, onStateChange])

  const balanceDisplay = useMemo(() => {
    return `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }, [balance])

  // Estimated quantity for volatile
  const estimatedQty = volatile && asset.price && parsedAmount > 0
    ? (parsedAmount / asset.price)
    : null

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="default">
        <CurrencyInput
          label={volatile ? 'Vender' : 'Resgatar'}
          value={amount}
          onChange={setAmount}
          tokenIcon={BRL_FLAG}
          currencySymbol="R$"
          balance={balanceDisplay}
          onBalanceTap={() => setAmount(Math.round(balance * 100).toString())}
          balanceError={exceedsBalance}
          helperText={volatile ? `Saldo disponível em ${asset.name}` : undefined}
        />

        {/* Quick-fill percentage buttons */}
        <Stack direction="row" gap="sm">
          {[25, 50, 75, 100].map(pct => (
            <button
              key={pct}
              onClick={() => setAmount(Math.round(balance * (pct / 100) * 100).toString())}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--token-bg-secondary)] text-content-secondary"
            >
              {pct}%
            </button>
          ))}
        </Stack>

        {calcState === 'loading' && <DataListSkeleton rows={3} />}

        {calcState === 'ready' && volatile && (
          <DataList data={[
            { label: 'Você vende (estimado)', value: `${estimatedQty!.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${ticker}` },
            { label: 'Destino', value: 'Saldo Picnic' },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        )}

        {calcState === 'ready' && !volatile && (
          <DataList data={[
            { label: 'Destino', value: 'Saldo do Cartão' },
            {
              label: 'Prazo',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Imediato</span>,
            },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        )}

        <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }}>
          <Banner
            variant="neutral"
            title={volatile ? 'Venda de ativos' : 'Resgate imediato'}
            description={volatile
              ? `O valor final pode variar conforme a cotação de ${asset.name} no momento da venda.`
              : 'O valor é creditado direto no saldo do seu cartão, sem carência.'
            }
          />
        </motion.div>
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={() => {
          const handled = onElementTap?.('Button: Continuar')
          if (!handled) onNext()
        }}>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
