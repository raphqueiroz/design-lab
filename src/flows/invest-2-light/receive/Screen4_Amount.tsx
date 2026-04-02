/**
 * Amount Entry — how much crypto to deposit, with USD equivalent.
 * Network fee with info bottomsheet explaining relay bridging.
 */
import { useState, useCallback } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import DataList from '@/library/display/DataList'
import BottomSheet from '@/library/layout/BottomSheet'
import Text from '@/library/foundations/Text'
import { NetworkBase } from '@web3icons/react'
import { getAsset, formatUSD } from '../shared/data'
import type { AssetTicker } from '../shared/data'
import { getAssetPalette } from '../shared/assetPalette'
import { TokenLogoCircle } from '../shared/TokenLogo'

const CRYPTO_DECIMALS = 5
const RELAY_FEE_USD = 0.12

export default function Screen4_Amount({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{ assetTicker?: AssetTicker }>()
  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const price = asset.price ?? 100
  const tokenSvg = <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={40} color={palette.bg} />

  const [amount, setAmount] = useState('')
  const [feeSheetOpen, setFeeSheetOpen] = useState(false)
  const parsedAmount = parseInt(amount || '0', 10) / Math.pow(10, CRYPTO_DECIMALS)
  const usdEquivalent = parsedAmount * price
  const isValid = parsedAmount > 0

  const secondaryDisplay = isValid ? `≈ ${formatUSD(usdEquivalent)}` : undefined

  const handleContinue = useCallback(() => {
    const handled = onElementTap?.('Button: Continuar')
    if (!handled) onNext()
  }, [onElementTap, onNext])

  return (
    <BaseLayout>
      <Header title="Informe a quantidade" onBack={onBack} />

      <Stack gap="none">
        <CurrencyInput
          label="Quantidade"
          value={amount}
          onChange={setAmount}
          tokenIcon={tokenSvg}
          currencySymbol={assetTicker}
          decimals={CRYPTO_DECIMALS}
          secondaryValue={secondaryDisplay}
        />
      </Stack>

      <DataList data={[
          {
            label: 'Rede',
            value: (
              <span className="inline-flex items-center gap-1.5">
                <NetworkBase size={18} variant="branded" />
                Base
              </span>
            ),
          },
          { label: 'Tempo estimado', value: '~2 minutos' },
          {
            label: 'Nossa taxa',
            value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
          },
          {
            label: 'Custo de rede',
            info: () => setFeeSheetOpen(true),
            value: isValid
              ? formatUSD(RELAY_FEE_USD)
              : <span className="inline-block w-[48px] h-[14px] rounded bg-[var(--color-surface-shade)] animate-pulse" />,
          },
      ]} />

      <StickyFooter>
        <Button
          fullWidth
          size="lg"
          disabled={!isValid}
          onPress={handleContinue}
        >
          Continuar
        </Button>
      </StickyFooter>

      {/* Fee details BottomSheet */}
      <BottomSheet open={feeSheetOpen} onClose={() => setFeeSheetOpen(false)}>
        <Stack gap="default">
          <Stack gap="sm">
            <Text variant="heading-md">Custo de rede</Text>
            <Text variant="body-sm" color="content-secondary">
              Taxa cobrada pelo protocolo de bridge para processar a transação.
            </Text>
          </Stack>

          <DataList data={[
            { label: 'Provedor', value: 'Relay Bridge' },
            { label: 'Taxa de rede', value: formatUSD(RELAY_FEE_USD) },
            {
              label: 'Nossa taxa',
              value: <span className="text-[var(--color-feedback-success)] font-medium">Grátis</span>,
            },
          ]} />
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
