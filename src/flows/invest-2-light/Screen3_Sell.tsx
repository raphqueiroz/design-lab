/**
 * Screen3_Sell — Sell amount entry (v2).
 * Inputs: BTC (top, "Você compra") → USD (bottom, "Você paga").
 * Payment method selector with crypto positions.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import { USD_FLAG } from '@/lib/flags'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Section from '@/library/layout/Section'
import BottomSheet from '@/library/layout/BottomSheet'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import Divider from '@/library/foundations/Divider'
import ListItem from '@/library/display/ListItem'
import DataList from '@/library/display/DataList'
// Text available via library but unused in this screen
import { DataListSkeleton } from '@/library/feedback/Skeleton'
import {
  getAsset, isVolatile, formatUSD, rawDigitsFromAmount,
  MOCK_POSITIONS,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogoCircle } from './shared/TokenLogo'

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
  const { assetTicker = 'BTC', payWith } = useScreenData<{
    assetTicker?: AssetTicker
    payWith?: AssetTicker
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100
  const cryptoBalance = MOCK_CRYPTO_BALANCE[assetTicker] ?? 0.01
  const tokenSvg = <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={40} color={palette.bg} />

  // Pay with crypto token info (for USDT state)
  const payAsset = payWith ? getAsset(payWith) : null
  const payPalette = payWith ? getAssetPalette(payWith) : null
  const payTokenSvg = payWith && payAsset && payPalette
    ? <TokenLogoCircle ticker={payWith} fallbackUrl={payAsset.icon} size={40} color={payPalette.bg} />
    : null

  // Payment method
  const [paymentId, setPaymentId] = useState(payWith ?? 'account')
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false)

  const paymentOptions: PaymentOption[] = useMemo(() => [
    {
      id: 'account',
      title: 'Saldo em conta',
      subtitle: 'US$ 12.450,00 disponível',
      tokenIcon: USD_FLAG,
    },
    ...MOCK_POSITIONS
      .filter(pos => getAsset(pos.asset).category !== 'fixed-income')
      .map(pos => {
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

  // Pay currency price — USDT price per unit of the buy asset
  const payDecimals = payWith && payAsset?.category === 'stablecoin' ? 2 : payWith ? CRYPTO_DECIMALS : 2
  const payPrice = useMemo(() => {
    if (!payWith || !payAsset) return currentPrice // USD: BTC price in USD
    // Price of buy asset in pay asset units (e.g. BTC in USDT)
    const payAssetUsdPrice = payAsset.price ?? 1
    return currentPrice / payAssetUsdPrice
  }, [currentPrice, payWith, payAsset])

  // Amount state — crypto on top, pay amount on bottom
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [payAmount, setPayAmount] = useState('')

  const parsedCrypto = parseInt(cryptoAmount || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
  const parsedPay = parseInt(payAmount || '0', 10) / Math.pow(10, payDecimals)
  const isValid = parsedCrypto > 0 && parsedPay >= (payWith ? 0.01 : 1)
  const exceedsBalance = parsedCrypto > cryptoBalance

  const handleCryptoChange = useCallback((val: string) => {
    setCryptoAmount(val)
    const crypto = parseInt(val || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
    if (crypto > 0 && payPrice > 0) {
      setPayAmount(rawDigitsFromAmount(crypto * payPrice, payDecimals))
    } else {
      setPayAmount('')
    }
  }, [payPrice, payDecimals])

  const handlePayChange = useCallback((val: string) => {
    setPayAmount(val)
    const pay = parseInt(val || '0', 10) / Math.pow(10, payDecimals)
    if (pay > 0 && payPrice > 0 && volatile) {
      setCryptoAmount(rawDigitsFromAmount(pay / payPrice, CRYPTO_DECIMALS))
    } else {
      setCryptoAmount('')
    }
  }, [payPrice, payDecimals, volatile])

  // Recalculate pay amount when payment method changes
  useEffect(() => {
    if (parsedCrypto > 0 && payPrice > 0) {
      setPayAmount(rawDigitsFromAmount(parsedCrypto * payPrice, payDecimals))
    }
  }, [paymentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMaxTap = useCallback(() => {
    // Fill max pay balance and calculate crypto
    const maxPay = payWith ? 1800 : 12450
    setPayAmount(rawDigitsFromAmount(maxPay, payDecimals))
    if (payPrice > 0) {
      setCryptoAmount(rawDigitsFromAmount(maxPay / payPrice, CRYPTO_DECIMALS))
    }
  }, [payWith, payPrice, payDecimals])

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
      <Header title="" onClose={onBack} />

      <Section>
        <Stack gap="none">
          {/* Crypto input (top) — what you're selling */}
          <CurrencyInput
            label="Venda"
            value={cryptoAmount}
            onChange={handleCryptoChange}
            tokenIcon={tokenSvg}
            currencySymbol={assetTicker}
            decimals={CRYPTO_DECIMALS}
            secondaryValue={parsedCrypto > 0 ? `≈ ${formatUSD(parsedCrypto * currentPrice)}` : undefined}
            balance={`${cryptoBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${assetTicker}`}
            onBalanceTap={handleMaxTap}
            balanceError={exceedsBalance}
          />

          <Divider />

          {/* Receive input (bottom) — USD or crypto token */}
          <CurrencyInput
            label="Receba"
            value={payAmount}
            onChange={handlePayChange}
            tokenIcon={payTokenSvg ?? USD_FLAG}
            currencySymbol={payWith ?? 'US$'}
            decimals={payWith ? (payAsset?.category === 'stablecoin' ? 2 : CRYPTO_DECIMALS) : 2}
          />
        </Stack>

        {/* Receive method */}
        <ListItem
          title="Receber em"
          subtitle={currentPayment.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setPaymentSheetOpen(true)}>
              Mudar
            </Button>
          }
          trailing={null}
        />
      </Section>

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

      {/* Payment method sheet */}
      <BottomSheet open={paymentSheetOpen} onClose={() => setPaymentSheetOpen(false)} title="Receber em">
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
                // Switch simulator state based on payment method
                if (opt.id === 'USDT') {
                  onStateChange?.('btc-sell-usdt')
                } else if (opt.id === 'account') {
                  onStateChange?.('btc-sell')
                }
              }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
