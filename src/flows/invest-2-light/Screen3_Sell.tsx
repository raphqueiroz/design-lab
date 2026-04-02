/**
 * Screen3_Sell — Sell amount entry.
 * Inputs: BTC (top, "Você compra") → USD (bottom, "Você paga").
 * Order type + payment method selectors.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import { USD_FLAG } from '@/lib/flags'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import BottomSheet from '@/library/layout/BottomSheet'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import Divider from '@/library/foundations/Divider'
import ListItem from '@/library/display/ListItem'
import DataList from '@/library/display/DataList'
import Text from '@/library/foundations/Text'
import { DataListSkeleton } from '@/library/feedback/Skeleton'
import {
  getAsset, isVolatile, formatUSD, rawDigitsFromAmount,
  MOCK_POSITIONS,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogoCircle } from './shared/TokenLogo'

// ── Order types ──

interface OrderType {
  id: 'market' | 'limit'
  title: string
  description: string
}

const ORDER_TYPES: OrderType[] = [
  { id: 'market', title: 'Ordem a mercado', description: 'Execução instantânea pelo preço atual' },
  { id: 'limit', title: 'Ordem limitada', description: 'Defina o preço desejado para execução' },
]

// ── Payment options ──

interface PaymentOption {
  id: string
  title: string
  subtitle: string
  tokenIcon: React.ReactNode
}

const MOCK_CRYPTO_BALANCE: Record<string, number> = {
  BTC: 0.0542,
  ETH: 1.2350,
  SOL: 5.00,
}

const CRYPTO_DECIMALS = 5

type CalcState = 'idle' | 'loading' | 'ready'

export default function Screen3_Sell({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{
    assetTicker?: AssetTicker
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100
  const cryptoBalance = MOCK_CRYPTO_BALANCE[assetTicker] ?? 0.01
  const tokenSvg = <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={40} color={palette.bg} />

  // Payment method
  const [paymentId, setPaymentId] = useState('account')
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)

  const paymentOptions: PaymentOption[] = useMemo(() => [
    {
      id: 'account',
      title: 'Saldo em conta',
      subtitle: 'US$ 12.450,00 disponível',
      tokenIcon: USD_FLAG,
    },
    ...MOCK_POSITIONS.map(pos => {
      const a = getAsset(pos.asset)
      const p = getAssetPalette(pos.asset)
      return {
        id: pos.asset,
        title: a.name,
        subtitle: `${formatUSD(pos.currentValue)} · ${pos.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${pos.asset}`,
        tokenIcon: <TokenLogoCircle ticker={pos.asset} fallbackUrl={a.icon} size={40} color={p.bg} />,
      }
    }),
  ], [])

  const currentPayment = useMemo(
    () => paymentOptions.find(p => p.id === paymentId) ?? paymentOptions[0],
    [paymentId, paymentOptions],
  )

  // Order type
  const [orderTypeId, setOrderTypeId] = useState<'market' | 'limit'>('market')
  const [orderSheetOpen, setOrderSheetOpen] = useState(false)
  const currentOrderType = ORDER_TYPES.find(o => o.id === orderTypeId) ?? ORDER_TYPES[0]

  // Amount state — crypto on top, USD on bottom
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [usdAmount, setUsdAmount] = useState('')

  const parsedCrypto = parseInt(cryptoAmount || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
  const parsedUsd = parseInt(usdAmount || '0', 10) / 100
  const isValid = parsedCrypto > 0 && parsedUsd >= 1
  const exceedsBalance = parsedCrypto > cryptoBalance

  const handleCryptoChange = useCallback((val: string) => {
    setCryptoAmount(val)
    const crypto = parseInt(val || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
    if (crypto > 0 && currentPrice > 0) {
      setUsdAmount(rawDigitsFromAmount(crypto * currentPrice))
    } else {
      setUsdAmount('')
    }
  }, [currentPrice])

  const handleUsdChange = useCallback((val: string) => {
    setUsdAmount(val)
    const usd = parseInt(val || '0', 10) / 100
    if (usd > 0 && currentPrice > 0 && volatile) {
      setCryptoAmount(rawDigitsFromAmount(usd / currentPrice, CRYPTO_DECIMALS))
    } else {
      setCryptoAmount('')
    }
  }, [currentPrice, volatile])

  const handleMaxTap = useCallback(() => {
    handleCryptoChange(rawDigitsFromAmount(cryptoBalance, CRYPTO_DECIMALS))
  }, [handleCryptoChange, cryptoBalance])

  // Calc state
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!onStateChange) return
    const stateMap: Record<CalcState, string> = { idle: 'default', loading: 'loading', ready: 'ready' }
    onStateChange(stateMap[calcState])
  }, [calcState, onStateChange])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isValid && !exceedsBalance) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isValid, exceedsBalance, cryptoAmount])

  const balanceLabel = `${cryptoBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${assetTicker}`

  const summaryData = [
    { label: 'Preço atual', value: formatUSD(currentPrice) },
    {
      label: 'Nossa taxa',
      value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
    },
    { label: 'Execução', value: 'Instantânea' },
  ]

  const canSubmit = isValid && !exceedsBalance && calcState === 'ready'

  return (
    <BaseLayout>
      <Header onClose={onBack} />

      <Stack gap="none">
        {/* Crypto input (top) — what you're buying */}
        <CurrencyInput
          label="Você compra"
          value={cryptoAmount}
          onChange={handleCryptoChange}
          tokenIcon={tokenSvg}
          currencySymbol={assetTicker}
          decimals={CRYPTO_DECIMALS}
          secondaryValue={parsedCrypto > 0 ? `≈ ${formatUSD(parsedCrypto * currentPrice)}` : undefined}
          balance={balanceLabel}
          onBalanceTap={handleMaxTap}
          balanceError={exceedsBalance}
          error={exceedsBalance ? 'Saldo insuficiente' : undefined}
        />

        <Divider />

        {/* USD input (bottom) — what you pay */}
        <CurrencyInput
          label="Você paga"
          value={usdAmount}
          onChange={handleUsdChange}
          tokenIcon={USD_FLAG}
          currencySymbol="US$"
        />

        {/* Order type */}
        <ListItem
          title="Tipo de ordem"
          subtitle={currentOrderType.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setOrderSheetOpen(true)}>
              Mudar
            </Button>
          }
          trailing={null}
        />

        {/* Payment method */}
        <ListItem
          title="Meio de pagamento"
          subtitle={currentPayment.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setPaymentSheetOpen(true)}>
              Mudar
            </Button>
          }
          trailing={null}
        />
      </Stack>

      {calcState === 'loading' && <DataListSkeleton rows={3} />}
      {calcState === 'ready' && <DataList data={summaryData} />}

      <StickyFooter>
        <Button
          fullWidth
          disabled={!canSubmit}
          onPress={() => {
            const handled = onElementTap?.('Button: Continuar')
            if (!handled) onNext()
          }}
        >
          Continuar
        </Button>
      </StickyFooter>

      {/* Order type sheet */}
      <BottomSheet open={orderSheetOpen} onClose={() => setOrderSheetOpen(false)}>
        <Stack gap="none">
          {ORDER_TYPES.map(opt => (
            <ListItem
              key={opt.id}
              title={opt.title}
              subtitle={opt.description}
              onPress={() => {
                onElementTap?.(`ListItem: ${opt.title}`)
                setOrderTypeId(opt.id)
                setOrderSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>

      {/* Payment method sheet */}
      <BottomSheet open={paymentSheetOpen} onClose={() => setPaymentSheetOpen(false)}>
        <Stack gap="none">
          {paymentOptions.map(opt => (
            <ListItem
              key={opt.id}
              title={opt.title}
              subtitle={opt.subtitle}
              left={typeof opt.tokenIcon === 'string'
                ? <img src={opt.tokenIcon} alt="" className="w-[40px] h-[40px] rounded-full object-cover" />
                : <div className="flex-shrink-0">{opt.tokenIcon}</div>
              }
              onPress={() => {
                onElementTap?.(`ListItem: ${opt.title}`)
                setPaymentId(opt.id)
                setPaymentSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
