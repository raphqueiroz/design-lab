import { useState } from 'react'
import { Tag, Zap } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import ScreenLayout from '../../library/layout/ScreenLayout'
import HeroHeader from '../../library/navigation/HeroHeader'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'
import SavingsCard from '../../library/display/SavingsCard'
import BottomSheet from '../../library/layout/BottomSheet'

const heroImage = '/images/dollar-rate-hero.png'
const savingsBg = '/images/savings-card-bg.png'
const MOCK_SAVINGS = 'R$ 250,89'

const savingsBreakdown = [
  {
    icon: <Tag size={24} className="text-content-primary" />,
    title: 'Taxa subsidiada',
    value: 'R$48.59',
    description: 'Spread que você deixou de pagar ao converter.',
  },
  {
    icon: <Zap size={24} className="text-content-primary" />,
    title: 'Economia operacional',
    value: 'R$202.30',
    description: 'Economia média comparado com as taxas de outras plataformas.',
  },
]

export default function Screen3_DollarRate({ onNext, onBack }: FlowScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <ScreenLayout
      bottomCTA={
        <div className="flex flex-col gap-[var(--token-spacing-3)]">
          <Button fullWidth size="lg" onPress={onNext}>
            Converter agora
          </Button>
          <Button fullWidth variant="ghost" size="lg">
            <span className="underline">Consultar os Termos de Serviço</span>
          </Button>
        </div>
      }
    >
      <HeroHeader imageSrc={heroImage} onBack={onBack} />
      <div className="px-[var(--token-spacing-lg)] py-[var(--token-spacing-lg)] flex flex-col gap-[var(--token-spacing-xl)]">
        <div className="flex flex-col gap-[var(--token-spacing-sm)]">
          <h1 className="text-[30px] leading-[38px] font-semibold text-content-primary tracking-[-0.6px]">
            O dólar mais barato do Brasil.
          </h1>

          <div className="flex flex-col gap-[var(--token-spacing-sm)]">
            <Text variant="body-lg" color="content-secondary">
              Seja pra viajar ou investir em dólar — cada centavo que você
              economiza na conversão ajuda a conquistar seu objetivo.
            </Text>
            <Text variant="body-lg" color="content-secondary">
              Por isso agora você{' '}
              <strong className="text-content-primary font-semibold tracking-[-0.16px]">
                converte dólar a custo de atacado — sem taxas e custos
                adicionais.
              </strong>
            </Text>
            <Text variant="body-lg" color="content-secondary">
              Aproveite esse benefício por tempo limitado e tenha acesso a melhor
              cotação global disponível.
            </Text>
          </div>
        </div>

        <SavingsCard
          label="Você já economizou"
          amount={MOCK_SAVINGS}
          actionLabel="Compartilhar"
          onPress={() => setSheetOpen(true)}
          onInfo={() => setSheetOpen(true)}
          backgroundSrc={savingsBg}
        />
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="flex flex-col gap-[var(--token-spacing-md)]">
          <h2 className="text-[26px] leading-[34px] font-semibold text-content-primary tracking-[-0.39px]">
            Como calculamos sua economia
          </h2>
          <Text variant="body-sm" color="content-secondary">
            O valor apresentado é uma estimativa de quanto você economizou na
            conversão do dólar considerando dois fatores:
          </Text>

          <div className="flex flex-col gap-[var(--token-spacing-md)] pt-[var(--token-spacing-sm)]">
            {savingsBreakdown.map((item) => (
              <div key={item.title} className="flex gap-[var(--token-spacing-3)] items-start">
                <div className="shrink-0 pt-[2px]">{item.icon}</div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[18px] leading-[24px] font-semibold text-content-primary tracking-[-0.18px]">
                    {item.title}
                  </span>
                  <p className="text-[16px] leading-[24px] text-content-secondary tracking-[-0.08px]">
                    <strong className="text-content-primary font-semibold">
                      {item.value}
                    </strong>
                    {' • '}
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </ScreenLayout>
  )
}
