import { registerFlow } from '@/pages/simulator/flowRegistry'
import { registerPage } from '@/pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '@/pages/simulator/flowGraphStore'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '@/pages/simulator/flowGroupStore'
import type { FlowNodeData } from '@/pages/simulator/flowGraph.types'

// ── Screens ──
import Screen0_Dashboard from './Screen0_Dashboard'
import Screen1_Discover from './Screen1_Discover'
import Screen2_AssetPage from './Screen2_AssetPage'
import Screen3_Trade from './Screen3_Trade'
import Screen3_Sell from './Screen3_Sell'
import Screen3c_OrderConfig from './Screen3c_OrderConfig'
import Screen4_Review from './Screen4_Review'
import Screen5_Processing from './Screen5_Processing'
import Screen6_Success from './Screen6_Success'
import Screen7_OpenOrders from './Screen7_OpenOrders'
import Screen8_Favorites from './Screen8_Favorites'
import Screen9_Statement from './Screen9_Statement'
import Screen10_ExportStatement from './Screen10_ExportStatement'
import Receive_Screen1_RiskWarning from './receive/Screen1_RiskWarning'
import Receive_Screen2_SelectAsset from './receive/Screen2_SelectAsset'
import Receive_Screen3_SelectChain from './receive/Screen3_SelectChain'
import Receive_Screen4_Amount from './receive/Screen4_Amount'
import Receive_Screen5_DepositAddress from './receive/Screen5_DepositAddress'
import Receive_Screen6_Awaiting from './receive/Screen6_Awaiting'
import Send_Screen1 from './send/Screen1_Send'

// ═══════════════════════════════════════════════════════════════
// 1. EXPLORE FLOW — Dashboard → Discover → AssetPage + supporting
// ═══════════════════════════════════════════════════════════════

const exploreScreenDefs = [
  {
    id: 'il-dashboard',
    title: 'Dashboard (Visual)',
    description: 'Light theme portfolio: glassmorphism cards, area chart, shortcuts, favorites chips, holdings with sparklines.',
    componentsUsed: ['Custom'],
    component: Screen0_Dashboard,
    interactiveElements: [
      { id: 'sc-negociar', component: 'ShortcutButton', label: 'Negociar' },
      { id: 'sc-favoritos', component: 'ShortcutButton', label: 'Favoritos' },
      { id: 'sc-ordens', component: 'ShortcutButton', label: 'Ordens' },
      { id: 'li-depositar', component: 'ListItem', label: 'Depositar criptomoedas' },
      { id: 'li-enviar', component: 'ListItem', label: 'Enviar ativos' },
      { id: 'li-documentos', component: 'ListItem', label: 'Documentos' },
      { id: 'li-relatorio', component: 'ListItem', label: 'Relatório de Ganhos' },
      { id: 'li-explorar', component: 'ListItem', label: 'Explorar mais ativos' },
      { id: 'li-btc', component: 'ListItem', label: 'Bitcoin' },
      { id: 'btn-explorar', component: 'Button', label: 'Explorar ativos' },
      { id: 'btn-comecar', component: 'Button', label: 'Começar a investir' },
      { id: 'btn-simular', component: 'Button', label: 'Simular investimento' },
    ],
    states: [
      { id: 'first-access', name: 'First Access', description: 'Hero onboarding with Summary benefits', isDefault: true, data: { dashboard: 'first-access' } },
      { id: 'empty', name: 'Empty', description: 'No investments — psychology-driven onboarding', data: { dashboard: 'empty' } },
      { id: 'portfolio-new', name: 'Portfolio New', description: 'Just invested — no chart yet, waiting for 7 days', data: { dashboard: 'portfolio-new' } },
      { id: 'portfolio-7day', name: 'Portfolio 7-Day', description: '7 days of data — flat line then real values at the end', data: { dashboard: 'portfolio-3day' } },
      { id: 'portfolio', name: 'Portfolio', description: 'User has positions', data: { dashboard: 'portfolio' } },
    ],
  },
  {
    id: 'il-discover',
    title: 'Discover (Visual)',
    description: 'Light theme asset browser: search, categories, sparkline rows, featured cards, favorites.',
    componentsUsed: ['Custom'],
    component: Screen1_Discover,
    interactiveElements: [
      { id: 'li-btc', component: 'ListItem', label: 'Bitcoin' },
      { id: 'li-eth', component: 'ListItem', label: 'Ethereum' },
      { id: 'li-sol', component: 'ListItem', label: 'Solana' },
      { id: 'li-aave', component: 'ListItem', label: 'Aave' },
      { id: 'li-xrp', component: 'ListItem', label: 'XRP' },
      { id: 'li-link', component: 'ListItem', label: 'Chainlink' },
      { id: 'li-paxg', component: 'ListItem', label: 'Ouro' },
      { id: 'li-kag', component: 'ListItem', label: 'Prata' },
      { id: 'li-renda-usd', component: 'ListItem', label: 'Renda em Dólar' },
      { id: 'li-renda-brl', component: 'ListItem', label: 'Renda em Real' },
      { id: 'li-renda-eur', component: 'ListItem', label: 'Renda em Euro' },
      { id: 'li-usdc', component: 'ListItem', label: 'USD Coin' },
      { id: 'li-usdt', component: 'ListItem', label: 'Tether' },
      { id: 'li-dai', component: 'ListItem', label: 'Dai' },
    ],
  },
  {
    id: 'il-asset-page',
    title: 'Asset Page (Visual)',
    description: 'Light theme asset detail: glow header, chart, glass stat cards, shortcuts, slide-to-buy CTA.',
    componentsUsed: ['Custom', 'LineChart'],
    component: Screen2_AssetPage,
    interactiveElements: [
      { id: 'sc-comprar', component: 'ShortcutButton', label: 'Comprar' },
      { id: 'sc-vender', component: 'ShortcutButton', label: 'Vender' },
      { id: 'btn-comprar', component: 'Button', label: 'Comprar' },
      { id: 'btn-investir', component: 'Button', label: 'Investir' },
      { id: 'li-depositar', component: 'ListItem', label: 'Depositar' },
      { id: 'li-enviar', component: 'ListItem', label: 'Enviar' },
    ],
    states: [
      { id: 'btc-invested', name: 'BTC (investido)', isDefault: true, data: { assetTicker: 'BTC', invested: true } },
      { id: 'eth-invested', name: 'ETH (investido)', data: { assetTicker: 'ETH', invested: true } },
      { id: 'btc-new', name: 'BTC (novo)', data: { assetTicker: 'BTC', invested: false } },
    ],
  },
  {
    id: 'il-open-orders',
    title: 'Open Orders (Visual)',
    description: 'Light theme TP/SL orders list with glass cards.',
    componentsUsed: ['Custom'],
    component: Screen7_OpenOrders,
    interactiveElements: [
      { id: 'li-cancel', component: 'ListItem', label: 'Cancelar ordem' },
    ],
  },
  {
    id: 'il-favorites',
    title: 'Favorites (Visual)',
    description: 'Light theme favorites list with sparklines.',
    componentsUsed: ['Custom'],
    component: Screen8_Favorites,
    interactiveElements: [
      { id: 'li-fav', component: 'ListItem', label: 'Bitcoin' },
    ],
  },
  {
    id: 'il-statement',
    title: 'Statement (Visual)',
    description: 'Light theme transaction history grouped by date with token avatars and type badges.',
    componentsUsed: ['Custom', 'Header', 'ListItem', 'Avatar', 'GroupHeader'],
    component: Screen9_Statement,
    interactiveElements: [
      { id: 'li-export', component: 'ListItem', label: 'Exportar extrato' },
    ],
  },
  {
    id: 'il-export-statement',
    title: 'Export Statement (Visual)',
    description: 'Form to configure PDF export: date range, currency, language.',
    componentsUsed: ['Header', 'TextInput', 'Select', 'Button', 'StickyFooter'],
    component: Screen10_ExportStatement,
    interactiveElements: [
      { id: 'btn-export', component: 'Button', label: 'Gerar extrato' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. TRADE FLOW — Buy (Amount → TP/SL → Review → Processing → Success)
// ═══════════════════════════════════════════════════════════════

const buyScreenDefs = [
  {
    id: 'il-trade-buy',
    title: 'Trade – Buy',
    description: 'Amount entry with order type selector (market/programmed), dual currency inputs.',
    componentsUsed: ['Header', 'CurrencyInput', 'ListItem', 'DataList', 'Banner', 'Button'],
    component: Screen3_Trade,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
      { id: 'btn-configurar', component: 'Button', label: 'Configurar ordem' },
      { id: 'li-market', component: 'ListItem', label: 'Compra a mercado' },
      { id: 'li-programmed', component: 'ListItem', label: 'Compra programada' },
    ],
    states: [
      { id: 'btc-buy', name: 'BTC Buy', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
      { id: 'eth-buy', name: 'ETH Buy', data: { assetTicker: 'ETH', mode: 'buy' } },
    ],
  },
  {
    id: 'il-order-config',
    title: 'Order Config – Programmed Buy',
    description: 'Edge-to-edge chart with draggable TP/SL lines, toggle rows with descriptions, custom price labels.',
    componentsUsed: ['Header', 'LineChart', 'Toggle', 'DataList', 'Button', 'GroupHeader', 'Text'],
    component: Screen3c_OrderConfig,
    interactiveElements: [
      { id: 'btn-revisar', component: 'Button', label: 'Revisar ordem' },
    ],
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'eth', name: 'ETH', data: { assetTicker: 'ETH' } },
    ],
  },
  {
    id: 'il-review-buy',
    title: 'Review – Buy',
    description: 'Review with grouped DataLists. Market: single section. Programmed: details + TP/SL orders.',
    componentsUsed: ['Header', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Button'],
    component: Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar compra' },
    ],
    states: [
      { id: 'btc-market', name: 'BTC (Mercado)', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy', orderType: 'market' } },
      { id: 'btc-programmed', name: 'BTC (Programada)', data: { assetTicker: 'BTC', mode: 'buy', orderType: 'programmed', tpPrice: 409721, slPrice: 335226 } },
    ],
  },
  {
    id: 'il-processing-buy',
    title: 'Processing – Buy',
    description: 'LoadingScreen with step messages and auto-advance.',
    componentsUsed: ['LoadingScreen'],
    component: Screen5_Processing,
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'il-success-buy',
    title: 'Success – Buy',
    description: 'FeedbackLayout with DataList summary and confirmation button.',
    componentsUsed: ['FeedbackLayout', 'DataList', 'GroupHeader', 'Text', 'Button'],
    component: Screen6_Success,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'btc-buy', name: 'BTC Buy', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 3. SELL FLOW — reuses Trade/TpSl/Review/Processing/Success with sell state
// ═══════════════════════════════════════════════════════════════

const sellScreenDefs = [
  {
    id: 'il-trade-sell',
    title: 'Trade – Sell',
    description: 'Sell amount entry with dual currency inputs (crypto → USD), balance display.',
    componentsUsed: ['Header', 'CurrencyInput', 'DataList', 'Button'],
    component: Screen3_Sell,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc-sell', name: 'BTC Sell (USD)', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'btc-sell-usdt', name: 'BTC Sell (USDT)', data: { assetTicker: 'BTC', payWith: 'USDT' } },
    ],
  },
  {
    id: 'il-review-sell',
    title: 'Review – Sell',
    description: 'Review sell order with grouped DataLists.',
    componentsUsed: ['Header', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Button'],
    component: Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar venda' },
    ],
    states: [
      { id: 'btc-sell', name: 'BTC Sell (USD)', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
      { id: 'btc-sell-usdt', name: 'BTC Sell (USDT)', data: { assetTicker: 'BTC', mode: 'sell', payWith: 'USDT' } },
    ],
  },
  {
    id: 'il-processing-sell',
    title: 'Processing – Sell',
    description: 'LoadingScreen with sell step messages.',
    componentsUsed: ['LoadingScreen'],
    component: Screen5_Processing,
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'il-success-sell',
    title: 'Success – Sell',
    description: 'FeedbackLayout with sell summary.',
    componentsUsed: ['FeedbackLayout', 'DataList', 'GroupHeader', 'Text', 'Button'],
    component: Screen6_Success,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 4. RECEIVE + SEND
// ═══════════════════════════════════════════════════════════════

const receiveScreenDefs = [
  {
    id: 'il-receive-warning',
    title: 'Risk Warning (Visual)',
    description: 'BottomSheet risk warning with checkbox before deposit crypto.',
    componentsUsed: ['BottomSheet', 'Checkbox', 'Button'],
    component: Receive_Screen1_RiskWarning,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'il-receive-select-asset',
    title: 'Select Asset (Visual)',
    description: 'Searchable crypto asset list for deposit selection.',
    componentsUsed: ['Header', 'SearchBar', 'AssetListItem'],
    component: Receive_Screen2_SelectAsset,
  },
  {
    id: 'il-receive-select-chain',
    title: 'Select Chain (Visual)',
    description: 'Network selection for crypto deposit.',
    componentsUsed: ['Header', 'ListItem', 'Avatar'],
    component: Receive_Screen3_SelectChain,
  },
  {
    id: 'il-receive-amount',
    title: 'Deposit Amount (Visual)',
    description: 'Crypto amount entry with USD equivalent.',
    componentsUsed: ['Header', 'CurrencyInput', 'DataList', 'Button'],
    component: Receive_Screen4_Amount,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'il-receive-address',
    title: 'Deposit Address (Visual)',
    description: 'QR code + copyable address + warning banner.',
    componentsUsed: ['Header', 'DataList', 'Banner', 'Button'],
    component: Receive_Screen5_DepositAddress,
    interactiveElements: [
      { id: 'btn-sent', component: 'Button', label: 'Já enviei' },
    ],
  },
  {
    id: 'il-receive-awaiting',
    title: 'Awaiting Deposit (Visual)',
    description: 'FeedbackLayout confirmation with delayed toast notification.',
    componentsUsed: ['FeedbackLayout', 'DataList', 'Toast', 'Button'],
    component: Receive_Screen6_Awaiting,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
  },
]

const sendScreenDefs = [
  {
    id: 'il-send',
    title: 'Send (Visual)',
    description: 'Light theme send form with amount, address, network.',
    componentsUsed: ['Custom'],
    component: Send_Screen1,
    interactiveElements: [
      { id: 'btn-enviar', component: 'Button', label: 'Enviar' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGES
// ═══════════════════════════════════════════════════════════════

const allScreenDefs = [
  ...exploreScreenDefs,
  ...buyScreenDefs,
  ...sellScreenDefs,
  ...receiveScreenDefs,
  ...sendScreenDefs,
]
const seen = new Set<string>()

for (const s of allScreenDefs) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
  const states = 'states' in s && Array.isArray(s.states) ? s.states : undefined
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...(states ? { states } : {}),
  })
}

// ═══════════════════════════════════════════════════════════════
// REGISTER FLOWS
// ═══════════════════════════════════════════════════════════════

registerFlow({
  id: 'trade-manage',
  name: 'Invest Light (Explore)',
  description: 'Light theme: dashboard, discover, asset page, orders, favorites, statement.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['trade-buy-order', 'trade-sell', 'trade-deposit-asset', 'invest-2-light-send'],
  screens: exploreScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'trade-buy-order',
  name: 'Invest Light (Buy)',
  description: 'Light theme: keypad amount, TP/SL config, slide-confirm, orbital processing, confetti success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['trade-manage'],
  entryPoints: ['asset-page'],
  screens: buyScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'trade-sell',
  name: 'Invest Light (Sell)',
  description: 'Light theme: sell keypad, slide-confirm, orbital processing, confetti success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['trade-manage'],
  entryPoints: ['asset-page'],
  screens: sellScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'trade-deposit-asset',
  name: 'Invest Light (Receive)',
  description: 'Light theme: QR code, wallet address, network.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['trade-manage'],
  screens: receiveScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-light-send',
  name: 'Invest Light (Send)',
  description: 'Light theme: address, amount, network, fee.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['trade-manage'],
  screens: sendScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════════════
// FLOW GRAPHS
// ═══════════════════════════════════════════════════════════════

const ROW = 120
const x = 300
const xL = 0
const xR = 600

// ── Explore Flow Graph ──
{
  const nodes = [
    { id: 'n-dash', type: 'screen', position: { x, y: 0 },
      data: { label: 'Dashboard', screenId: 'il-dashboard', nodeType: 'screen', pageId: 'il-dashboard', description: 'Portfolio overview' } as FlowNodeData },
    // Shortcut actions
    { id: 'n-tap-negociar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Negociar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Negociar' } as FlowNodeData },
    { id: 'n-tap-favoritos', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Favoritos', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Favoritos' } as FlowNodeData },
    { id: 'n-tap-ordens', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Ordens', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Ordens' } as FlowNodeData },
    // More modal actions
    { id: 'n-tap-depositar', type: 'action', position: { x: xL, y: ROW * 2 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Depositar criptomoedas' } as FlowNodeData },
    { id: 'n-tap-extrato', type: 'action', position: { x: xR, y: ROW * 2 },
      data: { label: 'Tap Extrato', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Extrato' } as FlowNodeData },
    { id: 'n-statement', type: 'screen', position: { x: xR, y: ROW * 2.5 },
      data: { label: 'Statement', screenId: 'il-statement', nodeType: 'screen', pageId: 'il-statement', description: 'Transaction history' } as FlowNodeData },
    // Explore actions
    { id: 'n-tap-explorar', type: 'action', position: { x, y: ROW * 2 },
      data: { label: 'Tap Explorar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Explorar mais ativos' } as FlowNodeData },
    { id: 'n-tap-explorar-btn', type: 'action', position: { x, y: ROW * 2.5 },
      data: { label: 'Tap Explorar (empty)', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Explorar ativos' } as FlowNodeData },

    // Screen destinations
    { id: 'n-favorites', type: 'screen', position: { x: xL, y: ROW * 3 },
      data: { label: 'Favorites', screenId: 'il-favorites', nodeType: 'screen', pageId: 'il-favorites', description: 'Favorite assets' } as FlowNodeData },
    { id: 'n-orders', type: 'screen', position: { x: xR, y: ROW * 3 },
      data: { label: 'Open Orders', screenId: 'il-open-orders', nodeType: 'screen', pageId: 'il-open-orders', description: 'Active TP/SL orders' } as FlowNodeData },
    { id: 'n-discover', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Discover', screenId: 'il-discover', nodeType: 'screen', pageId: 'il-discover', description: 'Asset browser' } as FlowNodeData },

    { id: 'n-tap-asset', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-asset', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Asset Page', screenId: 'il-asset-page', nodeType: 'screen', pageId: 'il-asset-page', description: 'Asset detail' } as FlowNodeData },

    { id: 'n-tap-buy', type: 'action', position: { x: xL, y: ROW * 6 },
      data: { label: 'Tap Comprar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell', type: 'action', position: { x: xR, y: ROW * 6 },
      data: { label: 'Tap Vender', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Vender' } as FlowNodeData },
    { id: 'n-tap-invest', type: 'action', position: { x, y: ROW * 6 },
      data: { label: 'Tap CTA', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },

    { id: 'n-ref-buy', type: 'flow-reference', position: { x: xL, y: ROW * 7 },
      data: { label: 'Buy Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-buy-order' } as FlowNodeData },
    { id: 'n-ref-sell', type: 'flow-reference', position: { x: xR, y: ROW * 7 },
      data: { label: 'Sell Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-sell' } as FlowNodeData },
    { id: 'n-ref-receive', type: 'flow-reference', position: { x: xL, y: ROW * 2.5 },
      data: { label: 'Receive Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-deposit-asset' } as FlowNodeData },
    { id: 'n-ref-send', type: 'flow-reference', position: { x: xR, y: ROW * 2.5 },
      data: { label: 'Send Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-light-send' } as FlowNodeData },
    // Statement → Export
    { id: 'n-tap-export', type: 'action', position: { x: xR, y: ROW * 3.5 },
      data: { label: 'Tap Export', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Exportar extrato' } as FlowNodeData },
    { id: 'n-export', type: 'screen', position: { x: xR, y: ROW * 4.5 },
      data: { label: 'Export Statement', screenId: 'il-export-statement', nodeType: 'screen', pageId: 'il-export-statement', description: 'PDF export config' } as FlowNodeData },
  ]

  const edges = [
    // Dashboard → shortcut actions
    { id: 'e-1', source: 'n-dash', target: 'n-tap-negociar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-dash', target: 'n-tap-favoritos', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-3', source: 'n-dash', target: 'n-tap-ordens', sourceHandle: 'right-source', targetHandle: 'top' },
    // Dashboard → more modal actions
    { id: 'e-4', source: 'n-dash', target: 'n-tap-depositar', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-5', source: 'n-dash', target: 'n-tap-extrato', sourceHandle: 'right-source', targetHandle: 'top' },
    // Dashboard → explore
    { id: 'e-6', source: 'n-dash', target: 'n-tap-explorar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6b', source: 'n-dash', target: 'n-tap-explorar-btn', sourceHandle: 'bottom', targetHandle: 'top' },
    // Shortcut → destinations
    { id: 'e-7', source: 'n-tap-negociar', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-favoritos', target: 'n-favorites', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-ordens', target: 'n-orders', sourceHandle: 'bottom', targetHandle: 'top' },
    // More modal → flow references
    { id: 'e-10', source: 'n-tap-depositar', target: 'n-ref-receive', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-tap-extrato', target: 'n-statement', sourceHandle: 'bottom', targetHandle: 'top' },
    // Explore → discover
    { id: 'e-12', source: 'n-tap-explorar', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12b', source: 'n-tap-explorar-btn', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    // Discover → asset
    { id: 'e-13', source: 'n-discover', target: 'n-tap-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-14', source: 'n-tap-asset', target: 'n-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    // Asset → buy/sell
    { id: 'e-15', source: 'n-asset', target: 'n-tap-buy', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-16', source: 'n-asset', target: 'n-tap-sell', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-17', source: 'n-asset', target: 'n-tap-invest', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-18', source: 'n-tap-buy', target: 'n-ref-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-19', source: 'n-tap-invest', target: 'n-ref-buy', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-20', source: 'n-tap-sell', target: 'n-ref-sell', sourceHandle: 'bottom', targetHandle: 'top' },
    // Statement → Export
    { id: 'e-21', source: 'n-statement', target: 'n-tap-export', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-22', source: 'n-tap-export', target: 'n-export', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('trade-manage', nodes, edges, 6)
}

// ── Buy Flow Graph ──
{
  const COL_L = x - 200
  const COL_R = x + 200
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Buy)', screenId: 'il-trade-buy', nodeType: 'screen', pageId: 'il-trade-buy', description: 'Amount entry + order type selector' } as FlowNodeData },
    // Market order path (left)
    { id: 'n-tap-market', type: 'action', position: { x: COL_L, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    // Programmed order path (right) — goes to order config first
    { id: 'n-tap-config', type: 'action', position: { x: COL_R, y: ROW },
      data: { label: 'Tap Configurar ordem', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Configurar ordem' } as FlowNodeData },
    { id: 'n-order-config', type: 'screen', position: { x: COL_R, y: ROW * 2 },
      data: { label: 'Order Config', screenId: 'il-order-config', nodeType: 'screen', pageId: 'il-order-config', description: 'Edge-to-edge chart, draggable TP/SL' } as FlowNodeData },
    { id: 'n-tap-confirm-order', type: 'action', position: { x: COL_R, y: ROW * 3 },
      data: { label: 'Tap Revisar ordem', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Revisar ordem' } as FlowNodeData },
    // Both paths converge at review
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Review', screenId: 'il-review-buy', nodeType: 'screen', pageId: 'il-review-buy', description: 'Slide-to-confirm' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Process Buy', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/buy', description: 'Execute buy' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Processing', screenId: 'il-processing-buy', nodeType: 'screen', pageId: 'il-processing-buy', description: 'Orbital animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Success', screenId: 'il-success-buy', nodeType: 'screen', pageId: 'il-success-buy', description: 'Confetti celebration' } as FlowNodeData },
    { id: 'n-tap4', type: 'action', position: { x, y: ROW * 9 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 10 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-manage' } as FlowNodeData },
  ]
  const edges = [
    // Market path (left): Trade → Review directly
    { id: 'e-b1', source: 'n-trade', target: 'n-tap-market', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-b2', source: 'n-tap-market', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'left-target' },
    // Programmed path (right): Trade → Order Config → Review
    { id: 'e-b3', source: 'n-trade', target: 'n-tap-config', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-b4', source: 'n-tap-config', target: 'n-order-config', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b5', source: 'n-order-config', target: 'n-tap-confirm-order', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b6', source: 'n-tap-confirm-order', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'right-target' },
    // Shared path from review onward
    { id: 'e-b7', source: 'n-review', target: 'n-tap3', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b8', source: 'n-tap3', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b9', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b10', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b11', source: 'n-success', target: 'n-tap4', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b12', source: 'n-tap4', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ]
  bootstrapFlowGraph('trade-buy-order', nodes, edges, 5)
}

// ── Sell Flow Graph ──
{
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Sell)', screenId: 'il-trade-sell', nodeType: 'screen', pageId: 'il-trade-sell', description: 'Keypad sell amount' } as FlowNodeData },
    { id: 'n-tap1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'il-review-sell', nodeType: 'screen', pageId: 'il-review-sell', description: 'Slide-to-confirm sell' } as FlowNodeData },
    { id: 'n-tap2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Process Sell', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/sell', description: 'Execute sell' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'il-processing-sell', nodeType: 'screen', pageId: 'il-processing-sell', description: 'Orbital animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'il-success-sell', nodeType: 'screen', pageId: 'il-success-sell', description: 'Confetti' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 8 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-manage' } as FlowNodeData },
  ]
  const edges = [
    { id: 'e-s1', source: 'n-trade', target: 'n-tap1', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s2', source: 'n-tap1', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s3', source: 'n-review', target: 'n-tap2', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s4', source: 'n-tap2', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s5', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s6', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s7', source: 'n-success', target: 'n-tap3', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s8', source: 'n-tap3', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ]
  bootstrapFlowGraph('trade-sell', nodes, edges, 3)
}

// ── Receive Flow Graph (6 screens, 5 actions) ──
{
  const C1 = 0, C2 = 300, C3 = 600
  const receiveNodes = [
    // Screens
    { id: 'n-warning', type: 'screen', position: { x: C1, y: 0 },
      data: { label: 'Risk Warning', screenId: 'il-receive-warning', nodeType: 'screen', pageId: 'il-receive-warning', description: 'Caution checkbox + dual buttons' } as FlowNodeData },
    { id: 'n-select-asset', type: 'screen', position: { x: C3, y: 0 },
      data: { label: 'Select Asset', screenId: 'il-receive-select-asset', nodeType: 'screen', pageId: 'il-receive-select-asset', description: 'Searchable asset list' } as FlowNodeData },
    { id: 'n-select-chain', type: 'screen', position: { x: C1, y: ROW * 3 },
      data: { label: 'Select Chain', screenId: 'il-receive-select-chain', nodeType: 'screen', pageId: 'il-receive-select-chain', description: 'Network selection' } as FlowNodeData },
    { id: 'n-amount', type: 'screen', position: { x: C3, y: ROW * 3 },
      data: { label: 'Amount', screenId: 'il-receive-amount', nodeType: 'screen', pageId: 'il-receive-amount', description: 'Crypto amount + USD equivalent' } as FlowNodeData },
    { id: 'n-address', type: 'screen', position: { x: C1, y: ROW * 6 },
      data: { label: 'Deposit Address', screenId: 'il-receive-address', nodeType: 'screen', pageId: 'il-receive-address', description: 'QR code + copy address' } as FlowNodeData },
    { id: 'n-awaiting', type: 'screen', position: { x: C3, y: ROW * 6 },
      data: { label: 'Awaiting', screenId: 'il-receive-awaiting', nodeType: 'screen', pageId: 'il-receive-awaiting', description: 'Confirmation + toast after 30s' } as FlowNodeData },
    // Actions
    { id: 'n-accept', type: 'action', position: { x: C2, y: 0 },
      data: { label: 'Accept Risk', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tap-asset', type: 'action', position: { x: C2, y: ROW * 1.5 },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-tap-chain', type: 'action', position: { x: C2, y: ROW * 3 },
      data: { label: 'Tap Chain', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Gnosis Chain' } as FlowNodeData },
    { id: 'n-continue', type: 'action', position: { x: C2, y: ROW * 4.5 },
      data: { label: 'Continue', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-sent', type: 'action', position: { x: C2, y: ROW * 6 },
      data: { label: 'Confirm Sent', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Já enviei' } as FlowNodeData },
  ]
  const receiveEdges = [
    { id: 'e-r1', source: 'n-warning', target: 'n-accept', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r2', source: 'n-accept', target: 'n-select-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r3', source: 'n-select-asset', target: 'n-tap-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r4', source: 'n-tap-asset', target: 'n-select-chain', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r5', source: 'n-select-chain', target: 'n-tap-chain', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r6', source: 'n-tap-chain', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r7', source: 'n-amount', target: 'n-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r8', source: 'n-continue', target: 'n-address', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r9', source: 'n-address', target: 'n-sent', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-r10', source: 'n-sent', target: 'n-awaiting', sourceHandle: 'bottom', targetHandle: 'top' },
  ]
  bootstrapFlowGraph('trade-deposit-asset', receiveNodes, receiveEdges, 3)
}

// ── Send Flow Graph ──
{
  const nodes = [
    { id: 'n-send', type: 'screen', position: { x, y: 0 },
      data: { label: 'Send', screenId: 'il-send', nodeType: 'screen', pageId: 'il-send', description: 'Send form' } as FlowNodeData },
    { id: 'n-tap', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Enviar' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 2 },
      data: { label: 'Back', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-manage' } as FlowNodeData },
  ]
  bootstrapFlowGraph('invest-2-light-send', nodes, [
    { id: 'e-1', source: 'n-send', target: 'n-tap', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ], 1)
}

// ═══════════════════════════════════════════════════════════════
// GROUP IN SIDEBAR
// ═══════════════════════════════════════════════════════════════

{
  const GROUP_NAME = 'Trading'
  const DOMAIN = 'earn'
  const FLOW_IDS = [
    'trade-manage',
    'trade-buy-order',
    'trade-sell',
    'trade-deposit-asset',
    'invest-2-light-send',
  ]

  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)

  for (const flowId of FLOW_IDS) {
    assignFlowToGroup(flowId, group.id)
  }
}
