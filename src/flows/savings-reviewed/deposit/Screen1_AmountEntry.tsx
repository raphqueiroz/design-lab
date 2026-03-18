/**
 * @screen Savings Deposit
 * @description USD amount entry with BRL equivalent and instant redemption callout.
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
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import { DataListSkeleton } from '../../../library/feedback/Skeleton'
import Divider from '../../../library/foundations/Divider'
import {
  type CaixinhaCurrency,
  CURRENCIES,
  rawDigitsFromAmount,
} from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

const MOCK_CARD_BALANCES: Record<CaixinhaCurrency, number> = {
  USD: 4230.00,
  BRL: 12500.00,
  EUR: 2100.00,
}

const MOCK_EUR_TO_USD = 1.0842

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { currency: dataCurrency } = useScreenData<{ currency?: CaixinhaCurrency }>()
  const currency = dataCurrency ?? 'USD'
  const isEurMode = currency === 'EUR'
  const curr = CURRENCIES[currency]
  const usdCurr = CURRENCIES.USD
  const cardBalance = MOCK_CARD_BALANCES[currency]

  const [amount, setAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [, setLastEdited] = useState<'eur' | 'usd'>('eur')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedAmount = parseInt(amount || '0', 10) / 100
  const exceedsBalance = parsedAmount > cardBalance
  const isValid = parsedAmount >= 1 && !exceedsBalance

  // EUR↔USD sync
  const handleEurChange = (val: string) => {
    setAmount(val)
    setLastEdited('eur')
    const eurVal = parseInt(val || '0', 10) / 100
    if (eurVal > 0) {
      setUsdAmount(rawDigitsFromAmount(eurVal * MOCK_EUR_TO_USD))
    } else {
      setUsdAmount('')
    }
  }

  const handleUsdChange = (val: string) => {
    setUsdAmount(val)
    setLastEdited('usd')
    const usdVal = parseInt(val || '0', 10) / 100
    if (usdVal > 0) {
      setAmount(rawDigitsFromAmount(usdVal / MOCK_EUR_TO_USD))
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
    return `${curr.symbol} ${cardBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }, [curr.symbol, cardBalance])

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="default">
        {isEurMode ? (
          <Stack gap="none">
            <CurrencyInput
              label="Pague"
              value={amount}
              onChange={handleEurChange}
              tokenIcon={curr.flagIcon}
              currencySymbol={curr.symbol}
              balance={balanceDisplay}
              onBalanceTap={() => handleEurChange(rawDigitsFromAmount(cardBalance))}
              balanceError={exceedsBalance}
            />
            <Divider />
            <CurrencyInput
              label="Guarde"
              value={usdAmount}
              onChange={handleUsdChange}
              tokenIcon={usdCurr.flagIcon}
              currencySymbol={usdCurr.symbol}
              readOnly
            />
          </Stack>
        ) : (
          <CurrencyInput
            label="Guarde"
            value={amount}
            onChange={setAmount}
            tokenIcon={curr.flagIcon}
            currencySymbol={curr.symbol}
            balance={balanceDisplay}
            onBalanceTap={() => setAmount(rawDigitsFromAmount(cardBalance))}
            balanceError={exceedsBalance}
          />
        )}

        {calcState === 'loading' && <DataListSkeleton rows={3} />}

        {calcState === 'ready' && !isEurMode && (
          <DataList data={[
            { label: 'Prazo', value: 'Instantâneo' },
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
            { label: 'VET', value: `€ 1 ⇄ US$ ${MOCK_EUR_TO_USD.toFixed(4).replace('.', ',')}` },
          ]} />
        )}

        <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }}>
          <Banner
            variant="neutral"
            title={isEurMode ? 'Conversão automática' : 'Rendimento automático'}
            description={isEurMode
              ? 'Seus euros são convertidos em dólar e guardados na sua caixinha, rendendo 4,37% ao ano.'
              : 'Seu dinheiro rende 4.37% ao ano e você resgata quando quiser.'
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
