/**
 * Screen3_Trade.parts — Order type sheet for buy screen.
 */
import BottomSheet from '@/library/layout/BottomSheet'
import Stack from '@/library/layout/Stack'
import ListItem from '@/library/display/ListItem'

// ── Order Types ──

export interface OrderType {
  id: 'market' | 'programmed'
  title: string
  subtitle: string
}

export const ORDER_TYPES: OrderType[] = [
  {
    id: 'market',
    title: 'Compra a mercado',
    subtitle: 'Executa imediatamente pelo melhor preço disponível',
  },
  {
    id: 'programmed',
    title: 'Compra programada',
    subtitle: 'Configure alvos de entrada, lucro e proteção',
  },
]

export function getOrderType(id: string): OrderType {
  return ORDER_TYPES.find(o => o.id === id) ?? ORDER_TYPES[0]
}

// ── Order Type Sheet ──

interface OrderTypeSheetProps {
  open: boolean
  onClose: () => void
  onSelect: (id: 'market' | 'programmed') => void
}

export function OrderTypeSheet({ open, onClose, onSelect }: OrderTypeSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Tipo de ordem">
      <Stack gap="none">
        {ORDER_TYPES.map(type => (
          <ListItem
            key={type.id}
            title={type.title}
            subtitle={type.subtitle}
            onPress={() => {
              onSelect(type.id)
              onClose()
            }}
          />
        ))}
      </Stack>
    </BottomSheet>
  )
}
