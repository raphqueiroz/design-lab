/**
 * Screen-only parts for the Caixinha Hub (multi-currency).
 */

import { RiArrowUpLine, RiArrowDownLine } from '@remixicon/react'
import Stack from '../../../library/layout/Stack'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import Badge from '../../../library/display/Badge'
import Text from '../../../library/foundations/Text'
import { type CaixinhaCurrency, CURRENCIES, formatCurrency } from '../shared/data'

// ── Balance Display ──

const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

interface BalanceDisplayProps {
  value: number
  symbol: string
  inverted?: boolean
}

export function BalanceDisplay({ value, symbol, inverted }: BalanceDisplayProps) {
  const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const textColor = inverted ? 'text-white' : 'text-content-primary'
  return (
    <Stack direction="row" gap="none" align="center">
      <span
        className={`text-[28px] font-medium leading-[40px] tracking-[-0.56px] uppercase ${textColor}`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontFeatureSettings: symbolFeatures }}
      >
        {symbol}
      </span>
      <span
        className={`text-[40px] font-bold leading-[40px] ${textColor} ml-1`}
        style={{ fontFeatureSettings: digitFeatures }}
      >
        {formatted}
      </span>
    </Stack>
  )
}

// ── Details Tab ──

interface DetailsTabProps {
  currency: CaixinhaCurrency
  balance: number
  onViewPolicy?: () => void
}

export function DetailsTab({ currency, balance, onViewPolicy }: DetailsTabProps) {
  const curr = CURRENCIES[currency]
  const mockYield = balance * curr.apy * (45 / 365)
  return (
    <Stack gap="default">
      <Stack gap="none">
        <DataList data={[
          { label: 'Rendimento', value: curr.apyDisplay },
          { label: 'Rendeu até agora', value: formatCurrency(Math.round(mockYield * 100) / 100, currency) },
          { label: 'Investindo desde', value: '21 jan 2026' },
          {
            label: 'Resgate',
            value: <span className="text-[var(--color-feedback-success)] font-medium">Imediato</span>,
          },
        ]} />
      </Stack>

      <Banner
        variant="neutral"
        title="Investimento assegurado"
        description="Seu investimento é protegido pela OpenCover contra riscos operacionais de smart contracts."
        linkText="Ver apólice"
        onLinkPress={onViewPolicy}
      />
    </Stack>
  )
}

// ── History Tab ──

interface HistoryTabProps {
  currency: CaixinhaCurrency
}

export function HistoryTab({ currency }: HistoryTabProps) {
  const transactions = [
    { id: '1', type: 'deposit' as const, title: 'Depósito', amount: formatCurrency(500, currency), date: '28 fev 2026', icon: RiArrowDownLine, status: 'processing' as const },
    { id: '2', type: 'withdraw' as const, title: 'Resgate', amount: formatCurrency(200, currency), date: '15 fev 2026', icon: RiArrowUpLine, status: 'completed' as const },
    { id: '3', type: 'deposit' as const, title: 'Depósito', amount: formatCurrency(950, currency), date: '21 jan 2026', icon: RiArrowDownLine, status: 'completed' as const },
  ]

  return (
    <Stack gap="none">
      {transactions.map((tx) => (
        <ListItem
          key={tx.id}
          title={tx.title}
          subtitle={tx.status === 'processing' ? 'Processando...' : tx.date}
          left={<Avatar icon={<tx.icon size={20} />} size="md" />}
          right={
            <Stack gap="none" align="end">
              <Text variant="body-sm" className={tx.status === 'processing' ? 'text-content-tertiary' : ''}>
                {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
              </Text>
              {tx.status === 'processing' && (
                <Badge variant="warning" size="sm">Processando</Badge>
              )}
            </Stack>
          }
          trailing={null}
        />
      ))}
    </Stack>
  )
}
