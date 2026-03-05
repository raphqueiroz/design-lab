import { RiShieldCheckLine, RiTimeLine, RiPercentLine, RiLockUnlockLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../../pages/simulator/flowRegistry'
import FeatureLayout from '../../../../library/layout/FeatureLayout'
import StickyFooter from '../../../../library/layout/StickyFooter'
import Stack from '../../../../library/layout/Stack'
import Button from '../../../../library/inputs/Button'
import Text from '../../../../library/foundations/Text'
import Badge from '../../../../library/display/Badge'
import Banner from '../../../../library/display/Banner'
import Summary from '../../../../library/display/Summary'

import { TAX_DESCRIPTION } from '../../shared/data'

export default function B_Screen1_Intro({ onNext, onBack }: FlowScreenProps) {
  return (
    <FeatureLayout
      imageSrc="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
      imageAlt="Dollar bills representing savings"
      onClose={onBack}
      imageOverlay={<Badge variant="lime" size="md">5% a.a.</Badge>}
    >
      <Stack gap="sm">
        <Text variant="display">Caixinha do Dólar</Text>
        <Text variant="body-md" color="content-secondary">
          Seus dólares rendem enquanto você planeja sua próxima viagem.
        </Text>
      </Stack>

      <Summary
        data={[
          {
            icon: <RiPercentLine size={24} className="text-[#a5f20c]" />,
            title: '5% de rendimento ao ano',
            description: 'Juros calculados diariamente sobre seu saldo em dólares.',
          },
          {
            icon: <RiLockUnlockLine size={24} className="text-[#a5f20c]" />,
            title: 'Sem prazo mínimo',
            description: 'Resgate quando quiser, sem carência ou penalidade.',
          },
          {
            icon: <RiShieldCheckLine size={24} className="text-[#a5f20c]" />,
            title: 'Lastreado em Treasuries',
            description: 'Seus fundos são protegidos por títulos do Tesouro americano.',
          },
          {
            icon: <RiTimeLine size={24} className="text-[#a5f20c]" />,
            title: 'Depósito via PIX ou USD',
            description: 'Use seu saldo em dólares ou deposite via PIX.',
          },
        ]}
      />

      <Banner
        variant="neutral"
        title="Informações fiscais"
        description={TAX_DESCRIPTION}
      />

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Ativar Caixinha
        </Button>
      </StickyFooter>
    </FeatureLayout>
  )
}
