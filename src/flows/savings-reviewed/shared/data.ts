import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'

export type CaixinhaCurrency = 'USD' | 'BRL' | 'EUR'

export interface CurrencyInfo {
  name: string
  symbol: string
  flagIcon: string
  apy: number
  apyDisplay: string
}

export const CURRENCIES: Record<CaixinhaCurrency, CurrencyInfo> = {
  USD: { name: 'Dólar americano', symbol: 'US$', flagIcon: USD_FLAG, apy: 0.0437, apyDisplay: '4,37% a.a.' },
  BRL: { name: 'Real brasileiro', symbol: 'R$', flagIcon: BRL_FLAG, apy: 0.10, apyDisplay: '10% a.a.' },
  EUR: { name: 'Euro', symbol: '€', flagIcon: EUR_FLAG, apy: 0.03, apyDisplay: '3% a.a.' },
}

export const MOCK_FX_TO_BRL: Record<CaixinhaCurrency, number> = {
  USD: 5.46,
  BRL: 1,
  EUR: 5.92,
}

export const CAIXINHA_ICONS = [
  { id: 'plane', label: 'Viagem' },
  { id: 'home', label: 'Casa' },
  { id: 'car', label: 'Carro' },
  { id: 'phone', label: 'Celular' },
  { id: 'shield', label: 'Reserva' },
  { id: 'gift', label: 'Presente' },
  { id: 'graduation', label: 'Educação' },
  { id: 'heart', label: 'Saúde' },
  { id: 'game', label: 'Lazer' },
  { id: 'money', label: 'Investir' },
  { id: 'pet', label: 'Pet' },
  { id: 'music', label: 'Música' },
] as const

export type CaixinhaIconId = typeof CAIXINHA_ICONS[number]['id']

export interface CaixinhaData {
  id: string
  iconId: CaixinhaIconId
  name: string
  currency: CaixinhaCurrency
  balance: number
  yieldToday: number
  createdAt: string
}

export const MOCK_REVIEWED_CAIXINHAS: CaixinhaData[] = [
  { id: 'viagem-europa', iconId: 'plane', name: 'Viagem Europa', currency: 'EUR', balance: 843.57, yieldToday: 0.07, createdAt: '2025-11-15' },
  { id: 'reserva-emergencia', iconId: 'shield', name: 'Reserva de emergência', currency: 'USD', balance: 2500.00, yieldToday: 0.34, createdAt: '2025-09-01' },
  { id: 'iphone', iconId: 'phone', name: 'iPhone novo', currency: 'USD', balance: 420.30, yieldToday: 0.06, createdAt: '2026-01-10' },
  { id: 'poupanca-brl', iconId: 'money', name: 'Poupança turbinada', currency: 'BRL', balance: 5200.00, yieldToday: 1.42, createdAt: '2025-07-20' },
]

export const TIME_HORIZONS = [
  { id: '6m', label: 'Em 6 meses' },
  { id: '1y', label: 'Em 1 ano' },
  { id: '2y', label: 'Em 2 anos' },
  { id: 'none', label: 'Sem prazo' },
]

export function formatCurrency(amount: number, currency: CaixinhaCurrency): string {
  const { symbol } = CURRENCIES[currency]
  const formatted = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${symbol} ${formatted}`
}

export function formatBrlEquivalent(amount: number, currency: CaixinhaCurrency): string {
  if (currency === 'BRL') return ''
  const brl = amount * MOCK_FX_TO_BRL[currency]
  return `Aprox. R$ ${brl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

export const DEPOSIT_PROCESSING_STEPS = [
  { title: 'Verificando dados...', progress: 33 },
  { title: 'Processando depósito...', progress: 66 },
  { title: 'Atualizando saldo...', progress: 100 },
]

export const WITHDRAW_PROCESSING_STEPS = [
  { title: 'Verificando saldo...', progress: 33 },
  { title: 'Processando resgate...', progress: 66 },
  { title: 'Atualizando saldo...', progress: 100 },
]

export function generateYieldChartData(days: number, balance: number, apy: number) {
  const now = new Date()
  const dailyRate = apy / 365
  return Array.from({ length: days + 1 }, (_, i) => ({
    time: new Date(now.getTime() - (days - i) * 86400000).toISOString().split('T')[0],
    value: Math.round(balance * (1 + dailyRate * i) * 100) / 100,
  }))
}
