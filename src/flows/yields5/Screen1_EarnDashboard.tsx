import { RiShieldCheckLine, RiFlashlightLine, RiCoinLine, RiArrowRightSLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'
import Amount from '../../library/display/Amount'
import Badge from '../../library/display/Badge'
import Card from '../../library/display/Card'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import Banner from '../../library/display/Banner'

import { NET_APY, GROSS_APY, formatPct } from '../yields2/shared/data'

/**
 * Yields5 — "Earn Dashboard"
 * Inspired by Binance Earn: multi-product earn dashboard
 * where insured yield is one product card among others.
 */

const TOTAL_EARNING = 2150.0
const DAILY_EARNING = 0.24

const EARN_PRODUCTS = [
  {
    id: 'insured-yield',
    icon: <RiShieldCheckLine size={20} className="text-[var(--color-feedback-success)]" />,
    title: 'Renda Protegida',
    subtitle: `~${formatPct(NET_APY)} a.a. · Segurado`,
    badge: <Badge variant="success" size="sm">Segurado</Badge>,
    balance: 'US$ 2.150,00',
    label: 'Renda Protegida',
  },
  {
    id: 'standard-yield',
    icon: <RiFlashlightLine size={20} className="text-content-secondary" />,
    title: 'Renda Padrão',
    subtitle: `${formatPct(GROSS_APY)} a.a. · Sem seguro`,
    badge: null,
    balance: null,
    label: 'Renda Padrão',
  },
  {
    id: 'staking',
    icon: <RiCoinLine size={20} className="text-content-secondary" />,
    title: 'Staking',
    subtitle: 'Até 8% a.a. · Vários tokens',
    badge: <Badge variant="neutral" size="sm">Em breve</Badge>,
    balance: null,
    label: 'Staking',
  },
]

export default function Screen1_EarnDashboard({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const handleProductTap = (label: string) => {
    const resolved = onElementTap?.(`ListItem: ${label}`)
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Rendimentos" onBack={onBack} />

      <Stack gap="default">
        {/* Portfolio summary card */}
        <Card variant="elevated">
          <Stack gap="sm">
            <Text variant="caption" color="content-secondary">Total rendendo</Text>
            <Amount value={TOTAL_EARNING} currency="US$" size="lg" />
            <Text variant="caption" className="text-[var(--color-feedback-success)]">
              +US$ {DAILY_EARNING.toFixed(2).replace('.', ',')} hoje
            </Text>
          </Stack>
        </Card>

        <Banner
          variant="success"
          title="Seus fundos são segurados"
          description="97,5% de cobertura via OpenCover / Nexus Mutual no produto Renda Protegida."
        />

        {/* Product categories */}
        <Stack gap="none">
          <GroupHeader text="Produtos disponíveis" />
          {EARN_PRODUCTS.map((product) => (
            <ListItem
              key={product.id}
              title={product.title}
              subtitle={product.subtitle}
              left={
                <Avatar icon={product.icon} size="md" />
              }
              right={
                product.balance
                  ? <Text variant="body-sm">{product.balance}</Text>
                  : product.badge
              }
              trailing={<RiArrowRightSLine size={20} className="text-content-tertiary" />}
              onPress={() => handleProductTap(product.label)}
            />
          ))}
        </Stack>

        <Banner
          variant="neutral"
          collapsable
          title="Como funcionam os rendimentos?"
          description="Seus dólares são alocados em protocolos DeFi auditados. O rendimento é calculado diariamente e creditado automaticamente no seu saldo. Você pode resgatar a qualquer momento."
        />
      </Stack>
    </BaseLayout>
  )
}
