import { RiShieldCheckLine, RiFlashlightLine, RiStarLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import Card from '../../library/display/Card'
import DataList from '../../library/display/DataList'

import { GROSS_APY, NET_APY, formatPct } from '../yields2/shared/data'

/**
 * Yields4 — "Compare & Choose"
 * Inspired by Nubank fixed-income comparison: 3 product cards with rates,
 * user picks one before activation.
 */

interface YieldOptionProps {
  title: string
  rate: string
  badge: React.ReactNode
  icon: React.ReactNode
  features: string[]
  recommended?: boolean
  onPress: () => void
}

function YieldOption({ title, rate, badge, icon, features, recommended, onPress }: YieldOptionProps) {
  return (
    <Card
      variant={recommended ? 'elevated' : 'flat'}
      pressable
      onPress={onPress}
    >
      <Stack gap="sm">
        <Stack direction="row" align="between">
          <Stack direction="row" gap="sm" align="center">
            {icon}
            <Text variant="heading-sm">{title}</Text>
          </Stack>
          {badge}
        </Stack>
        <Text variant="display">{rate}</Text>
        <Text variant="caption" color="content-secondary">rentabilidade líquida anual</Text>
        <DataList
          data={features.map((f) => ({ label: f, value: '' }))}
        />
        {recommended && (
          <Badge variant="lime" size="sm">Recomendado</Badge>
        )}
      </Stack>
    </Card>
  )
}

export default function Screen1_Compare({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const handleSelect = (label: string) => {
    const resolved = onElementTap?.(`Card: ${label}`)
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Escolha seu rendimento" onBack={onBack} />

      <Stack gap="sm">
        <Text variant="body-md" color="content-secondary">
          Compare as opções e escolha a que faz mais sentido para você.
        </Text>
      </Stack>

      <Stack gap="default">
        <YieldOption
          title="Protegido"
          rate={`~${formatPct(NET_APY)} a.a.`}
          badge={<Badge variant="success" size="sm">Segurado</Badge>}
          icon={<RiShieldCheckLine size={20} className="text-[var(--color-feedback-success)]" />}
          features={['97,5% cobertura de seguro', 'OpenCover / Nexus Mutual', 'Liquidez imediata']}
          recommended
          onPress={() => handleSelect('Protegido')}
        />

        <YieldOption
          title="Padrão"
          rate={`${formatPct(GROSS_APY)} a.a.`}
          badge={<Badge variant="neutral" size="sm">Sem seguro</Badge>}
          icon={<RiFlashlightLine size={20} className="text-content-secondary" />}
          features={['Maior rendimento bruto', 'Sem custo de seguro', 'Liquidez imediata']}
          onPress={() => handleSelect('Padrão')}
        />

        <YieldOption
          title="Conservador"
          rate="3,20% a.a."
          badge={<Badge variant="info" size="sm">USDC</Badge>}
          icon={<RiStarLine size={20} className="text-content-secondary" />}
          features={['Stablecoin mais conservadora', 'Aave v3 na Ethereum', 'Liquidez imediata']}
          onPress={() => handleSelect('Conservador')}
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => handleSelect('Protegido')}>
          Escolher Protegido
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
