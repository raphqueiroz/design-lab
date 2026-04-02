/**
 * Open Orders — list of orders grouped by date, with status badges.
 * Tap order row → BottomSheet with details + cancel. Empty state when no orders.
 */
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RiInboxLine, RiAddLine, RiSubtractLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  getAllOrdersGrouped, getAsset, formatBRL, formatQuantity,
} from './shared/data'
import type { Order } from './shared/data'
import Toast from '@/library/feedback/Toast'
import { getAssetPalette } from './shared/assetPalette'
import {
  BG, TEXT_SECONDARY, TEXT_TERTIARY,
  SAFE_TOP, SAFE_BOTTOM, fadeUp,
} from './shared/theme'
import { idlePulse } from './shared/animations'
import { TokenLogoCircle } from './shared/TokenLogo'
import Header from '@/library/navigation/Header'
import GroupHeader from '@/library/navigation/GroupHeader'
import ListItem from '@/library/display/ListItem'
import BottomSheet from '@/library/layout/BottomSheet'
import DataList from '@/library/display/DataList'
import Button from '@/library/inputs/Button'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'

// ── Status config ──

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string }> = {
  active: { label: 'Em aberto', color: '#F59E0B' },
  executed: { label: 'Executada', color: '#16A34A' },
  cancelled: { label: 'Cancelada', color: '#9CA3AF' },
}

// ── Order Avatar: asset token with +/- overlay (same pattern as il-statement) ──

function OrderAvatar({ order }: { order: Order }) {
  const asset = getAsset(order.asset)
  const palette = getAssetPalette(order.asset)
  const isBuy = order.side === 'buy'
  const Icon = isBuy ? RiAddLine : RiSubtractLine

  return (
    <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
      {/* Main: asset token */}
      <TokenLogoCircle ticker={asset.ticker} fallbackUrl={asset.icon} size={40} color={palette.bg} />
      {/* Overlay: buy/sell icon */}
      <div
        className="absolute flex items-center justify-center rounded-full border-2 border-white bg-[var(--color-surface-shade)]"
        style={{ width: 24, height: 24, bottom: -4, right: -4 }}
      >
        <Icon size={12} className="text-content-primary" />
      </div>
    </div>
  )
}

export default function Screen7_OpenOrders({ onBack, onElementTap, onNext }: FlowScreenProps) {
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  // Build groups with local cancelled overrides
  const orderGroups = getAllOrdersGrouped().map(g => ({
    ...g,
    orders: g.orders.map(o => cancelledIds.has(o.id) ? { ...o, status: 'cancelled' as const } : o),
  }))
  const allOrders = orderGroups.flatMap(g => g.orders)

  const handleCancelOrder = useCallback(() => {
    if (selectedOrder) {
      setCancelledIds(prev => new Set(prev).add(selectedOrder.id))
      setSelectedOrder(null)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 3000)
    }
  }, [selectedOrder])

  // ── Empty State ──
  if (allOrders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: BG }}>
        <div style={{ height: SAFE_TOP }} />
        <div className="page-pad">
          <Header title="Ordens" description="Acompanhe e gerencie suas ordens de Take Profit e Stop Loss." onBack={onBack} />
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
            <RiInboxLine size={32} color={TEXT_TERTIARY} />
          </motion.div>
          <motion.span
            {...fadeUp(0.05)}
            style={{ color: TEXT_SECONDARY, fontSize: 15, fontWeight: 500 }}
          >
            Nenhuma ordem ativa
          </motion.span>
          <motion.span
            {...fadeUp(0.1)}
            className="mt-1.5 text-center max-w-[220px]"
            style={{ color: TEXT_TERTIARY, fontSize: 13, lineHeight: 1.5 }}
          >
            Crie ordens de Take Profit ou Stop Loss na tela de negociação.
          </motion.span>
        </div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>
    )
  }

  // ── Orders List ──
  return (
    <div className="relative flex flex-col min-h-screen" style={{ background: BG }}>
      <div style={{ height: SAFE_TOP }} />

      <div className="flex-1 overflow-y-auto page-pad">
        <Header title="Ordens" description="Acompanhe e gerencie suas ordens de Take Profit e Stop Loss." onBack={onBack} />

        {/* Orders grouped by date */}
        <div className="full-bleed mt-4">
          {orderGroups.map(group => (
            <Stack gap="none" key={group.date}>
              <GroupHeader text={group.date} className="px-[var(--token-spacing-6)]" />
              {group.orders.map((order) => {
                const asset = getAsset(order.asset)
                const isBuy = order.side === 'buy'
                const sideLabel = isBuy ? 'Comprar' : 'Vender'
                const status = STATUS_CONFIG[order.status]
                const isCancelled = order.status === 'cancelled'

                return (
                  <ListItem
                    key={order.id}
                    title={`${sideLabel} ${asset.name}`}
                    subtitle={`Preço alvo: ${formatBRL(order.triggerPrice)}`}
                    className={`[--token-font-size-body-lg:16px] px-[var(--token-spacing-6)] ${isCancelled ? 'opacity-50' : ''}`}
                    left={<OrderAvatar order={order} />}
                    onPress={() => setSelectedOrder(order)}
                    right={
                      <Stack gap="none" align="end">
                        <Text variant="body-md">{formatBRL(order.value)}</Text>
                        <span className="inline-flex items-center gap-1.5" style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                          <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: status.color, flexShrink: 0 }} />
                          {status.label}
                        </span>
                      </Stack>
                    }
                    trailing={null}
                  />
                )
              })}
            </Stack>
          ))}
        </div>

        <div style={{ paddingBottom: SAFE_BOTTOM }} />
      </div>

      {/* ── Order Detail BottomSheet ── */}
      {selectedOrder && (() => {
        const asset = getAsset(selectedOrder.asset)
        const isBuy = selectedOrder.side === 'buy'
        const sideLabel = isBuy ? 'Compra' : 'Venda'
        const typeLabel = selectedOrder.type === 'take-profit' ? 'Take Profit' : 'Stop Loss'
        const status = STATUS_CONFIG[selectedOrder.status]

        return (
          <BottomSheet open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
            <DataList data={[
              { label: 'Ativo', value: `${asset.name} (${asset.ticker})` },
              { label: 'Operação', value: sideLabel },
              { label: 'Tipo', value: typeLabel },
              { label: 'Preço alvo', value: formatBRL(selectedOrder.triggerPrice) },
              { label: 'Valor', value: formatBRL(selectedOrder.value) },
              { label: 'Quantidade', value: formatQuantity(selectedOrder.quantity, selectedOrder.asset) },
              { label: 'Status', value: (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: status.color, flexShrink: 0 }} />
                  {status.label}
                </span>
              ) },
              { label: 'Criada em', value: selectedOrder.createdAt },
            ]} />
            {selectedOrder.status === 'active' && (
              <div className="mt-4">
                <Button
                  variant="destructive"
                  size="lg"
                  fullWidth
                  onPress={handleCancelOrder}
                >
                  Cancelar ordem
                </Button>
              </div>
            )}
          </BottomSheet>
        )
      })()}

      <Toast
        variant="success"
        message="Ordem cancelada com sucesso"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </div>
  )
}
