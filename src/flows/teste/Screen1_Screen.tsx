/**
 * @screen page 01
 * @description pagina de cripto que apresenta o nome da criptomoeda com a logo,
 *   grafico de preco e dados usando o componente datalist com botao de comprar.
 */
import { useMemo } from 'react'
import { RiBitCoinFill } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import Avatar from '@/library/display/Avatar'
import Amount from '@/library/display/Amount'
import LineChart from '@/library/display/LineChart'
import DataList from '@/library/display/DataList'
import GroupHeader from '@/library/navigation/GroupHeader'

// ── Mock data ──

function generateChartData(days: number, base: number) {
  const data = []
  const now = Date.now()
  let price = base
  for (let i = days; i >= 0; i--) {
    price += price * (Math.random() - 0.48) * 0.03
    const date = new Date(now - i * 86400000)
    data.push({ time: date.toISOString().split('T')[0], value: Math.round(price * 100) / 100 })
  }
  return data
}

export default function Screen({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const chartData = useMemo(() => generateChartData(30, 534280), [])
  const currentPrice = chartData[chartData.length - 1].value
  const firstPrice = chartData[0].value
  const change = ((currentPrice - firstPrice) / firstPrice) * 100
  const isPositive = change >= 0

  return (
    <BaseLayout>
      <Header title="Bitcoin" onBack={onBack} />

      {/* Asset header */}
      <Stack gap="sm">
        <div className="flex items-center gap-3">
          <Avatar
            size="lg"
            icon={<RiBitCoinFill size={28} />}
            className="bg-[#F7931A] text-white"
          />
          <Stack gap="none">
            <Text variant="heading-md">Bitcoin</Text>
            <Text variant="body-sm" color="content-secondary">BTC</Text>
          </Stack>
        </div>

        {/* Price */}
        <Stack gap="none">
          <Amount value={currentPrice} currency="R$" size="lg" />
          <Text variant="body-sm" className={isPositive ? 'text-[var(--color-feedback-success)]' : 'text-[var(--color-feedback-error)]'}>
            {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(2)}% (30d)
          </Text>
        </Stack>
      </Stack>

      {/* Chart */}
      <LineChart
        data={chartData}
        height={180}
        variant="area"
        color={isPositive ? 'var(--color-feedback-success)' : 'var(--color-feedback-error)'}
        smooth
        lineWidth={2}
      />

      {/* Market data */}
      <Stack gap="none">
        <GroupHeader text="Dados de mercado" />
        <DataList data={[
          { label: 'Cap. de mercado', value: 'R$ 10,4 tri' },
          { label: 'Volume 24h', value: 'R$ 142,8 bi' },
          { label: 'Máxima histórica', value: 'R$ 612.450,00' },
          { label: 'Mínima 24h', value: `R$ ${(currentPrice * 0.97).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
          { label: 'Máxima 24h', value: `R$ ${(currentPrice * 1.02).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        ]} />
      </Stack>

      <StickyFooter>
        <Button variant="accent" size="lg" fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Comprar')
          if (!handled) onNext()
        }}>
          Comprar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
