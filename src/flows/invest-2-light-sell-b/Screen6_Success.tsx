/**
 * Screen6_Success — Buy/Sell order success with FeedbackLayout.
 * Adapts title, subtitle, and summary based on mode.
 * Sell mode uses same DataList structure as review page.
 */
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import FeedbackLayout from '@/library/layout/FeedbackLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Text from '@/library/foundations/Text'
import { getAsset, isVolatile, formatUSD, formatQuantity } from '../invest-2-light/shared/data'
import type { AssetTicker } from '../invest-2-light/shared/data'
import { getAssetPalette } from '../invest-2-light/shared/assetPalette'
import { TokenLogoCircle } from '../invest-2-light/shared/TokenLogo'
import sellSuccessImg from '@/assets/images/sell-success.png'

export default function Screen6_Success({ onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC', mode = 'buy', payWith } = useScreenData<{
    assetTicker?: AssetTicker
    mode?: 'buy' | 'sell'
    payWith?: AssetTicker
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const currentPrice = volatile ? (asset.price ?? 100) : 100
  const isBuy = mode === 'buy'

  const payAsset = payWith ? getAsset(payWith) : null
  const payPalette = payWith ? getAssetPalette(payWith) : null
  const payAssetPrice = payAsset?.price ?? 1
  const payPrice = payWith ? currentPrice / payAssetPrice : currentPrice

  const investAmount = 100
  const estimatedQty = volatile && currentPrice > 0 ? investAmount / currentPrice : 0

  return (
    <FeedbackLayout animation={null} imageSrc={isBuy ? undefined : sellSuccessImg} onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">{isBuy ? 'Compra realizada' : 'Estamos processando sua transação'}</Text>
        <Text variant="body-md" color="content-secondary">
          {isBuy
            ? `Sua ordem de compra de ${asset.name} foi executada.`
            : 'Te avisaremos quando a operação for concluída. Isso deve levar poucos minutos.'}
        </Text>
      </Stack>

      <Stack gap="none">
        <GroupHeader text="Resumo da operação" />
        <DataList data={[
          {
            label: 'Você compra',
            value: (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={20} color={palette.bg} />
                {formatQuantity(estimatedQty, assetTicker)}
              </span>
            ),
          },
          {
            label: 'Você paga',
            value: payWith && payAsset && payPalette ? (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <TokenLogoCircle ticker={payWith} fallbackUrl={payAsset.icon} size={20} color={payPalette.bg} />
                {(investAmount * payAssetPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {payWith}
              </span>
            ) : formatUSD(investAmount),
          },
          {
            label: 'Nossa taxa',
            value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
          },
          {
            label: 'VET',
            info: () => {},
            value: payWith ? `1 ${assetTicker} ⇄ ${payPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${payWith}` : `1 ${assetTicker} ⇄ ${formatUSD(currentPrice)}`,
          },
        ]} />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Entendi')
          if (!handled) onBack()
        }}>Entendi</Button>
      </StickyFooter>
    </FeedbackLayout>
  )
}
