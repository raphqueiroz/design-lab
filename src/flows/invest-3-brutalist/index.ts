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
    id: 'ib-dashboard',
    title: 'Dashboard (Brutalist)',
    description: 'Neo-brutalist portfolio: oversized typography, B&W, hard edges, pill shortcuts, clean holdings list.',
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
      { id: 'first-access', name: 'First Access', description: 'B&W split hero with numbered benefits', data: { dashboard: 'first-access' } },
      { id: 'empty', name: 'Empty', description: 'Giant INVISTA headline, geometric illustration, grid cards', data: { dashboard: 'empty' } },
    ],
  },
  {
    id: 'ib-discover',
    title: 'Discover (Brutalist)',
    description: 'Neo-brutalist asset browser: grid layout, uppercase headers, hard-edge cards.',
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
    id: 'ib-asset-page',
    title: 'Asset Page (Brutalist)',
    description: 'Neo-brutalist asset detail: no glow, hard-bordered stat cards, black CTA pill.',
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
    id: 'ib-open-orders',
    title: 'Open Orders (Brutalist)',
    description: 'Neo-brutalist orders list with hard-bordered cards.',
    componentsUsed: ['Custom'],
    component: Screen7_OpenOrders,
    interactiveElements: [
      { id: 'li-cancel', component: 'ListItem', label: 'Cancelar ordem' },
    ],
  },
  {
    id: 'ib-favorites',
    title: 'Favorites (Brutalist)',
    description: 'Neo-brutalist favorites list with 1px dividers.',
    componentsUsed: ['Custom'],
    component: Screen8_Favorites,
    interactiveElements: [
      { id: 'li-fav', component: 'ListItem', label: 'Bitcoin' },
    ],
  },
  {
    id: 'ib-statement',
    title: 'Statement (Brutalist)',
    description: 'Neo-brutalist filterable transaction history.',
    componentsUsed: ['Custom'],
    component: Screen9_Statement,
    interactiveElements: [
      { id: 'btn-pdf', component: 'Button', label: 'Gerar PDF' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. BUY FLOW — Amount → TP/SL → Review → Processing → Success
// ═══════════════════════════════════════════════════════════════

const buyScreenDefs = [
  {
    id: 'ib-trade-buy',
    title: 'Trade – Buy (Brutalist)',
    description: 'Neo-brutalist keypad amount entry with hard-edged keys.',
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
    id: 'ib-tpsl-buy',
    title: 'TP/SL Config – Buy (Brutalist)',
    description: 'Neo-brutalist TP/SL config with flat chart and hard borders.',
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
    id: 'ib-review-buy',
    title: 'Review – Buy (Brutalist)',
    description: 'Neo-brutalist slide-to-confirm with hard-bordered summary.',
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
    id: 'ib-processing-buy',
    title: 'Processing – Buy (Brutalist)',
    description: 'Neo-brutalist geometric spinner processing.',
    componentsUsed: ['Custom'],
    component: Screen5_Processing,
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'ib-success-buy',
    title: 'Success – Buy (Brutalist)',
    description: 'Neo-brutalist clean success with large checkmark.',
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
// 3. SELL FLOW — Trade → Review → Processing → Success
// ═══════════════════════════════════════════════════════════════

const sellScreenDefs = [
  {
    id: 'ib-trade-sell',
    title: 'Trade – Sell (Brutalist)',
    description: 'Neo-brutalist keypad for sell amount.',
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
    id: 'ib-review-sell',
    title: 'Review – Sell (Brutalist)',
    description: 'Neo-brutalist slide-to-confirm for sell.',
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
    id: 'ib-processing-sell',
    title: 'Processing – Sell (Brutalist)',
    description: 'Neo-brutalist geometric spinner for sell.',
    componentsUsed: ['Custom'],
    component: Screen5_Processing,
    states: [
      { id: 'btc-sell', name: 'BTC Sell', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'ib-success-sell',
    title: 'Success – Sell (Brutalist)',
    description: 'Neo-brutalist success for sell.',
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
    id: 'ib-receive',
    title: 'Receive (Brutalist)',
    description: 'Neo-brutalist QR code with hard-bordered container.',
    componentsUsed: ['Custom'],
    component: Receive_Screen1,
  },
]

const sendScreenDefs = [
  {
    id: 'ib-send',
    title: 'Send (Brutalist)',
    description: 'Neo-brutalist send form with hard borders, black CTA pill.',
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
  id: 'invest-3-brutalist-explore',
  name: 'Invest Brutalist (Explore)',
  description: 'Neo-brutalist: oversized typography, B&W, hard edges, dashboard → discover → asset page.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['invest-3-brutalist-buy', 'invest-3-brutalist-sell', 'invest-3-brutalist-receive', 'invest-3-brutalist-send'],
  screens: exploreScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-3-brutalist-buy',
  name: 'Invest Brutalist (Buy)',
  description: 'Neo-brutalist: keypad, TP/SL, slide-confirm, geometric processing, clean success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-3-brutalist-explore'],
  entryPoints: ['asset-page'],
  screens: buyScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-3-brutalist-sell',
  name: 'Invest Brutalist (Sell)',
  description: 'Neo-brutalist: sell keypad, slide-confirm, geometric processing, clean success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-3-brutalist-explore'],
  entryPoints: ['asset-page'],
  screens: sellScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-3-brutalist-receive',
  name: 'Invest Brutalist (Receive)',
  description: 'Neo-brutalist: QR code, wallet address, hard-bordered.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-3-brutalist-explore'],
  screens: receiveScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-3-brutalist-send',
  name: 'Invest Brutalist (Send)',
  description: 'Neo-brutalist: address, amount, network, black CTA pill.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-3-brutalist-explore'],
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
      data: { label: 'Dashboard', screenId: 'ib-dashboard', nodeType: 'screen', pageId: 'ib-dashboard', description: 'Portfolio overview' } as FlowNodeData },
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
      data: { label: 'Open Orders', screenId: 'ib-open-orders', nodeType: 'screen', pageId: 'ib-open-orders', description: 'Active TP/SL orders' } as FlowNodeData },
    { id: 'n-statement', type: 'screen', position: { x: xR, y: ROW * 3 },
      data: { label: 'Statement', screenId: 'ib-statement', nodeType: 'screen', pageId: 'ib-statement', description: 'Transaction history' } as FlowNodeData },
    { id: 'n-discover', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Discover', screenId: 'ib-discover', nodeType: 'screen', pageId: 'ib-discover', description: 'Asset browser' } as FlowNodeData },

    { id: 'n-tap-asset', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-asset', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Asset Page', screenId: 'ib-asset-page', nodeType: 'screen', pageId: 'ib-asset-page', description: 'Asset detail' } as FlowNodeData },

    { id: 'n-tap-buy', type: 'action', position: { x: xL, y: ROW * 6 },
      data: { label: 'Tap Comprar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell', type: 'action', position: { x: xR, y: ROW * 6 },
      data: { label: 'Tap Vender', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Vender' } as FlowNodeData },
    { id: 'n-tap-invest', type: 'action', position: { x, y: ROW * 6 },
      data: { label: 'Tap CTA', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },

    { id: 'n-ref-buy', type: 'flow-reference', position: { x: xL, y: ROW * 7 },
      data: { label: 'Buy Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-buy' } as FlowNodeData },
    { id: 'n-ref-sell', type: 'flow-reference', position: { x: xR, y: ROW * 7 },
      data: { label: 'Sell Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-sell' } as FlowNodeData },
    { id: 'n-ref-receive', type: 'flow-reference', position: { x: xL, y: ROW * 1.5 },
      data: { label: 'Receive Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-receive' } as FlowNodeData },
    { id: 'n-ref-send', type: 'flow-reference', position: { x: xR, y: ROW * 1.5 },
      data: { label: 'Send Flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-send' } as FlowNodeData },
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

  bootstrapFlowGraph('invest-3-brutalist-explore', nodes, edges, 1)
}

// ── Buy Flow Graph ──
{
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Buy)', screenId: 'ib-trade-buy', nodeType: 'screen', pageId: 'ib-trade-buy', description: 'Keypad amount' } as FlowNodeData },
    { id: 'n-tap1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tpsl', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'TP/SL Config', screenId: 'ib-tpsl-buy', nodeType: 'screen', pageId: 'ib-tpsl-buy', description: 'TP/SL config' } as FlowNodeData },
    { id: 'n-tap2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Review', screenId: 'ib-review-buy', nodeType: 'screen', pageId: 'ib-review-buy', description: 'Slide-to-confirm' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Process Buy', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/buy', description: 'Execute buy' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Processing', screenId: 'ib-processing-buy', nodeType: 'screen', pageId: 'ib-processing-buy', description: 'Geometric spinner' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Success', screenId: 'ib-success-buy', nodeType: 'screen', pageId: 'ib-success-buy', description: 'Clean success' } as FlowNodeData },
    { id: 'n-tap4', type: 'action', position: { x, y: ROW * 9 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 10 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-explore' } as FlowNodeData },
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
  bootstrapFlowGraph('invest-3-brutalist-buy', nodes, edges, 1)
}

// ── Sell Flow Graph ──
{
  const nodes = [
    { id: 'n-trade', type: 'screen', position: { x, y: 0 },
      data: { label: 'Trade (Sell)', screenId: 'ib-trade-sell', nodeType: 'screen', pageId: 'ib-trade-sell', description: 'Keypad sell amount' } as FlowNodeData },
    { id: 'n-tap1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'ib-review-sell', nodeType: 'screen', pageId: 'ib-review-sell', description: 'Slide-to-confirm sell' } as FlowNodeData },
    { id: 'n-tap2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Confirm', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Process Sell', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/sell', description: 'Execute sell' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'ib-processing-sell', nodeType: 'screen', pageId: 'ib-processing-sell', description: 'Geometric spinner' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'ib-success-sell', nodeType: 'screen', pageId: 'ib-success-sell', description: 'Clean success' } as FlowNodeData },
    { id: 'n-tap3', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 8 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-explore' } as FlowNodeData },
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
  bootstrapFlowGraph('invest-3-brutalist-sell', nodes, edges, 1)
}

// ── Receive Flow Graph ──
{
  bootstrapFlowGraph('invest-3-brutalist-receive', [
    { id: 'n-receive', type: 'screen', position: { x, y: 0 },
      data: { label: 'Receive', screenId: 'ib-receive', nodeType: 'screen', pageId: 'ib-receive', description: 'QR + address' } as FlowNodeData },
  ], [], 1)
}

// ── Send Flow Graph ──
{
  const nodes = [
    { id: 'n-send', type: 'screen', position: { x, y: 0 },
      data: { label: 'Send', screenId: 'ib-send', nodeType: 'screen', pageId: 'ib-send', description: 'Send form' } as FlowNodeData },
    { id: 'n-tap', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Enviar' } as FlowNodeData },
    { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 2 },
      data: { label: 'Back', screenId: null, nodeType: 'flow-reference', targetFlowId: 'invest-3-brutalist-explore' } as FlowNodeData },
  ]
  bootstrapFlowGraph('invest-3-brutalist-send', nodes, [
    { id: 'e-1', source: 'n-send', target: 'n-tap', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
  ], 1)
}

// ═══════════════════════════════════════════════════════════════
// GROUP IN SIDEBAR
// ═══════════════════════════════════════════════════════════════

{
  const GROUP_NAME = 'Invest 3 Brutalist'
  const DOMAIN = 'investments'
  const FLOW_IDS = [
    'invest-3-brutalist-explore',
    'invest-3-brutalist-buy',
    'invest-3-brutalist-sell',
    'invest-3-brutalist-receive',
    'invest-3-brutalist-send',
  ]

  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)

  for (const flowId of FLOW_IDS) {
    assignFlowToGroup(flowId, group.id)
  }
}
