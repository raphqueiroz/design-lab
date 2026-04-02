import { useState } from 'react'
import { RiPriceTag3Line, RiFlashlightLine, RiInformationLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeatureLayout from '../../library/layout/FeatureLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'
import IconButton from '../../library/inputs/IconButton'
import Link from '../../library/foundations/Link'
import BottomSheet from '../../library/layout/BottomSheet'
import ListItem from '../../library/display/ListItem'

const heroImage = '/images/dollar-rate-hero.png'
const savingsBg = '/images/savings-card-bg.png'
const MOCK_SAVINGS = 'R$ 250,89'

const savingsBreakdown = [
  {
    icon: <RiPriceTag3Line size={24} className="text-content-primary" />,
    title: 'Taxa subsidiada',
    value: 'R$48.59',
    description: 'Spread que você deixou de pagar ao converter.',
  },
  {
    icon: <RiFlashlightLine size={24} className="text-content-primary" />,
    title: 'Economia operacional',
    value: 'R$202.30',
    description: 'Economia média comparado com as taxas de outras plataformas.',
  },
]

export default function Screen3_DollarRate({ onNext, onBack }: FlowScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <FeatureLayout
      imageSrc={heroImage}
      imageAlt="Dollar rate hero"
      onClose={onBack}
    >
      <Stack gap="sm">
        <Text variant="heading-lg">
          O dólar mais barato do Brasil.
        </Text>
        <Stack gap="sm">
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
        </Stack>
      </Stack>

      {/* Savings card — bespoke visual with background image */}
      <div
        className="relative overflow-hidden rounded-[var(--token-radius-lg)] px-[var(--token-spacing-4)] py-[var(--token-spacing-4)] flex flex-col justify-between"
        style={{ minHeight: 171 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[var(--token-radius-lg)] pointer-events-none">
          <img src={savingsBg} alt="" className="absolute h-full left-[-47%] top-0 w-[157%] max-w-none object-cover" />
        </div>
        <div className="absolute top-[var(--token-spacing-4)] right-[var(--token-spacing-4)]">
          <IconButton
            variant="base"
            inverted
            icon={<RiInformationLine size={24} />}
            onPress={() => setSheetOpen(true)}
          />
        </div>
        <div className="relative flex flex-col gap-[4px] cursor-pointer" onClick={() => setSheetOpen(true)} role="button" tabIndex={0}>
          <Text variant="caption" className="!text-white">Você já economizou</Text>
          <span className="text-[42px] leading-[48px] font-semibold text-white tracking-[-2.1px] tabular-nums" style={{ fontFeatureSettings: "'ss01' 1" }}>
            {MOCK_SAVINGS}
          </span>
        </div>
        <Button variant="accent" size="sm" onPress={() => setSheetOpen(true)} className="relative mt-auto w-fit">
          Compartilhar
        </Button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Stack>
          <Text variant="heading-md">
            Como calculamos sua economia
          </Text>
          <Text variant="body-sm" color="content-secondary">
            O valor apresentado é uma estimativa de quanto você economizou na
            conversão do dólar considerando dois fatores:
          </Text>
          <Stack>
            {savingsBreakdown.map((item) => (
              <ListItem
                key={item.title}
                left={item.icon}
                title={item.title}
                subtitle={`${item.value} • ${item.description}`}
              />
            ))}
          </Stack>
        </Stack>
      </BottomSheet>

      <StickyFooter>
        <Stack gap="sm">
          <Button fullWidth size="lg" onPress={onNext}>
            Converter agora
          </Button>
          <Link linkText="Consultar os Termos de Serviço" size="base" />
        </Stack>
      </StickyFooter>
    </FeatureLayout>
  )
}
