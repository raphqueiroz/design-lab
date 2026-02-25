import { TrendingDown, Shield, Zap } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import ScreenLayout from '../../library/layout/ScreenLayout'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'
import Card from '../../library/display/Card'
import Spacer from '../../library/foundations/Spacer'
import Divider from '../../library/foundations/Divider'

const MOCK_RATE = 5.12

const benefits = [
  {
    icon: <TrendingDown size={20} className="text-interactive-foreground" />,
    title: 'Sem spread oculto',
    description: 'Usamos a cotação comercial, sem margem escondida.',
  },
  {
    icon: <Shield size={20} className="text-interactive-foreground" />,
    title: 'Economia operacional',
    description: 'Nossa estrutura enxuta repassa economia pra você.',
  },
  {
    icon: <Zap size={20} className="text-interactive-foreground" />,
    title: 'Conversão instantânea',
    description: 'Converta em segundos, 24h por dia.',
  },
]

export default function Screen3_DollarRate({ onNext, onBack }: FlowScreenProps) {
  return (
    <ScreenLayout
      header={<Header title="O dólar mais barato do Brasil" onBack={onBack} />}
      bottomCTA={
        <Button fullWidth size="lg" onPress={onNext}>
          Converter agora
        </Button>
      }
    >
      <div className="px-[var(--token-spacing-md)] py-[var(--token-spacing-lg)]">
        <Text variant="heading-sm">
          Por que aqui o dólar é mais barato?
        </Text>
        <Spacer size="sm" />
        <Text variant="body-md" color="text-secondary">
          Na Picnic, você compra dólar a custo justo — cada centavo economizado é
          seu. Diferente de bancos e corretoras que cobram spreads abusivos.
        </Text>

        <Spacer size="lg" />

        {/* Rate highlight */}
        <Card variant="outlined">
          <div className="flex items-baseline justify-between">
            <Text variant="body-sm" color="text-secondary">Câmbio atual</Text>
            <Text variant="heading-md" className="text-interactive-foreground">
              R$ {MOCK_RATE.toFixed(2)}
            </Text>
          </div>
          <Text variant="caption" color="text-tertiary" className="mt-[var(--token-spacing-1)]">
            Cotação comercial · Atualizado agora
          </Text>
        </Card>

        <Spacer size="lg" />
        <Divider />
        <Spacer size="lg" />

        {/* Benefits list */}
        <div className="flex flex-col gap-[var(--token-spacing-md)]">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-[var(--token-spacing-3)]">
              <div className="shrink-0 w-[40px] h-[40px] rounded-[var(--token-radius-md)] bg-surface-secondary flex items-center justify-center">
                {b.icon}
              </div>
              <div className="flex-1">
                <Text variant="body-md">{b.title}</Text>
                <Text variant="body-sm" color="text-secondary">{b.description}</Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}
