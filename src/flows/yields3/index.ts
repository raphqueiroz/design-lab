import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// ── Screen imports ──
import Screen1_Hub from './Screen1_Hub'
import Screen2_DepositAmount from './Screen2_DepositAmount'
import Screen3_DepositReview from './Screen3_DepositReview'
import SharedProcessing from '../yields2/shared/SharedProcessing'
import Screen5_DepositSuccess from './Screen5_DepositSuccess'
import Screen6_WithdrawAmount from './Screen6_WithdrawAmount'
import Screen7_WithdrawReview from './Screen7_WithdrawReview'
import Screen8_WithdrawSuccess from './Screen8_WithdrawSuccess'

/* ═══════════════════════════════════════════════════════
 * FLOW 1: Main Yields3 — Hub only (Minimalist)
 * Insurance in collapsible Banner + BottomSheet overlay
 * ═══════════════════════════════════════════════════════ */

const mainScreenDefs = [
  {
    id: 'yields3-hub',
    title: 'Minimalist Hub',
    description: 'Hub with balance hero, insurance Banner (collapsible), coverage BottomSheet. No intro screen.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'ShortcutButton', 'Badge', 'Amount', 'DataList', 'Banner', 'BottomSheet', 'ListItem', 'Avatar', 'GroupHeader', 'Text'],
    component: Screen1_Hub,
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 2: Yields3 Deposit
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const depositScreenDefs = [
  {
    id: 'yields3-deposit-amount',
    title: 'Deposit Amount',
    description: 'Simpler deposit: net yield with "incl. seguro" line, monthly est., fee.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'Button', 'CurrencyInput', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Divider', 'StickyFooter', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen2_DepositAmount,
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
    id: 'yields3-deposit-review',
    title: 'Deposit Review',
    description: 'Simpler review with Badge "Protegido por seguro" instead of full coverage Banner.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'Badge', 'DataList', 'GroupHeader', 'StickyFooter'],
    component: Screen3_DepositReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar' },
    ],
  },
  {
    id: 'yields3-deposit-processing',
    title: 'Processing (Deposit)',
    description: 'Animated loading with deposit steps.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields3-deposit-success',
    title: 'Deposit Success',
    description: 'Simpler success: confirmation DataList + Entendi button.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen5_DepositSuccess,
  },
]

/* ═══════════════════════════════════════════════════════
 * FLOW 3: Yields3 Withdraw
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const withdrawScreenDefs = [
  {
    id: 'yields3-withdraw-amount',
    title: 'Withdraw Amount',
    description: 'Withdrawal amount entry with quick-pick buttons and tax info.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'DataList', 'StickyFooter'],
    component: Screen6_WithdrawAmount,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'yields3-withdraw-review',
    title: 'Withdraw Review',
    description: 'Review withdrawal with tax breakdown.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: Screen7_WithdrawReview,
  },
  {
    id: 'yields3-withdraw-processing',
    title: 'Processing (Withdraw)',
    description: 'Animated loading with withdrawal steps.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'yields3-withdraw-success',
    title: 'Withdraw Success',
    description: 'Withdrawal confirmed with transaction summary.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen8_WithdrawSuccess,
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
  id: 'yields3',
  name: 'Yields3 — Minimalist',
  description: 'Insured yield (sDAI on Gnosis). Hub-only entry with insurance in collapsible Banner + BottomSheet. Faster activation, no dedicated intro.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['yields3-deposit', 'yields3-withdraw'],
  screens: mainScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields3-deposit',
  name: 'Yields3 — Deposit',
  description: 'Simpler deposit into insured yield: amount → review → processing → success.',
  domain: 'earn',
  level: 2,

  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'yields3-withdraw',
  name: 'Yields3 — Withdraw',
  description: 'Withdraw from insured yield: amount → tax review → processing → success.',
  domain: 'earn',
  level: 2,

  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════
// GRAPH 1: Yields3 Main — Hub → sub-flows
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Hub
    { id: 'n-hub', type: 'screen', position: { x, y: 0 },
      data: { label: 'Minimalist Hub', screenId: 'yields3-hub', nodeType: 'screen', pageId: 'yields3-hub', description: 'Balance hero, insurance Banner, coverage BottomSheet' } as FlowNodeData },
    // Row 1: Action nodes for deposit/withdraw
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-withdraw', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    // Row 2: Flow references
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Yields3 Deposit', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields3-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 2 },
      data: { label: 'Yields3 Withdraw', screenId: null, nodeType: 'flow-reference', targetFlowId: 'yields3-withdraw' } as FlowNodeData },
    // Coverage overlay (left)
    { id: 'n-coverage-sheet', type: 'overlay', position: { x: xL, y: 0 },
      data: { label: 'Coverage BottomSheet', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-hub', description: 'Full covered/not-covered lists with provider details' } as FlowNodeData },
    // Note (right)
    { id: 'n-note-product', type: 'note', position: { x: xR, y: 0 },
      data: { label: 'Minimalist Approach', screenId: null, nodeType: 'note', description: 'Insurance surfaced via collapsible Banner + BottomSheet overlay. No dedicated intro screen — faster activation.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-hub', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-hub', target: 'n-tap-withdraw', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-3', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-sheet', source: 'n-hub', target: 'n-coverage-sheet', sourceHandle: 'left-source', targetHandle: 'right-target' },
  ]

  bootstrapFlowGraph('yields3', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 2: Yields3 Deposit — Amount → Review → Processing → Success
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Deposit Amount', screenId: 'yields3-deposit-amount', nodeType: 'screen', pageId: 'yields3-deposit-amount', description: 'Simpler deposit with net yield "incl. seguro" line' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Yield', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/calculate', description: 'Calculate net yield including insurance' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Deposit Review', screenId: 'yields3-deposit-review', nodeType: 'screen', pageId: 'yields3-deposit-review', description: 'Simpler review with Badge instead of full coverage section' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/deposit', description: 'Allocate funds to sDAI vault' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields3-deposit-processing', nodeType: 'screen', pageId: 'yields3-deposit-processing', description: 'Loading with deposit steps' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll deposit status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for sDAI allocation confirmation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Deposit Success', screenId: 'yields3-deposit-success', nodeType: 'screen', pageId: 'yields3-deposit-success', description: 'Simpler confirmation with Entendi button' } as FlowNodeData },
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

  bootstrapFlowGraph('yields3-deposit', nodes, edges)
}

// ═══════════════════════════════════════════════════════
// GRAPH 3: Yields3 Withdraw — Amount → Review → Processing → Success
// ═══════════════════════════════════════════════════════
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Withdraw Amount', screenId: 'yields3-withdraw-amount', nodeType: 'screen', pageId: 'yields3-withdraw-amount', description: 'Amount entry with quick picks and tax info' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Tax & Net', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw/calculate', description: 'Calculate IR withholding and net redemption' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Withdraw Review', screenId: 'yields3-withdraw-review', nodeType: 'screen', pageId: 'yields3-withdraw-review', description: 'Tax breakdown with IR and net amount' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/yields/withdraw', description: 'Redeem sDAI, apply IR, credit USD' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'yields3-withdraw-processing', nodeType: 'screen', pageId: 'yields3-withdraw-processing', description: 'Loading with withdrawal steps' } as FlowNodeData },
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll withdraw status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for withdrawal confirmation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Withdraw Success', screenId: 'yields3-withdraw-success', nodeType: 'screen', pageId: 'yields3-withdraw-success', description: 'Withdrawal confirmed with IR retained' } as FlowNodeData },
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

  bootstrapFlowGraph('yields3-withdraw', nodes, edges)
}
