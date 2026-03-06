/**
 * @screen Investimentos
 * @description Dashboard de acompanhamento de investimentos, com gráficos.
 *   Dois estados: sem investimentos (empty) e com investimentos (invested).
 */
import { useState } from 'react'
import { RiShieldCheckLine, RiFlashlightLine, RiCoinLine, RiArrowRightSLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import Stack from '@/library/layout/Stack'
import Header from '@/library/navigation/Header'
import GroupHeader from '@/library/navigation/GroupHeader'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import Text from '@/library/foundations/Text'
import Divider from '@/library/foundations/Divider'
import Amount from '@/library/display/Amount'
import Badge from '@/library/display/Badge'
import Card from '@/library/display/Card'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import LineChart from '@/library/display/LineChart'
import EmptyState from '@/library/feedback/EmptyState'

import { NET_APY, MOCK_BALANCE, YIELD_TODAY, formatPct, generateYieldChartData } from '../yields2/shared/data'

const TIME_RANGES = ['1S', '1M', '3M', '1A']

const AVAILABLE_PRODUCTS = [
  {
    id: 'renda-protegida',
    icon: <RiShieldCheckLine size={20} className="text-[var(--color-feedback-success)]" />,
    title: 'Renda Protegida',
    subtitle: `~${formatPct(NET_APY)} a.a. · Segurado`,
    badge: <Badge variant="success" size="sm">Segurado</Badge>,
    balance: `US$ ${MOCK_BALANCE.toFixed(2).replace('.', ',')}`,
    label: 'Renda Protegida',
    enabled: true,
  },
  {
    id: 'renda-padrao',
    icon: <RiFlashlightLine size={20} className="text-content-secondary" />,
    title: 'Renda Padrão',
    subtitle: '5,2% a.a. · Sem seguro',
    badge: null,
    balance: null,
    label: 'Renda Padrão',
    enabled: false,
  },
  {
    id: 'staking',
    icon: <RiCoinLine size={20} className="text-content-secondary" />,
    title: 'Staking',
    subtitle: 'Até 8% a.a. · Vários tokens',
    badge: <Badge variant="neutral" size="sm">Em breve</Badge>,
    balance: null,
    label: 'Staking',
    enabled: false,
  },
]

const CHART_DATA = generateYieldChartData(30)

export default function Screen({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { hasInvestments } = useScreenData<{ hasInvestments?: boolean }>()
  const [timeRange, setTimeRange] = useState(1)

  const handleProductTap = (label: string) => {
    const resolved = onElementTap?.(`ListItem: ${label}`)
    if (!resolved) onNext()
  }

  if (!hasInvestments) {
    return (
      <BaseLayout>
        <Header title="Investimentos" onBack={onBack} />
        <Stack gap="default">
          <EmptyState
            icon={<RiShieldCheckLine size={32} className="text-[var(--color-feedback-success)]" />}
            title="Comece a investir"
            description="Escolha um produto abaixo e faça seu dinheiro render com segurança."
          />

          <Stack gap="none">
            <GroupHeader text="Produtos disponíveis" />
            {AVAILABLE_PRODUCTS.map((product) => (
              <ListItem
                key={product.id}
                title={product.title}
                subtitle={product.subtitle}
                left={<Avatar icon={product.icon} size="md" />}
                right={product.badge}
                trailing={<RiArrowRightSLine size={20} className="text-content-tertiary" />}
                disabled={!product.enabled}
                onPress={product.enabled ? () => handleProductTap(product.label) : undefined}
              />
            ))}
          </Stack>
        </Stack>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <Header title="Investimentos" onBack={onBack} />
      <Stack gap="default">
        <Card variant="elevated">
          <Stack gap="sm">
            <Text variant="caption" color="content-secondary">Patrimônio investido</Text>
            <Amount value={MOCK_BALANCE} currency="US$" size="lg" />
            <Text variant="caption" className="text-[var(--color-feedback-success)]">
              +US$ {YIELD_TODAY.toFixed(2).replace('.', ',')} hoje
            </Text>
          </Stack>
        </Card>

        <SegmentedControl
          segments={TIME_RANGES}
          activeIndex={timeRange}
          onChange={setTimeRange}
        />

        <LineChart data={CHART_DATA} variant="area" height={180} />

        <Divider />

        <Stack gap="none">
          <GroupHeader text="Seus investimentos" />
          {AVAILABLE_PRODUCTS.filter((p) => p.id === 'renda-protegida').map((product) => (
            <ListItem
              key={product.id}
              title={product.title}
              subtitle={product.subtitle}
              left={<Avatar icon={product.icon} size="md" />}
              right={<Text variant="body-sm">{product.balance}</Text>}
              trailing={<RiArrowRightSLine size={20} className="text-content-tertiary" />}
              onPress={() => handleProductTap(product.label)}
            />
          ))}
        </Stack>
      </Stack>
    </BaseLayout>
  )
}
