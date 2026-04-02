/**
 * AssetListItem — unified asset row used in portfolio lists and discover screens.
 * Variants: 'holding' (portfolio value + quantity) and 'market' (market price + change).
 */
import { motion } from 'framer-motion'
import { RiHeartFill, RiHeartLine } from '@remixicon/react'
import { TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, BORDER_LIGHT, GREEN, RED } from './theme'
import { getAsset, getPosition, isVolatile, formatBRL, formatQuantity } from './data'
import type { AssetTicker } from './data'
import { getAssetPalette } from './assetPalette'
import { TokenLogoCircle } from './TokenLogo'
import { Sparkline } from '../Screen0_Dashboard.parts'
import { getSparkline } from './data'

export interface AssetListItemProps {
  ticker: AssetTicker
  /** 'holding' shows portfolio value + quantity; 'market' shows market price + change */
  variant?: 'holding' | 'market'
  /** Show inline sparkline chart (default true) */
  showSparkline?: boolean
  showFavorite?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  onPress?: () => void
}

export default function AssetListItem({
  ticker,
  variant = 'market',
  showSparkline = true,
  showFavorite,
  isFavorite,
  onFavoriteToggle,
  onPress,
}: AssetListItemProps) {
  const asset = getAsset(ticker)
  const palette = getAssetPalette(ticker)
  const volatile = isVolatile(asset)
  const change = asset.change24h ?? 0
  const isPositive = change >= 0
  const sparkline = getSparkline(ticker)
  const position = variant === 'holding' ? getPosition(ticker) : undefined

  // Subtitle text
  const subtitle = volatile
    ? <>24h{'\u2009'}<span style={{ fontSize: 17, lineHeight: 1, verticalAlign: 'text-top', paddingBottom: 2 }}>{isPositive ? '↗' : '↘'}</span>{'\u2009'}{Math.abs(change).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</>
    : `Rende ${asset.apyDisplay?.replace(' a.a.', '')} ao ano`

  // Right column
  const rightTitle = variant === 'holding' && position
    ? formatBRL(position.currentValue)
    : volatile
      ? formatBRL(asset.price!)
      : (asset.apyDisplay ?? '')
  const rightSubtitle = variant === 'holding' && position && volatile
    ? formatQuantity(position.quantity, ticker)
    : volatile
      ? <span style={{ color: isPositive ? GREEN : RED, fontWeight: 600 }}>{isPositive ? '↗' : '↘'}{'\u2009'}{Math.abs(change).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
      : null

  return (
    <div
      className="flex items-center gap-3 w-full pl-4 pr-5 py-4"
      style={{ borderBottom: `1px solid ${BORDER_LIGHT}` }}
    >
      {/* Tappable main area */}
      <motion.button
        onClick={onPress}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left"
      >
        {/* Icon */}
        <TokenLogoCircle ticker={ticker} fallbackUrl={asset.icon} size={40} color={palette.bg} className="flex-shrink-0" />

        {/* Name + subtitle */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="truncate block" style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>
            {asset.name}
          </span>
          <span className="inline-flex items-center" style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
            {subtitle}
          </span>
        </div>

        {/* Sparkline — fixed width slot for vertical alignment across rows (volatile only) */}
        {showSparkline && volatile && (
          <div className="flex-shrink-0" style={{ width: 60 }}>
            <Sparkline data={sparkline} color={TEXT_PRIMARY} width={60} height={24} />
          </div>
        )}

        {/* Right column */}
        <div className="flex flex-col items-end flex-shrink-0 ml-2" style={showSparkline && volatile ? { width: 110 } : undefined}>
          <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 500 }}>
            {rightTitle}
          </span>
          {rightSubtitle && (
            <span style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
              {rightSubtitle}
            </span>
          )}
        </div>
      </motion.button>

      {/* Favorite toggle */}
      {showFavorite && (
        <motion.button
          onClick={onFavoriteToggle}
          whileTap={{ scale: 0.85 }}
          className="flex-shrink-0 bg-transparent border-none cursor-pointer p-1"
        >
          {isFavorite
            ? <RiHeartFill size={20} color="#F43F5E" />
            : <RiHeartLine size={20} color={TEXT_TERTIARY} />
          }
        </motion.button>
      )}
    </div>
  )
}
