import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'

// ── Types ──

export type AssetCategory = 'crypto' | 'commodity' | 'fixed-income' | 'stablecoin'

export type AssetTicker =
  | 'BTC' | 'ETH' | 'SOL' | 'AAVE' | 'XRP' | 'LINK'
  | 'PAXG' | 'KAG'
  | 'RENDA-USD' | 'RENDA-BRL' | 'RENDA-EUR'
  | 'USDC' | 'USDT' | 'DAI'
  | 'AVAX'

export interface Asset {
  ticker: AssetTicker
  name: string
  category: AssetCategory
  icon: string
  price?: number         // BRL (volatile only)
  change24h?: number     // % (volatile only)
  apy?: number           // decimal (fixed income only)
  apyDisplay?: string    // "4,37% a.a."
  marketCap?: string
  volume24h?: string
  ath?: string           // all-time high formatted
  network?: string       // crypto only
  description: string    // pt-BR user-facing description
  tags?: string[]        // for discovery: "popular", "trending", etc.
}

export interface Position {
  asset: AssetTicker
  quantity: number
  avgCost: number
  currentValue: number
  investedSince: string   // date string
}

export interface LineChartDataPoint {
  time: string
  value: number
}

// ── Category Info ──

export const CATEGORY_INFO: Record<AssetCategory, { label: string; emoji: string; description: string }> = {
  crypto: { label: 'Criptomoedas', emoji: '₿', description: 'Moedas digitais com potencial de valorização' },
  commodity: { label: 'Commodities', emoji: '🥇', description: 'Metais preciosos tokenizados' },
  'fixed-income': { label: 'Renda Fixa Digital', emoji: '📈', description: 'Rendimento automático sobre stablecoins' },
  stablecoin: { label: 'Stablecoins', emoji: '💵', description: 'Moedas pareadas ao dólar para estabilidade' },
}

export const CATEGORY_BADGE_VARIANT: Record<AssetCategory, 'info' | 'grape' | 'lime' | 'neutral'> = {
  crypto: 'info',
  commodity: 'grape',
  'fixed-income': 'lime',
  stablecoin: 'neutral',
}

// ── Asset Catalog ──

export const ASSETS: Asset[] = [
  // Crypto
  {
    ticker: 'BTC', name: 'Bitcoin', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    price: 372473.49, change24h: 2.3, marketCap: 'R$ 12,5 tri', volume24h: 'R$ 285 bi', ath: 'R$ 420.000,00', network: 'Bitcoin',
    description: 'A maior e mais conhecida moeda digital do mundo. Reserva de valor descentralizada.',
    tags: ['popular', 'trending'],
  },
  {
    ticker: 'ETH', name: 'Ethereum', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    price: 18200, change24h: -3.2, marketCap: 'R$ 2,3 tri', volume24h: 'R$ 85 bi', ath: 'R$ 28.500,00', network: 'Ethereum',
    description: 'Plataforma líder em contratos inteligentes e aplicações descentralizadas.',
    tags: ['popular'],
  },
  {
    ticker: 'SOL', name: 'Solana', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    price: 890, change24h: 4.1, marketCap: 'R$ 450 bi', volume24h: 'R$ 25 bi', ath: 'R$ 1.580,00', network: 'Solana',
    description: 'Blockchain de alta performance com taxas baixas e velocidade.',
    tags: ['trending'],
  },
  {
    ticker: 'AAVE', name: 'Aave', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    price: 1450, change24h: -0.7, marketCap: 'R$ 22 bi', volume24h: 'R$ 1,2 bi', ath: 'R$ 3.900,00', network: 'Ethereum',
    description: 'Protocolo líder em empréstimos e rendimentos descentralizados.',
  },
  {
    ticker: 'XRP', name: 'XRP', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
    price: 14.20, change24h: 0.5, marketCap: 'R$ 82 bi', volume24h: 'R$ 8 bi', ath: 'R$ 20,50', network: 'XRP Ledger',
    description: 'Rede de pagamentos globais rápidos e de baixo custo.',
  },
  {
    ticker: 'LINK', name: 'Chainlink', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    price: 98.50, change24h: 3.2, marketCap: 'R$ 65 bi', volume24h: 'R$ 4,5 bi', ath: 'R$ 310,00', network: 'Ethereum',
    description: 'Rede de oráculos que conecta contratos inteligentes a dados do mundo real.',
    tags: ['trending'],
  },

  // Commodities
  {
    ticker: 'PAXG', name: 'Ouro', category: 'commodity',
    icon: 'https://assets.coingecko.com/coins/images/9519/small/paxg.PNG',
    price: 18500, change24h: 0.3, marketCap: 'R$ 3,2 bi', volume24h: 'R$ 180 mi', ath: 'R$ 19.200,00',
    description: 'Ouro tokenizado — cada unidade é lastreada por uma onça troy de ouro físico.',
    tags: ['popular'],
  },
  {
    ticker: 'KAG', name: 'Prata', category: 'commodity',
    icon: 'https://assets.coingecko.com/coins/images/11802/small/KAG.png',
    price: 185, change24h: 0.1, marketCap: 'R$ 450 mi', volume24h: 'R$ 12 mi',
    description: 'Prata digital lastreada em metal físico. Diversificação em metais preciosos.',
  },

  // Fixed Income
  {
    ticker: 'RENDA-USD', name: 'Renda em Dólar', category: 'fixed-income',
    icon: USD_FLAG,
    apy: 0.0437, apyDisplay: '4,37% a.a.',
    description: 'Seu saldo em dólar rende automaticamente todos os dias. Resgate quando quiser.',
    tags: ['popular'],
  },
  {
    ticker: 'RENDA-BRL', name: 'Renda em Real', category: 'fixed-income',
    icon: BRL_FLAG,
    apy: 0.10, apyDisplay: '10% a.a.',
    description: 'Rendimento em reais acima da poupança. Sem carência e sem burocracia.',
    tags: ['popular', 'trending'],
  },
  {
    ticker: 'RENDA-EUR', name: 'Renda em Euro', category: 'fixed-income',
    icon: EUR_FLAG,
    apy: 0.03, apyDisplay: '3% a.a.',
    description: 'Faça seus euros renderem automaticamente com resgate imediato.',
  },

  // Stablecoins
  {
    ticker: 'USDC', name: 'USD Coin', category: 'stablecoin',
    icon: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
    price: 5.72, change24h: 0.01, network: 'Ethereum',
    description: 'Dólar digital emitido pela Circle. Paridade 1:1 com o dólar americano.',
    tags: ['popular'],
  },
  {
    ticker: 'USDT', name: 'Tether', category: 'stablecoin',
    icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    price: 5.71, change24h: -0.02, network: 'Ethereum',
    description: 'A stablecoin mais negociada do mundo. Paridade com o dólar americano.',
    tags: ['popular'],
  },
  {
    ticker: 'DAI', name: 'Dai', category: 'stablecoin',
    icon: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
    price: 5.71, change24h: 0.0, network: 'Ethereum',
    description: 'Stablecoin descentralizada mantida por garantias em criptoativos.',
  },
  {
    ticker: 'AVAX', name: 'Avalanche', category: 'crypto',
    icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    price: 135.20, change24h: 4.1, marketCap: 'R$ 310 bi', volume24h: 'R$ 18 bi', ath: 'R$ 850,00', network: 'Avalanche',
    description: 'Plataforma de contratos inteligentes com alta velocidade e baixas taxas.',
    tags: ['popular', 'trending'],
  },
]

// ── Accessors ──

export function getAsset(ticker: AssetTicker): Asset {
  return ASSETS.find(a => a.ticker === ticker)!
}

export function getAssetsByCategory(category: AssetCategory): Asset[] {
  return ASSETS.filter(a => a.category === category)
}

export function getPopularAssets(): Asset[] {
  return ASSETS.filter(a => a.tags?.includes('popular'))
}

export function getTrendingAssets(): Asset[] {
  return ASSETS.filter(a => a.tags?.includes('trending'))
}

export function isVolatile(asset: Asset): boolean {
  return asset.category === 'crypto' || asset.category === 'commodity' || asset.category === 'stablecoin'
}

// ── Mock Portfolio ──

export const MOCK_POSITIONS: Position[] = [
  { asset: 'BTC', quantity: 0.0185, avgCost: 520000, currentValue: 14802.50, investedSince: '15 jan 2026' },
  { asset: 'ETH', quantity: 0.65, avgCost: 16800, currentValue: 11549.99, investedSince: '20 jan 2026' },
  { asset: 'SOL', quantity: 5, avgCost: 780, currentValue: 4450, investedSince: '02 fev 2026' },
  { asset: 'RENDA-USD', quantity: 200, avgCost: 1, currentValue: 4072.40, investedSince: '10 dez 2025' },
  { asset: 'PAXG', quantity: 0.1, avgCost: 17800, currentValue: 1850, investedSince: '25 jan 2026' },
  { asset: 'USDT', quantity: 1800, avgCost: 5.71, currentValue: 10278, investedSince: '05 jan 2026' },
]

export function getPosition(ticker: AssetTicker): Position | undefined {
  return MOCK_POSITIONS.find(p => p.asset === ticker)
}

export function getPortfolioTotal(): number {
  return MOCK_POSITIONS.reduce((sum, p) => sum + p.currentValue, 0)
}

// ── Formatting ──

export function formatBRL(amount: number): string {
  return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatUSD(amount: number): string {
  return `US$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPercentChange(pct: number): string {
  const arrow = pct >= 0 ? '↑' : '↓'
  const abs = Math.abs(pct).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${arrow} ${abs}%`
}

export function formatQuantity(qty: number, ticker: AssetTicker): string {
  if (ticker.startsWith('RENDA-')) {
    const symbol = ticker === 'RENDA-USD' ? 'US$' : ticker === 'RENDA-EUR' ? '€' : 'R$'
    return `${symbol} ${qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  const decimals = qty < 1 ? 8 : qty < 100 ? 4 : 2
  return `${qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: decimals })} ${ticker}`
}

export function rawDigitsFromAmount(amount: number, decimals = 2): string {
  if (amount <= 0) return ''
  const multiplier = Math.pow(10, decimals)
  return Math.round(amount * multiplier).toString()
}

export function getCurrencySymbol(ticker: AssetTicker): string {
  if (ticker === 'RENDA-USD') return 'US$'
  if (ticker === 'RENDA-EUR') return '€'
  if (ticker === 'RENDA-BRL') return 'R$'
  return 'R$' // volatile assets are priced in BRL
}

// ── Chart Data ──

export function generatePriceChartData(days: number, basePrice: number, volatility: number): LineChartDataPoint[] {
  const points: LineChartDataPoint[] = []
  let price = basePrice
  const now = new Date()

  // Use hourly points for short timeframes, daily for longer ones
  const totalPoints = days <= 1 ? 24 : days <= 7 ? days * 4 : days
  const msPerPoint = (days * 24 * 60 * 60 * 1000) / totalPoints

  for (let i = 0; i <= totalPoints; i++) {
    const date = new Date(now.getTime() - (totalPoints - i) * msPerPoint)
    const change = (Math.random() - 0.48) * volatility * basePrice * (days <= 7 ? 0.25 : 1)
    price = Math.max(price + change, basePrice * 0.5)
    points.push({
      time: date.toISOString().split('T')[0],
      value: Math.round(price * 100) / 100,
    })
  }
  return points
}

export function generateYieldChartData(days: number, balance: number, apy: number): LineChartDataPoint[] {
  const now = new Date()
  const dailyRate = apy / 365
  return Array.from({ length: days + 1 }, (_, i) => ({
    time: new Date(now.getTime() - (days - i) * 86400000).toISOString().split('T')[0],
    value: Math.round(balance * (1 + dailyRate * i) * 100) / 100,
  }))
}

export function generatePortfolioChartData(days: number): LineChartDataPoint[] {
  const total = getPortfolioTotal()
  const numDays = days
  const points: LineChartDataPoint[] = []
  const now = new Date()

  // Shape inspired by a real portfolio chart:
  // Start low → small dip → sharp zigzag rally → pullback → high plateau with minor peak → slight dip at end
  // Expressed as piecewise multipliers of total at key fractions of the time range
  const keyframes: [number, number][] = [
    [0.00, 0.68],  // start low
    [0.07, 0.72],  // small bump
    [0.13, 0.66],  // dip back down
    [0.20, 0.74],  // recover
    [0.27, 0.82],  // climbing
    [0.33, 0.96],  // sharp spike
    [0.37, 0.88],  // pullback from spike
    [0.43, 0.78],  // deeper pullback
    [0.50, 0.84],  // recovery
    [0.57, 0.90],  // steady climb
    [0.63, 0.93],  // continuing up
    [0.70, 0.88],  // small dip
    [0.77, 0.97],  // new high
    [0.83, 1.00],  // peak
    [0.90, 0.95],  // slight pullback
    [1.00, 0.93],  // end slightly below peak
  ]

  for (let i = numDays; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const t = (numDays - i) / numDays // 0 → 1

    // Interpolate between keyframes
    let trend: number
    if (t <= keyframes[0][0]) {
      trend = total * keyframes[0][1]
    } else if (t >= keyframes[keyframes.length - 1][0]) {
      trend = total * keyframes[keyframes.length - 1][1]
    } else {
      let k = 0
      while (k < keyframes.length - 1 && keyframes[k + 1][0] < t) k++
      const [t0, v0] = keyframes[k]
      const [t1, v1] = keyframes[k + 1]
      const p = (t - t0) / (t1 - t0)
      trend = total * (v0 + (v1 - v0) * p)
    }

    // Small deterministic noise for realism
    const noise = (Math.sin(i * 13.7 + 2.3) * 0.4 + Math.sin(i * 37.9) * 0.3) * total * 0.005

    points.push({
      time: date.toISOString().split('T')[0],
      value: Math.round((trend + noise) * 100) / 100,
    })
  }
  return points
}

// ── Processing Steps ──

export const BUY_PROCESSING_STEPS = [
  { title: 'Verificando saldo...', progress: 25 },
  { title: 'Processando ordem...', progress: 55 },
  { title: 'Atualizando portfólio...', progress: 85 },
  { title: 'Pronto!', progress: 100 },
]

export const SELL_PROCESSING_STEPS = [
  { title: 'Processando venda...', progress: 25 },
  { title: 'Executando ordem...', progress: 55 },
  { title: 'Atualizando saldo...', progress: 85 },
  { title: 'Pronto!', progress: 100 },
]

// ── Mock transaction history ──

export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'yield'
  title: string
  amount: string       // BRL value
  date: string
  status: 'completed' | 'processing'
}

export function getMockTransactions(ticker: AssetTicker): Transaction[] {
  const asset = getAsset(ticker)
  const isFixed = asset.category === 'fixed-income'
  const symbol = getCurrencySymbol(ticker)
  const price = asset.price ?? 0

  if (isFixed) {
    return [
      { id: '1', type: 'yield', title: 'Rendimento', amount: `+${symbol} 2,14`, date: '17 mar 2026', status: 'completed' },
      { id: '2', type: 'buy', title: 'Depósito', amount: `+${symbol} 500,00`, date: '10 mar 2026', status: 'completed' },
      { id: '3', type: 'buy', title: 'Depósito', amount: `+${symbol} 572,40`, date: '10 dez 2025', status: 'completed' },
    ]
  }

  const qty1 = 0.003, qty2 = 0.001, qty3 = 0.0055
  return [
    { id: '1', type: 'buy', title: `Comprou ${formatQuantity(qty1, ticker)}`, amount: formatBRL(qty1 * price), date: '10 mar 2026', status: 'completed' },
    { id: '2', type: 'sell', title: `Vendeu ${formatQuantity(qty2, ticker)}`, amount: formatBRL(qty2 * price), date: '5 mar 2026', status: 'completed' },
    { id: '3', type: 'buy', title: `Comprou ${formatQuantity(qty3, ticker)}`, amount: formatBRL(qty3 * price), date: '15 jan 2026', status: 'completed' },
  ]
}

// ── Statement transactions (date-grouped, all assets) ──

export type StatementTxType = 'buy' | 'sell' | 'deposit-crypto' | 'withdraw-crypto'

export interface StatementTransaction {
  id: string
  type: StatementTxType
  asset: AssetTicker
  title: string
  subtitle: string
  date: string        // display date e.g. "13 mar 2026"
  sortKey: number     // for sorting (higher = more recent)
}

const STATEMENT_TRANSACTIONS: StatementTransaction[] = [
  { id: 'st-01', type: 'buy', asset: 'BTC', title: 'Comprou 0,025 BTC', subtitle: 'por US$ 800,00', date: '28 mar 2026', sortKey: 20260328_3 },
  { id: 'st-03', type: 'sell', asset: 'ETH', title: 'Vendeu 0,5 ETH', subtitle: 'por US$ 1.200,00', date: '28 mar 2026', sortKey: 20260328_1 },
  { id: 'st-04', type: 'buy', asset: 'SOL', title: 'Comprou 5,00 SOL', subtitle: 'por US$ 450,00', date: '25 mar 2026', sortKey: 20260325_1 },
  { id: 'st-06', type: 'deposit-crypto', asset: 'BTC', title: 'Depósito de Bitcoin', subtitle: '0,01 BTC recebido', date: '22 mar 2026', sortKey: 20260322_1 },
  { id: 'st-07', type: 'sell', asset: 'PAXG', title: 'Vendeu 0,10 PAXG', subtitle: 'por US$ 230,00', date: '20 mar 2026', sortKey: 20260320_2 },
  { id: 'st-08', type: 'buy', asset: 'ETH', title: 'Comprou 0,30 ETH', subtitle: 'por US$ 540,00', date: '20 mar 2026', sortKey: 20260320_1 },
  { id: 'st-09', type: 'withdraw-crypto', asset: 'ETH', title: 'Saque de Ethereum', subtitle: '0,15 ETH enviado', date: '18 mar 2026', sortKey: 20260318_1 },
  { id: 'st-10', type: 'buy', asset: 'BTC', title: 'Comprou 0,003 BTC', subtitle: 'por US$ 280,00', date: '15 mar 2026', sortKey: 20260315_1 },
  { id: 'st-12', type: 'sell', asset: 'SOL', title: 'Vendeu 2,00 SOL', subtitle: 'por US$ 180,00', date: '10 mar 2026', sortKey: 20260310_1 },
  { id: 'st-13', type: 'buy', asset: 'PAXG', title: 'Comprou 0,20 PAXG', subtitle: 'por US$ 460,00', date: '05 mar 2026', sortKey: 20260305_1 },
  { id: 'st-14', type: 'deposit-crypto', asset: 'SOL', title: 'Depósito de Solana', subtitle: '3,00 SOL recebido', date: '01 mar 2026', sortKey: 20260301_1 },
]

export interface StatementDateGroup {
  date: string
  transactions: StatementTransaction[]
}

export function getStatementTransactions(): StatementDateGroup[] {
  const sorted = [...STATEMENT_TRANSACTIONS].sort((a, b) => b.sortKey - a.sortKey)
  const groups: StatementDateGroup[] = []
  for (const tx of sorted) {
    const last = groups[groups.length - 1]
    if (last && last.date === tx.date) {
      last.transactions.push(tx)
    } else {
      groups.push({ date: tx.date, transactions: [tx] })
    }
  }
  return groups
}

// ── Orders (TP/SL) ──

export type OrderType = 'take-profit' | 'stop-loss'
export type OrderSide = 'buy' | 'sell'

export interface Order {
  id: string
  asset: AssetTicker
  side: OrderSide
  type: OrderType
  triggerPrice: number  // BRL
  value: number         // order value in BRL
  quantity: number
  createdAt: string     // date string
  status: 'active' | 'executed' | 'cancelled'
}

export const MOCK_ORDERS: Order[] = [
  { id: 'ord-1', asset: 'BTC', side: 'sell', type: 'take-profit', triggerPrice: 620000, value: 3100, quantity: 0.005, createdAt: '22 mar 2026', status: 'active' },
  { id: 'ord-2', asset: 'BTC', side: 'buy', type: 'stop-loss', triggerPrice: 480000, value: 2400, quantity: 0.005, createdAt: '22 mar 2026', status: 'active' },
  { id: 'ord-3', asset: 'ETH', side: 'sell', type: 'take-profit', triggerPrice: 22000, value: 6600, quantity: 0.3, createdAt: '20 mar 2026', status: 'executed' },
  { id: 'ord-4', asset: 'SOL', side: 'buy', type: 'stop-loss', triggerPrice: 700, value: 1400, quantity: 2, createdAt: '18 mar 2026', status: 'cancelled' },
]

export function getActiveOrders(ticker?: AssetTicker): Order[] {
  const active = MOCK_ORDERS.filter(o => o.status === 'active')
  return ticker ? active.filter(o => o.asset === ticker) : active
}

export interface OrderDateGroup {
  date: string
  orders: Order[]
}

export function getAllOrdersGrouped(): OrderDateGroup[] {
  const groups: OrderDateGroup[] = []
  for (const order of MOCK_ORDERS) {
    const last = groups[groups.length - 1]
    if (last && last.date === order.createdAt) {
      last.orders.push(order)
    } else {
      groups.push({ date: order.createdAt, orders: [order] })
    }
  }
  return groups
}

// ── Favorites ──

export const MOCK_FAVORITES: AssetTicker[] = ['BTC', 'ETH', 'SOL', 'XRP', 'AVAX']

export function isFavorite(ticker: AssetTicker): boolean {
  return MOCK_FAVORITES.includes(ticker)
}

export function getFavoriteAssets(): Asset[] {
  return MOCK_FAVORITES.map(t => getAsset(t))
}
