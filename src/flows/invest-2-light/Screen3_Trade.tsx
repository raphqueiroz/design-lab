/**
 * Screen3_Trade — Buy amount entry with order type selector.
 * Two editable inputs: USD (pay) and crypto (receive) — editing one calculates the other.
 * Market order shows detailed summary; programmed order shows banner.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import { USD_FLAG } from '@/lib/flags'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import Divider from '@/library/foundations/Divider'
import ListItem from '@/library/display/ListItem'
import DataList from '@/library/display/DataList'
import Banner from '@/library/display/Banner'
import { DataListSkeleton } from '@/library/feedback/Skeleton'
import {
  getAsset, isVolatile, formatUSD, rawDigitsFromAmount,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogoCircle } from './shared/TokenLogo'
import {
  OrderTypeSheet, getOrderType,
} from './Screen3_Trade.parts'

const MOCK_CARD_BALANCE = 12450 // US$ 12.450,00
const CRYPTO_DECIMALS = 5

type CalcState = 'idle' | 'loading' | 'ready'
type ActiveField = 'usd' | 'crypto'

export default function Screen3_Trade({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{
    assetTicker?: AssetTicker
    mode?: 'buy' | 'sell'
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100
  const tokenSvg = <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={40} color={palette.bg} />

  // Amount state — two fields, one drives the other
  const [usdAmount, setUsdAmount] = useState('')
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [, setActiveField] = useState<ActiveField>('usd')

  const parsedUsd = parseInt(usdAmount || '0', 10) / 100
  const isValid = parsedUsd >= 1
  const exceedsBalance = parsedUsd > MOCK_CARD_BALANCE

  // When USD changes, calculate crypto
  const handleUsdChange = useCallback((val: string) => {
    setUsdAmount(val)
    setActiveField('usd')
    const usd = parseInt(val || '0', 10) / 100
    if (usd > 0 && currentPrice > 0 && volatile) {
      const crypto = usd / currentPrice
      setCryptoAmount(rawDigitsFromAmount(crypto, CRYPTO_DECIMALS))
    } else {
      setCryptoAmount('')
    }
  }, [currentPrice, volatile])

  // When crypto changes, calculate USD
  const handleCryptoChange = useCallback((val: string) => {
    setCryptoAmount(val)
    setActiveField('crypto')
    const crypto = parseInt(val || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
    if (crypto > 0 && currentPrice > 0) {
      const usd = crypto * currentPrice
      setUsdAmount(rawDigitsFromAmount(usd))
    } else {
      setUsdAmount('')
    }
  }, [currentPrice])

  // Order type state
  const [orderTypeId, setOrderTypeId] = useState<'market' | 'programmed'>('market')
  const [orderSheetOpen, setOrderSheetOpen] = useState(false)
  const orderType = getOrderType(orderTypeId)
  const isProgrammed = orderTypeId === 'programmed'

  // Calc state machine
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
  }, [isValid, exceedsBalance, usdAmount])

  const handleMaxTap = useCallback(() => {
    handleUsdChange(rawDigitsFromAmount(MOCK_CARD_BALANCE))
  }, [handleUsdChange])

  const handleOrderSelect = useCallback((id: 'market' | 'programmed') => {
    onElementTap?.(`ListItem: ${getOrderType(id).title}`)
    setOrderTypeId(id)
  }, [onElementTap])

  // Market order summary
  const marketSummaryData = [
    { label: 'Preço atual', value: formatUSD(currentPrice) },
    {
      label: 'Nossa taxa',
      value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
    },
    {
      label: 'Outros custos',
      info: () => {},
      value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
    },
    { label: 'Meio de pagamento', value: 'Saldo em dólar' },
    { label: 'Estimativa de entrega', value: 'Instantâneo' },
  ]

  const ctaLabel = isProgrammed ? 'Configurar ordem' : 'Continuar'
  const canSubmit = isValid && !exceedsBalance && calcState === 'ready'

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="none">
        <CurrencyInput
          label="Você paga"
          value={usdAmount}
          onChange={handleUsdChange}
          tokenIcon={USD_FLAG}
          currencySymbol="US$"
          balance={`US$ ${MOCK_CARD_BALANCE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          onBalanceTap={handleMaxTap}
          balanceError={exceedsBalance}
          error={exceedsBalance ? 'Saldo insuficiente' : undefined}
        />

        {/* Crypto receive input — editable for market orders */}
        {!isProgrammed && volatile && (
          <>
            <Divider />
            <CurrencyInput
              label="Você recebe"
              value={cryptoAmount}
              onChange={handleCryptoChange}
              tokenIcon={tokenSvg}
              currencySymbol={assetTicker}
              decimals={CRYPTO_DECIMALS}
            />
          </>
        )}

        <ListItem
          title="Tipo de ordem"
          subtitle={orderType.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setOrderSheetOpen(true)}>
              Mudar
            </Button>
          }
          trailing={null}
        />
      </Stack>

      {/* Banner for programmed orders */}
      {isProgrammed && (
        <Banner
          variant="neutral"
          title="Na próxima etapa, você define o preço de entrada e pode configurar ordens de saída automáticas."
        />
      )}

      {/* Summary — only for market orders */}
      {!isProgrammed && calcState === 'loading' && <DataListSkeleton rows={5} />}
      {!isProgrammed && calcState === 'ready' && <DataList data={marketSummaryData} />}

      <StickyFooter>
        <Button
          fullWidth
          disabled={!canSubmit}
          onPress={() => {
            const handled = onElementTap?.(`Button: ${ctaLabel}`)
            if (!handled) onNext()
          }}
        >
          {ctaLabel}
        </Button>
      </StickyFooter>

      {/* Order type sheet */}
      <OrderTypeSheet
        open={orderSheetOpen}
        onClose={() => setOrderSheetOpen(false)}
        onSelect={handleOrderSelect}
      />
    </BaseLayout>
  )
}
