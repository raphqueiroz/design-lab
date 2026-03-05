import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// ── Screen imports ──
import Screen1_Intro from './Screen1_Intro'
import Screen2_Coverage from './Screen2_Coverage'
import Screen3_Hub from './Screen3_Hub'
import Screen4_DepositAmount from './Screen4_DepositAmount'
import Screen5_DepositReview from './Screen5_DepositReview'
import SharedProcessing from './shared/SharedProcessing'
import Screen7_DepositSuccess from './Screen7_DepositSuccess'
import Screen8_WithdrawAmount from './Screen8_WithdrawAmount'
import Screen9_WithdrawReview from './Screen9_WithdrawReview'
import Screen10_WithdrawSuccess from './Screen10_WithdrawSuccess'

/* ═══════════════════════════════════════════════════════
 * FLOW 1: Main Yields2 — Intro → Coverage → Hub
 * "Trust-First" approach: insurance front and center
 * ═══════════════════════════════════════════════════════ */

const mainScreenDefs = [
  {
    id: 'yields2-intro',
    title: 'Feature Intro',
    description: 'FeatureLayout intro with insured yield value prop, ~4.16% APY badge, and benefits summary.',
    componentsUsed: ['FeatureLayout', 'StickyFooter', 'Stack', 'Button', 'Text', 'Badge', 'Summary'],
    component: Screen1_Intro,
    interactiveElements: [
      { id: 'btn-activate', component: 'Button', label: 'Ativar' },
    ],
  },
  {
    id: 'yields2-coverage',
    title: 'Coverage Detail',
    description: 'Insurance coverage breakdown: covered/not-covered lists, provider details, auto-activation.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'ListItem', 'Avatar', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen2_Coverage,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi, ativar' },
    ],
  },
  {
    id: 'yields2-hub',
    title: 'Insured Yield Hub',
    description: 'Balance hero with "Protegido" badge, yield chart, rate breakdown with insurance line items.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'ShortcutButton', 'Badge', 'Amount', 'DataList', 'Banner', 'LineChart', 'Text'],
    component: Screen3_Hub,
    states: [
      { id: 'default', name: 'Has balance', isDefault: true, data: {} },
      { id: 'new-user', name: 'New user', data: { isNewUser: true } },
    ],
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 2: Yields2 Deposit
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const depositScreenDefs = [
  {
    id: 'yields2-deposit-amount',
    title: 'Deposit Amount',
    description: 'Currency entry with funding source selector, async calc with insurance fee breakdown.',
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
    id: 'yields2-deposit-review',
    title: 'Deposit Review',
    description: 'Review with insurance section: gross, insurance cost, net yield, monthly/annual estimates.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen5_DepositReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar' },
    ],
  },
  {
    id: 'yields2-deposit-processing',
    title: 'Processing (Deposit)',
    description: 'Animated loading with deposit + insurance activation steps.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields2-deposit-success',
    title: 'Deposit Success',
    description: 'FeedbackLayout with "Protegido" badge, coverage summary, and navigation options.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'Badge', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen7_DepositSuccess,
    interactiveElements: [
      { id: 'btn-view', component: 'Button', label: 'Ver rendimentos' },
      { id: 'btn-home', component: 'Button', label: 'Início' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 3: Yields2 Withdraw
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const withdrawScreenDefs = [
  {
    id: 'yields2-withdraw-amount',
    title: 'Withdraw Amount',
    description: 'Withdrawal amount entry with quick-pick buttons and tax info.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'DataList', 'StickyFooter'],
    component: Screen8_WithdrawAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'yields2-withdraw-review',
    title: 'Withdraw Review',
    description: 'Review withdrawal with tax breakdown: gains, IR 15%, estimated tax, net amount.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen9_WithdrawReview,
  },
  {
    id: 'yields2-withdraw-processing',
    title: 'Processing (Withdraw)',
    description: 'Animated loading with withdrawal step messages.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields2-withdraw-success',
    title: 'Withdraw Success',
    description: 'Withdrawal confirmed with transaction summary and IR retained.',
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
  id: 'yields2',
  name: 'Yields2 — Trust-First',
  description: 'Insured yield (sDAI on Gnosis via OpenCover/Nexus Mutual). Dedicated intro + coverage screens before activation. ~4.16% net APY.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['yields2-deposit', 'yields2-withdraw'],
  screens: mainScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields2-deposit',
  name: 'Yields2 — Deposit',
  description: 'Deposit into insured yield: amount with insurance fee breakdown → review → processing → success.',
  domain: 'earn',
  level: 2,

  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields2-withdraw',
  name: 'Yields2 — Withdraw',
  description: 'Withdraw from insured yield: amount → tax review → processing → success.',
  domain: 'earn',
  level: 2,

  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════
// GRAPH 1: Yields2 Main — Intro → Coverage → Hub → sub-flows
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Intro
    { id: 'n-intro', type: 'screen', position: { x, y: 0 },
      data: { label: 'Feature Intro', screenId: 'yields2-intro', nodeType: 'screen', pageId: 'yields2-intro', description: 'FeatureLayout with insured yield value prop' } as FlowNodeData },
    // Row 1: Tap Ativar
    { id: 'n-tap-ativar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Ativar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ativar' } as FlowNodeData },
    // Row 2: Coverage
    { id: 'n-coverage', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Coverage Detail', screenId: 'yields2-coverage', nodeType: 'screen', pageId: 'yields2-coverage', description: 'Covered/not-covered lists, provider details' } as FlowNodeData },
    // Row 3: Tap Entendi
    { id: 'n-tap-entendi', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Entendi, ativar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi, ativar' } as FlowNodeData },
    // Row 4: API activate
    { id: 'n-api-activate', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Activate Insured Yield', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/activate', description: 'Enable sDAI allocation with OpenCover insurance' } as FlowNodeData },
    // Row 5: Hub
    { id: 'n-hub', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Insured Yield Hub', screenId: 'yields2-hub', nodeType: 'screen', pageId: 'yields2-hub', description: 'Balance hero, yield chart, rate breakdown with insurance' } as FlowNodeData },
    // Row 6: Action nodes for deposit/withdraw
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW * 6 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-withdraw', type: 'action', position: { x: xR, y: ROW * 6 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    // Row 7: Flow references
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 7 },
      data: { label: 'Yields2 Deposit', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields2-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 7 },
      data: { label: 'Yields2 Withdraw', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields2-withdraw' } as FlowNodeData },
    // Note
    { id: 'n-note-product', type: 'note', position: { x: xR, y: 0 },
      data: { label: 'Product Details', screenId: null, nodeType: 'note', description: 'sDAI on Gnosis Chain. Gross APY 4.86%, insurance cost 0.70% (OpenCover/Nexus Mutual), net ~4.16%.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-intro', target: 'n-tap-ativar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-ativar', target: 'n-coverage', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-coverage', target: 'n-tap-entendi', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-entendi', target: 'n-api-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-api-activate', target: 'n-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-hub', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-7', source: 'n-hub', target: 'n-tap-withdraw', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-8', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('yields2', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 2: Yields2 Deposit — Amount → Review → Processing → Success
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Deposit Amount', screenId: 'yields2-deposit-amount', nodeType: 'screen', pageId: 'yields2-deposit-amount', description: 'Currency entry with insurance fee breakdown' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Yield + Insurance', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/calculate', description: 'Calculate gross yield, insurance cost, net yield, monthly estimate' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Deposit Review', screenId: 'yields2-deposit-review', nodeType: 'screen', pageId: 'yields2-deposit-review', description: 'Review with insurance section and yield breakdown' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/deposit', description: 'Allocate funds to sDAI vault with insurance' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields2-deposit-processing', nodeType: 'screen', pageId: 'yields2-deposit-processing', description: 'Loading with deposit + insurance activation steps' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll deposit status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for sDAI allocation confirmation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Deposit Success', screenId: 'yields2-deposit-success', nodeType: 'screen', pageId: 'yields2-deposit-success', description: 'FeedbackLayout with Protegido badge and coverage summary' } as FlowNodeData },
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

  bootstrapFlowGraph('yields2-deposit', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 3: Yields2 Withdraw — Amount → Review → Processing → Success
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Withdraw Amount', screenId: 'yields2-withdraw-amount', nodeType: 'screen', pageId: 'yields2-withdraw-amount', description: 'Amount entry with quick picks and tax info' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Tax & Net', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw/calculate', description: 'Calculate IR withholding, gains, and net redemption amount' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Withdraw Review', screenId: 'yields2-withdraw-review', nodeType: 'screen', pageId: 'yields2-withdraw-review', description: 'Tax breakdown with gains, IR 15%, estimated tax, net' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw', description: 'Redeem sDAI, apply IR withholding, credit USD balance' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields2-withdraw-processing', nodeType: 'screen', pageId: 'yields2-withdraw-processing', description: 'Animated loading with withdrawal steps' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll withdraw status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for withdrawal confirmation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Withdraw Success', screenId: 'yields2-withdraw-success', nodeType: 'screen', pageId: 'yields2-withdraw-success', description: 'Withdrawal confirmed with IR retained summary' } as FlowNodeData },
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

  bootstrapFlowGraph('yields2-withdraw', nodes, edges)
}
