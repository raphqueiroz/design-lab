import Stack from '../../../library/layout/Stack'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import Text from '../../../library/foundations/Text'
import { RiArrowUpLine, RiArrowDownLine } from '@remixicon/react'

// ── Balance Display (CurrencyInput typography) ──

/** Barlow Condensed for currency symbol */
const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"
/** Inter variable: open 4, 6, 9 (ss01) + flat-top 3 (cv05) */
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

interface BalanceDisplayProps {
  value?: number
}

export function BalanceDisplay({ value = 1250.00 }: BalanceDisplayProps) {
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (
    <Stack direction="row" gap="none" align="center">
      <span
        className="text-[28px] font-medium leading-[40px] tracking-[-0.56px] uppercase text-content-primary"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontFeatureSettings: symbolFeatures }}
      >
        US$
      </span>
      <span
        className="text-[40px] font-bold leading-[40px] text-content-primary ml-1"
        style={{ fontFeatureSettings: digitFeatures }}
      >
        {formatted}
      </span>
    </Stack>
  )
}

// ── Mock yield data for LineChart (30 days) ──

export const MOCK_YIELD_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 1, 3 + i) // Feb 3 → Mar 4
  const base = 1200 + i * 1.8 + Math.sin(i * 0.5) * 3
  return {
    time: date.toISOString().split('T')[0],
    value: Math.round(base * 100) / 100,
  }
})

// ── Details Tab ──

interface DetailsTabProps {
  onViewPolicy?: () => void
}

export function DetailsTab({ onViewPolicy }: DetailsTabProps) {
  return (
    <Stack gap="default">
      <Stack gap="none">
        <DataList
          data={[
            { label: 'Rendimento', value: '4,72% a.a.' },
            { label: 'Rendeu até agora', value: 'US$ 5,21' },
            { label: 'Investindo desde', value: '21 jan 2026' },
            { label: 'Resgate', value: 'A qualquer momento' },
          ]}
        />
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

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'deposit' as const, title: 'Depósito', amount: '+US$ 500,00', date: '28 fev 2026', icon: RiArrowDownLine },
  { id: '2', type: 'withdraw' as const, title: 'Resgate', amount: '-US$ 200,00', date: '15 fev 2026', icon: RiArrowUpLine },
  { id: '3', type: 'deposit' as const, title: 'Depósito', amount: '+US$ 950,00', date: '21 jan 2026', icon: RiArrowDownLine },
]

export function HistoryTab() {
  return (
    <Stack gap="none">
      {MOCK_TRANSACTIONS.map((tx) => (
        <ListItem
          key={tx.id}
          title={tx.title}
          subtitle={tx.date}
          left={<Avatar icon={<tx.icon size={20} />} size="md" />}
          right={<Text variant="body-sm">{tx.amount}</Text>}
          trailing={null}
        />
      ))}
    </Stack>
  )
}
