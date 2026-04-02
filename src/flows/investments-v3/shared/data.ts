import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'

export type AssetTicker = 'BTC' | 'ETH' | 'SOL' | 'AAVE' | 'XRP' | 'LINK' | 'PAXG' | 'KAG' | 'RENDA-USD' | 'RENDA-BRL' | 'RENDA-EUR'
export type AssetCategory = 'crypto' | 'commodity' | 'fixed-income'

export interface Asset {
  ticker: AssetTicker
  name: string
  category: AssetCategory
  icon: string
  color: string        // brand color for gradients
  price?: number
  change24h?: number
  apy?: number
  apyDisplay?: string
  marketCap?: string
  volume24h?: string
  network?: string
  description: string
  sparkline: number[]  // 7 values for mini sparkline
}

export const ASSETS: Asset[] = [
  {
    ticker: 'BTC', name: 'Bitcoin', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    color: '#F7931A',
    price: 565000, change24h: 2.3, marketCap: 'R$ 12,5 tri', volume24h: 'R$ 285 bi', network: 'Bitcoin',
    description: 'A maior moeda digital do mundo.',
    sparkline: [520, 535, 528, 545, 550, 558, 565],
  },
  {
    ticker: 'ETH', name: 'Ethereum', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    color: '#627EEA',
    price: 18200, change24h: 1.8, marketCap: 'R$ 2,3 tri', volume24h: 'R$ 85 bi', network: 'Ethereum',
    description: 'Plataforma líder em contratos inteligentes.',
    sparkline: [17200, 17500, 17800, 17400, 18000, 18100, 18200],
  },
  {
    ticker: 'SOL', name: 'Solana', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    color: '#9945FF',
    price: 890, change24h: 4.1, marketCap: 'R$ 450 bi', volume24h: 'R$ 25 bi', network: 'Solana',
    description: 'Blockchain de alta performance.',
    sparkline: [780, 800, 820, 835, 850, 870, 890],
  },
  {
    ticker: 'AAVE', name: 'Aave', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    color: '#B6509E',
    price: 1450, change24h: -0.7, marketCap: 'R$ 22 bi', volume24h: 'R$ 1,2 bi', network: 'Ethereum',
    description: 'Protocolo líder em DeFi.',
    sparkline: [1500, 1480, 1470, 1460, 1455, 1448, 1450],
  },
  {
    ticker: 'XRP', name: 'XRP', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    color: '#23292F',
    price: 14.20, change24h: 0.5, marketCap: 'R$ 82 bi', volume24h: 'R$ 8 bi', network: 'XRP Ledger',
    description: 'Pagamentos globais rápidos.',
    sparkline: [13.8, 14.0, 13.9, 14.1, 14.0, 14.15, 14.20],
  },
  {
    ticker: 'LINK', name: 'Chainlink', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    color: '#2A5ADA',
    price: 98.50, change24h: 3.2, marketCap: 'R$ 65 bi', volume24h: 'R$ 4,5 bi', network: 'Ethereum',
    description: 'Oráculos para smart contracts.',
    sparkline: [88, 90, 92, 94, 95, 97, 98.5],
  },
  {
    ticker: 'PAXG', name: 'Ouro', category: 'commodity',
    icon: 'https://assets.coingecko.com/coins/images/9519/small/paxg.PNG',
    color: '#E6B800',
    price: 18500, change24h: 0.3, marketCap: 'R$ 3,2 bi', volume24h: 'R$ 180 mi',
    description: 'Ouro tokenizado, lastreado 1:1.',
    sparkline: [18300, 18350, 18380, 18400, 18420, 18460, 18500],
  },
  {
    ticker: 'KAG', name: 'Prata', category: 'commodity',
    icon: 'https://assets.coingecko.com/coins/images/11802/small/KAG.png',
    color: '#C0C0C0',
    price: 185, change24h: 0.1, marketCap: 'R$ 450 mi', volume24h: 'R$ 12 mi',
    description: 'Prata digital lastreada em metal físico.',
    sparkline: [183, 183.5, 184, 184.2, 184.5, 184.8, 185],
  },
  {
    ticker: 'RENDA-USD', name: 'Renda em Dólar', category: 'fixed-income',
    icon: USD_FLAG,
    color: '#10B981',
    apy: 0.0437, apyDisplay: '4,37% a.a.',
    description: 'Rendimento automático em dólar.',
    sparkline: [100, 100.2, 100.4, 100.6, 100.8, 101, 101.2],
  },
  {
    ticker: 'RENDA-BRL', name: 'Renda em Real', category: 'fixed-income',
    icon: BRL_FLAG,
    color: '#10B981',
    apy: 0.10, apyDisplay: '10% a.a.',
    description: 'Rendimento em reais acima da poupança.',
    sparkline: [100, 100.5, 101, 101.5, 102, 102.5, 103],
  },
  {
    ticker: 'RENDA-EUR', name: 'Renda em Euro', category: 'fixed-income',
    icon: EUR_FLAG,
    color: '#10B981',
    apy: 0.03, apyDisplay: '3% a.a.',
    description: 'Seus euros renderem automaticamente.',
    sparkline: [100, 100.1, 100.2, 100.3, 100.4, 100.5, 100.6],
  },
]

export function getAsset(ticker: AssetTicker): Asset {
  return ASSETS.find(a => a.ticker === ticker)!
}

export function formatBRL(n: number): string {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPct(n: number): string {
  const s = n >= 0 ? '+' : ''
  return `${s}${n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function generateChartData(days: number, base: number, vol: number) {
  let price = base
  const now = new Date()
  return Array.from({ length: days + 1 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - i))
    price = Math.max(price + (Math.random() - 0.48) * vol * base, base * 0.5)
    return { time: d.toISOString().split('T')[0], value: Math.round(price * 100) / 100 }
  })
}
