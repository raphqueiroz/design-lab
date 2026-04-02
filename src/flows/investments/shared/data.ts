import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'

// Asset types
export type AssetCategory = 'crypto' | 'commodity' | 'fixed-income'

export type AssetTicker =
  | 'BTC' | 'ETH' | 'SOL' | 'AAVE' | 'XRP' | 'LINK'
  | 'PAXG' | 'KAG'
  | 'RENDA-USD' | 'RENDA-BRL' | 'RENDA-EUR'

export interface Asset {
  ticker: AssetTicker
  name: string
  category: AssetCategory
  icon: string
  price?: number
  change24h?: number
  apy?: number
  apyDisplay?: string
  marketCap?: string
  volume24h?: string
  network?: string
}

export interface Position {
  asset: AssetTicker
  quantity: number
  avgCost: number
  currentValue: number
}

export interface LineChartDataPoint {
  time: string
  value: number
}

// ── Asset Catalog ──

export const ASSETS: Asset[] = [
  // Crypto
  { ticker: 'BTC', name: 'Bitcoin', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', price: 565000, change24h: 2.3, marketCap: 'R$ 12,5 tri', volume24h: 'R$ 285 bi', network: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', price: 18200, change24h: 1.8, marketCap: 'R$ 2,3 tri', volume24h: 'R$ 85 bi', network: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', price: 890, change24h: 4.1, marketCap: 'R$ 450 bi', volume24h: 'R$ 25 bi', network: 'Solana' },
  { ticker: 'AAVE', name: 'Aave', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png', price: 1450, change24h: -0.7, marketCap: 'R$ 22 bi', volume24h: 'R$ 1,2 bi', network: 'Ethereum' },
  { ticker: 'XRP', name: 'XRP', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', price: 14.20, change24h: 0.5, marketCap: 'R$ 82 bi', volume24h: 'R$ 8 bi', network: 'XRP Ledger' },
  { ticker: 'LINK', name: 'Chainlink', category: 'crypto', icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', price: 98.50, change24h: 3.2, marketCap: 'R$ 65 bi', volume24h: 'R$ 4,5 bi', network: 'Ethereum' },
  // Commodities
  { ticker: 'PAXG', name: 'Ouro', category: 'commodity', icon: 'https://assets.coingecko.com/coins/images/9519/small/paxg.PNG', price: 18500, change24h: 0.3, marketCap: 'R$ 3,2 bi', volume24h: 'R$ 180 mi' },
  { ticker: 'KAG', name: 'Prata', category: 'commodity', icon: 'https://assets.coingecko.com/coins/images/11802/small/KAG.png', price: 185, change24h: 0.1, marketCap: 'R$ 450 mi', volume24h: 'R$ 12 mi' },
  // Fixed Income
  { ticker: 'RENDA-USD', name: 'Renda em Dólar', category: 'fixed-income', icon: USD_FLAG, apy: 4.37, apyDisplay: '4,37% a.a.' },
  { ticker: 'RENDA-BRL', name: 'Renda em Real', category: 'fixed-income', icon: BRL_FLAG, apy: 10, apyDisplay: '10% a.a.' },
  { ticker: 'RENDA-EUR', name: 'Renda em Euro', category: 'fixed-income', icon: EUR_FLAG, apy: 3, apyDisplay: '3% a.a.' },
]

export function getAsset(ticker: AssetTicker): Asset {
  return ASSETS.find(a => a.ticker === ticker)!
}

export function getVariableAssets(): Asset[] {
  return ASSETS.filter(a => a.category === 'crypto' || a.category === 'commodity')
}

export function getFixedIncomeAssets(): Asset[] {
  return ASSETS.filter(a => a.category === 'fixed-income')
}

// ── Mock Portfolio ──

export const MOCK_POSITIONS: Position[] = [
  { asset: 'BTC', quantity: 0.0085, avgCost: 520000, currentValue: 4802.50 },
  { asset: 'ETH', quantity: 0.25, avgCost: 16800, currentValue: 4550 },
  { asset: 'SOL', quantity: 5, avgCost: 780, currentValue: 4450 },
  { asset: 'RENDA-USD', quantity: 200, avgCost: 1, currentValue: 1072.40 },
  { asset: 'PAXG', quantity: 0.1, avgCost: 17800, currentValue: 1850 },
]

export function getPortfolioTotal(): number {
  return MOCK_POSITIONS.reduce((sum, p) => sum + p.currentValue, 0)
}

export function getPortfolioChange(): number {
  const totalCost = MOCK_POSITIONS.reduce((sum, p) => sum + (p.avgCost * p.quantity), 0)
  const totalValue = getPortfolioTotal()
  return ((totalValue - totalCost) / totalCost) * 100
}

// ── Formatting Helpers ──

export function formatBRL(amount: number): string {
  return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPercentChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function formatQuantity(qty: number, ticker: AssetTicker): string {
  if (ticker.startsWith('RENDA-')) {
    const currency = ticker === 'RENDA-USD' ? 'US$' : ticker === 'RENDA-EUR' ? '€' : 'R$'
    return `${currency} ${qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${ticker}`
}

// ── Chart Data Generators ──

export function generatePriceChartData(days: number, basePrice: number, volatility: number): LineChartDataPoint[] {
  const points: LineChartDataPoint[] = []
  let price = basePrice
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.48) * volatility * basePrice
    price = Math.max(price + change, basePrice * 0.5)
    points.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(price * 100) / 100,
    })
  }

  return points
}

export function generatePortfolioChartData(days: number): LineChartDataPoint[] {
  const total = getPortfolioTotal()
  return generatePriceChartData(days, total * 0.92, 0.015)
}

export function getCategoryLabel(category: AssetCategory): string {
  switch (category) {
    case 'crypto': return 'Cripto'
    case 'commodity': return 'Commodity'
    case 'fixed-income': return 'Renda Fixa'
  }
}

export function getCategoryBadgeVariant(category: AssetCategory): 'info' | 'lime' | 'grape' {
  switch (category) {
    case 'crypto': return 'info'
    case 'commodity': return 'grape'
    case 'fixed-income': return 'lime'
  }
}
