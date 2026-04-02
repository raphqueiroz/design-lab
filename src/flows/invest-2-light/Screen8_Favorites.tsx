/**
 * Favorites — list of favorited assets using shared AssetListItem.
 * Empty state when no favorites.
 */
import { motion } from 'framer-motion'
import { RiHeartLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { getFavoriteAssets } from './shared/data'
import {
  BG, TEXT_SECONDARY, TEXT_TERTIARY,
  SAFE_TOP, SAFE_BOTTOM, fadeUp,
} from './shared/theme'
import { idlePulse } from './shared/animations'
import AssetListItem from './shared/AssetListItem'
import Header from '@/library/navigation/Header'

export default function Screen8_Favorites({ onBack, onElementTap, onNext }: FlowScreenProps) {
  const favorites = getFavoriteAssets()

  const handleAssetTap = (name: string) => {
    const handled = onElementTap?.(`ListItem: ${name}`)
    if (!handled) onNext()
  }

  // ── Empty State ──
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: BG }}>
        <div style={{ height: SAFE_TOP }} />
        <div className="page-pad">
          <Header title="Favoritos" description="Ativos que você marcou como favorito. Acompanhe seus preços e negocie com um toque." onBack={onBack} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            {...fadeUp(0)}
            {...idlePulse}
            className="flex items-center justify-center rounded-full mb-5"
            style={{
              width: 72,
              height: 72,
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <RiHeartLine size={32} color={TEXT_TERTIARY} />
          </motion.div>
          <motion.span
            {...fadeUp(0.05)}
            style={{ color: TEXT_SECONDARY, fontSize: 15, fontWeight: 500 }}
          >
            Nenhum favorito
          </motion.span>
          <motion.span
            {...fadeUp(0.1)}
            className="mt-1.5 text-center max-w-[240px]"
            style={{ color: TEXT_TERTIARY, fontSize: 13, lineHeight: 1.5 }}
          >
            Toque no ícone de coração em qualquer ativo para adicioná-lo aos seus favoritos.
          </motion.span>
        </div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>
    )
  }

  // ── Favorites List ──
  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      <div style={{ height: SAFE_TOP }} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto page-pad">
        <Header title="Favoritos" description="Ativos que você marcou como favorito. Acompanhe seus preços e negocie com um toque." onBack={onBack} />

        {/* Asset list — full bleed for edge-to-edge borders */}
        <div className="full-bleed mt-4">
          <div className="flex flex-col">
            {favorites.map(asset => (
              <AssetListItem
                key={asset.ticker}
                ticker={asset.ticker}
                variant="market"
                showSparkline={false}
                showFavorite
                isFavorite
                onPress={() => handleAssetTap(asset.name)}
              />
            ))}
          </div>
        </div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>
    </div>
  )
}
