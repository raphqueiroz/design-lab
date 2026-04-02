/**
 * Statement — transaction history grouped by date, matching card history visual language.
 * Token avatars with type overlay badges. Export extrato CTA at top.
 */
import { RiDownloadCloud2Line, RiAddLine, RiSubtractLine, RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  getStatementTransactions, getAsset,
} from './shared/data'
import type { StatementTxType, AssetTicker } from './shared/data'
import { getAssetPalette } from './shared/assetPalette'
import {
  BG, SAFE_TOP, SAFE_BOTTOM,
} from './shared/theme'
import { TokenLogoCircle } from './shared/TokenLogo'
import Header from '@/library/navigation/Header'
import GroupHeader from '@/library/navigation/GroupHeader'
import ListItem from '@/library/display/ListItem'
import IconButton from '@/library/inputs/IconButton'
import Stack from '@/library/layout/Stack'

// ── Overlay badge config ──

const TX_BADGE: Record<StatementTxType, { icon: typeof RiAddLine }> = {
  buy: { icon: RiAddLine },
  sell: { icon: RiSubtractLine },
  'deposit-crypto': { icon: RiArrowDownLine },
  'withdraw-crypto': { icon: RiArrowUpLine },
}

function TxAvatar({ type, asset }: { type: StatementTxType; asset: AssetTicker }) {
  const assetData = getAsset(asset)
  const palette = getAssetPalette(asset)
  const badge = TX_BADGE[type]
  const BadgeIcon = badge.icon

  return (
    <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
      <TokenLogoCircle ticker={assetData.ticker} fallbackUrl={assetData.icon} size={40} color={palette.bg} />
      <div
        className="absolute flex items-center justify-center rounded-full border-2 border-white bg-[var(--color-surface-shade)]"
        style={{
          width: 24,
          height: 24,
          bottom: -4,
          right: -4,
        }}
      >
        <BadgeIcon size={12} className="text-content-primary" />
      </div>
    </div>
  )
}

export default function Screen9_Statement({ onBack, onElementTap, onNext }: FlowScreenProps) {
  const dateGroups = getStatementTransactions()

  const handleExport = () => {
    const handled = onElementTap?.('ListItem: Exportar extrato')
    if (!handled) onNext()
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      <div style={{ height: SAFE_TOP }} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto page-pad">
        <Header
          title="Extrato"
          description="Histórico de todas as suas operações de investimento."
          onBack={onBack}
          rightAction={
            <IconButton
              variant="base"
              icon={<RiDownloadCloud2Line size={22} className="text-content-primary" />}
              onPress={handleExport}
            />
          }
        />

        {/* Transaction list grouped by date */}
        <div className="full-bleed mt-4">
          {dateGroups.map(group => (
            <Stack gap="none" key={group.date}>
              <GroupHeader text={group.date} className="px-[var(--token-spacing-6)]" />
              {group.transactions.map(tx => (
                <ListItem
                  key={tx.id}
                  title={tx.title}
                  subtitle={tx.subtitle}
                  className="[--token-font-size-body-lg:16px] px-[var(--token-spacing-6)]"
                  left={<TxAvatar type={tx.type} asset={tx.asset} />}
                  trailing={null}
                />
              ))}
            </Stack>
          ))}
        </div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>
    </div>
  )
}
