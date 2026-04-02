import { useState, useMemo, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'
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
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import { DataListSkeleton, BannerSkeleton } from '../../library/feedback/Skeleton'

const MOCK_RATE = 5.4583

const PAYMENT_METHODS = [
  {
    id: 'brl',
    title: 'Real Brasileiro',
    subtitle: 'Pague de sua conta bancária com Pix',
    icon: BRL_FLAG,
  },
  {
    id: 'usd',
    title: 'Dólar Americano',
    subtitle: 'Pague de sua conta americana com transferência ACH',
    icon: USD_FLAG,
  },
  {
    id: 'eur',
    title: 'Euro',
    subtitle: 'Pague de sua conta internacional com SEPA',
    icon: EUR_FLAG,
  },
  {
    id: 'crypto',
    title: 'Criptomoedas',
    subtitle: 'Transferência via carteira ou corretora',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/128px-Bitcoin.svg.png',
  },
]

function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

type CalcState = 'idle' | 'loading' | 'ready' | 'error'

export default function Screen1_AmountEntry({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { initialCalcState, initialAmount } = useScreenData<{ initialCalcState?: CalcState; initialAmount?: string }>()
  const [usdValue, setUsdValue] = useState(initialAmount ?? '')
  const [brlValue, setBrlValue] = useState('')
  const [lastEdited, setLastEdited] = useState<'usd' | 'brl'>('usd')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('brl')
  const [calcState, setCalcState] = useState<CalcState>(initialCalcState ?? 'idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Report internal state changes to the prototype player's state pills
  useEffect(() => {
    if (!onStateChange) return
    const stateMap: Record<CalcState, string> = { idle: 'default', loading: 'loading', ready: 'ready', error: 'error' }
    onStateChange(stateMap[calcState])
  }, [calcState, onStateChange])

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const brlAmount = parseInt(brlValue || '0', 10) / 100

  const displayUsd = lastEdited === 'usd' ? usdValue : rawDigitsFromAmount(brlAmount / MOCK_RATE)
  const displayBrl = lastEdited === 'brl' ? brlValue : rawDigitsFromAmount(usdAmount * MOCK_RATE)

  const effectiveUsd = parseInt(displayUsd || '0', 10) / 100
  const isValid = effectiveUsd >= 1

  // Simulate calculation when amount becomes valid
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isValid, usdValue, brlValue])

  const handleUsdChange = (value: string) => {
    setUsdValue(value)
    setLastEdited('usd')
  }

  const handleBrlChange = (value: string) => {
    setBrlValue(value)
    setLastEdited('brl')
  }

  const handleSelectMethod = (method: typeof PAYMENT_METHODS[number]) => {
    // Notify graph navigation system before updating local state
    if (onElementTap) {
      onElementTap(`ListItem: ${method.title}`)
    }
    setSelectedMethod(method.id)
    setSheetOpen(false)
  }

  const currentMethod = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === selectedMethod) ?? PAYMENT_METHODS[0],
    [selectedMethod],
  )

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="none">
        <CurrencyInput
          label="Receba"
          value={displayUsd}
          onChange={handleUsdChange}
          tokenIcon={USD_FLAG}
          currencySymbol="US$"
        />

        <Divider />

        <CurrencyInput
          label="Pague"
          value={displayBrl}
          onChange={handleBrlChange}
          tokenIcon={BRL_FLAG}
          currencySymbol="R$"
        />

        <ListItem
          title="Você paga em"
          subtitle={currentMethod.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setSheetOpen(true)}>
              Mudar
            </Button>
          }
          trailing={null}
        />
      </Stack>

      {/* Transaction details — loading skeleton (mirrors DataList + Banner layout) */}
      {calcState === 'loading' && (
        <Stack gap="none">
          <DataListSkeleton rows={5} />
          <BannerSkeleton />
        </Stack>
      )}

      {/* Transaction details — error */}
      {calcState === 'error' && (
        <Stack gap="none">
          <Banner
            variant="critical"
            title="Valor mínimo de depósito é US$ 5,00"
          />
        </Stack>
      )}

      {/* Transaction details — ready */}
      {calcState === 'ready' && (
        <Stack gap="none">
          <DataList
            data={[
              { label: 'Meio de pagamento', value: 'Transferência Pix' },
              { label: 'Estimativa de entrega', value: '5 minutos' },
              {
                label: 'Nossa taxa',
                value: (
                  <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>
                ),
              },
              {
                label: 'Outros custos',
                info: () => {},
                value: (
                  <span className="flex items-center gap-[var(--token-spacing-1)]">
                    <span className="text-content-tertiary line-through">R$ 28,32</span>
                    <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>
                  </span>
                ),
              },
              {
                label: 'VET',
                info: () => {},
                value: 'US$ 1 ⇄ R$ 5,4434',
              },
            ]}
          />

          <Banner
            variant="success"
            title="Benefício aplicado: Converta sem taxas"
          />
        </Stack>
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={() => {
          const handled = onElementTap?.('Button: Continuar')
          if (!handled) onNext()
        }}>
          Continuar
        </Button>
      </StickyFooter>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Como quer pagar?"
      >
        <Stack gap="none">
          {PAYMENT_METHODS.map((method) => (
            <ListItem
              key={method.id}
              title={method.title}
              subtitle={method.subtitle}
              left={<Avatar src={method.icon} size="md" />}
              onPress={() => handleSelectMethod(method)}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
