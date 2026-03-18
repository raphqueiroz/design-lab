import Stack from '../../../library/layout/Stack'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import Text from '../../../library/foundations/Text'
import { RiAddLine, RiSubtractLine } from '@remixicon/react'

// ── Balance Display (CurrencyInput typography) ──

/** Barlow Condensed for currency symbol */
const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"
/** Inter variable: open 4, 6, 9 (ss01) + flat-top 3 (cv05) */
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

interface BalanceDisplayProps {
  value?: number
}

export function BalanceDisplay({ value = 1250.00 }: BalanceDisplayProps) {
  const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
  hasBalance?: boolean
  yieldAmount?: string
  onViewPolicy?: () => void
}

export function DetailsTab({ hasBalance = true, yieldAmount, onViewPolicy }: DetailsTabProps) {
  return (
    <Stack gap="default">
      <Stack gap="none">
        <DataList
          data={
            hasBalance
              ? [
                  { label: 'Rendimento', value: '4,72% a.a.' },
                  { label: 'Rendeu até agora', value: yieldAmount ?? 'US$ 80,32' },
                  { label: 'Guardando desde', value: '21 jan 2026' },
                  { label: 'Resgate', value: 'A qualquer momento' },
                ]
              : [
                  { label: 'Rendimento', value: '4,72% a.a.' },
                  { label: 'Resgate', value: 'A qualquer momento' },
                  { label: 'Proteção', value: 'Seguro incluso' },
                ]
          }
        />
      </Stack>

      <Banner
        variant="neutral"
        title="Seu dinheiro protegido"
        description="Seu saldo é coberto contra falhas técnicas e fraudes — sem custo adicional."
        linkText="Ver certificado"
        onLinkPress={onViewPolicy}
      />
    </Stack>
  )
}

// ── History Tab ──

interface Transaction {
  id: string
  type: 'deposit' | 'expense'
  title: string
  amount: string
  brl?: string
  status?: 'completed' | 'processing'
}

interface TransactionGroup {
  date: string
  transactions: Transaction[]
}

const MOCK_HISTORY: TransactionGroup[] = [
  {
    date: '3 março 2026',
    transactions: [
      { id: '1', type: 'deposit', title: 'Depósito', amount: '+ US$ 500,00', status: 'processing' },
    ],
  },
  {
    date: '28 fevereiro 2026',
    transactions: [
      { id: '2', type: 'expense', title: 'Resgate', amount: '- US$ 200,00' },
      { id: '3', type: 'deposit', title: 'Depósito', amount: '+ US$ 1.200,00' },
    ],
  },
  {
    date: '21 janeiro 2026',
    transactions: [
      { id: '4', type: 'deposit', title: 'Depósito', amount: '+ US$ 950,00' },
    ],
  },
]

function TransactionLine({ tx }: { tx: Transaction }) {
  const Icon = tx.type === 'deposit' ? RiAddLine : RiSubtractLine
  const isProcessing = tx.status === 'processing'

  return (
    <div className="flex items-center justify-between py-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
          <Icon size={20} className={isProcessing ? 'text-content-tertiary' : 'text-content-primary'} />
        </div>
        <Stack gap="none">
          <span className={`text-[16px] font-semibold leading-6 ${isProcessing ? 'text-content-tertiary' : 'text-content-primary'}`}>
            {tx.title}
          </span>
          {isProcessing && (
            <span className="text-[14px] leading-5 text-[var(--color-feedback-warning)] font-medium">Processando</span>
          )}
        </Stack>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span
          className={`text-[16px] font-normal leading-6 tracking-[-0.08px] ${isProcessing ? 'text-content-tertiary' : 'text-content-primary'}`}
          style={{ fontFeatureSettings: "'ss01' 1, 'calt' 0" }}
        >
          {tx.amount}
        </span>
        {tx.brl && (
          <span
            className="text-[14px] font-normal leading-[1.5] text-content-tertiary"
            style={{ fontFeatureSettings: "'ss01' 1, 'lnum' 1, 'tnum' 1" }}
          >
            {tx.brl}
          </span>
        )}
      </div>
    </div>
  )
}

interface HistoryTabProps {
  hasBalance?: boolean
}

export function HistoryTab({ hasBalance = true }: HistoryTabProps) {
  if (!hasBalance) {
    return (
      <Stack gap="sm" className="py-8 items-center">
        <Text variant="body-md" color="content-tertiary" className="text-center">
          Nenhuma movimentação ainda
        </Text>
        <Text variant="body-sm" color="content-tertiary" className="text-center">
          Faça seu primeiro depósito para começar a render.
        </Text>
      </Stack>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {MOCK_HISTORY.map((group) => (
        <div key={group.date} className="flex flex-col w-full">
          {/* Date group header */}
          <div className="border-b border-border-default pb-3 pt-2">
            <Text variant="body-sm" className="font-medium text-content-secondary">
              {group.date}
            </Text>
          </div>
          {/* Transactions */}
          <div className="flex flex-col">
            {group.transactions.map((tx) => (
              <TransactionLine key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
