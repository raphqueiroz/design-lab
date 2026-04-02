import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import { USD_FLAG, BRL_FLAG } from '@/lib/flags'
import Header from '../../library/navigation/Header'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Button from '../../library/inputs/Button'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import Divider from '../../library/foundations/Divider'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import Badge from '../../library/display/Badge'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import { DataListSkeleton } from '../../library/feedback/Skeleton'

const MOCK_RATE = 5.4583
const MOCK_CARD_BALANCE = 1250.00

type PaymentMethod = 'card-balance' | 'pix' | 'ach'
type CalcState = 'idle' | 'loading' | 'ready'

interface MethodOption {
  id: PaymentMethod
  title: string
  subtitle: string
  icon: string
  blocked: boolean
  blockedReason?: string
}

const METHODS: MethodOption[] = [
  { id: 'card-balance', title: 'Saldo do Cartão', subtitle: 'Deposite usando seu saldo em dólar', icon: USD_FLAG, blocked: false },
  { id: 'pix', title: 'Real Brasileiro', subtitle: 'Deposite via PIX da sua conta bancária', icon: BRL_FLAG, blocked: false },
]

function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { initialMethod } = useScreenData<{ initialMethod?: PaymentMethod }>()
  const [method, setMethod] = useState<PaymentMethod>(initialMethod ?? 'card-balance')
  const [amount, setAmount] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentMethod = useMemo(() => METHODS.find((m) => m.id === method) ?? METHODS[0], [method])
  const isPix = method === 'pix'
  const parsedAmount = parseInt(amount || '0', 10) / 100
  const exceedsBalance = !isPix && parsedAmount > MOCK_CARD_BALANCE
  const isValid = parsedAmount >= 1 && !exceedsBalance

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isValid, amount])

  useEffect(() => {
    const stateMap: Record<CalcState, string> = { idle: 'default', loading: 'loading', ready: 'ready' }
    onStateChange?.(stateMap[calcState])
  }, [calcState, onStateChange])

  const handleSelectMethod = (m: MethodOption) => {
    if (m.blocked) return
    onElementTap?.(`ListItem: ${m.title}`)
    setMethod(m.id)
    setSheetOpen(false)
  }

  const receiveUsd = isPix ? rawDigitsFromAmount(parsedAmount / MOCK_RATE) : amount

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="default">
        <Stack gap="none">
          {isPix ? (
            <>
              <CurrencyInput label="Receba" value={receiveUsd} onChange={() => {}} tokenIcon={USD_FLAG} currencySymbol="US$" readOnly />
              <Divider />
              <CurrencyInput label="Pague" value={amount} onChange={setAmount} tokenIcon={BRL_FLAG} currencySymbol="R$" />
            </>
          ) : (
            <CurrencyInput
              label="Guarde"
              value={amount}
              onChange={setAmount}
              tokenIcon={USD_FLAG}
              currencySymbol="US$"
              balance={`US$ ${MOCK_CARD_BALANCE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              onBalanceTap={() => setAmount(rawDigitsFromAmount(MOCK_CARD_BALANCE))}
              balanceError={exceedsBalance}
            />
          )}

          <ListItem
            title="Você paga com"
            subtitle={currentMethod.title}
            inverted
            left={null}
            right={<Button variant="primary" size="sm" onPress={() => setSheetOpen(true)}>Mudar</Button>}
            trailing={null}
          />
        </Stack>

        {calcState === 'loading' && (
          <DataListSkeleton rows={3} />
        )}

        {calcState === 'ready' && (
          <DataList data={[
            ...(isPix
              ? [
                  { label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4)}` },
                  { label: 'Spread', value: '0,38%' },
                  { label: 'VET', info: () => {}, value: `US$ 1 ⇄ R$ ${(MOCK_RATE * 1.0038).toFixed(4)}` },
                ]
              : []),
            { label: 'Prazo', value: isPix ? '5 minutos' : 'Instantâneo' },
            { label: 'Rendimento a partir de', value: 'Hoje' },
            {
              label: 'Nossa taxa',
              value: (
                <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>
              ),
            },
          ]} />
        )}

        <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }}>
          <Banner
            variant="neutral"
            title="Rendimento automático"
            description="Seu dinheiro rende 4.37% ao ano e você resgata quando quiser."
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

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Método de depósito">
        <Stack gap="none">
          {METHODS.map((m) => (
            <ListItem
              key={m.id}
              title={m.title}
              subtitle={m.blocked ? m.blockedReason : m.subtitle}
              left={<Avatar src={m.icon} size="md" />}
              right={m.blocked ? <Badge variant="neutral">Indisponível</Badge> : undefined}
              onPress={m.blocked ? undefined : () => handleSelectMethod(m)}
              disabled={m.blocked}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
