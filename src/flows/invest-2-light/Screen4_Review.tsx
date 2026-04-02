/**
 * Screen4_Review — Review screen for buy and sell orders.
 * Buy: market (single DataList) / programmed (two sections with TP/SL).
 * Sell: asset with logo, quantities, payment method, VET.
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import Header from '@/library/navigation/Header'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Banner from '@/library/display/Banner'
import Text from '@/library/foundations/Text'
import {
  getAsset, isVolatile, formatUSD, formatQuantity,
} from './shared/data'
import type { AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import { TokenLogoCircle } from './shared/TokenLogo'

interface ScreenData {
  assetTicker?: AssetTicker
  mode?: 'buy' | 'sell'
  orderType?: 'market' | 'programmed'
  tpPrice?: number
  slPrice?: number
}

export default function Screen4_Review({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const {
    assetTicker = 'BTC',
    mode = 'buy',
    orderType = 'market',
    tpPrice,
    slPrice,
  } = useScreenData<ScreenData>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const isBuy = mode === 'buy'
  const currentPrice = volatile ? (asset.price ?? 100) : 100
  const isProgrammed = orderType === 'programmed'

  const investAmount = 100
  const estimatedQty = volatile && currentPrice > 0
    ? investAmount / currentPrice
    : 0

  const mockTp = tpPrice ?? Math.round(currentPrice * 1.1)
  const mockSl = slPrice ?? Math.round(currentPrice * 0.9)

  // ── Sell Review ──
  if (!isBuy) {
    return (
      <BaseLayout>
        <Header title="Revise os dados" onBack={onBack} />

        <Stack gap="none">
          <GroupHeader text="Detalhes da operação" />
          <DataList data={[
            {
              label: 'Ativo',
              value: (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={20} color={palette.bg} />
                  {asset.name}
                </span>
              ),
            },
            { label: 'Você compra', value: formatQuantity(estimatedQty, assetTicker) },
            { label: 'Você paga', value: formatUSD(investAmount) },
            { label: 'Meio de pagamento', value: 'Saldo em conta' },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
            {
              label: 'VET',
              info: () => {},
              value: `1 ${assetTicker} ⇄ ${formatUSD(currentPrice)}`,
            },
          ]} />
        </Stack>

        <Banner
          variant="neutral"
          title="O valor final pode variar"
          description="A ordem será executada ao melhor preço disponível. Para ativos voláteis, o preço final pode diferir ligeiramente do exibido."
        />

        <StickyFooter>
          <Button fullWidth onPress={() => {
            const handled = onElementTap?.('Button: Confirmar venda')
            if (!handled) onNext()
          }}>
            Confirmar venda
          </Button>
        </StickyFooter>
      </BaseLayout>
    )
  }

  // ── Buy Review ──
  return (
    <BaseLayout>
      <Header title="Revise os dados" onBack={onBack} />

      {isProgrammed ? (
        <Stack gap="default">
          <Stack gap="none">
            <GroupHeader text="Detalhes da operação" />
            <DataList data={[
              {
                label: 'Ativo',
                value: (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={20} color={palette.bg} />
                    {asset.name}
                  </span>
                ),
              },
              { label: 'Tipo de ordem', value: 'Compra programada' },
              { label: 'Valor', value: formatUSD(investAmount) },
              { label: 'Pagamento', value: 'Saldo em dólar' },
              {
                label: 'Nossa taxa',
                value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
              },
            ]} />
          </Stack>

          <Stack gap="none">
            <GroupHeader text="Ordens configuradas" />
            <DataList data={[
              { label: 'Preço de entrada', value: formatUSD(currentPrice) },
              {
                label: 'Realizar lucro (TP)',
                value: <span className="text-[var(--color-feedback-success)] font-medium">{formatUSD(mockTp)}</span>,
              },
              {
                label: 'Stop Loss (SL)',
                value: <span className="text-[var(--color-feedback-critical)] font-medium">{formatUSD(mockSl)}</span>,
              },
            ]} />
          </Stack>

          <Banner
            variant="neutral"
            title="Ordens automáticas ativas"
            description="A compra será executada quando o preço atingir o valor definido. As ordens de saída serão ativadas automaticamente após a compra."
          />
        </Stack>
      ) : (
        <Stack gap="default">
          <Stack gap="none">
            <GroupHeader text="Detalhes da operação" />
            <DataList data={[
              {
                label: 'Ativo',
                value: (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={20} color={palette.bg} />
                    {asset.name}
                  </span>
                ),
              },
              { label: 'Valor', value: formatUSD(investAmount) },
              ...(estimatedQty > 0
                ? [{ label: 'Quantidade estimada', value: formatQuantity(estimatedQty, asset.ticker) }]
                : []),
              { label: 'Preço atual', value: formatUSD(currentPrice) },
              { label: 'Pagamento', value: 'Saldo em dólar' },
              { label: 'Execução', value: 'Instantânea' },
              {
                label: 'Nossa taxa',
                value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
              },
            ]} />
          </Stack>

          <Banner
            variant="neutral"
            title="O valor final pode variar"
            description="A ordem será executada ao melhor preço disponível. Para ativos voláteis, o preço final pode diferir ligeiramente do exibido."
          />
        </Stack>
      )}

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Confirmar compra')
          if (!handled) onNext()
        }}>
          Confirmar compra
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
