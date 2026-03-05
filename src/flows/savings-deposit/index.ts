import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import Screen1_AmountEntry from './Screen1_AmountEntry'
import Screen2_Review from './Screen2_Review'
import Screen3_Processing from './Screen3_Processing'
import Screen4_Success from './Screen4_Success'

// ── Screen definitions ──

const screenDefs = [
  {
    id: 'savings-deposit-usd',
    title: 'Amount Entry – Card Balance',
    description: 'Amount entry for depositing with card balance (USD→USD). Has BottomSheet for switching payment method.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'StickyFooter', 'Button', 'BottomSheet', 'ListItem', 'Avatar', 'Badge', 'DataList', 'Banner', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
      { id: 'btn-mudar', component: 'Button', label: 'Mudar' },
      { id: 'li-saldo', component: 'ListItem', label: 'Saldo do Cartão' },
      { id: 'li-pix', component: 'ListItem', label: 'Real Brasileiro' },
      { id: 'li-ach', component: 'ListItem', label: 'ACH' },
    ],
    states: [
      { id: 'default', name: 'Card Balance', description: 'Default USD→USD via card balance', isDefault: true, data: { initialMethod: 'card-balance' } },
      { id: 'pix', name: 'PIX', description: 'BRL→USD via PIX', data: { initialMethod: 'pix' } },
    ],
  },
  {
    id: 'savings-deposit-pix',
    title: 'Amount Entry – PIX',
    description: 'Amount entry for depositing via PIX (BRL→USD). Direct entry for users without card balance.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'Divider', 'StickyFooter', 'Button', 'BottomSheet', 'ListItem', 'Avatar', 'Badge', 'DataList', 'Banner', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
      { id: 'btn-mudar', component: 'Button', label: 'Mudar' },
    ],
    states: [
      { id: 'default', name: 'PIX', description: 'BRL→USD via PIX', isDefault: true, data: { initialMethod: 'pix' } },
    ],
  },
  {
    id: 'savings-deposit-ach',
    title: 'Amount Entry – ACH',
    description: 'Amount entry for depositing via ACH (USD→USD). Requires Noah registration.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'StickyFooter', 'Button', 'BottomSheet', 'ListItem', 'Avatar', 'Badge', 'DataList', 'Banner', 'DataListSkeleton', 'BannerSkeleton'],
    component: Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'default', name: 'ACH', description: 'USD→USD via ACH transfer', isDefault: true, data: { initialMethod: 'ach' } },
    ],
  },
  {
    id: 'savings-deposit-review',
    title: 'Deposit Review',
    description: 'Review deposit details before confirming. Two DataList sections (operation details + yield info), neutral banner about yield, "Confirmar depósito" CTA.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Button', 'TextInput', 'DataList', 'GroupHeader', 'Text'],
    component: Screen2_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar depósito' },
    ],
  },
  {
    id: 'savings-deposit-processing',
    title: 'Processing',
    description: 'Animated loading with deposit step messages. Adapts messages per payment method.',
    componentsUsed: ['LoadingScreen'],
    component: Screen3_Processing,
    states: [
      { id: 'default', name: 'Card Balance', description: 'Processing card balance deposit', isDefault: true, data: { paymentMethod: 'card-balance' } },
      { id: 'pix', name: 'PIX', description: 'Processing PIX deposit with FX conversion', data: { paymentMethod: 'pix' } },
      { id: 'ach', name: 'ACH', description: 'Processing ACH deposit via Noah', data: { paymentMethod: 'ach' } },
    ],
  },
  {
    id: 'savings-deposit-success',
    title: 'Deposit Success',
    description: 'Deposit confirmed with transaction summary and yield projection.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Button', 'DataList', 'Banner', 'GroupHeader', 'Text'],
    component: Screen4_Success,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
  },
]

// ── Register pages ──

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Savings',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

// ── Register flow ──

registerFlow({
  id: 'savings-deposit',
  name: 'Savings Deposit',
  description: 'Deposit into USD savings account. Supports card balance (USD→USD), PIX (BRL→USD), and ACH (requires Noah). Decision-based entry: card balance holders see method selector, others go to PIX directly.',
  domain: 'savings',
  level: 2,
  linkedFlows: ['noah-registration', 'savings-manage'],
  entryPoints: ['savings-hub', 'dashboard-shortcut'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow graph ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Entry decision
    { id: 'n-decision-balance', type: 'decision', position: { x, y: 0 },
      data: { label: 'Tem saldo no cartão?', screenId: null, nodeType: 'decision',
              description: 'Verifica se o usuário tem saldo disponível no cartão em dólar' } as FlowNodeData },

    // Row 1: Two entry screens
    { id: 'n-amount-usd', type: 'screen', position: { x: xL, y: ROW },
      data: { label: 'Amount Entry (Card)', screenId: 'savings-deposit-usd', nodeType: 'screen',
              pageId: 'savings-deposit-usd', description: 'USD→USD via card balance, with method selector BottomSheet' } as FlowNodeData },
    { id: 'n-amount-pix', type: 'screen', position: { x: xR, y: ROW },
      data: { label: 'Amount Entry (PIX)', screenId: 'savings-deposit-pix', nodeType: 'screen',
              pageId: 'savings-deposit-pix', description: 'BRL→USD via PIX, direct entry without card balance' } as FlowNodeData },

    // Row 2: Tap Mudar → opens BottomSheet
    { id: 'n-tap-mudar', type: 'action', position: { x: xL - 200, y: ROW * 2 },
      data: { label: 'Tap Mudar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Mudar' } as FlowNodeData },

    // Row 3: Method selector overlay
    { id: 'n-method-sheet', type: 'overlay', position: { x: xL - 200, y: ROW * 3 },
      data: { label: 'Método de depósito', screenId: null, nodeType: 'overlay',
              overlayType: 'bottom-sheet', parentScreenNodeId: 'n-amount-usd',
              description: 'Choose deposit method: Saldo do Cartão or Real Brasileiro (via PIX)',
              interactiveElements: [
                { id: 'li-card', component: 'ListItem', label: 'Saldo do Cartão' },
                { id: 'li-pix', component: 'ListItem', label: 'Real Brasileiro' },
              ] } as FlowNodeData },

    // Row 4: Noah reference (for ACH requirement)
    { id: 'n-ref-noah', type: 'flow-reference', position: { x: xL - 200, y: ROW * 4.5 },
      data: { label: 'Noah Registration', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'noah-registration', description: 'Required for ACH deposits' } as FlowNodeData },

    // Row 3: Continuar actions from both paths
    { id: 'n-tap-continuar-usd', type: 'action', position: { x: xL, y: ROW * 3 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tap-continuar-pix', type: 'action', position: { x: xR, y: ROW * 3 },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },

    // Row 5: Review screen (merge point)
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Deposit Review', screenId: 'savings-deposit-review', nodeType: 'screen',
              pageId: 'savings-deposit-review', description: 'Review amount, method, fees before confirming' } as FlowNodeData },

    // Row 6: Confirm action
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 6 },
      data: { label: 'Tap Confirmar depósito', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar depósito' } as FlowNodeData },

    // Row 7: API call
    { id: 'n-api-deposit', type: 'api-call', position: { x, y: ROW * 7 },
      data: { label: 'Process Deposit', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/savings/deposit',
              description: 'Submit deposit order to backend' } as FlowNodeData },

    // Row 8: Processing screen
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Processing', screenId: 'savings-deposit-processing', nodeType: 'screen',
              pageId: 'savings-deposit-processing', description: 'Animated loading with step messages' } as FlowNodeData },

    // Row 9: Success screen
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 9 },
      data: { label: 'Deposit Success', screenId: 'savings-deposit-success', nodeType: 'screen',
              pageId: 'savings-deposit-success', description: 'Deposit confirmed with summary' } as FlowNodeData },

    // Row 10: Tap Entendi → back to savings hub
    { id: 'n-tap-entendi', type: 'action', position: { x, y: ROW * 10 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },

    // Row 11: Flow reference → savings-manage
    { id: 'n-ref-savings', type: 'flow-reference', position: { x, y: ROW * 11 },
      data: { label: 'Savings Hub', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-manage', description: 'Return to savings hub after successful deposit' } as FlowNodeData },

    // Note: ACH requirement
    { id: 'n-note-ach', type: 'note', position: { x: xL - 200, y: ROW * 5.5 },
      data: { label: 'ACH Requirement', screenId: null, nodeType: 'note',
              description: 'ACH option in the BottomSheet is disabled with "Indisponível" badge if user has no Noah registration. Selecting it does nothing.' } as FlowNodeData },
  ]

  const edges = [
    // Decision branches
    { id: 'e-1', source: 'n-decision-balance', target: 'n-amount-usd', sourceHandle: 'left-source', targetHandle: 'top', label: 'Sim' },
    { id: 'e-2', source: 'n-decision-balance', target: 'n-amount-pix', sourceHandle: 'right-source', targetHandle: 'top', label: 'Não' },

    // USD screen → BottomSheet
    { id: 'e-3', source: 'n-amount-usd', target: 'n-tap-mudar', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-4', source: 'n-tap-mudar', target: 'n-method-sheet', sourceHandle: 'bottom', targetHandle: 'top' },

    // Overlay → Noah reference
    { id: 'e-ref-noah', source: 'n-method-sheet', target: 'n-ref-noah', sourceHandle: 'bottom', targetHandle: 'top' },

    // USD screen → Continuar
    { id: 'e-5', source: 'n-amount-usd', target: 'n-tap-continuar-usd', sourceHandle: 'bottom', targetHandle: 'top' },

    // PIX screen → Continuar
    { id: 'e-6', source: 'n-amount-pix', target: 'n-tap-continuar-pix', sourceHandle: 'bottom', targetHandle: 'top' },

    // Both Continuar → Review
    { id: 'e-7', source: 'n-tap-continuar-usd', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'left-target' },
    { id: 'e-8', source: 'n-tap-continuar-pix', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'right-target' },

    // Review → Confirm → API → Processing → Success
    { id: 'e-9', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-confirmar', target: 'n-api-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-api-deposit', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },

    // Success → Entendi → Savings Hub
    { id: 'e-13', source: 'n-success', target: 'n-tap-entendi', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-14', source: 'n-tap-entendi', target: 'n-ref-savings', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  // One-time migration: clear stale graph previously force-written with saveFlowGraph
  try {
    const STORAGE_KEY = 'picnic-design-lab:flow-graphs'
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const graphs = JSON.parse(raw)
      if (graphs['savings-deposit'] && !graphs['savings-deposit'].nodes?.some((n: { id: string }) => n.id === 'n-tap-entendi')) {
        delete graphs['savings-deposit']
        localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs))
      }
    }
  } catch { /* ignore */ }

  bootstrapFlowGraph('savings-deposit', nodes, edges)
}
