import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// ── Screen imports ──
import Screen1_EarnDashboard from './Screen1_EarnDashboard'
import Screen2_ProductHub from './Screen2_ProductHub'
import Screen3_DepositAmount from './Screen3_DepositAmount'
import Screen4_DepositReview from './Screen4_DepositReview'
import SharedProcessing from '../yields2/shared/SharedProcessing'
import Screen6_DepositSuccess from './Screen6_DepositSuccess'
import Screen7_WithdrawAmount from './Screen7_WithdrawAmount'
import Screen8_WithdrawReview from './Screen8_WithdrawReview'
import Screen9_WithdrawSuccess from './Screen9_WithdrawSuccess'

/* ═══════════════════════════════════════════════════════
 * FLOW 1: Main Yields5 — Earn Dashboard → Product Hub
 * "Earn Dashboard" inspired by Binance Earn benchmark
 * Multi-product dashboard where insured yield is one card
 * ═══════════════════════════════════════════════════════ */

const mainScreenDefs = [
  {
    id: 'yields5-dashboard',
    title: 'Earn Dashboard',
    description: 'Multi-product earn dashboard. Total portfolio balance, product cards (insured yield, standard yield, staking). Insurance surfaced as a product differentiator.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Card', 'Text', 'Amount', 'Badge', 'Banner', 'ListItem', 'Avatar', 'GroupHeader'],
    component: Screen1_EarnDashboard,
    interactiveElements: [
      { id: 'li-insured', component: 'ListItem', label: 'Renda Protegida' },
      { id: 'li-standard', component: 'ListItem', label: 'Renda Padrão' },
      { id: 'li-staking', component: 'ListItem', label: 'Staking' },
    ],
  },
  {
    id: 'yields5-product-hub',
    title: 'Product Hub',
    description: 'Detailed insured yield view: balance hero, performance chart, yield breakdown, protocol info, coverage BottomSheet.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'ShortcutButton', 'Badge', 'Amount', 'DataList', 'Banner', 'LineChart', 'ListItem', 'Avatar', 'GroupHeader', 'Text'],
    component: Screen2_ProductHub,
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 2: Yields5 Deposit
 * ═══════════════════════════════════════════════════════ */

const depositScreenDefs = [
  {
    id: 'yields5-deposit-amount',
    title: 'Deposit Amount',
    description: 'Simpler deposit with net yield "incl. seguro" line.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'Button', 'CurrencyInput', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Divider', 'StickyFooter', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen3_DepositAmount,
    states: [
      { id: 'default', name: 'Empty', isDefault: true, data: {} },
      { id: 'loading', name: 'Calculating', data: { initialAmount: '50000', initialCalcState: 'loading' } },
      { id: 'ready', name: 'Ready', data: { initialAmount: '50000', initialCalcState: 'ready' } },
    ],
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'yields5-deposit-review',
    title: 'Deposit Review',
    description: 'Review with Badge "Protegido por seguro".',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'Badge', 'DataList', 'GroupHeader', 'StickyFooter'],
    component: Screen4_DepositReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar' },
    ],
  },
  {
    id: 'yields5-deposit-processing',
    title: 'Processing (Deposit)',
    description: 'Animated loading.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields5-deposit-success',
    title: 'Deposit Success',
    description: 'Simple confirmation.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen6_DepositSuccess,
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 3: Yields5 Withdraw
 * ═══════════════════════════════════════════════════════ */

const withdrawScreenDefs = [
  {
    id: 'yields5-withdraw-amount',
    title: 'Withdraw Amount',
    description: 'Amount entry with quick picks.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'DataList', 'StickyFooter'],
    component: Screen7_WithdrawAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'yields5-withdraw-review',
    title: 'Withdraw Review',
    description: 'Tax breakdown review.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen8_WithdrawReview,
  },
  {
    id: 'yields5-withdraw-processing',
    title: 'Processing (Withdraw)',
    description: 'Animated loading.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields5-withdraw-success',
    title: 'Withdraw Success',
    description: 'Withdrawal confirmed.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen9_WithdrawSuccess,
  },
]

// ── Register all pages ──

const allScreenDefs = [...mainScreenDefs, ...depositScreenDefs, ...withdrawScreenDefs]

for (const s of allScreenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: [...s.states] } : {}),
  })
}

// ── Register flows ──

registerFlow({
  id: 'yields5',
  name: 'Yields5 — Earn Dashboard',
  description: 'Multi-product earn dashboard. Insured yield is one product card among others. User navigates from dashboard to product detail to deposit/withdraw.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['yields5-deposit', 'yields5-withdraw'],
  screens: mainScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields5-deposit',
  name: 'Yields5 — Deposit',
  description: 'Deposit into insured yield from earn dashboard.',
  domain: 'earn',
  level: 2,

  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields5-withdraw',
  name: 'Yields5 — Withdraw',
  description: 'Withdraw from insured yield via earn dashboard.',
  domain: 'earn',
  level: 2,

  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════
// GRAPH 1: Yields5 Main — Dashboard → Product Hub → sub-flows
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Dashboard
    { id: 'n-dashboard', type: 'screen', position: { x, y: 0 },
      data: { label: 'Earn Dashboard', screenId: 'yields5-dashboard', nodeType: 'screen', pageId: 'yields5-dashboard', description: 'Multi-product earn dashboard with portfolio total and product cards' } as FlowNodeData },
    // Row 1: Tap product
    { id: 'n-tap-insured', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Renda Protegida', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Renda Protegida' } as FlowNodeData },
    // Row 2: Product Hub
    { id: 'n-product-hub', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Product Hub', screenId: 'yields5-product-hub', nodeType: 'screen', pageId: 'yields5-product-hub', description: 'Balance hero, chart, metrics, protocol info, coverage BottomSheet' } as FlowNodeData },
    // Row 2 left: Coverage overlay
    { id: 'n-coverage-sheet', type: 'overlay', position: { x: xL, y: ROW * 2 },
      data: { label: 'Coverage BottomSheet', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-product-hub', description: 'Full coverage details with covered/not-covered lists' } as FlowNodeData },
    // Row 3: Action nodes
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW * 3 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-withdraw', type: 'action', position: { x: xR, y: ROW * 3 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    // Row 4: Flow references
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 4 },
      data: { label: 'Yields5 Deposit', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields5-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 4 },
      data: { label: 'Yields5 Withdraw', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields5-withdraw' } as FlowNodeData },
    // Note
    { id: 'n-note', type: 'note', position: { x: xR, y: 0 },
      data: { label: 'Earn Dashboard Pattern', screenId: null, nodeType: 'note', description: 'Binance Earn-inspired: insured yield is one of multiple earning products. User discovers insurance through the product card differentiator rather than a dedicated intro.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-dashboard', target: 'n-tap-insured', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-insured', target: 'n-product-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sheet', source: 'n-product-hub', target: 'n-coverage-sheet', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-3', source: 'n-product-hub', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-4', source: 'n-product-hub', target: 'n-tap-withdraw', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-5', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('yields5', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 2: Yields5 Deposit
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Deposit Amount', screenId: 'yields5-deposit-amount', nodeType: 'screen', pageId: 'yields5-deposit-amount' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Yield', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/calculate' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Deposit Review', screenId: 'yields5-deposit-review', nodeType: 'screen', pageId: 'yields5-deposit-review' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/deposit' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields5-deposit-processing', nodeType: 'screen', pageId: 'yields5-deposit-processing' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll deposit status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Deposit Success', screenId: 'yields5-deposit-success', nodeType: 'screen', pageId: 'yields5-deposit-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-amount', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-continue', target: 'n-api-calc', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-calc', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-confirm', target: 'n-api-submit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-api-submit', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-processing', target: 'n-poll', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-poll', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('yields5-deposit', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 3: Yields5 Withdraw
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Withdraw Amount', screenId: 'yields5-withdraw-amount', nodeType: 'screen', pageId: 'yields5-withdraw-amount' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Tax & Net', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw/calculate' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Withdraw Review', screenId: 'yields5-withdraw-review', nodeType: 'screen', pageId: 'yields5-withdraw-review' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields5-withdraw-processing', nodeType: 'screen', pageId: 'yields5-withdraw-processing' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll withdraw status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Withdraw Success', screenId: 'yields5-withdraw-success', nodeType: 'screen', pageId: 'yields5-withdraw-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-amount', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-continue', target: 'n-api-calc', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-calc', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-confirm', target: 'n-api-submit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-api-submit', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-processing', target: 'n-poll', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-poll', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('yields5-withdraw', nodes, edges)
}
