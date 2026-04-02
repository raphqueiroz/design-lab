/**
 * Deposit Address — matches Figma "Crypto Deposit Code" pattern.
 * Banner warning, payment data, address via vertical DataList, QR bottomsheet.
 */
import { useState } from 'react'
import { RiFileCopyLine, RiCheckLine, RiQrCodeLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Button from '@/library/inputs/Button'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'
import Banner from '@/library/display/Banner'
import BottomSheet from '@/library/layout/BottomSheet'
import Text from '@/library/foundations/Text'
import { NetworkBase } from '@web3icons/react'
import { getAsset } from '../shared/data'
import type { AssetTicker } from '../shared/data'
import { getAssetPalette } from '../shared/assetPalette'
import { TokenLogoCircle } from '../shared/TokenLogo'

const MOCK_ADDRESS = '0xA4ab77567b376f3fB6DF19fa9Fe898246B68846A'

export default function Screen5_DepositAddress({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC' } = useScreenData<{ assetTicker?: AssetTicker }>()
  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BaseLayout>
      <Header title="Continue em sua carteira ou corretora" onBack={onBack} />

      {/* Warning banner — attached to header */}
      <Banner
        variant="warning"
        title="Importante"
        description="Risco de perda permanente ao enviar criptomoedas não suportadas ou usar redes diferentes da selecionada."
      />

      {/* Payment data + deposit address — continuous table */}
      <Stack gap="none">
        <GroupHeader text="Dados para pagamento" />
        <DataList
          className="[&>div:last-child]:border-b [&>div:last-child]:border-[var(--token-neutral-100)]"
          data={[
            {
              label: 'Você paga',
              value: (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <TokenLogoCircle ticker={assetTicker} fallbackUrl={asset.icon} size={20} color={palette.bg} />
                  0,025 {asset.ticker}
                </span>
              ),
            },
            {
              label: 'Rede Blockchain',
              value: (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <NetworkBase size={20} variant="branded" />
                  Base
                </span>
              ),
            },
            { label: 'Você recebe', value: `0,025 ${asset.ticker}` },
            { label: 'Taxa de rede', value: 'US$ 0,12' },
          ]}
        />
        <DataList
          variant="vertical"
          data={[
            {
              label: 'Endereço para depósito',
              value: <span className="break-all">{MOCK_ADDRESS}</span>,
              action: (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center rounded-full border-none cursor-pointer"
                  style={{ width: 32, height: 32, background: 'var(--color-surface-shade)' }}
                >
                  {copied
                    ? <RiCheckLine size={16} className="text-[var(--color-feedback-success)]" />
                    : <RiFileCopyLine size={16} className="text-content-secondary" />
                  }
                </button>
              ),
            },
          ]}
        />
        {/* QR Code button — inline, no gap to table above */}
        <div className="pt-0">
          <Button variant="primary" size="sm" onPress={() => setQrOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <RiQrCodeLine size={14} />
              Ver QR Code
            </span>
          </Button>
        </div>
      </Stack>

      <StickyFooter>
        <Stack gap="sm">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            onPress={() => {
              const handled = onElementTap?.('Button: Já enviei')
              if (!handled) onNext()
            }}
          >
            Já enviei
          </Button>
          <button
            type="button"
            className="w-full text-center bg-transparent border-none cursor-pointer py-2"
            style={{ color: 'var(--color-content-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Ver instruções de envio
          </button>
        </Stack>
      </StickyFooter>

      {/* QR Code BottomSheet */}
      <BottomSheet open={qrOpen} onClose={() => setQrOpen(false)}>
        <Stack gap="default">
          <Text variant="heading-md" className="text-center">QR Code</Text>
          <Text variant="body-sm" color="content-secondary" className="text-center">
            Escaneie o código abaixo com sua carteira ou corretora para enviar {asset.name} na rede Base.
          </Text>
          <div
            className="flex items-center justify-center mx-auto rounded-2xl"
            style={{
              width: 200,
              height: 200,
              background: 'var(--color-surface-shade)',
              border: '2px dashed var(--color-neutral-200)',
            }}
          >
            <Text variant="body-sm" color="content-tertiary">QR Code</Text>
          </div>
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
