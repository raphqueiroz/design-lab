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
import Screen3b_TpSlConfig from './Screen3b_TpSlConfig'
import Screen4_Review from './Screen4_Review'
import Screen5_Processing from './Screen5_Processing'
import Screen6_Success from './Screen6_Success'
import Screen7_OpenOrders from './Screen7_OpenOrders'
import Screen8_Favorites from './Screen8_Favorites'
import Screen9_Statement from './Screen9_Statement'
import Receive_Screen1 from './receive/Screen1_Receive'
import Send_Screen1 from './send/Screen1_Send'

// ═══════════════════════════════════════════════════════════════
// 1. EXPLORE FLOW — Dashboard → Discover → AssetPage + supporting
// ═══════════════════════════════════════════════════════════════

const exploreScreenDefs = [
  {
    id: 'iv-dashboard',
    title: 'Dashboard (Visual)',
    description: 'Dark theme portfolio: glassmorphism cards, area chart, shortcuts, favorites chips, holdings with sparklines.',
    componentsUsed: ['Custom'],
    component: Screen0_Dashboard,
    interactiveElements: [
      { id: 'sc-negociar', component: 'ShortcutButton', label: 'Negociar' },
      { id: 'sc-receber', component: 'ShortcutButton', label: 'Receber' },
      { id: 'sc-enviar', component: 'ShortcutButton', label: 'Enviar' },
      { id: 'li-ordens', component: 'ListItem', label: 'Ordens abertas' },
      { id: 'li-extrato', component: 'ListItem', label: 'Extrato' },
      { id: 'li-explorar', component: 'ListItem', label: 'Explorar mais ativos' },
      { id: 'li-btc', component: 'ListItem', label: 'Bitcoin' },
      { id: 'btn-explorar', component: 'Button', label: 'Explorar ativos' },
      { id: 'btn-comecar', component: 'Button', label: 'Começar a investir' },
      { id: 'btn-simular', component: 'Button', label: 'Simular investimento' },
    ],
    states: [
      { id: 'portfolio', name: 'Portfolio', description: 'User has positions', isDefault: true, data: { dashboard: 'portfolio' } },
      { id: 'first-access', name: 'First Access', description: 'Hero onboarding with benefits', data: { dashboard: 'first-access' } },
      { id: 'empty', name: 'Empty', description: 'No investments — nudge to explore', data: { dashboard: 'empty' } },
    ],
  },
  {
    id: 'iv-discover',
    title: 'Discover (Visual)',
    description: 'Dark theme asset browser: search, categories, sparkline rows, featured cards, favorites.',
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
    id: 'iv-asset-page',
    title: 'Asset Page (Visual)',
    description: 'Dark theme asset detail: glow header, chart, glass stat cards, shortcuts, slide-to-buy CTA.',
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
      { id: 'renda-usd-invested', name: 'Renda USD (investido)', data: { assetTicker: 'RENDA-USD', invested: true } },
      { id: 'renda-brl-new', name: 'Renda BRL (novo)', data: { assetTicker: 'RENDA-BRL', invested: false } },
    ],
  },
  {
    id: 'iv-open-orders',
    title: 'Open Orders (Visual)',
    description: 'Dark theme TP/SL orders list with glass cards.',
    componentsUsed: ['Custom'],
    component: Screen7_OpenOrders,
    interactiveElements: [
      { id: 'li-cancel', component: 'ListItem', label: 'Cancelar ordem' },
    ],
  },
  {
    id: 'iv-favorites',
    title: 'Favorites (Visual)',
    description: 'Dark theme favorites list with sparklines.',
    componentsUsed: ['Custom'],
    component: Screen8_Favorites,
    interactiveElements: [
      { id: 'li-fav', component: 'ListItem', label: 'Bitcoin' },
    ],
  },
  {
    id: 'iv-statement',
    title: 'Statement (Visual)',
    description: 'Dark theme filterable transaction history.',
    componentsUsed: ['Custom'],
    component: Screen9_Statement,
    interactiveElements: [
      { id: 'btn-pdf', component: 'Button', label: 'Gerar PDF' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. TRADE FLOW — Buy (Amount → TP/SL → Review → Processing → Success)
// ═══════════════════════════════════════════════════════════════

const buyScreenDefs = [
  {
    id: 'iv-trade-buy',
    title: 'Trade – Buy (Visual)',
    description: 'Dark theme custom keypad amount entry with % quick-fill.',
    componentsUsed: ['Custom'],
    component: Screen3_Trade,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc-buy', name: 'BTC Buy', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
      { id: 'eth-buy', name: 'ETH Buy', data: { assetTicker: 'ETH', mode: 'buy' } },
    ],
  },
  {
    id: 'iv-tpsl-buy',
    title: 'TP/SL Config – Buy (Visual)',
    description: 'Dark theme chart overlay with TP/SL toggles and custom price sheets.',
    componentsUsed: ['Custom', 'LineChart'],
    component: Screen3b_TpSlConfig,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'iv-review-buy',
    title: 'Review – Buy (Visual)',
    description: 'Dark theme slide-to-confirm with glass summary card.',
    componentsUsed: ['Custom'],
    component: Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar compra' },
    ],
    states: [
      { id: 'btc-buy', name: 'BTC Buy', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
    ],
  },
  {
    id: 'iv-processing-buy',
    title: 'Processing – Buy (Visual)',
    description: 'Dark theme orbital animation with step messages.',
    componentsUsed: ['Custom'],
    component: Screen5_Processing,
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'iv-success-buy',
    title: 'Success – Buy (Visual)',
    description: 'Dark theme confetti celebration with glass summary.',
    componentsUsed: ['Custom'],
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
    id: 'iv-trade-sell',
    title: 'Trade – Sell (Visual)',
    description: 'Dark theme keypad for sell amount.',
    componentsUsed: ['Custom'],
    component: Screen3_Trade,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
    ],
  },
  {
    id: 'iv-review-sell',
    title: 'Review – Sell (Visual)',
    description: 'Dark theme slide-to-confirm for sell.',
    componentsUsed: ['Custom'],
    component: Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar venda' },
    ],
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
    ],
  },
  {
    id: 'iv-processing-sell',
    title: 'Processing – Sell (Visual)',
    description: 'Dark theme orbital for sell.',
    componentsUsed: ['Custom'],
    component: Screen5_Processing,
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'iv-success-sell',
    title: 'Success – Sell (Visual)',
    description: 'Dark theme confetti for sell.',
    componentsUsed: ['Custom'],
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
    id: 'iv-receive',
    title: 'Receive (Visual)',
    description: 'Dark theme QR code + address + network selector.',
    componentsUsed: ['Custom'],
    component: Receive_Screen1,
  },
]

const sendScreenDefs = [
  {
    id: 'iv-send',
    title: 'Send (Visual)',
    description: 'Dark theme send form with amount, address, network.',
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
    area: 'Investments',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...(states ? { states } : {}),
  })
}

// ═══════════════════════════════════════════════════════════════
// REGISTER FLOWS
// ═══════════════════════════════════════════════════════════════

registerFlow({
  id: 'invest-2-visual-explore',
  name: 'Invest Visual (Explore)',
  description: 'Dark theme: dashboard, discover, asset page, orders, favorites, statement.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['invest-2-visual-buy', 'invest-2-visual-sell', 'invest-2-visual-receive', 'invest-2-visual-send'],
  screens: exploreScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-visual-buy',
  name: 'Invest Visual (Buy)',
  description: 'Dark theme: keypad amount, TP/SL config, slide-confirm, orbital processing, confetti success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-visual-explore'],
  entryPoints: ['asset-page'],
  screens: buyScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-visual-sell',
  name: 'Invest Visual (Sell)',
  description: 'Dark theme: sell keypad, slide-confirm, orbital processing, confetti success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-visual-explore'],
  entryPoints: ['asset-page'],
  screens: sellScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-visual-receive',
  name: 'Invest Visual (Receive)',
  description: 'Dark theme: QR code, wallet address, network.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-visual-explore'],
  screens: receiveScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-visual-send',
  name: 'Invest Visual (Send)',
  description: 'Dark theme: address, amount, network, fee.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-visual-explore'],
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
      data: { label: 'Dashboard', screenId: 'iv-dashboard', nodeType: 'screen', pageId: 'iv-dashboard', description: 'Portfolio overview' } as FlowNodeData },
    { id: 'n-tap-negociar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Negociar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Negociar' } as FlowNodeData },
    { id: 'n-tap-receber', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Receber', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Receber' } as FlowNodeData },
    { id: 'n-tap-enviar', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Enviar' } as FlowNodeData },
    { id: 'n-tap-ordens', type: 'action', position: { x: xL, y: ROW * 2 },
      data: { label: 'Tap Ordens', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Ordens abertas' } as FlowNodeData },
    { id: 'n-tap-extrato', type: 'action', position: { x: xR, y: ROW * 2 },
      data: { label: 'Tap Extrato', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Extrato' } as FlowNodeData },
    { id: 'n-tap-explorar', type: 'action', position: { x, y: ROW * 2 },
      data: { label: 'Tap Explorar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Explorar mais ativos' } as FlowNodeData },
    { id: 'n-tap-explorar-btn', type: 'action', position: { x, y: ROW * 2.5 },
      data: { label: 'Tap Explorar (empty)', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Explorar ativos' } as FlowNodeData },

    { id: 'n-orders', type: 'screen', position: { x: xL, y: ROW * 3 },
      data: { label: 'Open Orders', screenId: 'iv-open-orders', nodeType: 'screen', pageId: 'iv-open-orders', description: 'Active TP/SL orders' } as FlowNodeData },
    { id: 'n-statement', type: 'screen', position: { x: xR, y: ROW * 3 },
      data: { label: 'Statement', screenId: 'iv-statement', nodeType: 'screen', pageId: 'iv-statement', description: 'Transaction history' } as FlowNodeData },
    { id: 'n-discover', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Discover', screenId: 'iv-discover', nodeType: 'screen', pageId: 'iv-discover', description: 'Asset browser' } as FlowNodeData },

    { id: 'n-tap-asset', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-asset', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Asset Page', screenId: 'iv-asset-page', nodeType: 'screen', pageId: 'iv-asset-page', description: 'Asset detail' } as FlowNodeData },

    { id: 'n-tap-buy', type: 'action', position: { x: xL, y: ROW * 6 },
      data: { label: 'Tap Comprar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell', type: 'action', position: { x: xR, y: ROW * 6 },
      data: { label: 'Tap Vender', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Vender' } as FlowNodeData },
    { id: 'n-tap-invest', type: 'action', position: { x, y: ROW * 6 },
      data: { label: 'Tap CTA', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },

    { id: 'n-ref-buy', type: 'flow-reference', position: { x: xL, y: ROW * 7 },
      data: { label: 'Buy Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-buy' } as FlowNodeData },
    { id: 'n-ref-sell', type: 'flow-reference', position: { x: xR, y: ROW * 7 },
      data: { label: 'Sell Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-sell' } as FlowNodeData },
    { id: 'n-ref-receive', type: 'flow-reference', position: { x: xL, y: ROW * 1.5 },
      data: { label: 'Receive Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-receive' } as FlowNodeData },
    { id: 'n-ref-send', type: 'flow-reference', position: { x: xR, y: ROW * 1.5 },
      data: { label: 'Send Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-send' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-dash', target: 'n-tap-negociar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-dash', target: 'n-tap-receber', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-3', source: 'n-dash', target: 'n-tap-enviar', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-4', source: 'n-dash', target: 'n-tap-ordens', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-5', source: 'n-dash', target: 'n-tap-extrato', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-6', source: 'n-dash', target: 'n-tap-explorar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6b', source: 'n-dash', target: 'n-tap-explorar-btn', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-tap-negociar', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-receber', target: 'n-ref-receive', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-enviar', target: 'n-ref-send', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-ordens', target: 'n-orders', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-tap-extrato', target: 'n-statement', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-tap-explorar', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12b', source: 'n-tap-explorar-btn', target: 'n-discover', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-13', source: 'n-discover', target: 'n-tap-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-14', source: 'n-tap-asset', target: 'n-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-15', source: 'n-asset', target: 'n-tap-buy', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-16', source: 'n-asset', target: 'n-tap-sell', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-17', source: 'n-asset', target: 'n-tap-invest', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-18', source: 'n-tap-buy', target: 'n-ref-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-19', source: 'n-tap-invest', target: 'n-ref-buy', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-20', source: 'n-tap-sell', target: 'n-ref-sell', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('invest-2-visual-explore', nodes, edges, 1)
}

// ── Buy Flow Graph ──
{
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Buy)', screenId: 'iv-trade-buy', nodeType: 'screen', pageId: 'iv-trade-buy', description: 'Custom keypad amount' } as FlowNodeData },
    { id: 'n-tap1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tpsl', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'TP/SL Config', screenId: 'iv-tpsl-buy', nodeType: 'screen', pageId: 'iv-tpsl-buy', description: 'Chart overlay with TP/SL' } as FlowNodeData },
    { id: 'n-tap2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Review', screenId: 'iv-review-buy', nodeType: 'screen', pageId: 'iv-review-buy', description: 'Slide-to-confirm' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Process Buy', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/buy', description: 'Execute buy' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Processing', screenId: 'iv-processing-buy', nodeType: 'screen', pageId: 'iv-processing-buy', description: 'Orbital animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Success', screenId: 'iv-success-buy', nodeType: 'screen', pageId: 'iv-success-buy', description: 'Confetti celebration' } as FlowNodeData },
    { id: 'n-tap4', type: 'action', position: { x, y: ROW * 9 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 10 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-explore' } as FlowNodeData },
  ]
  const edges = [
    { id: 'e-b1', source: 'n-trade', target: 'n-tap1', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b2', source: 'n-tap1', target: 'n-tpsl', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b3', source: 'n-tpsl', target: 'n-tap2', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b4', source: 'n-tap2', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b5', source: 'n-review', target: 'n-tap3', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b6', source: 'n-tap3', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b7', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b8', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b9', source: 'n-success', target: 'n-tap4', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b10', source: 'n-tap4', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ]
  bootstrapFlowGraph('invest-2-visual-buy', nodes, edges, 1)
}

// ── Sell Flow Graph ──
{
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Sell)', screenId: 'iv-trade-sell', nodeType: 'screen', pageId: 'iv-trade-sell', description: 'Keypad sell amount' } as FlowNodeData },
    { id: 'n-tap1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'iv-review-sell', nodeType: 'screen', pageId: 'iv-review-sell', description: 'Slide-to-confirm sell' } as FlowNodeData },
    { id: 'n-tap2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Process Sell', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/sell', description: 'Execute sell' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'iv-processing-sell', nodeType: 'screen', pageId: 'iv-processing-sell', description: 'Orbital animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'iv-success-sell', nodeType: 'screen', pageId: 'iv-success-sell', description: 'Confetti' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 8 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-explore' } as FlowNodeData },
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
  bootstrapFlowGraph('invest-2-visual-sell', nodes, edges, 1)
}

// ── Receive Flow Graph ──
{
  bootstrapFlowGraph('invest-2-visual-receive', [
    { id: 'n-receive', type: 'screen', position: { x, y: 0 },
      data: { label: 'Receive', screenId: 'iv-receive', nodeType: 'screen', pageId: 'iv-receive', description: 'QR + address' } as FlowNodeData },
  ], [], 1)
}

// ── Send Flow Graph ──
{
  const nodes = [
    { id: 'n-send', type: 'screen', position: { x, y: 0 },
      data: { label: 'Send', screenId: 'iv-send', nodeType: 'screen', pageId: 'iv-send', description: 'Send form' } as FlowNodeData },
    { id: 'n-tap', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Enviar' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 2 },
      data: { label: 'Back', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-2-visual-explore' } as FlowNodeData },
  ]
  bootstrapFlowGraph('invest-2-visual-send', nodes, [
    { id: 'e-1', source: 'n-send', target: 'n-tap', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ], 1)
}

// ═══════════════════════════════════════════════════════════════
// GROUP IN SIDEBAR
// ═══════════════════════════════════════════════════════════════

{
  const GROUP_NAME = 'Invest 2 Visual'
  const DOMAIN = 'investments'
  const FLOW_IDS = [
    'invest-2-visual-explore',
    'invest-2-visual-buy',
    'invest-2-visual-sell',
    'invest-2-visual-receive',
    'invest-2-visual-send',
  ]

  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)

  for (const flowId of FLOW_IDS) {
    assignFlowToGroup(flowId, group.id)
  }
}
