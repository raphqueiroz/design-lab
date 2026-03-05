import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// ── Shared screens ──
import SharedDepositAmount from './shared/SharedDepositAmount'
import SharedDepositReview from './shared/SharedDepositReview'
import SharedWithdrawAmount from './shared/SharedWithdrawAmount'
import SharedWithdrawReview from './shared/SharedWithdrawReview'
import SharedProcessing from './shared/SharedProcessing'
import SharedDepositSuccess from './shared/SharedDepositSuccess'
import SharedWithdrawSuccess from './shared/SharedWithdrawSuccess'

// ── Version A ──
import A_Screen1_Hub from './version-a/A_Screen1_Hub'

// ── Version B ──
import B_Screen1_Intro from './version-b/B_Screen1_Intro'
import B_Screen2_Hub from './version-b/B_Screen2_Hub'

// ── Version C ──
import C_Screen1_Portfolio from './version-c/C_Screen1_Portfolio'

// ── Version D ──
import D_Screen1_CaixinhaList from './version-d/D_Screen1_CaixinhaList'
import D_Screen2_CreateName from './version-d/D_Screen2_CreateName'
import D_Screen3_CreateGoal from './version-d/D_Screen3_CreateGoal'
import D_Screen4_CaixinhaDetail from './version-d/D_Screen4_CaixinhaDetail'

/* ═══════════════════════════════════════════════════════
 * FLOW 1: Deposit flow (shared, no versions)
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const depositScreenDefs = [
  {
    id: 'caixinha-deposit-amount',
    title: 'Deposit Amount',
    description: 'Currency entry with funding source selector, async calculation, and earnings projection.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'Button', 'CurrencyInput', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Text', 'Divider', 'StickyFooter', 'DataListSkeleton', 'BannerSkeleton'],
    component: SharedDepositAmount,
    states: [
      { id: 'default', name: 'Returning user', isDefault: true, data: {} },
      { id: 'new-user', name: 'First-time', data: { isNewUser: true } },
    ],
    interactiveElements: [
      { id: 'input-amount', component: 'CurrencyInput', label: 'Valor (USD)' },
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-deposit-review',
    title: 'Deposit Review',
    description: 'Review deposit amount, fee breakdown, and earnings projection before confirming.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: SharedDepositReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar depósito' },
    ],
  },
  {
    id: 'caixinha-deposit-processing',
    title: 'Processing (Deposit)',
    description: 'Animated loading with deposit step messages.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'caixinha-deposit-success',
    title: 'Deposit Success',
    description: 'Deposit confirmed with yield summary and navigation options.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'Banner', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: SharedDepositSuccess,
    interactiveElements: [
      { id: 'btn-view-earnings', component: 'Button', label: 'Ver meus rendimentos' },
      { id: 'btn-home', component: 'Button', label: 'Voltar ao início' },
    ],
  },
]

for (const s of depositScreenDefs) {
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

registerFlow({
  id: 'caixinha-deposit',
  name: 'Depositar',
  description: 'Deposit flow for Caixinha do Dólar: amount entry → review → processing → success.',
  domain: 'earn',
  level: 2,
  entryPoints: ['caixinha-hub'],

  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Deposit flow graph ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    // Row 0: Amount Entry
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Deposit Amount', screenId: 'caixinha-deposit-amount', nodeType: 'screen', pageId: 'caixinha-deposit-amount', description: 'Currency entry with funding source, async calculation, earnings projection' } as FlowNodeData },
    // Row 1: Tap Continuar
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    // Row 2: Calculate yield API
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Yield', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/calculate', description: 'Calculate projected yield at 5% APY on deposit amount' } as FlowNodeData },
    // Row 3: Review
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Deposit Review', screenId: 'caixinha-deposit-review', nodeType: 'screen', pageId: 'caixinha-deposit-review', description: 'Fee breakdown and earnings projection before confirming' } as FlowNodeData },
    // Row 4: Tap Confirmar
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar depósito', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar depósito' } as FlowNodeData },
    // Row 5: Submit deposit API
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/deposit', description: 'Create deposit order, move funds into yield vault' } as FlowNodeData },
    // Row 6: Processing
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'caixinha-deposit-processing', nodeType: 'screen', pageId: 'caixinha-deposit-processing', description: 'Animated loading with deposit step messages' } as FlowNodeData },
    // Row 7: Poll status
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll deposit status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for deposit confirmation from yield vault' } as FlowNodeData },
    // Row 8: Success
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Deposit Success', screenId: 'caixinha-deposit-success', nodeType: 'screen', pageId: 'caixinha-deposit-success', description: 'Deposit confirmed with yield summary' } as FlowNodeData },
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

  bootstrapFlowGraph('caixinha-deposit', nodes, edges)
}

/* ═══════════════════════════════════════════════════════
 * FLOW 2: Withdraw flow (shared, no versions)
 * Amount → Review → Processing → Success
 * ═══════════════════════════════════════════════════════ */

const withdrawScreenDefs = [
  {
    id: 'caixinha-withdraw-amount',
    title: 'Withdraw Amount',
    description: 'Withdrawal amount entry with pre-filled balance, quick-pick buttons, and tax info.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'DataList', 'StickyFooter'],
    component: SharedWithdrawAmount,
    interactiveElements: [
      { id: 'input-amount', component: 'CurrencyInput', label: 'Valor do resgate' },
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-withdraw-review',
    title: 'Withdraw Review',
    description: 'Review withdrawal details with tax breakdown before confirming.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter'],
    component: SharedWithdrawReview,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar resgate' },
    ],
  },
  {
    id: 'caixinha-withdraw-processing',
    title: 'Processing (Withdraw)',
    description: 'Animated loading with withdraw step messages.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'caixinha-withdraw-success',
    title: 'Withdraw Success',
    description: 'Withdrawal confirmed with transaction summary.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: SharedWithdrawSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Entendi' },
    ],
  },
]

for (const s of withdrawScreenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

registerFlow({
  id: 'caixinha-withdraw',
  name: 'Resgatar',
  description: 'Withdrawal flow for Caixinha do Dólar: amount → review → processing → success.',
  domain: 'earn',
  level: 2,
  entryPoints: ['caixinha-hub'],

  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Withdraw flow graph ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    // Row 0: Withdraw Amount
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Withdraw Amount', screenId: 'caixinha-withdraw-amount', nodeType: 'screen', pageId: 'caixinha-withdraw-amount', description: 'Amount entry with pre-filled balance and tax info' } as FlowNodeData },
    // Row 1: Tap Continuar
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    // Row 2: Calculate tax API
    { id: 'n-api-calc', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Calculate Tax & Net', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/withdraw/calculate', description: 'Calculate IOF, IR withholding, and net redemption amount' } as FlowNodeData },
    // Row 3: Review
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Withdraw Review', screenId: 'caixinha-withdraw-review', nodeType: 'screen', pageId: 'caixinha-withdraw-review', description: 'Tax breakdown and net amount before confirming' } as FlowNodeData },
    // Row 4: Tap Confirmar
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    // Row 5: Submit withdraw API
    { id: 'n-api-submit', type: 'api-call', position: { x, y: ROW * 5 },
      data: { label: 'Submit Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/earn/withdraw', description: 'Redeem from yield vault, apply tax withholding' } as FlowNodeData },
    // Row 6: Processing
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Processing', screenId: 'caixinha-withdraw-processing', nodeType: 'screen', pageId: 'caixinha-withdraw-processing', description: 'Animated loading with withdraw step messages' } as FlowNodeData },
    // Row 7: Poll status
    { id: 'n-poll', type: 'delay', position: { x, y: ROW * 7 },
      data: { label: 'Poll withdraw status', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'Wait for withdrawal confirmation' } as FlowNodeData },
    // Row 8: Success
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Withdraw Success', screenId: 'caixinha-withdraw-success', nodeType: 'screen', pageId: 'caixinha-withdraw-success', description: 'Withdrawal confirmed with transaction summary' } as FlowNodeData },
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

  bootstrapFlowGraph('caixinha-withdraw', nodes, edges)
}

/* ═══════════════════════════════════════════════════════
 * FLOW 3: Main Caixinha flow (versioned — entry screens only)
 * Each version has only its unique hub/entry screens.
 * Deposit & withdraw are linked flows.
 * ═══════════════════════════════════════════════════════ */

const versionAScreenDefs = [
  {
    id: 'caixinha-a-hub',
    title: 'Hub (A)',
    description: 'Minimalist hub with balance card, yield ticker, quick actions, chart, and inline deposit/withdraw BottomSheets.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'Button', 'CurrencyInput', 'ListItem', 'Avatar', 'DataList', 'Banner', 'LineChart', 'Text', 'Badge', 'Amount', 'ShortcutButton'],
    component: A_Screen1_Hub,
    states: [
      { id: 'default', name: 'Has balance', isDefault: true, data: {} },
      { id: 'new-user', name: 'New user', data: { isNewUser: true } },
    ],
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
] as const

const versionBScreenDefs = [
  {
    id: 'caixinha-b-intro',
    title: 'Feature Intro (B)',
    description: 'FeatureLayout introduction with hero image, benefits summary, tax info, and activation CTA.',
    componentsUsed: ['FeatureLayout', 'StickyFooter', 'Stack', 'Button', 'Text', 'Badge', 'Banner', 'Summary'],
    component: B_Screen1_Intro,
    interactiveElements: [
      { id: 'btn-activate', component: 'Button', label: 'Ativar Caixinha' },
    ],
  },
  {
    id: 'caixinha-b-hub',
    title: 'Hub (B)',
    description: 'Detailed hub with SegmentedControl tabs (Resumo/Histórico), balance, chart, metrics, and history.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'SegmentedControl', 'ShortcutButton', 'Badge', 'Amount', 'DataList', 'Banner', 'LineChart', 'Text', 'ListItem', 'Avatar', 'GroupHeader'],
    component: B_Screen2_Hub,
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'seg-tabs', component: 'SegmentedControl', label: 'Resumo / Histórico' },
    ],
  },
] as const

const versionCScreenDefs = [
  {
    id: 'caixinha-c-portfolio',
    title: 'Portfolio (C)',
    description: 'Multi-product portfolio with caixinha as one product. Detail BottomSheet with balance, metrics, and actions.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'BottomSheet', 'ShortcutButton', 'Amount', 'DataList', 'Banner', 'ListItem', 'Avatar', 'Badge', 'GroupHeader', 'Text'],
    component: C_Screen1_Portfolio,
    states: [
      { id: 'default', name: 'Active', isDefault: true, data: {} },
      { id: 'new-user', name: 'New user', data: { isNewUser: true } },
    ],
    interactiveElements: [
      { id: 'li-caixinha', component: 'ListItem', label: 'Caixinha do Dólar' },
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
] as const

const versionDScreenDefs = [
  {
    id: 'caixinha-d-list',
    title: 'Caixinha List (D)',
    description: 'List of user caixinhas with emoji, name, progress bar toward goal, and create new button.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Amount', 'Badge', 'Text', 'Card', 'ProgressBar'],
    component: D_Screen1_CaixinhaList,
    states: [
      { id: 'default', name: 'Has caixinhas', isDefault: true, data: {} },
      { id: 'new-user', name: 'Empty state', data: { isNewUser: true } },
    ],
    interactiveElements: [
      { id: 'btn-create', component: 'Button', label: 'Nova Caixinha' },
      { id: 'li-caixinha', component: 'Card', label: 'Caixinha item' },
    ],
  },
  {
    id: 'caixinha-d-create-name',
    title: 'Create — Name (D)',
    description: 'Choose emoji and name for a new caixinha. Live preview of emoji + name.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'TextInput', 'Text', 'StickyFooter'],
    component: D_Screen2_CreateName,
    interactiveElements: [
      { id: 'input-name', component: 'TextInput', label: 'Nome da caixinha' },
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-d-create-goal',
    title: 'Create — Goal (D)',
    description: 'Set target amount and time horizon for the caixinha. Shows monthly deposit suggestion.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'CurrencyInput', 'RadioGroup', 'DataList', 'Banner', 'Text', 'StickyFooter'],
    component: D_Screen3_CreateGoal,
    interactiveElements: [
      { id: 'input-target', component: 'CurrencyInput', label: 'Meta' },
      { id: 'radio-horizon', component: 'RadioGroup', label: 'Prazo' },
      { id: 'btn-create', component: 'Button', label: 'Criar Caixinha' },
    ],
  },
  {
    id: 'caixinha-d-detail',
    title: 'Caixinha Detail (D)',
    description: 'Per-caixinha detail: emoji hero, goal progress bar, balance, yield chart, deposit/withdraw actions.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'ShortcutButton', 'Amount', 'Badge', 'DataList', 'Banner', 'ProgressBar', 'LineChart', 'Text'],
    component: D_Screen4_CaixinhaDetail,
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-withdraw', component: 'ShortcutButton', label: 'Resgatar' },
    ],
  },
] as const

// Register all version-unique screens in the page gallery
const mainFlowScreenDefs = [
  ...versionAScreenDefs,
  ...versionBScreenDefs,
  ...versionCScreenDefs,
  ...versionDScreenDefs,
]

for (const s of mainFlowScreenDefs) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mainFlowScreens = [...mainFlowScreenDefs].map((s) => ({ ...s, pageId: s.id })) as any[]

registerFlow({
  id: 'caixinha-dolar',
  name: 'Caixinha do Dólar',
  description: 'Fixed 5% APY savings on idle USD balances. Four exploration versions: A (minimalist hub), B (trust-first intro), C (portfolio), D (multi-caixinha goals). Deposit and withdraw are separate linked flows.',
  domain: 'earn',
  level: 2,
  entryPoints: ['dashboard-earn', 'invest-tab'],
  linkedFlows: ['dashboard', 'caixinha-deposit', 'caixinha-withdraw'],
  screens: mainFlowScreens,
})

// ── Main flow graph: 4 version columns with shared deposit/withdraw references ──
{
  const ROW = 120
  // 4 columns for versions A–D, plus shared refs at bottom
  const xA = 0
  const xB = 300
  const xC = 600
  const xD = 900

  const nodes = [
    // ── Version A: Minimalist hub ──
    { id: 'n-note-a', type: 'note', position: { x: xA, y: 0 },
      data: { label: 'Version A', screenId: null, nodeType: 'note', description: 'Minimalist hub with balance card, yield ticker, quick actions, and inline deposit/withdraw BottomSheets.' } as FlowNodeData },
    { id: 'n-a-hub', type: 'screen', position: { x: xA, y: ROW },
      data: { label: 'Hub (A)', screenId: 'caixinha-a-hub', nodeType: 'screen', pageId: 'caixinha-a-hub', description: 'Balance card, yield ticker, chart, quick actions' } as FlowNodeData },
    { id: 'n-a-tap-deposit', type: 'action', position: { x: xA, y: ROW * 2 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-a-tap-withdraw', type: 'action', position: { x: xA, y: ROW * 3 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },

    // ── Version B: Trust-first intro → hub ──
    { id: 'n-note-b', type: 'note', position: { x: xB, y: 0 },
      data: { label: 'Version B', screenId: null, nodeType: 'note', description: 'Trust-first: FeatureLayout intro with benefits, then detailed hub with tabs (Resumo/Histórico).' } as FlowNodeData },
    { id: 'n-b-intro', type: 'screen', position: { x: xB, y: ROW },
      data: { label: 'Feature Intro (B)', screenId: 'caixinha-b-intro', nodeType: 'screen', pageId: 'caixinha-b-intro', description: 'Hero image, benefits summary, tax info, activation CTA' } as FlowNodeData },
    { id: 'n-b-tap-activate', type: 'action', position: { x: xB, y: ROW * 2 },
      data: { label: 'Tap Ativar Caixinha', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ativar Caixinha' } as FlowNodeData },
    { id: 'n-b-hub', type: 'screen', position: { x: xB, y: ROW * 3 },
      data: { label: 'Hub (B)', screenId: 'caixinha-b-hub', nodeType: 'screen', pageId: 'caixinha-b-hub', description: 'SegmentedControl tabs, balance, chart, metrics, history' } as FlowNodeData },
    { id: 'n-b-tap-deposit', type: 'action', position: { x: xB, y: ROW * 4 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-b-tap-withdraw', type: 'action', position: { x: xB, y: ROW * 5 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },

    // ── Version C: Portfolio view ──
    { id: 'n-note-c', type: 'note', position: { x: xC, y: 0 },
      data: { label: 'Version C', screenId: null, nodeType: 'note', description: 'Multi-product portfolio with caixinha as one product. Detail BottomSheet with balance, metrics, and actions.' } as FlowNodeData },
    { id: 'n-c-portfolio', type: 'screen', position: { x: xC, y: ROW },
      data: { label: 'Portfolio (C)', screenId: 'caixinha-c-portfolio', nodeType: 'screen', pageId: 'caixinha-c-portfolio', description: 'Multi-product portfolio, detail BottomSheet' } as FlowNodeData },
    { id: 'n-c-tap-deposit', type: 'action', position: { x: xC, y: ROW * 2 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-c-tap-withdraw', type: 'action', position: { x: xC, y: ROW * 3 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },

    // ── Version D: Multi-caixinha goals ──
    { id: 'n-note-d', type: 'note', position: { x: xD, y: 0 },
      data: { label: 'Version D', screenId: null, nodeType: 'note', description: 'Multi-caixinha with named goals, emoji, progress bars. Create flow + per-caixinha detail.' } as FlowNodeData },
    { id: 'n-d-list', type: 'screen', position: { x: xD, y: ROW },
      data: { label: 'Caixinha List (D)', screenId: 'caixinha-d-list', nodeType: 'screen', pageId: 'caixinha-d-list', description: 'List of caixinhas with progress toward goals' } as FlowNodeData },
    { id: 'n-d-tap-create', type: 'action', position: { x: xD, y: ROW * 2 },
      data: { label: 'Tap Nova Caixinha', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Nova Caixinha' } as FlowNodeData },
    { id: 'n-d-create-name', type: 'screen', position: { x: xD, y: ROW * 3 },
      data: { label: 'Create — Name (D)', screenId: 'caixinha-d-create-name', nodeType: 'screen', pageId: 'caixinha-d-create-name', description: 'Choose emoji and name for new caixinha' } as FlowNodeData },
    { id: 'n-d-tap-continue', type: 'action', position: { x: xD, y: ROW * 4 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-d-create-goal', type: 'screen', position: { x: xD, y: ROW * 5 },
      data: { label: 'Create — Goal (D)', screenId: 'caixinha-d-create-goal', nodeType: 'screen', pageId: 'caixinha-d-create-goal', description: 'Set target amount and time horizon' } as FlowNodeData },
    { id: 'n-d-tap-create-confirm', type: 'action', position: { x: xD, y: ROW * 6 },
      data: { label: 'Tap Criar Caixinha', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Criar Caixinha' } as FlowNodeData },
    { id: 'n-d-detail', type: 'screen', position: { x: xD, y: ROW * 7 },
      data: { label: 'Caixinha Detail (D)', screenId: 'caixinha-d-detail', nodeType: 'screen', pageId: 'caixinha-d-detail', description: 'Goal progress, balance, yield chart, deposit/withdraw' } as FlowNodeData },
    { id: 'n-d-tap-deposit', type: 'action', position: { x: xD, y: ROW * 8 },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-d-tap-withdraw', type: 'action', position: { x: xD, y: ROW * 9 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },

    // ── Shared flow references (bottom, centered) ──
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xA, y: ROW * 11 },
      data: { label: 'Depositar', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xC, y: ROW * 11 },
      data: { label: 'Resgatar', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-withdraw' } as FlowNodeData },
    { id: 'n-ref-dashboard', type: 'flow-reference', position: { x: xB, y: ROW * 12 },
      data: { label: 'Dashboard', screenId: null, nodeType: 'flow-reference', targetFlowId: 'dashboard' } as FlowNodeData },
  ]

  const edges = [
    // Version A: hub → deposit/withdraw
    { id: 'e-a1', source: 'n-a-hub', target: 'n-a-tap-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-a2', source: 'n-a-hub', target: 'n-a-tap-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-a3', source: 'n-a-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-a4', source: 'n-a-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },

    // Version B: intro → hub → deposit/withdraw
    { id: 'e-b1', source: 'n-b-intro', target: 'n-b-tap-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b2', source: 'n-b-tap-activate', target: 'n-b-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b3', source: 'n-b-hub', target: 'n-b-tap-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b4', source: 'n-b-hub', target: 'n-b-tap-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b5', source: 'n-b-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-b6', source: 'n-b-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },

    // Version C: portfolio → deposit/withdraw
    { id: 'e-c1', source: 'n-c-portfolio', target: 'n-c-tap-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c2', source: 'n-c-portfolio', target: 'n-c-tap-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c3', source: 'n-c-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c4', source: 'n-c-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },

    // Version D: list → create → detail → deposit/withdraw
    { id: 'e-d1', source: 'n-d-list', target: 'n-d-tap-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d2', source: 'n-d-tap-create', target: 'n-d-create-name', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d3', source: 'n-d-create-name', target: 'n-d-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d4', source: 'n-d-tap-continue', target: 'n-d-create-goal', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d5', source: 'n-d-create-goal', target: 'n-d-tap-create-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d6', source: 'n-d-tap-create-confirm', target: 'n-d-detail', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d7', source: 'n-d-detail', target: 'n-d-tap-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d8', source: 'n-d-detail', target: 'n-d-tap-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d9', source: 'n-d-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d10', source: 'n-d-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('caixinha-dolar', nodes, edges)
}

