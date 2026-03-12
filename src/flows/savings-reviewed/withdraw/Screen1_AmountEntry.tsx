import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import { DataListSkeleton } from '../../../library/feedback/Skeleton'
import {
  type CaixinhaCurrency,
  CURRENCIES,
  rawDigitsFromAmount,
} from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

const MOCK_BALANCES: Record<CaixinhaCurrency, number> = {
  USD: 2500.00,
  BRL: 5200.00,
  EUR: 843.57,
}

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const curr = CURRENCIES[currency]
  const balance = MOCK_BALANCES[currency]

  const [amount, setAmount] = useState('')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedAmount = parseInt(amount || '0', 10) / 100
  const exceedsBalance = parsedAmount > balance
  const isValid = parsedAmount >= 1 && !exceedsBalance

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
    return `${curr.symbol} ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }, [curr.symbol, balance])

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="default">
        <CurrencyInput
          label="Retire"
          value={amount}
          onChange={setAmount}
          tokenIcon={curr.flagIcon}
          currencySymbol={curr.symbol}
          balance={balanceDisplay}
          onBalanceTap={() => setAmount(rawDigitsFromAmount(balance))}
          balanceError={exceedsBalance}
        />

        {calcState === 'loading' && <DataListSkeleton rows={3} />}

        {calcState === 'ready' && (
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

        <motion.div
          layout
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Banner
            variant="neutral"
            title="Resgate imediato"
            description="O valor é creditado direto no saldo do seu cartão, sem carência."
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
