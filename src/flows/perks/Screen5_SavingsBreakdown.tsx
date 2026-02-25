import { X, TrendingDown, Building2, ArrowRightLeft } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Text from '../../library/foundations/Text'
import Spacer from '../../library/foundations/Spacer'
import Divider from '../../library/foundations/Divider'
import Amount from '../../library/display/Amount'

const MOCK_SAVINGS = 12.5

const lineItems = [
  {
    icon: <TrendingDown size={18} className="text-interactive-foreground" />,
    label: 'Taxa cobrada',
    sublabel: 'Spread + câmbio',
    picnic: 'R$ 0,00',
    others: 'R$ 7,50',
  },
  {
    icon: <Building2 size={18} className="text-interactive-foreground" />,
    label: 'Economia operacional',
    sublabel: 'IOF + tarifas',
    picnic: 'R$ 2,50',
    others: 'R$ 7,50',
  },
  {
    icon: <ArrowRightLeft size={18} className="text-interactive-foreground" />,
    label: 'Custo de conversão',
    sublabel: 'Taxa de câmbio',
    picnic: 'Comercial',
    others: 'Turismo',
  },
]

export default function Screen5_SavingsBreakdown({ onNext, onBack }: FlowScreenProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-[var(--token-spacing-md)] h-[56px] shrink-0">
        <Text variant="heading-sm">Como calculamos sua economia</Text>
        <button
          type="button"
          onClick={onBack}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-surface-secondary transition-colors cursor-pointer"
        >
          <X size={20} className="text-content-primary" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[var(--token-spacing-md)]">
        <Text variant="body-sm" color="text-secondary">
          Veja a comparação do que você paga na Picnic versus a média do mercado para
          conversões de dólar.
        </Text>

        <Spacer size="lg" />

        {/* Comparison header */}
        <div className="flex items-center mb-[var(--token-spacing-3)]">
          <div className="flex-1" />
          <div className="w-[80px] text-center">
            <Text variant="caption" color="text-tertiary">Picnic</Text>
          </div>
          <div className="w-[80px] text-center">
            <Text variant="caption" color="text-tertiary">Outros</Text>
          </div>
        </div>

        {/* Line items */}
        {lineItems.map((item, i) => (
          <div key={item.label}>
            {i > 0 && <Divider spacing="sm" />}
            <div className="flex items-center py-[var(--token-spacing-3)]">
              <div className="flex items-center gap-[var(--token-spacing-2)] flex-1 min-w-0">
                {item.icon}
                <div>
                  <Text variant="body-sm">{item.label}</Text>
                  <Text variant="caption" color="text-tertiary">{item.sublabel}</Text>
                </div>
              </div>
              <div className="w-[80px] text-center">
                <Text variant="body-sm" className="text-interactive-foreground">{item.picnic}</Text>
              </div>
              <div className="w-[80px] text-center">
                <Text variant="body-sm" color="text-tertiary">{item.others}</Text>
              </div>
            </div>
          </div>
        ))}

        <Spacer size="lg" />
        <Divider />
        <Spacer size="md" />

        {/* Total savings */}
        <div className="flex items-center justify-between bg-surface-secondary rounded-[var(--token-radius-lg)] p-[var(--token-spacing-md)]">
          <Text variant="body-md">Sua economia</Text>
          <div className="flex items-center gap-[var(--token-spacing-2)]">
            <Amount value={MOCK_SAVINGS} size="lg" />
          </div>
        </div>

        <Spacer size="md" />
        <Text variant="caption" color="text-tertiary" align="center">
          Valores baseados em uma conversão de R$ 250,89 comparando
          com a média de 5 instituições financeiras.
        </Text>
        <Spacer size="lg" />
      </div>

      {/* Bottom action */}
      <div className="shrink-0 p-[var(--token-spacing-md)] border-t border-border-default">
        <button
          type="button"
          onClick={onNext}
          className="w-full text-center py-[var(--token-spacing-3)] text-interactive-foreground text-[length:var(--token-font-size-body-md)] font-medium cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
