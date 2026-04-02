/**
 * @screen Titulo 2
 * @description página de compra seguindo o padrão do app
 */
import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'

// ── Quick-pick amounts ──

const QUICK_AMOUNTS = [50, 100, 250, 500]

export default function Screen({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [amount, setAmount] = useState(100)
  const btcPrice = 534280
  const btcQuantity = amount / btcPrice

  return (
    <BaseLayout>
      <Header title="Comprar Bitcoin" onBack={onBack} />

      <Stack>
        {/* Amount display */}
        <Stack gap="none" align="center" className="py-6">
          <Text variant="body-sm" color="content-secondary">Valor da compra</Text>
          <Text variant="display" className="tabular-nums">
            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <Text variant="body-sm" color="content-secondary">
            ≈ {btcQuantity.toFixed(8)} BTC
          </Text>
        </Stack>

        {/* Quick-pick pills */}
        <div className="flex gap-2 justify-center">
          {QUICK_AMOUNTS.map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="px-4 py-2 rounded-full border-none cursor-pointer text-[13px] font-semibold transition-colors"
              style={{
                background: amount === v ? 'var(--color-interactive-default)' : 'var(--token-neutral-100)',
                color: amount === v ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
              }}
            >
              R$ {v}
            </button>
          ))}
        </div>

        {/* Summary */}
        <Stack gap="none">
          <GroupHeader text="Resumo" />
          <DataList data={[
            { label: 'Ativo', value: 'Bitcoin (BTC)' },
            { label: 'Preço unitário', value: `R$ ${btcPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
            { label: 'Quantidade', value: `${btcQuantity.toFixed(8)} BTC` },
            { label: 'Método', value: 'Saldo em conta' },
          ]} />
        </Stack>
      </Stack>

      <StickyFooter>
        <Button variant="accent" size="lg" fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Confirmar compra')
          if (!handled) onNext()
        }}>
          Confirmar compra
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
