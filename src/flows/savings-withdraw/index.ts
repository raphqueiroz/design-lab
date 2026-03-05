import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_AmountEntry from './Screen1_AmountEntry'
import Screen2_Review from './Screen2_Review'
import Screen3_Processing from './Screen3_Processing'
import Screen4_Success from './Screen4_Success'

// ── Step 1: Screen defs ──

const screenDefs = [
  {
    id: 'savings-withdraw-amount',
    title: 'Withdraw – Amount',
    description: 'Currency input for savings withdrawal amount with balance display and destination info.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'StickyFooter', 'Button', 'Stack'],
    component: Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'savings-withdraw-review',
    title: 'Withdraw – Review',
    description: 'Confirmation screen showing withdrawal details before executing.',
    componentsUsed: ['BaseLayout', 'Header', 'Text', 'GroupHeader', 'DataList', 'StickyFooter', 'Button', 'Stack'],
    component: Screen2_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar resgate' },
    ],
  },
  {
    id: 'savings-withdraw-processing',
    title: 'Withdraw – Processing',
    description: 'Loading screen with processing steps while withdrawal executes.',
    componentsUsed: ['LoadingScreen'],
    component: Screen3_Processing,
  },
  {
    id: 'savings-withdraw-success',
    title: 'Withdraw – Success',
    description: 'Withdrawal confirmation with transaction summary.',
    componentsUsed: ['FeedbackLayout', 'Text', 'GroupHeader', 'DataList', 'StickyFooter', 'Button', 'Stack'],
    component: Screen4_Success,
  },
]

// ── Step 2: Register pages ──

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Savings',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

// ── Step 3: Register flow ──

registerFlow({
  id: 'savings-withdraw',
  name: 'Savings Withdraw',
  description: 'Withdraw savings back to card balance: enter amount, review, process, confirm.',
  domain: 'savings',
  level: 2,
  parentFlowId: 'savings-manage',
  entryPoints: ['savings-hub'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Step 4: Flow graph (linear spine) ──

{
  const ROW = 120
  const x = 300

  const nodes = [
    // Row 0: Amount entry
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Amount Entry', screenId: 'savings-withdraw-amount', nodeType: 'screen',
              pageId: 'savings-withdraw-amount', description: 'Enter withdrawal amount' } as FlowNodeData },

    // Row 1: Tap Continuar
    { id: 'n-tap-continuar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },

    // Row 2: Review
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'savings-withdraw-review', nodeType: 'screen',
              pageId: 'savings-withdraw-review', description: 'Confirm withdrawal details' } as FlowNodeData },

    // Row 3: Tap Confirmar
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },

    // Row 4: API call
    { id: 'n-api-withdraw', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Execute Withdrawal', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/savings/withdraw',
              description: 'Redeem savings position and credit card balance' } as FlowNodeData },

    // Row 5: Processing
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'savings-withdraw-processing', nodeType: 'screen',
              pageId: 'savings-withdraw-processing', description: 'Processing withdrawal animation' } as FlowNodeData },

    // Row 6: Success
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'savings-withdraw-success', nodeType: 'screen',
              pageId: 'savings-withdraw-success', description: 'Withdrawal confirmed' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-amount', target: 'n-tap-continuar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-continuar', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-confirmar', target: 'n-api-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-api-withdraw', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('savings-withdraw', nodes, edges)
}
