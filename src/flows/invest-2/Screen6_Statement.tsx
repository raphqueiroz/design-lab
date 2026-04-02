/**
 * Account Statement — filterable transaction history across all assets.
 */
import { useState, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Stack from '@/library/layout/Stack'
import Select from '@/library/inputs/Select'
import GroupHeader from '@/library/navigation/GroupHeader'
import ListItem from '@/library/display/ListItem'
import Avatar from '@/library/display/Avatar'
import Text from '@/library/foundations/Text'
import Badge from '@/library/display/Badge'
import Button from '@/library/inputs/Button'
import EmptyState from '@/library/feedback/EmptyState'
import { RiArrowDownLine, RiArrowUpLine, RiPercentLine, RiFileListLine } from '@remixicon/react'
import { ASSETS, getMockTransactions, type Transaction } from './shared/data'

const PERIOD_OPTIONS = [
  { label: 'Últimos 7 dias', value: '7' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 90 dias', value: '90' },
  { label: 'Tudo', value: 'all' },
]

const TYPE_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Compras', value: 'buy' },
  { label: 'Vendas', value: 'sell' },
  { label: 'Rendimentos', value: 'yield' },
]

const ASSET_OPTIONS = [
  { label: 'Todos', value: 'all' },
  ...ASSETS.map(a => ({ label: a.name, value: a.ticker })),
]

const ICON_MAP = {
  buy: RiArrowDownLine,
  sell: RiArrowUpLine,
  yield: RiPercentLine,
}

const TYPE_LABEL: Record<string, string> = {
  buy: 'Compra',
  sell: 'Venda',
  yield: 'Rendimento',
}

// Build a combined mock transaction list from several assets
function getAllTransactions(): (Transaction & { assetName: string })[] {
  const tickers = ['BTC', 'ETH', 'SOL', 'RENDA-USD', 'PAXG'] as const
  const all: (Transaction & { assetName: string })[] = []

  for (const ticker of tickers) {
    const asset = ASSETS.find(a => a.ticker === ticker)
    const txs = getMockTransactions(ticker)
    for (const tx of txs) {
      all.push({ ...tx, assetName: asset?.name ?? ticker })
    }
  }

  return all
}

export default function Screen6_Statement({ onBack, onNext, onElementTap }: FlowScreenProps) {
  const [period, setPeriod] = useState('30')
  const [typeFilter, setTypeFilter] = useState('all')
  const [assetFilter, setAssetFilter] = useState('all')

  const allTransactions = useMemo(() => getAllTransactions(), [])

  const filtered = useMemo(() => {
    let result = allTransactions
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter)
    }
    if (assetFilter !== 'all') {
      // Filter by matching asset name in title or assetName field
      const asset = ASSETS.find(a => a.ticker === assetFilter)
      if (asset) {
        result = result.filter(tx => tx.assetName === asset.name)
      }
    }
    return result
  }, [allTransactions, typeFilter, assetFilter])

  return (
    <BaseLayout>
      <Header title="Extrato" onBack={onBack} />

      <Stack gap="default">
        {/* Filter row */}
        <Stack direction="row" gap="sm">
          <div className="flex-1 min-w-0">
            <Select
              label="Período"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              label="Tipo"
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              label="Ativo"
              options={ASSET_OPTIONS}
              value={assetFilter}
              onChange={setAssetFilter}
            />
          </div>
        </Stack>

        {/* Transactions list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<RiFileListLine size={40} />}
            title="Nenhuma transação encontrada"
            description="Ajuste os filtros para ver mais resultados."
          />
        ) : (
          <Stack gap="none">
            <GroupHeader text="Transações" subtitle={`${filtered.length} ${filtered.length === 1 ? 'transação' : 'transações'}`} />
            {filtered.map((tx) => {
              const Icon = ICON_MAP[tx.type]
              return (
                <ListItem
                  key={`${tx.assetName}-${tx.id}`}
                  title={`${TYPE_LABEL[tx.type]} — ${tx.assetName}`}
                  subtitle={tx.date}
                  left={<Avatar icon={<Icon size={20} />} size="md" />}
                  right={
                    <Stack gap="none" align="end">
                      <Text variant="body-sm">{tx.amount}</Text>
                      {tx.status === 'processing' && (
                        <Badge variant="warning" size="sm">Processando</Badge>
                      )}
                    </Stack>
                  }
                  trailing={null}
                />
              )
            })}
          </Stack>
        )}
      </Stack>

      <StickyFooter>
        <Button variant="primary" fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Gerar PDF')
          if (!handled) onNext()
        }}>
          Gerar PDF
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
