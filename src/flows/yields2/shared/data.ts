// ── Yields2 & Yields3 shared constants, types, and formatters ──
// sDAI on Gnosis, insured via OpenCover/Nexus Mutual

import { USD_FLAG, BRL_FLAG } from '@/lib/flags'

export const GROSS_APY = 0.0486
export const INSURANCE_COST = 0.007
export const NET_APY = 0.0416

export const MOCK_BALANCE = 2150.00
export const YIELD_TODAY = 0.24
export const YIELD_MONTH = 7.44

export const COVERAGE_PERCENT = 97.5
export const INSURANCE_PROVIDER = 'OpenCover / Nexus Mutual'

export const USD_ICON = USD_FLAG
export const BRL_ICON = BRL_FLAG
export const MOCK_RATE = 5.4583

export const COVERED_ITEMS = [
  { title: 'Risco de colateral (MakerDAO)', description: 'Sub-colateralização do vault que gera sDAI' },
  { title: 'Hack de protocolo (Sky/Maker)', description: 'Exploração de smart contracts do protocolo' },
  { title: 'Dívida ruim (bad debt)', description: 'Liquidações insuficientes que causem perdas' },
  { title: 'Hack da bridge Gnosis', description: 'Comprometimento da ponte entre Ethereum e Gnosis Chain' },
]

export const NOT_COVERED_ITEMS = [
  { title: 'Hack da Picnic', description: 'Comprometimento da infraestrutura da Picnic' },
  { title: 'Perda de chaves pessoais', description: 'Perda ou roubo de credenciais do usuário' },
  { title: 'Hack do contrato sDAI', description: 'Bug no smart contract específico do sDAI' },
]

export const FUNDING_SOURCES = [
  {
    id: 'usd-balance',
    title: 'Saldo USD',
    subtitle: 'Disponível: US$ 4.230,00',
    icon: USD_ICON,
  },
  {
    id: 'pix',
    title: 'Depósito via PIX',
    subtitle: 'Pague em BRL, renda em USD',
    icon: BRL_ICON,
  },
]

export const WITHDRAW_QUICK_PICKS = [
  { label: 'Tudo', pct: 1 },
  { label: 'Metade', pct: 0.5 },
]

export const TAX_DESCRIPTION =
  'Rendimentos em USD são tributados como ganho de capital. Alíquota de 15% sobre o lucro na conversão para BRL. Consulte seu contador para mais detalhes.'

export function formatUsd(amount: number): string {
  return `US$ ${amount.toFixed(2).replace('.', ',')}`
}

export function formatBrl(amount: number): string {
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(2).replace('.', ',')}%`
}

export function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

export function generateYieldChartData(days: number) {
  const now = new Date()
  const dailyRate = NET_APY / 365
  return Array.from({ length: days + 1 }, (_, i) => ({
    time: new Date(now.getTime() - (days - i) * 86400000).toISOString(),
    value: Math.round(MOCK_BALANCE * (1 + dailyRate * i) * 100) / 100,
  }))
}
