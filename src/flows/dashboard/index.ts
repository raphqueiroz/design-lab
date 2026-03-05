import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import Screen1_Dashboard from './Screen1_Dashboard'

const screenDefs = [
  {
    id: 'dashboard-main',
    title: 'Dashboard',
    description: 'Main home screen showing balance card, quick actions, promo carousel, pending tasks, and transaction history.',
    componentsUsed: [
      'BaseLayout', 'Stack', 'Text', 'Avatar', 'Badge', 'IconButton',
      'ListItem', 'Card', 'BottomSheet', 'GroupHeader', 'Button', 'ShortcutButton',
    ],
    component: Screen1_Dashboard,
    states: [
      { id: 'default', name: 'Default', isDefault: true, data: {} },
      { id: 'hidden', name: 'Hidden Values', data: { valuesHidden: true } },
      { id: 'pending-task', name: 'Pending Task', data: { hasPendingTask: true } },
      { id: 'updating', name: 'Balance Updating', data: { balanceUpdating: true } },
    ],
    interactiveElements: [
      { id: 'btn-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'btn-receive', component: 'ShortcutButton', label: 'Receber' },
      { id: 'btn-toggle-values', component: 'IconButton', label: 'Mostrar/Ocultar' },
      { id: 'li-pending-tasks', component: 'ListItem', label: 'Tarefas pendentes' },
      { id: 'li-netflix', component: 'ListItem', label: 'Netflix' },
    ],
  },
]

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Dashboard',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    states: [...s.states],
  })
}

registerFlow({
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Main home screen with balance overview, quick actions, promotions, and transaction history.',
  domain: 'dashboard',
  level: 1,
  linkedFlows: ['deposit-pix-v2', 'perks-benefits', 'caixinha-dolar', 'caixinha-deposit', 'caixinha-withdraw'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap graph: dashboard hub with all linked flow connections
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Dashboard screen
    { id: 'n-dashboard', type: 'screen', position: { x, y: 0 }, data: { label: 'Dashboard', screenId: 'dashboard-main', nodeType: 'screen', pageId: 'dashboard-main' } as FlowNodeData },

    // Row 1: Action nodes for quick actions
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-receive', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Receber', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Receber' } as FlowNodeData },
    { id: 'n-tap-caixinha', type: 'action', position: { x: xR, y: ROW }, data: { label: 'Tap Caixinha do Dólar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Card: Caixinha do Dólar' } as FlowNodeData },

    // Row 2: Flow reference nodes
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 2 }, data: { label: 'Deposit via PIX', screenId: null, nodeType: 'flow-reference', targetFlowId: 'deposit-pix-v2' } as FlowNodeData },
    { id: 'n-ref-perks', type: 'flow-reference', position: { x, y: ROW * 2 }, data: { label: 'Perks & Benefits', screenId: null, nodeType: 'flow-reference', targetFlowId: 'perks-benefits' } as FlowNodeData },
    { id: 'n-ref-caixinha', type: 'flow-reference', position: { x: xR, y: ROW * 2 }, data: { label: 'Caixinha do Dólar', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-dolar' } as FlowNodeData },

    // Row 3: Pending task overlay
    { id: 'n-pending-sheet', type: 'overlay', position: { x: xL, y: ROW * 3 }, data: { label: 'Pending Tasks', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-dashboard', description: 'Shows pending tasks like KYC verification' } as FlowNodeData },
  ]

  const edges = [
    // Dashboard → action nodes
    { id: 'e-1', source: 'n-dashboard', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-dashboard', target: 'n-tap-receive', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-dashboard', target: 'n-tap-caixinha', sourceHandle: 'right-source', targetHandle: 'left-target' },
    // Action → flow references
    { id: 'e-4', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-receive', target: 'n-ref-perks', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-caixinha', target: 'n-ref-caixinha', sourceHandle: 'bottom', targetHandle: 'top' },
    // Pending tasks overlay
    { id: 'e-pending', source: 'n-dashboard', target: 'n-pending-sheet', sourceHandle: 'left-source', targetHandle: 'right-target' },
  ]

  bootstrapFlowGraph('dashboard', nodes, edges)
}
