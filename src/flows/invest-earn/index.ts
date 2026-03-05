import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_Offer from './Screen1_Offer'
import Screen2_Amount from './Screen2_Amount'
import Screen3_Review from './Screen3_Review'
import Screen4_Processing from './Screen4_Processing'
import Screen5_Success from './Screen5_Success'

const screenDefs = [
  {
    id: 'invest-earn-offer',
    title: 'Earn Offer',
    description: 'Landing screen presenting the 5% APY USD savings product with key details and fund protection info.',
    componentsUsed: ['BaseLayout', 'Header', 'Card', 'Button', 'Text', 'Amount', 'Banner', 'DataList', 'Badge', 'StickyFooter', 'Stack'],
    component: Screen1_Offer,
    states: [
      { id: 'default', name: 'New user', description: 'User has no existing balance', isDefault: true, data: { currentBalance: 0 } },
      { id: 'has-balance', name: 'Has balance', description: 'User already has funds earning yield', data: { currentBalance: 1243.57 } },
    ],
    interactiveElements: [
      { id: 'btn-invest', component: 'Button', label: 'Começar a investir' },
      { id: 'btn-add-more', component: 'Button', label: 'Adicionar mais' },
    ],
  },
  {
    id: 'invest-earn-amount',
    title: 'Amount Entry',
    description: 'USD amount input with funding source selector (USD balance or PIX deposit). Shows earnings projection after calculation.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'Button', 'Text', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Skeleton', 'BottomSheet', 'StickyFooter', 'Stack', 'Divider'],
    component: Screen2_Amount,
    states: [
      { id: 'default', name: 'Empty', description: 'No amount entered yet', isDefault: true, data: {} },
      { id: 'loading', name: 'Calculating', description: 'Amount entered, calculating yield projection', data: { initialAmount: '10000', initialCalcState: 'loading' } },
      { id: 'ready', name: 'Ready', description: 'Calculation complete, CTA enabled', data: { initialAmount: '10000', initialCalcState: 'ready' } },
      { id: 'error', name: 'Error', description: 'Amount below minimum or validation error', data: { initialAmount: '50', initialCalcState: 'error' } },
    ],
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
      { id: 'btn-change-source', component: 'Button', label: 'Mudar' },
      { id: 'input-amount', component: 'CurrencyInput', label: 'Valor (USD)' },
      { id: 'li-funding-source', component: 'ListItem', label: 'Fonte de recursos' },
    ],
  },
  {
    id: 'invest-earn-review',
    title: 'Review',
    description: 'Deposit confirmation screen with amount summary, fee breakdown, and earnings projection.',
    componentsUsed: ['BaseLayout', 'Header', 'Button', 'Text', 'Amount', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter', 'Stack'],
    component: Screen3_Review,
    interactiveElements: [
      { id: 'btn-confirm', component: 'Button', label: 'Confirmar depósito' },
    ],
  },
  {
    id: 'invest-earn-processing',
    title: 'Processing',
    description: 'Animated loading with deposit progress steps. Auto-advances after completion.',
    componentsUsed: ['LoadingScreen'],
    component: Screen4_Processing,
  },
  {
    id: 'invest-earn-success',
    title: 'Success',
    description: 'Deposit confirmed. Shows earning summary, next payout, and navigation options.',
    componentsUsed: ['FeedbackLayout', 'Button', 'Text', 'DataList', 'Banner', 'GroupHeader', 'StickyFooter', 'Stack'],
    component: Screen5_Success,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Concluir' },
      { id: 'btn-view-portfolio', component: 'Button', label: 'Ver portfólio' },
    ],
  },
]

// Register each screen as a standalone page (with states when defined)
for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...(s.states ? { states: s.states } : {}),
  })
}

registerFlow({
  id: 'invest-earn-5pct',
  name: 'USD Savings',
  description: 'Users deposit USD (from balance or via PIX) into a 5% APY savings product. No lock-up, daily interest accrual, instant withdrawals.',
  domain: 'earn',
  level: 2,
  entryPoints: ['deposit-success-nudge', 'dashboard-earn'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Bootstrap flow graph ──
{
  const ROW = 120
  const x = 300
  const xR = 600

  const nodes = [
    // Row 0: Offer screen
    { id: 'n-offer', type: 'screen', position: { x, y: 0 }, data: { label: 'Earn Offer', screenId: 'invest-earn-offer', nodeType: 'screen', pageId: 'invest-earn-offer', description: '5% APY USD savings product landing' } as FlowNodeData },

    // Row 1: Action — tap invest
    { id: 'n-tap-invest', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Começar a investir', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Começar a investir' } as FlowNodeData },

    // Row 2: Amount Entry
    { id: 'n-amount', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Amount Entry', screenId: 'invest-earn-amount', nodeType: 'screen', pageId: 'invest-earn-amount', description: 'USD amount input with funding source selector' } as FlowNodeData },

    // Row 2: Funding source overlay
    { id: 'n-funding-sheet', type: 'overlay', position: { x: xR, y: ROW * 2 }, data: { label: 'Funding Source', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-amount', description: 'Select funding source: USD balance or PIX deposit' } as FlowNodeData },

    // Row 3: Action — tap continue
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },

    // Row 4: Review
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 }, data: { label: 'Review', screenId: 'invest-earn-review', nodeType: 'screen', pageId: 'invest-earn-review', description: 'Deposit confirmation with fee breakdown' } as FlowNodeData },

    // Row 5: Action — tap confirm
    { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Confirmar depósito', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar depósito' } as FlowNodeData },

    // Row 6: Processing
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 6 }, data: { label: 'Processing', screenId: 'invest-earn-processing', nodeType: 'screen', pageId: 'invest-earn-processing', description: 'Animated loading with deposit progress' } as FlowNodeData },

    // Row 7: Success
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 7 }, data: { label: 'Success', screenId: 'invest-earn-success', nodeType: 'screen', pageId: 'invest-earn-success', description: 'Deposit confirmed with earning summary' } as FlowNodeData },
  ]

  const edges = [
    // Main spine
    { id: 'e-1', source: 'n-offer', target: 'n-tap-invest', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-invest', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-amount', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-continue', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-confirm', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    // Funding source overlay
    { id: 'e-funding', source: 'n-amount', target: 'n-funding-sheet', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('invest-earn-5pct', nodes, edges)
}
