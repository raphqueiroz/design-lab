// Re-export + extend invest-2 data with visual properties (colors, sparklines)
export {
  type Asset,
  type AssetCategory,
  type AssetTicker,
  type Position,
  type LineChartDataPoint,
  type Transaction,
  type Order,
  type OrderType,
  type OrderSide,
  type StatementTxType,
  type StatementTransaction,
  type StatementDateGroup,
  getStatementTransactions,
  MOCK_POSITIONS,
  MOCK_ORDERS,
  MOCK_FAVORITES,
  getPosition,
  getPortfolioTotal,
  getActiveOrders,
  type OrderDateGroup,
  getAllOrdersGrouped,
  isFavorite,
  getFavoriteAssets,
  isVolatile,
  formatBRL,
  formatUSD,
  formatPercentChange,
  formatQuantity,
  getCurrencySymbol,
  rawDigitsFromAmount,
  generatePriceChartData,
  generateYieldChartData,
  generatePortfolioChartData,
  getMockTransactions,
  BUY_PROCESSING_STEPS,
  SELL_PROCESSING_STEPS,
  CATEGORY_INFO,
} from '../../invest-2/shared/data'

import { ASSETS as BASE_ASSETS, getAsset as baseGetAsset } from '../../invest-2/shared/data'
import type { AssetTicker } from '../../invest-2/shared/data'

// ── Visual extensions ──

export const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  AAVE: '#B6509E',
  XRP: '#23292F',
  LINK: '#2A5ADA',
  PAXG: '#E6B800',
  KAG: '#C0C0C0',
  'RENDA-USD': '#10B981',
  'RENDA-BRL': '#10B981',
  'RENDA-EUR': '#10B981',
  USDC: '#2775CA',
  USDT: '#26A17B',
  DAI: '#F5AC37',
  AVAX: '#E84142',
}

export const SPARKLINES: Record<string, number[]> = {
  BTC: [520, 535, 528, 545, 550, 558, 565],
  ETH: [17200, 17500, 17800, 17400, 18000, 18100, 18200],
  SOL: [780, 800, 820, 835, 850, 870, 890],
  AAVE: [1500, 1480, 1470, 1460, 1455, 1448, 1450],
  XRP: [13.8, 14.0, 13.9, 14.1, 14.0, 14.15, 14.20],
  LINK: [88, 90, 92, 94, 95, 97, 98.5],
  PAXG: [18300, 18350, 18380, 18400, 18420, 18460, 18500],
  KAG: [183, 183.5, 184, 184.2, 184.5, 184.8, 185],
  'RENDA-USD': [100, 100.2, 100.4, 100.6, 100.8, 101, 101.2],
  'RENDA-BRL': [100, 100.5, 101, 101.5, 102, 102.5, 103],
  'RENDA-EUR': [100, 100.1, 100.2, 100.3, 100.4, 100.5, 100.6],
  USDC: [5.70, 5.71, 5.72, 5.71, 5.72, 5.72, 5.72],
  USDT: [5.70, 5.71, 5.70, 5.71, 5.71, 5.71, 5.71],
  DAI: [5.70, 5.71, 5.71, 5.70, 5.71, 5.71, 5.71],
  AVAX: [120, 125, 128, 130, 132, 134, 135],
}

export function getAssetColor(ticker: AssetTicker | string): string {
  return ASSET_COLORS[ticker] ?? '#6366F1'
}

export function getSparkline(ticker: AssetTicker | string): number[] {
  return SPARKLINES[ticker] ?? [1, 1, 1, 1, 1, 1, 1]
}

// Re-export ASSETS and getAsset so screens don't need dual imports
export const ASSETS = BASE_ASSETS
export const getAsset = baseGetAsset
