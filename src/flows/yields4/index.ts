import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// ── Screen imports ──
import Screen1_Compare from './Screen1_Compare'
import Screen2_ProductDetail from './Screen2_ProductDetail'
import Screen3_Hub from './Screen3_Hub'
import Screen4_DepositAmount from './Screen4_DepositAmount'
import Screen5_DepositReview from './Screen5_DepositReview'
import SharedProcessing from '../yields2/shared/SharedProcessing'
import Screen7_DepositSuccess from './Screen7_DepositSuccess'
import Screen8_WithdrawAmount from './Screen8_WithdrawAmount'
import Screen9_WithdrawReview from './Screen9_WithdrawReview'
import Screen10_WithdrawSuccess from './Screen10_WithdrawSuccess'

/* ═══════════════════════════════════════════════════════
 * FLOW 1: Main Yields4 — Compare → Product Detail → Hub
 * "Compare & Choose" inspired by Nubank fixed-income benchmark
 * ═══════════════════════════════════════════════════════ */

const mainScreenDefs = [
  {
    id: 'yields4-compare',
    title: 'Rate Comparison',
    description: 'Three yield options as cards: Insured (~4.16%), Standard (4.86%), Conservative (3.20%). User picks one.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Card', 'Text', 'Badge', 'DataList', 'StickyFooter'],
    component: Screen1_Compare,
    interactiveElements: [
      { id: 'card-protected', component: 'Card', label: 'Protegido' },
      { id: 'card-standard', component: 'Card', label: 'Padrão' },
      { id: 'card-conservative', component: 'Card', label: 'Conservador' },
      { id: 'btn-choose', component: 'Button', label: 'Escolher Protegido' },
    ],
  },
  {
    id: 'yields4-product-detail',
    title: 'Product Detail',
    description: 'Long-scroll product info: yield breakdown, protocol & risk, coverage lists, terms. Inspired by Nubank CDB detail.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Badge', 'DataList', 'ListItem', 'Avatar', 'Banner', 'GroupHeader', 'Divider', 'StickyFooter'],
    component: Screen2_ProductDetail,
    interactiveElements: [
      { id: 'btn-activate', component: 'Button', label: 'Ativar Renda Protegida' },
    ],
  },
  {
    id: 'yields4-hub',
    title: 'Insured Yield Hub',
    description: 'Balance hero with Protegido badge, yield chart, rate breakdown with insurance line items.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'ShortcutButton', 'Badge', 'Amount', 'DataList', 'Banner', 'LineChart', 'Text'],
    component: Screen3_Hub,
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 2: Yields4 Deposit
 * ═══════════════════════════════════════════════════════ */

const depositScreenDefs = [
  {
    id: 'yields4-deposit-amount',
    title: 'Deposit Amount',
    description: 'Currency entry with async calc and insurance fee breakdown.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'Button', 'CurrencyInput', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Divider', 'StickyFooter', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen4_DepositAmount,
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
    id: 'yields4-deposit-review',
    title: 'Deposit Review',
    description: 'Review with insurance section.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen5_DepositReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar' },
    ],
  },
  {
    id: 'yields4-deposit-processing',
    title: 'Processing (Deposit)',
    description: 'Animated loading.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields4-deposit-success',
    title: 'Deposit Success',
    description: 'FeedbackLayout with Protegido badge.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'Badge', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen7_DepositSuccess,
    interactiveElements: [
      { id: 'btn-view', component: 'Button', label: 'Ver rendimentos' },
      { id: 'btn-home', component: 'Button', label: 'Início' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 3: Yields4 Withdraw
 * ═══════════════════════════════════════════════════════ */

const withdrawScreenDefs = [
  {
    id: 'yields4-withdraw-amount',
    title: 'Withdraw Amount',
    description: 'Amount entry with quick picks.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'DataList', 'StickyFooter'],
    component: Screen8_WithdrawAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'yields4-withdraw-review',
    title: 'Withdraw Review',
    description: 'Tax breakdown review.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen9_WithdrawReview,
  },
  {
    id: 'yields4-withdraw-processing',
    title: 'Processing (Withdraw)',
    description: 'Animated loading.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields4-withdraw-success',
    title: 'Withdraw Success',
    description: 'Withdrawal confirmed.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen10_WithdrawSuccess,
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
    ...('states' in s && s.states ? { states: s.states as import('../../pages/gallery/pageRegistry').PageStateDefinition[] } : {}),
  })
}

// ── Register flows ──

registerFlow({
  id: 'yields4',
  name: 'Yields4 — Compare & Choose',
  description: 'Insured yield with rate comparison. User compares 3 yield options (insured, standard, conservative), picks one, sees full product detail, then activates.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['yields4-deposit', 'yields4-withdraw'],
  screens: mainScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields4-deposit',
  name: 'Yields4 — Deposit',
  description: 'Deposit into insured yield with insurance fee breakdown.',
  domain: 'earn',
  level: 2,

  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields4-withdraw',
  name: 'Yields4 — Withdraw',
  description: 'Withdraw from insured yield with tax review.',
  domain: 'earn',
  level: 2,

  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════
// GRAPH 1: Yields4 Main — Compare → Detail → Hub → sub-flows
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    { id: 'n-compare', type: 'screen', position: { x, y: 0 },
      data: { label: 'Rate Comparison', screenId: 'yields4-compare', nodeType: 'screen', pageId: 'yields4-compare', description: '3 yield options as cards: Insured, Standard, Conservative' } as FlowNodeData },
    { id: 'n-tap-choose', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Escolher Protegido', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Escolher Protegido' } as FlowNodeData },
    { id: 'n-tap-card-protected', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Protegido card', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Card: Protegido' } as FlowNodeData },
    { id: 'n-detail', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Product Detail', screenId: 'yields4-product-detail', nodeType: 'screen', pageId: 'yields4-product-detail', description: 'Long-scroll: yield, protocol, risk, coverage breakdown' } as FlowNodeData },
    { id: 'n-tap-activate', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Ativar Renda Protegida', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ativar Renda Protegida' } as FlowNodeData },
    { id: 'n-api-activate', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Activate Insured Yield', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/activate', description: 'Enable sDAI with OpenCover insurance' } as FlowNodeData },
    { id: 'n-hub', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Insured Yield Hub', screenId: 'yields4-hub', nodeType: 'screen', pageId: 'yields4-hub', description: 'Balance hero, chart, rate breakdown' } as FlowNodeData },
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW * 6 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-withdraw', type: 'action', position: { x: xR, y: ROW * 6 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 7 },
      data: { label: 'Yields4 Deposit', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields4-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 7 },
      data: { label: 'Yields4 Withdraw', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields4-withdraw' } as FlowNodeData },
    { id: 'n-note', type: 'note', position: { x: xR, y: 0 },
      data: { label: 'Compare & Choose', screenId: null, nodeType: 'note', description: 'Nubank-style comparison: user sees 3 products side by side before committing. Builds confidence through informed choice.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-compare', target: 'n-tap-choose', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-1b', source: 'n-compare', target: 'n-tap-card-protected', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-1c', source: 'n-tap-card-protected', target: 'n-detail', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-choose', target: 'n-detail', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-detail', target: 'n-tap-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-activate', target: 'n-api-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-api-activate', target: 'n-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-hub', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-7', source: 'n-hub', target: 'n-tap-withdraw', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-8', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('yields4', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 2: Yields4 Deposit
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Deposit Amount', screenId: 'yields4-deposit-amount', nodeType: 'screen', pageId: 'yields4-deposit-amount' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Yield + Insurance', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/calculate' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Deposit Review', screenId: 'yields4-deposit-review', nodeType: 'screen', pageId: 'yields4-deposit-review' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/deposit' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields4-deposit-processing', nodeType: 'screen', pageId: 'yields4-deposit-processing' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll deposit status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Deposit Success', screenId: 'yields4-deposit-success', nodeType: 'screen', pageId: 'yields4-deposit-success' } as FlowNodeData },
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

  bootstrapFlowGraph('yields4-deposit', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 3: Yields4 Withdraw
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Withdraw Amount', screenId: 'yields4-withdraw-amount', nodeType: 'screen', pageId: 'yields4-withdraw-amount' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Tax & Net', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw/calculate' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Withdraw Review', screenId: 'yields4-withdraw-review', nodeType: 'screen', pageId: 'yields4-withdraw-review' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields4-withdraw-processing', nodeType: 'screen', pageId: 'yields4-withdraw-processing' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll withdraw status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Withdraw Success', screenId: 'yields4-withdraw-success', nodeType: 'screen', pageId: 'yields4-withdraw-success' } as FlowNodeData },
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

  bootstrapFlowGraph('yields4-withdraw', nodes, edges)
}
