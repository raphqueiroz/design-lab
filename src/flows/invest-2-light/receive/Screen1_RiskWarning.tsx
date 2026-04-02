/**
 * Risk Warning — BottomSheet overlay on top of the asset selection screen.
 * Checkbox must be checked to enable "Continuar".
 */
import { useState, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { ASSETS } from '../shared/data'
import { getAssetPalette } from '../shared/assetPalette'
import { TokenLogoCircle } from '../shared/TokenLogo'
import BottomSheet from '@/library/layout/BottomSheet'
import Button from '@/library/inputs/Button'
import Checkbox from '@/library/inputs/Checkbox'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'
import Header from '@/library/navigation/Header'
import ListItem from '@/library/display/ListItem'
import cautionImg from '@/assets/images/deposit-caution.png'

export default function Screen1_RiskWarning({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [accepted, setAccepted] = useState(false)

  // Show asset list in background for context
  const cryptoAssets = useMemo(() => ASSETS.filter(a => a.category !== 'fixed-income').slice(0, 6), [])

  return (
    <div className="relative flex flex-col min-h-screen bg-[var(--color-surface-primary)]">
      {/* Background: asset selection page (dimmed by BottomSheet backdrop) */}
      <div className="flex-1 overflow-hidden" style={{ paddingTop: 'var(--safe-area-top)' }}>
        <div className="px-[var(--token-spacing-6)] pt-4 pb-3">
          <Header title="Qual criptomoeda?" description="Escolha o ativo que deseja depositar." onBack={onBack} />
        </div>
        <div className="px-[var(--token-spacing-6)]">
          {cryptoAssets.map(asset => {
            const palette = getAssetPalette(asset.ticker)
            return (
              <ListItem
                key={asset.ticker}
                title={asset.name}
                subtitle={asset.ticker}
                left={<TokenLogoCircle ticker={asset.ticker} fallbackUrl={asset.icon} size={40} color={palette.bg} />}
              />
            )
          })}
        </div>
      </div>

      {/* Risk warning BottomSheet */}
      <BottomSheet open onClose={() => {}} showCloseButton={false}>
        <Stack gap="default">
          {/* Illustration */}
          <div className="flex justify-center mt-2">
            <img
              src={cautionImg}
              alt=""
              style={{ width: 140, height: 140, objectFit: 'contain' }}
            />
          </div>

          {/* Title + body */}
          <Stack gap="sm">
            <Text variant="heading-lg" className="text-center">Prossiga com cuidado</Text>
            <Text variant="body-md" color="content-secondary" className="text-center">
              Receba criptomoedas de qualquer carteira web3 ou corretora.
            </Text>
          </Stack>

          {/* Checkbox + label text */}
          <button
            type="button"
            onClick={() => setAccepted(!accepted)}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0 text-left"
          >
            <Checkbox checked={accepted} onChange={setAccepted} />
            <Text variant="body-md" color="content-primary" className="font-medium">
              Entendo que erros podem resultar em perda total dos ativos e quero continuar
            </Text>
          </button>

          <div className="h-2" />

          {/* Buttons */}
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" fullWidth onPress={onBack}>
              Voltar
            </Button>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              disabled={!accepted}
              onPress={() => {
                const handled = onElementTap?.('Button: Continuar')
                if (!handled) onNext()
              }}
            >
              Continuar
            </Button>
          </div>
        </Stack>
      </BottomSheet>
    </div>
  )
}
