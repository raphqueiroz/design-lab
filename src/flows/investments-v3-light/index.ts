import { registerFlow } from '@/pages/simulator/flowRegistry'
import { registerPage } from '@/pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '@/pages/simulator/flowGraphStore'
import { assignFlowToGroup, getGroupsForDomain } from '@/pages/simulator/flowGroupStore'
import type { FlowNodeData } from '@/pages/simulator/flowGraph.types'

import Screen1_Discover from './Screen1_Discover'
import Screen2_AssetPage from './Screen2_AssetPage'
import Screen3_Trade from './Screen3_Trade'
import Screen4_Review from './Screen4_Review'
import Screen5_Processing from './Screen5_Processing'
import Screen6_Success from './Screen6_Success'

// ── Screen Definitions ──

const screenDefs = [
  {
    id: 'inv3l-discover',
    title: 'Discover (Light)',
    description: 'Light-themed asset discovery: trending carousel, top movers grid, category pills, sparkline rows.',
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
    ],
  },
  {
    id: 'inv3l-asset-page',
    title: 'Asset Page (Light)',
    description: 'Light asset detail: clean chart, stat cards, floating action buttons.',
    componentsUsed: ['Custom'],
    component: Screen2_AssetPage,
    interactiveElements: [
      { id: 'btn-buy', component: 'Button', label: 'Comprar' },
      { id: 'btn-sell', component: 'Button', label: 'Vender' },
    ],
    states: [
      { id: 'btc', name: 'Bitcoin', description: 'BTC detail', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'eth', name: 'Ethereum', description: 'ETH detail', data: { assetTicker: 'ETH' } },
      { id: 'sol', name: 'Solana', description: 'SOL detail', data: { assetTicker: 'SOL' } },
      { id: 'paxg', name: 'Ouro (PAXG)', description: 'Gold detail', data: { assetTicker: 'PAXG' } },
      { id: 'renda-usd', name: 'Renda em Dólar', description: 'USD yield', data: { assetTicker: 'RENDA-USD' } },
      { id: 'renda-brl', name: 'Renda em Real', description: 'BRL yield', data: { assetTicker: 'RENDA-BRL' } },
    ],
  },
  {
    id: 'inv3l-trade',
    title: 'Trade Amount (Light)',
    description: 'Light keypad amount entry: big display, asset pill, estimated quantity.',
    componentsUsed: ['Custom'],
    component: Screen3_Trade,
    interactiveElements: [
      { id: 'btn-cont', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'buy-btc', name: 'Comprar BTC', description: 'Buy Bitcoin', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
      { id: 'sell-btc', name: 'Vender BTC', description: 'Sell Bitcoin', data: { assetTicker: 'BTC', mode: 'sell' } },
      { id: 'buy-renda', name: 'Investir Renda USD', description: 'Buy USD yield', data: { assetTicker: 'RENDA-USD', mode: 'buy' } },
    ],
  },
  {
    id: 'inv3l-review',
    title: 'Review (Light)',
    description: 'Light summary card with slide-to-confirm gesture.',
    componentsUsed: ['Custom'],
    component: Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirm-buy', component: 'Button', label: 'Confirmar compra' },
      { id: 'btn-confirm-sell', component: 'Button', label: 'Confirmar venda' },
    ],
    states: [
      { id: 'buy-btc', name: 'Comprar BTC', description: 'Buy BTC review', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
      { id: 'sell-btc', name: 'Vender BTC', description: 'Sell BTC review', data: { assetTicker: 'BTC', mode: 'sell' } },
    ],
  },
  {
    id: 'inv3l-processing',
    title: 'Processing (Light)',
    description: 'Light orbital loading animation with asset icon.',
    componentsUsed: ['Custom'],
    component: Screen5_Processing,
    states: [
      { id: 'btc', name: 'BTC', description: 'Processing BTC', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'sol', name: 'SOL', description: 'Processing SOL', data: { assetTicker: 'SOL' } },
    ],
  },
  {
    id: 'inv3l-success',
    title: 'Success (Light)',
    description: 'Light celebration: confetti, check animation, summary card.',
    componentsUsed: ['Custom'],
    component: Screen6_Success,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Concluir' },
    ],
    states: [
      { id: 'buy-btc', name: 'Comprou BTC', description: 'BTC buy success', isDefault: true, data: { assetTicker: 'BTC', mode: 'buy' } },
      { id: 'sell-btc', name: 'Vendeu BTC', description: 'BTC sell success', data: { assetTicker: 'BTC', mode: 'sell' } },
      { id: 'buy-renda', name: 'Investiu Renda', description: 'Fixed income success', data: { assetTicker: 'RENDA-USD', mode: 'buy' } },
    ],
  },
]

// ── Register Pages ──

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Investments',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

// ── Register Flow ──

registerFlow({
  id: 'investments-v3-light',
  name: 'Investimentos V3 (Light)',
  description: 'Clean light-themed investments: discovery with sparklines, asset pages, keypad trade, slide-to-confirm, orbital processing, confetti success.',
  domain: 'earn',
  level: 2,
  screens: screenDefs.map(s => ({ ...s, pageId: s.id })),
})

// ── Sidebar Group ──
{
  const DOMAIN = 'investments'
  const GROUP_NAME = 'Investimentos V3'
  const existing = getGroupsForDomain(DOMAIN).find(g => g.name === GROUP_NAME)
  if (existing) {
    assignFlowToGroup('investments-v3-light', existing.id)
  }
}

// ── Flow Graph ──
{
  const ROW = 120
  const x = 300
  const xR = 600

  const nodes = [
    { id: 'n-discover', type: 'screen', position: { x, y: 0 },
      data: { label: 'Discover', screenId: 'inv3l-discover', nodeType: 'screen',
              pageId: 'inv3l-discover', description: 'Light-themed discovery with trending, movers, categories' } as FlowNodeData },
    { id: 'n-tap-asset', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-asset', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Asset Page', screenId: 'inv3l-asset-page', nodeType: 'screen',
              pageId: 'inv3l-asset-page', description: 'Light detail with chart, stats' } as FlowNodeData },
    { id: 'n-tap-buy', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Comprar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell', type: 'action', position: { x: xR, y: ROW * 3 },
      data: { label: 'Tap Vender', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Vender' } as FlowNodeData },
    { id: 'n-trade', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Trade Amount', screenId: 'inv3l-trade', nodeType: 'screen',
              pageId: 'inv3l-trade', description: 'Light keypad amount entry' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Review', screenId: 'inv3l-review', nodeType: 'screen',
              pageId: 'inv3l-review', description: 'Light slide-to-confirm with summary' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Slide to Confirm', screenId: null, nodeType: 'action',
              actionType: 'swipe', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 8 },
      data: { label: 'Execute Order', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/investments/order' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 9 },
      data: { label: 'Processing', screenId: 'inv3l-processing', nodeType: 'screen',
              pageId: 'inv3l-processing', description: 'Light orbital animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 10 },
      data: { label: 'Success', screenId: 'inv3l-success', nodeType: 'screen',
              pageId: 'inv3l-success', description: 'Light celebration with summary' } as FlowNodeData },
    { id: 'n-note-design', type: 'note', position: { x: xR, y: 0 },
      data: { label: 'Design Notes', screenId: null, nodeType: 'note',
              description: 'V3 Light: same structure as V3 Dark but with clean white backgrounds, gray borders, subtle shadows.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-discover', target: 'n-tap-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-asset', target: 'n-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-asset', target: 'n-tap-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-asset', target: 'n-tap-sell', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-5', source: 'n-tap-buy', target: 'n-trade', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-sell', target: 'n-trade', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-trade', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-continue', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-confirm', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-note', source: 'n-discover', target: 'n-note-design', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('investments-v3-light', nodes, edges, 1)
}
