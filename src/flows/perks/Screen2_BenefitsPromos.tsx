import { useState } from 'react'
import { DollarSign, Users, Percent, Star, Gift } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Header from '../../library/navigation/Header'
import ScreenLayout from '../../library/layout/ScreenLayout'
import SegmentedControl from '../../library/navigation/SegmentedControl'
import ListItem from '../../library/display/ListItem'
import Divider from '../../library/foundations/Divider'
import Badge from '../../library/display/Badge'
import Text from '../../library/foundations/Text'

const highlights = [
  {
    icon: <DollarSign size={20} className="text-interactive-foreground" />,
    label: 'Conversão sem taxas',
    description: 'Converta dólar com o melhor câmbio',
  },
  {
    icon: <Users size={20} className="text-interactive-foreground" />,
    label: 'Indique e ganhe',
    description: 'Ganhe $5 a cada amigo indicado',
  },
  {
    icon: <Percent size={20} className="text-interactive-foreground" />,
    label: 'Programa de Cashback',
    description: 'Receba de volta em todas as compras',
  },
  {
    icon: <Star size={20} className="text-interactive-foreground" />,
    label: 'Benefícios exclusivos',
    description: 'Acesso a promoções e ofertas especiais',
  },
]

const referrals = [
  {
    icon: <Gift size={20} className="text-interactive-foreground" />,
    label: 'Indique amigos',
    description: 'Compartilhe seu código e ganhe $5',
    badge: 'Novo',
  },
  {
    icon: <Users size={20} className="text-interactive-foreground" />,
    label: 'Seus indicados',
    description: '3 amigos já se cadastraram',
  },
]

export default function Screen2_BenefitsPromos({ onNext, onBack }: FlowScreenProps) {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <ScreenLayout header={<Header title="Benefícios e Promos" onBack={onBack} />}>
      <div className="px-[var(--token-spacing-md)] py-[var(--token-spacing-3)]">
        <SegmentedControl
          segments={['Destaques', 'Indicações']}
          activeIndex={tabIndex}
          onChange={setTabIndex}
        />
      </div>

      {tabIndex === 0 ? (
        <div className="bg-surface-primary mx-[var(--token-spacing-md)] rounded-[var(--token-radius-lg)] overflow-hidden">
          {highlights.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <Divider spacing="sm" />}
              <ListItem
                icon={item.icon}
                label={item.label}
                description={item.description}
                onPress={i === 0 ? onNext : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-[var(--token-spacing-md)]">
          <div className="bg-surface-primary rounded-[var(--token-radius-lg)] overflow-hidden">
            {referrals.map((item, i) => (
              <div key={item.label}>
                {i > 0 && <Divider spacing="sm" />}
                <ListItem
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  onPress={onNext}
                  rightValue={
                    item.badge ? undefined : undefined
                  }
                />
                {item.badge && (
                  <div className="px-[var(--token-spacing-md)] pb-[var(--token-spacing-2)] -mt-[var(--token-spacing-1)]">
                    <Badge variant="success" size="sm">{item.badge}</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-[var(--token-spacing-lg)]">
            <Text variant="body-sm" color="text-tertiary" align="center">
              Convide amigos e ganhe recompensas a cada cadastro confirmado.
            </Text>
          </div>
        </div>
      )}
    </ScreenLayout>
  )
}
