/**
 * @screen Savings Withdraw
 * @description USD withdrawal with instant redemption badge and BRL equivalent.
 */
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
import Divider from '../../../library/foundations/Divider'
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

const MOCK_USD_TO_EUR = 0.9223

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const isEurMode = currency === 'EUR'
  const usdCurr = CURRENCIES.USD
  const eurCurr = CURRENCIES.EUR
  const curr = CURRENCIES[currency]
  // In EUR mode, balance is in USD (withdraw FROM USD caixinha)
  const balance = isEurMode ? MOCK_BALANCES.USD : MOCK_BALANCES[currency]

  const [amount, setAmount] = useState('')
  const [eurAmount, setEurAmount] = useState('')
  const [, setLastEdited] = useState<'usd' | 'eur'>('usd')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedAmount = parseInt(amount || '0', 10) / 100
  const exceedsBalance = parsedAmount > balance
  const isValid = parsedAmount >= 1 && !exceedsBalance

  // USD↔EUR sync
  const handleUsdChange = (val: string) => {
    setAmount(val)
    setLastEdited('usd')
    const usdVal = parseInt(val || '0', 10) / 100
    if (usdVal > 0) {
      setEurAmount(rawDigitsFromAmount(usdVal * MOCK_USD_TO_EUR))
    } else {
      setEurAmount('')
    }
  }

  const handleEurChange = (val: string) => {
    setEurAmount(val)
    setLastEdited('eur')
    const eurVal = parseInt(val || '0', 10) / 100
    if (eurVal > 0) {
      setAmount(rawDigitsFromAmount(eurVal / MOCK_USD_TO_EUR))
    } else {
      setAmount('')
    }
  }

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
    const sym = isEurMode ? usdCurr.symbol : curr.symbol
    return `${sym} ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }, [isEurMode, usdCurr.symbol, curr.symbol, balance])

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="default">
        {isEurMode ? (
          <Stack gap="none">
            <CurrencyInput
              label="Retire"
              value={amount}
              onChange={handleUsdChange}
              tokenIcon={usdCurr.flagIcon}
              currencySymbol={usdCurr.symbol}
              balance={balanceDisplay}
              onBalanceTap={() => handleUsdChange(rawDigitsFromAmount(balance))}
              balanceError={exceedsBalance}
            />
            <Divider />
            <CurrencyInput
              label="Receba"
              value={eurAmount}
              onChange={handleEurChange}
              tokenIcon={eurCurr.flagIcon}
              currencySymbol={eurCurr.symbol}
              readOnly
            />
          </Stack>
        ) : (
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
        )}

        {calcState === 'loading' && <DataListSkeleton rows={3} />}

        {calcState === 'ready' && !isEurMode && (
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

        {calcState === 'ready' && isEurMode && (
          <DataList data={[
            { label: 'Prazo de conversão', value: 'Até 3 minutos' },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
            { label: 'VET', value: `US$ 1 ⇄ € ${MOCK_USD_TO_EUR.toFixed(4).replace('.', ',')}` },
          ]} />
        )}

        <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }}>
          <Banner
            variant="neutral"
            title={isEurMode ? 'Conversão automática' : 'Resgate imediato'}
            description={isEurMode
              ? 'Seus dólares são convertidos em euro e creditados na sua conta.'
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
