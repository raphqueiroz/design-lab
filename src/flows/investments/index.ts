import { registerFlow } from '@/pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '@/pages/simulator/flowGraphStore'
import type { FlowNodeData } from '@/pages/simulator/flowGraph.types'
import { registerPage } from '@/pages/gallery/pageRegistry'
import { declareGroupDefault, declareMembershipDefault } from '@/pages/simulator/flowGroupStore'

import Screen1_Intro from './Screen1_Intro'
import Screen2_Dashboard from './Screen2_Dashboard'
import Screen3_AssetDetail_Variable from './Screen3_AssetDetail_Variable'
import Screen4_AssetDetail_Fixed from './Screen4_AssetDetail_Fixed'
import Screen5_BuyAmount from './Screen5_BuyAmount'
import Screen6_BuyReview from './Screen6_BuyReview'
import Screen7_BuyProcessing from './Screen7_BuyProcessing'
import Screen8_BuySuccess from './Screen8_BuySuccess'
import Screen9_SellAmount from './Screen9_SellAmount'
import Screen10_SellReview from './Screen10_SellReview'
import Screen11_SellProcessing from './Screen11_SellProcessing'
import Screen12_SellSuccess from './Screen12_SellSuccess'

// ── Screen Definitions ──

const screenDefs = [
  {
    id: 'investments-intro',
    title: 'Intro',
    description: 'Feature introduction with LPS hero image, benefits summary, and risk disclaimer.',
    componentsUsed: ['FeatureLayout', 'Text', 'Summary', 'GroupHeader', 'Banner', 'Button', 'Stack'] as const,
    component: Screen1_Intro,
    interactiveElements: [
      { id: 'btn-start', component: 'Button', label: 'Começar a investir' },
    ],
  },
  {
    id: 'investments-dashboard',
    title: 'Dashboard',
    description: 'Portfolio overview with total balance, line chart, positions list, and Explorar tab for browsing assets.',
    componentsUsed: ['BaseLayout', 'Header', 'SegmentedControl', 'Text', 'Badge', 'LineChart', 'ShortcutButton', 'GroupHeader', 'ListItem', 'Avatar', 'SearchBar', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen2_Dashboard,
    states: [
      { id: 'with-positions', name: 'Com posições', description: 'User has investments', isDefault: true, data: { initialState: 'with-positions' } },
      { id: 'empty', name: 'Vazio', description: 'No investments yet', data: { initialState: 'empty' } },
    ],
    interactiveElements: [
      { id: 'sc-comprar', component: 'ShortcutButton', label: 'Comprar' },
      { id: 'sc-vender', component: 'ShortcutButton', label: 'Vender' },
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
    id: 'investments-asset-variable',
    title: 'Asset Detail (Variable)',
    description: 'Volatile asset detail page with price chart, time range selector, risk banner, and buy/sell CTAs.',
    componentsUsed: ['BaseLayout', 'Header', 'Avatar', 'Badge', 'Text', 'SegmentedControl', 'LineChart', 'Banner', 'DataList', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen3_AssetDetail_Variable,
    states: [
      { id: 'btc', name: 'Bitcoin', description: 'BTC detail', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'eth', name: 'Ethereum', description: 'ETH detail', data: { assetTicker: 'ETH' } },
      { id: 'sol', name: 'Solana', description: 'SOL detail', data: { assetTicker: 'SOL' } },
      { id: 'paxg', name: 'Ouro', description: 'PAXG detail', data: { assetTicker: 'PAXG' } },
    ],
    interactiveElements: [
      { id: 'btn-buy', component: 'Button', label: 'Comprar' },
      { id: 'btn-sell', component: 'Button', label: 'Vender' },
    ],
  },
  {
    id: 'investments-asset-fixed',
    title: 'Asset Detail (Fixed)',
    description: 'Fixed income detail page with APY display, benefits summary, and invest CTA.',
    componentsUsed: ['BaseLayout', 'Header', 'Avatar', 'Badge', 'Text', 'Summary', 'DataList', 'GroupHeader', 'Banner', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen4_AssetDetail_Fixed,
    states: [
      { id: 'usd', name: 'Renda em Dólar', description: 'USD yield', isDefault: true, data: { assetTicker: 'RENDA-USD' } },
      { id: 'brl', name: 'Renda em Real', description: 'BRL yield', data: { assetTicker: 'RENDA-BRL' } },
      { id: 'eur', name: 'Renda em Euro', description: 'EUR yield', data: { assetTicker: 'RENDA-EUR' } },
    ],
    interactiveElements: [
      { id: 'btn-invest', component: 'Button', label: 'Investir' },
    ],
  },
  {
    id: 'investments-buy-amount',
    title: 'Buy Amount',
    description: 'Amount entry for buying an asset, with balance or Pix payment method selector.',
    componentsUsed: ['BaseLayout', 'Header', 'SegmentedControl', 'CurrencyInput', 'Text', 'Button', 'StickyFooter'] as const,
    component: Screen5_BuyAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'investments-buy-review',
    title: 'Buy Review',
    description: 'Order review before confirming a buy: asset, quantity, value, method, fee.',
    componentsUsed: ['BaseLayout', 'Header', 'DataList', 'GroupHeader', 'Banner', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen6_BuyReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar compra' },
    ],
  },
  {
    id: 'investments-buy-processing',
    title: 'Buy Processing',
    description: 'Processing animation with step messages while the buy order executes.',
    componentsUsed: ['LoadingScreen'] as const,
    component: Screen7_BuyProcessing,
  },
  {
    id: 'investments-buy-success',
    title: 'Buy Success',
    description: 'Buy confirmation with transaction summary and return-to-portfolio CTA.',
    componentsUsed: ['FeedbackLayout', 'Text', 'DataList', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen8_BuySuccess,
    interactiveElements: [
      { id: 'btn-portfolio', component: 'Button', label: 'Ver portfólio' },
    ],
  },
  {
    id: 'investments-sell-amount',
    title: 'Sell Amount',
    description: 'Amount entry for selling an asset, showing available balance.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'Text', 'Button', 'StickyFooter'] as const,
    component: Screen9_SellAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'investments-sell-review',
    title: 'Sell Review',
    description: 'Sell order review: asset, quantity, estimated value, destination, fee.',
    componentsUsed: ['BaseLayout', 'Header', 'DataList', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen10_SellReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar venda' },
    ],
  },
  {
    id: 'investments-sell-processing',
    title: 'Sell Processing',
    description: 'Processing animation with step messages while the sell order executes.',
    componentsUsed: ['LoadingScreen'] as const,
    component: Screen11_SellProcessing,
  },
  {
    id: 'investments-sell-success',
    title: 'Sell Success',
    description: 'Sell confirmation with transaction summary and return-to-portfolio CTA.',
    componentsUsed: ['FeedbackLayout', 'Text', 'DataList', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'] as const,
    component: Screen12_SellSuccess,
    interactiveElements: [
      { id: 'btn-portfolio', component: 'Button', label: 'Ver portfólio' },
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
  id: 'investments',
  name: 'Investimentos',
  description: 'Browse and invest in crypto, commodities, and fixed-income products. Buy with Picnic balance or Pix, sell back to balance.',
  domain: 'earn',
  level: 2,
  screens: screenDefs.map(s => ({ ...s, pageId: s.id })),
})

// ── Sidebar Group ──

const groupId = declareGroupDefault('Investimentos', 'investments')
declareMembershipDefault('investments', groupId)

// ── Flow Graph ──
{
  const ROW = 120
  const x = 300   // spine
  const xL = 0    // left column
  const xR = 600  // right column

  const nodes = [
    // ── Row 0: Intro ──
    { id: 'n-intro', type: 'screen', position: { x, y: 0 }, data: { label: 'Intro', screenId: 'investments-intro', nodeType: 'screen', pageId: 'investments-intro', description: 'Feature onboarding with benefits and risk disclaimer' } as FlowNodeData },

    // ── Row 1: Tap Começar ──
    { id: 'n-tap-start', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Começar a investir', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Começar a investir' } as FlowNodeData },

    // ── Row 2: Dashboard ──
    { id: 'n-dashboard', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Dashboard', screenId: 'investments-dashboard', nodeType: 'screen', pageId: 'investments-dashboard', description: 'Portfolio overview + Explorar tab for browsing assets' } as FlowNodeData },
    { id: 'n-note-categories', type: 'note', position: { x: xR, y: ROW * 2 }, data: { label: 'Asset Categories', screenId: null, nodeType: 'note', description: 'Renda Variável: BTC, ETH, SOL, AAVE, XRP, LINK, PAXG, KAG. Renda Fixa: Renda em Dólar/Real/Euro.' } as FlowNodeData },

    // ── Row 3: Browse actions (variable vs fixed) ──
    { id: 'n-tap-variable', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap variable asset', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },
    { id: 'n-tap-fixed', type: 'action', position: { x: xR, y: ROW * 3 }, data: { label: 'Tap fixed income', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Renda em Dólar' } as FlowNodeData },

    // ── Row 4: Asset detail screens ──
    { id: 'n-detail-variable', type: 'screen', position: { x, y: ROW * 4 }, data: { label: 'Asset Detail (Variable)', screenId: 'investments-asset-variable', nodeType: 'screen', pageId: 'investments-asset-variable', description: 'Price chart, time range, risk banner, buy/sell CTAs' } as FlowNodeData },
    { id: 'n-detail-fixed', type: 'screen', position: { x: xR, y: ROW * 4 }, data: { label: 'Asset Detail (Fixed)', screenId: 'investments-asset-fixed', nodeType: 'screen', pageId: 'investments-asset-fixed', description: 'APY display, benefits, invest CTA' } as FlowNodeData },

    // ── Row 5: Buy/Sell decision from variable + Invest from fixed ──
    { id: 'n-tap-buy', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Comprar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell-from-detail', type: 'action', position: { x: xL, y: ROW * 5 }, data: { label: 'Tap Vender', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Vender' } as FlowNodeData },
    { id: 'n-tap-invest', type: 'action', position: { x: xR, y: ROW * 5 }, data: { label: 'Tap Investir', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Investir' } as FlowNodeData },

    // ── Row 6: Buy Amount ──
    { id: 'n-buy-amount', type: 'screen', position: { x, y: ROW * 6 }, data: { label: 'Buy Amount', screenId: 'investments-buy-amount', nodeType: 'screen', pageId: 'investments-buy-amount', description: 'Amount entry with balance/Pix toggle' } as FlowNodeData },

    // ── Row 7: Tap Continuar (buy) ──
    { id: 'n-tap-buy-continue', type: 'action', position: { x, y: ROW * 7 }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },

    // ── Row 8: Buy Review ──
    { id: 'n-buy-review', type: 'screen', position: { x, y: ROW * 8 }, data: { label: 'Buy Review', screenId: 'investments-buy-review', nodeType: 'screen', pageId: 'investments-buy-review', description: 'Order summary and confirm button' } as FlowNodeData },

    // ── Row 9: Tap Confirmar compra ──
    { id: 'n-tap-confirm-buy', type: 'action', position: { x, y: ROW * 9 }, data: { label: 'Tap Confirmar compra', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },

    // ── Row 10: API process buy ──
    { id: 'n-api-buy', type: 'api-call', position: { x, y: ROW * 10 }, data: { label: 'Process Buy Order', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/buy', description: 'Execute buy order, update portfolio' } as FlowNodeData },

    // ── Row 11: Buy Processing ──
    { id: 'n-buy-processing', type: 'screen', position: { x, y: ROW * 11 }, data: { label: 'Buy Processing', screenId: 'investments-buy-processing', nodeType: 'screen', pageId: 'investments-buy-processing', description: 'Animated loading with step messages' } as FlowNodeData },

    // ── Row 12: Buy Success ──
    { id: 'n-buy-success', type: 'screen', position: { x, y: ROW * 12 }, data: { label: 'Buy Success', screenId: 'investments-buy-success', nodeType: 'screen', pageId: 'investments-buy-success', description: 'Confirmation with summary' } as FlowNodeData },

    // ── Sell flow (left column, rows 6-12) ──
    { id: 'n-sell-amount', type: 'screen', position: { x: xL, y: ROW * 6 }, data: { label: 'Sell Amount', screenId: 'investments-sell-amount', nodeType: 'screen', pageId: 'investments-sell-amount', description: 'Amount entry showing available balance' } as FlowNodeData },
    { id: 'n-tap-sell-continue', type: 'action', position: { x: xL, y: ROW * 7 }, data: { label: 'Tap Continuar (sell)', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-sell-review', type: 'screen', position: { x: xL, y: ROW * 8 }, data: { label: 'Sell Review', screenId: 'investments-sell-review', nodeType: 'screen', pageId: 'investments-sell-review', description: 'Sell order summary and confirm' } as FlowNodeData },
    { id: 'n-tap-confirm-sell', type: 'action', position: { x: xL, y: ROW * 9 }, data: { label: 'Tap Confirmar venda', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
    { id: 'n-api-sell', type: 'api-call', position: { x: xL, y: ROW * 10 }, data: { label: 'Process Sell Order', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/sell', description: 'Execute sell order, credit balance' } as FlowNodeData },
    { id: 'n-sell-processing', type: 'screen', position: { x: xL, y: ROW * 11 }, data: { label: 'Sell Processing', screenId: 'investments-sell-processing', nodeType: 'screen', pageId: 'investments-sell-processing', description: 'Animated loading with sell step messages' } as FlowNodeData },
    { id: 'n-sell-success', type: 'screen', position: { x: xL, y: ROW * 12 }, data: { label: 'Sell Success', screenId: 'investments-sell-success', nodeType: 'screen', pageId: 'investments-sell-success', description: 'Sell confirmation with summary' } as FlowNodeData },
  ]

  const edges = [
    // Main spine: Intro → Dashboard → Variable Detail → Buy flow
    { id: 'e-1', source: 'n-intro', target: 'n-tap-start', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-start', target: 'n-dashboard', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-dashboard', target: 'n-tap-variable', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-variable', target: 'n-detail-variable', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-detail-variable', target: 'n-tap-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-buy', target: 'n-buy-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-buy-amount', target: 'n-tap-buy-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-buy-continue', target: 'n-buy-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-buy-review', target: 'n-tap-confirm-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-confirm-buy', target: 'n-api-buy', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-api-buy', target: 'n-buy-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-buy-processing', target: 'n-buy-success', sourceHandle: 'bottom', targetHandle: 'top' },

    // Fixed income branch: Dashboard → Fixed Detail → Buy
    { id: 'e-fixed-1', source: 'n-dashboard', target: 'n-tap-fixed', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-fixed-2', source: 'n-tap-fixed', target: 'n-detail-fixed', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-fixed-3', source: 'n-detail-fixed', target: 'n-tap-invest', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-fixed-4', source: 'n-tap-invest', target: 'n-buy-amount', sourceHandle: 'left-source', targetHandle: 'right-target' },

    // Sell branch from variable detail
    { id: 'e-sell-1', source: 'n-detail-variable', target: 'n-tap-sell-from-detail', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-sell-2', source: 'n-tap-sell-from-detail', target: 'n-sell-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-3', source: 'n-sell-amount', target: 'n-tap-sell-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-4', source: 'n-tap-sell-continue', target: 'n-sell-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-5', source: 'n-sell-review', target: 'n-tap-confirm-sell', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-6', source: 'n-tap-confirm-sell', target: 'n-api-sell', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-7', source: 'n-api-sell', target: 'n-sell-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sell-8', source: 'n-sell-processing', target: 'n-sell-success', sourceHandle: 'bottom', targetHandle: 'top' },

    // Note connection
    { id: 'e-note', source: 'n-dashboard', target: 'n-note-categories', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('investments', nodes, edges, 1)
}
