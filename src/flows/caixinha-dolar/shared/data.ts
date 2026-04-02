import { USD_FLAG, BRL_FLAG } from '@/lib/flags'

export const APY = 0.05
export const MOCK_BALANCE = 1243.57
export const YIELD_TODAY = 0.17
export const YIELD_MONTH = 12.34
export const MOCK_RATE = 5.4583

export const USD_ICON = USD_FLAG
export const BRL_ICON = BRL_FLAG

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

export function generateYieldChartData(days: number) {
  const now = new Date()
  const dailyRate = APY / 365
  return Array.from({ length: days + 1 }, (_, i) => ({
    time: new Date(now.getTime() - (days - i) * 86400000).toISOString(),
    value: Math.round(MOCK_BALANCE * (1 + dailyRate * i) * 100) / 100,
  }))
}

export function formatUsd(amount: number): string {
  return `US$ ${amount.toFixed(2).replace('.', ',')}`
}

export function formatBrl(amount: number): string {
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
}

export function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

/* ─── Version D: Multi-caixinha mock data ─── */

export interface CaixinhaGoal {
  id: string
  emoji: string
  name: string
  balance: number
  target: number
  yieldToday: number
  createdAt: string
}

export const MOCK_CAIXINHAS: CaixinhaGoal[] = [
  {
    id: 'viagem-europa',
    emoji: '✈️',
    name: 'Viagem Europa',
    balance: 1843.57,
    target: 3000,
    yieldToday: 0.25,
    createdAt: '2025-11-15',
  },
  {
    id: 'reserva-emergencia',
    emoji: '🛡️',
    name: 'Reserva de emergência',
    balance: 2500.00,
    target: 5000,
    yieldToday: 0.34,
    createdAt: '2025-09-01',
  },
  {
    id: 'iphone',
    emoji: '📱',
    name: 'iPhone novo',
    balance: 420.30,
    target: 1200,
    yieldToday: 0.06,
    createdAt: '2026-01-10',
  },
]

export const EMOJI_OPTIONS = ['✈️', '🏠', '🚗', '📱', '🎓', '💍', '🛡️', '🏖️', '🎮', '💰', '🐶', '🎵']

export const TIME_HORIZONS = [
  { id: '6m', label: 'Em 6 meses' },
  { id: '1y', label: 'Em 1 ano' },
  { id: '2y', label: 'Em 2 anos' },
  { id: 'none', label: 'Sem prazo' },
]

export function projectedYield(principal: number, months: number): number {
  const monthlyRate = APY / 12
  return principal * monthlyRate * months
}

export const DEPOSIT_PROCESSING_STEPS = [
  { title: 'Verificando dados…', progress: 33 },
  { title: 'Processando depósito…', progress: 66 },
  { title: 'Atualizando saldo…', progress: 100 },
]

export const WITHDRAW_PROCESSING_STEPS = [
  { title: 'Verificando saldo…', progress: 33 },
  { title: 'Processando resgate…', progress: 66 },
  { title: 'Atualizando saldo…', progress: 100 },
]
