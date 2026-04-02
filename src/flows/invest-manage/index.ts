import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'

import Screen1_Dashboard from './Screen1_Dashboard'
import Screen1_DashboardB from './Screen1_DashboardB'
import Screen2_Intro from './Screen2_Intro'
import Screen3_Discovery from './Screen3_Discovery'
import Screen4_AssetPage from './Screen4_AssetPage'

// ── Screen definitions ──

const screenDefs = [
  {
    id: 'invest-manage-dashboard',
    title: 'Investments Dashboard',
    description: 'Portfolio overview with total value, P&L, chart, positions list, and explore shortcut.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Amount', 'Badge', 'LineChart', 'ShortcutButton', 'GroupHeader', 'ListItem', 'Avatar', 'Text', 'Button', 'StickyFooter'],
    component: Screen1_Dashboard,
    states: [
      { id: 'default', name: 'Com posições', description: 'User has active investments', isDefault: true, data: {} },
      { id: 'empty', name: 'Sem investimentos', description: 'Empty state — user has no investments yet', data: { isEmpty: true } },
    ],
    interactiveElements: [
      { id: 'sc-explorar', component: 'ShortcutButton', label: 'Explorar' },
      { id: 'sc-historico', component: 'ShortcutButton', label: 'Histórico' },
      { id: 'li-btc', component: 'ListItem', label: 'BTC' },
      { id: 'li-eth', component: 'ListItem', label: 'ETH' },
      { id: 'li-sol', component: 'ListItem', label: 'SOL' },
      { id: 'li-renda-usd', component: 'ListItem', label: 'RENDA-USD' },
      { id: 'li-paxg', component: 'ListItem', label: 'PAXG' },
      { id: 'btn-explorar', component: 'Button', label: 'Explorar investimentos' },
    ],
  },
  {
    id: 'invest-manage-dashboard-b',
    title: 'Investments Dashboard B',
    description: 'Design iteration of the investments dashboard.',
    componentsUsed: ['FeatureLayout', 'Header', 'Stack', 'LineChart', 'GroupHeader', 'ListItem', 'Avatar', 'Text', 'Button', 'StickyFooter'],
    component: Screen1_DashboardB,
    states: [
      { id: 'default', name: 'Com posições', description: 'User has active investments', isDefault: true, data: {} },
      { id: 'empty', name: 'Sem investimentos', description: 'Empty state — user has no investments yet', data: { isEmpty: true } },
    ],
  },
  {
    id: 'invest-manage-intro',
    title: 'Investments Intro',
    description: 'Onboarding screen introducing investments: crypto, commodities, and fixed income.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Button', 'Text', 'Summary', 'Banner', 'GroupHeader'],
    component: Screen2_Intro,
    interactiveElements: [
      { id: 'btn-start', component: 'Button', label: 'Começar a investir' },
    ],
  },
  {
    id: 'invest-manage-discovery',
    title: 'Investment Discovery',
    description: 'Browse and search assets by category with price/APY info.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'SearchBar', 'SegmentedControl', 'GroupHeader', 'ListItem', 'Avatar', 'Badge', 'Text'],
    component: Screen3_Discovery,
    interactiveElements: [
      { id: 'li-btc', component: 'ListItem', label: 'BTC' },
      { id: 'li-eth', component: 'ListItem', label: 'ETH' },
      { id: 'li-sol', component: 'ListItem', label: 'SOL' },
      { id: 'li-aave', component: 'ListItem', label: 'AAVE' },
      { id: 'li-xrp', component: 'ListItem', label: 'XRP' },
      { id: 'li-link', component: 'ListItem', label: 'LINK' },
      { id: 'li-paxg', component: 'ListItem', label: 'PAXG' },
      { id: 'li-kag', component: 'ListItem', label: 'KAG' },
      { id: 'li-renda-usd', component: 'ListItem', label: 'RENDA-USD' },
      { id: 'li-renda-brl', component: 'ListItem', label: 'RENDA-BRL' },
      { id: 'li-renda-eur', component: 'ListItem', label: 'RENDA-EUR' },
    ],
  },
  {
    id: 'invest-manage-asset-page',
    title: 'Asset Page',
    description: 'Asset detail with chart, shortcuts, details/history tabs (invested) or info + CTA (not invested).',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'StickyFooter', 'Avatar', 'Badge', 'LineChart', 'SegmentedControl', 'ShortcutButton', 'Button', 'GroupHeader', 'DataList', 'Banner', 'ListItem', 'Text'],
    component: Screen4_AssetPage,
    states: [
      { id: 'btc-invested', name: 'Bitcoin (investido)', description: 'BTC with active position', isDefault: true, data: { ticker: 'BTC', invested: true } },
      { id: 'btc-new', name: 'Bitcoin (novo)', description: 'BTC without position', data: { ticker: 'BTC', invested: false } },
      { id: 'eth-invested', name: 'Ethereum (investido)', description: 'ETH with active position', data: { ticker: 'ETH', invested: true } },
      { id: 'paxg-invested', name: 'Ouro (investido)', description: 'PAXG with active position', data: { ticker: 'PAXG', invested: true } },
      { id: 'paxg-new', name: 'Ouro (novo)', description: 'PAXG without position', data: { ticker: 'PAXG', invested: false } },
      { id: 'renda-usd-invested', name: 'Renda USD (investido)', description: 'Fixed income USD with active position', data: { ticker: 'RENDA-USD', invested: true } },
      { id: 'renda-usd-new', name: 'Renda USD (novo)', description: 'Fixed income USD without position', data: { ticker: 'RENDA-USD', invested: false } },
      { id: 'renda-brl-new', name: 'Renda BRL (novo)', description: 'Fixed income BRL without position', data: { ticker: 'RENDA-BRL', invested: false } },
    ],
    interactiveElements: [
      { id: 'sc-comprar', component: 'ShortcutButton', label: 'Comprar' },
      { id: 'sc-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
      { id: 'sc-vender', component: 'ShortcutButton', label: 'Vender' },
      { id: 'sc-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'sc-historico', component: 'ShortcutButton', label: 'Histórico' },
      { id: 'btn-comprar', component: 'Button', label: 'Comprar' },
      { id: 'btn-investir', component: 'Button', label: 'Investir' },
    ],
  },
]

// ── Register pages ──

const seen = new Set<string>()
for (const s of screenDefs) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
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

// ── Register flow ──

registerFlow({
  id: 'invest-manage',
  name: 'Investments',
  description: 'Investment management: portfolio dashboard, onboarding, asset discovery, and per-asset detail pages.',
  domain: 'earn',
  level: 1,
  linkedFlows: [],
  entryPoints: ['dashboard-investments', 'quick-action'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow graph ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Dashboard (level-1, topmost = shows TabBar)
    { id: 'n-dashboard', type: 'screen', position: { x, y: 0 }, data: { label: 'Investments Dashboard', screenId: 'invest-manage-dashboard', nodeType: 'screen', pageId: 'invest-manage-dashboard', description: 'Portfolio overview — positions, chart, P&L' } as FlowNodeData },

    // Left branch: Intro (onboarding for new users)
    { id: 'n-intro', type: 'screen', position: { x: xL, y: 0 }, data: { label: 'Investments Intro', screenId: 'invest-manage-intro', nodeType: 'screen', pageId: 'invest-manage-intro', description: 'Onboarding screen for new users' } as FlowNodeData },
    { id: 'n-tap-start', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Começar a investir', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Começar a investir' } as FlowNodeData },

    // Row 1: Actions from dashboard
    { id: 'n-tap-position', type: 'action', position: { x, y: ROW }, data: { label: 'Tap asset position', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: BTC' } as FlowNodeData },
    { id: 'n-tap-explorar-btn', type: 'action', position: { x: xR, y: ROW }, data: { label: 'Tap Explorar investimentos (empty)', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Explorar investimentos' } as FlowNodeData },

    // Row 2: Discovery + Asset Page
    { id: 'n-discovery', type: 'screen', position: { x: xR, y: ROW * 2 }, data: { label: 'Investment Discovery', screenId: 'invest-manage-discovery', nodeType: 'screen', pageId: 'invest-manage-discovery', description: 'Browse and search assets by category' } as FlowNodeData },
    { id: 'n-asset-page', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Asset Page', screenId: 'invest-manage-asset-page', nodeType: 'screen', pageId: 'invest-manage-asset-page', description: 'Per-asset detail: invested or not-invested states' } as FlowNodeData },

    // Row 3: Action from discovery
    { id: 'n-tap-discovery-asset', type: 'action', position: { x: xR, y: ROW * 3 }, data: { label: 'Tap asset in discovery', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: BTC' } as FlowNodeData },

    // Row 4: Actions from asset page (invested)
    { id: 'n-tap-comprar', type: 'action', position: { x, y: ROW * 4 }, data: { label: 'Tap Comprar/Adicionar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Comprar' } as FlowNodeData },
    { id: 'n-tap-vender', type: 'action', position: { x: xR, y: ROW * 4 }, data: { label: 'Tap Vender/Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Vender' } as FlowNodeData },

    // Row 5: Action from asset page (not invested)
    { id: 'n-tap-buy-btn', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Comprar/Investir CTA', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },

    // Row 6: Future flow references
    { id: 'n-note-future', type: 'note', position: { x, y: ROW * 6 }, data: { label: 'Future Flows', screenId: null, nodeType: 'note', description: 'Buy/sell flows (invest-buy, invest-sell) will be linked here as flow-reference nodes.' } as FlowNodeData },
  ]

  const edges = [
    // Intro → Tap start → Dashboard
    { id: 'e-1', source: 'n-intro', target: 'n-tap-start', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-start', target: 'n-dashboard', sourceHandle: 'right-source', targetHandle: 'left-target' },

    // Dashboard → Tap position → Asset page
    { id: 'e-5', source: 'n-dashboard', target: 'n-tap-position', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-position', target: 'n-asset-page', sourceHandle: 'bottom', targetHandle: 'top' },

    // Dashboard (empty) → Tap explorar button → Discovery
    { id: 'e-7', source: 'n-dashboard', target: 'n-tap-explorar-btn', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-8', source: 'n-tap-explorar-btn', target: 'n-discovery', sourceHandle: 'bottom', targetHandle: 'top' },

    // Discovery → Tap asset → Asset page
    { id: 'e-9', source: 'n-discovery', target: 'n-tap-discovery-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-discovery-asset', target: 'n-asset-page', sourceHandle: 'left-source', targetHandle: 'right-target' },

    // Asset page (invested) → Shortcuts
    { id: 'e-11', source: 'n-asset-page', target: 'n-tap-comprar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-asset-page', target: 'n-tap-vender', sourceHandle: 'bottom', targetHandle: 'top' },

    // Asset page (not invested) → Buy CTA
    { id: 'e-13', source: 'n-asset-page', target: 'n-tap-buy-btn', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('invest-manage', nodes, edges, 4)
}
