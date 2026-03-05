import { RiShieldCheckLine, RiPercentLine, RiLockUnlockLine, RiWaterFlashLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import FeatureLayout from '../../library/layout/FeatureLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import Summary from '../../library/display/Summary'

export default function Screen1_Intro({ onNext, onBack }: FlowScreenProps) {
  return (
    <FeatureLayout
      imageSrc="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
      imageAlt="Shield protecting savings"
      onClose={onBack}
      imageOverlay={<Badge variant="lime" size="md">~4,16% a.a.</Badge>}
    >
      <Stack gap="sm">
        <Text variant="display">Renda protegida</Text>
        <Text variant="body-md" color="content-secondary">
          Seus dólares rendem com seguro automático contra riscos de protocolo.
        </Text>
      </Stack>

      <Summary
        data={[
          {
            icon: <RiShieldCheckLine size={24} className="text-[var(--color-feedback-success)]" />,
            title: 'Seguro automático incluso',
            description: 'Cobertura de 97,5% via OpenCover / Nexus Mutual.',
          },
          {
            icon: <RiPercentLine size={24} className="text-[var(--color-feedback-success)]" />,
            title: '~4,16% líquido ao ano',
            description: 'Rendimento bruto de 4,86% menos 0,70% de custo do seguro.',
          },
          {
            icon: <RiWaterFlashLine size={24} className="text-[var(--color-feedback-success)]" />,
            title: 'Liquidez imediata',
            description: 'Resgate quando quiser, sem carência ou penalidade.',
          },
          {
            icon: <RiLockUnlockLine size={24} className="text-[var(--color-feedback-success)]" />,
            title: '97,5% de cobertura',
            description: 'Proteção contra hack de protocolo, risco de colateral e mais.',
          },
        ]}
      />

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Ativar
        </Button>
      </StickyFooter>
    </FeatureLayout>
  )
}
