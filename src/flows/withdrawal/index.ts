import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'

// Shared screens
import SharedProcessing from './shared/SharedProcessing'
import SharedSuccess from './shared/SharedSuccess'

// Version A screens
import A_Screen1_ChooseDestination from './version-a/A_Screen1_ChooseDestination'
import A_Screen2_ChooseRecipient from './version-a/A_Screen2_ChooseRecipient'
import A_Screen3_Amount from './version-a/A_Screen3_Amount'
import A_Screen4_Review from './version-a/A_Screen4_Review'

// Version B screens
import B_Screen1_Amount from './version-b/B_Screen1_Amount'
import B_Screen2_Recipient from './version-b/B_Screen2_Recipient'
import B_Screen3_Review from './version-b/B_Screen3_Review'

// Version C screens
import C_Screen1_Withdraw from './version-c/C_Screen1_Withdraw'

/* ─── Screen definitions ─── */

const sharedScreenDefs = [
  {
    id: 'withdrawal-processing',
    title: 'Processing',
    description: 'Animated loading with withdrawal-specific step messages.',
    componentsUsed: ['LoadingScreen'],
    component: SharedProcessing,
  },
  {
    id: 'withdrawal-success',
    title: 'Success',
    description: 'Withdrawal confirmed with recipient summary and transaction details.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: SharedSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Concluir' },
    ],
  },
] as const

const versionAScreenDefs = [
  {
    id: 'withdrawal-a-choose-destination',
    title: 'Choose Destination',
    description: 'Select withdrawal destination type: PIX, Picnic account, Picnic user, or foreign bank.',
    componentsUsed: ['BaseLayout', 'Header', 'ListItem', 'Avatar', 'Text', 'Stack'],
    component: A_Screen1_ChooseDestination,
    interactiveElements: [
      { id: 'li-pix', component: 'ListItem', label: 'PIX' },
      { id: 'li-picnic-account', component: 'ListItem', label: 'Conta Picnic' },
      { id: 'li-picnic-user', component: 'ListItem', label: 'Usuário Picnic' },
      { id: 'li-foreign-bank', component: 'ListItem', label: 'Banco internacional' },
    ],
  },
  {
    id: 'withdrawal-a-choose-recipient',
    title: 'Choose Recipient',
    description: 'Search and select from saved recipients or add a new one.',
    componentsUsed: ['BaseLayout', 'Header', 'SearchBar', 'ListItem', 'Avatar', 'Stack'],
    component: A_Screen2_ChooseRecipient,
    interactiveElements: [
      { id: 'search-recipient', component: 'SearchBar', label: 'Buscar destinatário' },
      { id: 'li-recipient', component: 'ListItem', label: 'Destinatário salvo' },
    ],
  },
  {
    id: 'withdrawal-a-amount',
    title: 'Amount',
    description: 'Enter withdrawal amount in USD with automatic BRL conversion and fee breakdown.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'DataListSkeleton', 'Button', 'StickyFooter'],
    component: A_Screen3_Amount,
    interactiveElements: [
      { id: 'input-amount', component: 'CurrencyInput', label: 'Valor (USD)' },
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'withdrawal-a-review',
    title: 'Review',
    description: 'Review withdrawal details with recipient, amounts, fees, and delivery estimate.',
    componentsUsed: ['BaseLayout', 'Header', 'ListItem', 'Avatar', 'DataList', 'Banner', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'],
    component: A_Screen4_Review,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar saque' },
    ],
  },
] as const

const versionBScreenDefs = [
  {
    id: 'withdrawal-b-amount',
    title: 'Amount',
    description: 'Bi-directional currency input with destination type selector via BottomSheet.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'Divider', 'ListItem', 'Avatar', 'DataList', 'Banner', 'DataListSkeleton', 'BannerSkeleton', 'BottomSheet', 'Button', 'StickyFooter', 'Stack'],
    component: B_Screen1_Amount,
    interactiveElements: [
      { id: 'input-usd', component: 'CurrencyInput', label: 'Envie (USD)' },
      { id: 'input-brl', component: 'CurrencyInput', label: 'Receba (BRL)' },
      { id: 'btn-change-dest', component: 'Button', label: 'Mudar' },
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'withdrawal-b-recipient',
    title: 'Recipient',
    description: 'Search and select from saved recipients or add a new one.',
    componentsUsed: ['BaseLayout', 'Header', 'SearchBar', 'ListItem', 'Avatar', 'Stack'],
    component: B_Screen2_Recipient,
    interactiveElements: [
      { id: 'search-recipient', component: 'SearchBar', label: 'Buscar destinatário' },
      { id: 'li-recipient', component: 'ListItem', label: 'Destinatário salvo' },
    ],
  },
  {
    id: 'withdrawal-b-review',
    title: 'Review',
    description: 'Review withdrawal details with recipient, amounts, fees, and delivery estimate.',
    componentsUsed: ['BaseLayout', 'Header', 'ListItem', 'Avatar', 'DataList', 'Banner', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'],
    component: B_Screen3_Review,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar saque' },
    ],
  },
] as const

const versionCScreenDefs = [
  {
    id: 'withdrawal-c-withdraw',
    title: 'Withdraw',
    description: 'All-in-one withdrawal screen with destination, recipient, amount, and fees. Uses BottomSheets for selections.',
    componentsUsed: ['BaseLayout', 'Header', 'ListItem', 'Avatar', 'CurrencyInput', 'Divider', 'DataList', 'Banner', 'DataListSkeleton', 'BannerSkeleton', 'SearchBar', 'BottomSheet', 'Button', 'StickyFooter', 'Stack'],
    component: C_Screen1_Withdraw,
    interactiveElements: [
      { id: 'li-destination', component: 'ListItem', label: 'Destino' },
      { id: 'li-recipient', component: 'ListItem', label: 'Destinatário' },
      { id: 'input-amount', component: 'CurrencyInput', label: 'Valor (USD)' },
      { id: 'btn-confirm', component: 'Button', label: 'Sacar' },
    ],
  },
] as const

/* ─── Register individual pages ─── */

const allScreenDefs = [
  ...versionAScreenDefs,
  ...versionBScreenDefs,
  ...versionCScreenDefs,
  ...sharedScreenDefs,
]

for (const s of allScreenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Withdrawals',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

/* ─── Register single unified withdrawal flow ─── */

const allScreens = [...allScreenDefs].map((s) => ({ ...s, pageId: s.id }))

registerFlow({
  id: 'withdrawal',
  name: 'Withdrawal',
  description: 'Withdrawal flow with multiple exploration versions: A (destination first), B (amount first), C (compact).',
  domain: 'send-funds',
  level: 2,
  entryPoints: ['dashboard-send', 'quick-action'],
  screens: allScreens,
})

/* ─── Bootstrap main flow graph + exploration versions ─── */

const FLOW_ID = 'withdrawal'
const ROW = 120
const x = 300
const xR = 600

// ── Version A graph: Destination First ──
// ChooseDestination → (select) → ChooseRecipient → (select) → Amount → (tap Continuar) → Review → (tap Confirmar) → api-call → Processing → (result) → Success
function buildVersionAGraph() {
  const nodes = [
    { id: 'n-destination', type: 'screen', position: { x, y: 0 }, data: { label: 'Choose Destination', screenId: 'withdrawal-a-choose-destination', nodeType: 'screen', pageId: 'withdrawal-a-choose-destination', description: 'Select withdrawal destination type' } as FlowNodeData },
    { id: 'n-tap-pix', type: 'action', position: { x, y: ROW }, data: { label: 'Select PIX', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: PIX' } as FlowNodeData },
    { id: 'n-recipient', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Choose Recipient', screenId: 'withdrawal-a-choose-recipient', nodeType: 'screen', pageId: 'withdrawal-a-choose-recipient', description: 'Search and select from saved recipients' } as FlowNodeData },
    { id: 'n-tap-recipient', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Select recipient', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Destinatário salvo' } as FlowNodeData },
    { id: 'n-amount', type: 'screen', position: { x, y: ROW * 4 }, data: { label: 'Amount', screenId: 'withdrawal-a-amount', nodeType: 'screen', pageId: 'withdrawal-a-amount', description: 'Enter withdrawal amount in USD' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 6 }, data: { label: 'Review', screenId: 'withdrawal-a-review', nodeType: 'screen', pageId: 'withdrawal-a-review', description: 'Review withdrawal details' } as FlowNodeData },
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 7 }, data: { label: 'Tap Confirmar saque', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar saque' } as FlowNodeData },
    { id: 'n-api-withdraw', type: 'api-call', position: { x, y: ROW * 8 }, data: { label: 'Process Withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/withdrawal/execute', description: 'Submit withdrawal to payment processor' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 9 }, data: { label: 'Processing', screenId: 'withdrawal-processing', nodeType: 'screen', pageId: 'withdrawal-processing' } as FlowNodeData },
    { id: 'n-result', type: 'decision', position: { x, y: ROW * 10 }, data: { label: 'Withdrawal result?', screenId: null, nodeType: 'decision', description: 'Check if withdrawal was processed successfully' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 11 }, data: { label: 'Success', screenId: 'withdrawal-success', nodeType: 'screen', pageId: 'withdrawal-success' } as FlowNodeData },
    { id: 'n-error', type: 'error', position: { x: xR, y: ROW * 10 }, data: { label: 'Withdrawal Failed', screenId: null, nodeType: 'error', description: 'Insufficient balance, network error, or compliance block' } as FlowNodeData },
  ]
  const edges = [
    { id: 'e-1', source: 'n-destination', target: 'n-tap-pix', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-pix', target: 'n-recipient', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-recipient', target: 'n-tap-recipient', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-recipient', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-amount', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-continue', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-confirm', target: 'n-api-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-api-withdraw', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-processing', target: 'n-result', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-result', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top', label: 'Success' },
    { id: 'e-12', source: 'n-result', target: 'n-error', sourceHandle: 'right-source', targetHandle: 'left-target', label: 'Failed' },
  ]
  return { nodes, edges }
}

// ── Save main flow graph (Version A as default) ──
{
  const graphA = buildVersionAGraph()
  bootstrapFlowGraph(FLOW_ID, graphA.nodes, graphA.edges)
}

