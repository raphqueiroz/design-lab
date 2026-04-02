/**
 * Screen6_Success — Buy/Sell order success with FeedbackLayout.
 * Adapts title, subtitle, and summary based on mode.
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
import { getAsset, formatUSD } from './shared/data'
import type { AssetTicker } from './shared/data'

export default function Screen6_Success({ onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC', mode = 'buy' } = useScreenData<{
    assetTicker?: AssetTicker
    mode?: 'buy' | 'sell'
  }>()

  const asset = getAsset(assetTicker)
  const currentPrice = asset.price ?? 100
  const isBuy = mode === 'buy'

  return (
    <FeedbackLayout onClose={onBack}>
      <Stack gap="sm">
        <Text variant="display">{isBuy ? 'Compra realizada' : 'Venda realizada'}</Text>
        <Text variant="body-md" color="content-secondary">
          {isBuy
            ? `Sua ordem de compra de ${asset.name} foi executada.`
            : `Sua ordem de venda de ${asset.name} foi executada.`}
        </Text>
      </Stack>

      <Stack gap="default">
        <Stack gap="none">
          <GroupHeader text="Resumo da operação" />
          <DataList data={[
            { label: 'Ativo', value: asset.name },
            { label: isBuy ? 'Valor investido' : 'Valor resgatado', value: 'US$ 100,00' },
            { label: 'Preço de execução', value: formatUSD(currentPrice) },
            { label: isBuy ? 'Pagamento' : 'Crédito em', value: 'Saldo em dólar' },
            {
              label: 'Nossa taxa',
              value: (
                <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>
              ),
            },
          ]} />
        </Stack>
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
