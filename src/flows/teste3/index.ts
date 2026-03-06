import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_NewScreen from './Screen1_NewScreen'
import Screen3_NewScreen from './Screen3_NewScreen'
import Screen4_NewScreen from './Screen4_NewScreen'
import Screen5_Processing from './Screen5_Processing'
import Screen6_Success from './Screen6_Success'

const screenDefs = [
  {
    id: 'screen-1772804298368',
    title: 'Investimentos',
    description: 'Dashboard de acompanhamento de investimentos com gráficos. Dois estados: sem investimentos (empty) e com investimentos (invested).',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Card', 'Amount', 'LineChart', 'SegmentedControl', 'GroupHeader', 'ListItem', 'Avatar', 'Badge', 'EmptyState', 'Divider', 'Text'],
    component: Screen1_NewScreen,
    states: [
      { id: 'default', name: 'Sem investimentos', description: 'Usuário ainda não investiu', isDefault: true, data: {} },
      { id: 'invested', name: 'Com investimentos', description: 'Usuário já tem investimentos ativos', data: { hasInvestments: true } },
    ],
    interactiveElements: [
      { id: 'li-renda-protegida', component: 'ListItem', label: 'Renda Protegida' },
    ],
  },
  {
    id: 'screen-1772804352514',
    title: 'Detalhes do Investimento',
    description: 'Detalhes do produto de investimento. Dois estados: não investido (info + CTA) e investido (saldo + ações).',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Card', 'Amount', 'Badge', 'DataList', 'GroupHeader', 'Banner', 'Button', 'ShortcutButton', 'Divider', 'Text', 'StickyFooter'],
    component: Screen3_NewScreen,
    states: [
      { id: 'default', name: 'Não investido', description: 'Produto ainda não ativado', isDefault: true, data: {} },
      { id: 'invested', name: 'Investido', description: 'Usuário já investiu neste produto', data: { isInvested: true } },
    ],
    interactiveElements: [
      { id: 'btn-investir', component: 'Button', label: 'Investir' },
      { id: 'sb-depositar', component: 'ShortcutButton', label: 'Depositar' },
    ],
  },
  {
    id: 'screen-1772804781705',
    title: 'Investir',
    description: 'Entrada de valor com cálculo de rendimento estimado e confirmação.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'CurrencyInput', 'DataList', 'Banner', 'Button', 'Divider', 'StickyFooter'],
    component: Screen4_NewScreen,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar' },
    ],
  },
  {
    id: 'teste3-processing',
    title: 'Processing',
    description: 'Animated loading state while investment is processed.',
    componentsUsed: ['LoadingScreen'],
    component: Screen5_Processing,
  },
  {
    id: 'teste3-success',
    title: 'Investimento realizado',
    description: 'Confirmation screen with transaction summary.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'GroupHeader', 'Text', 'Stack', 'StickyFooter'],
    component: Screen6_Success,
    interactiveElements: [
      { id: 'btn-ver-investimentos', component: 'Button', label: 'Ver investimentos' },
    ],
  },
]

// Register each screen as a standalone page (with states when defined)
const seen = new Set<string>()
for (const s of screenDefs) {
  const pid = s.id
  if (seen.has(pid)) continue
  seen.add(pid)
  registerPage({
    id: pid,
    name: s.title,
    description: s.description,
    area: 'earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

registerFlow({
  id: 'teste3',
  name: 'Investimentos',
  description: 'Investment dashboard with product details, deposit flow, and confirmation.',
  domain: 'earn',
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap flow graph
{
  const nodes = [
    // Entry
    { id: 'entry', type: 'entry-point', position: { x: 300, y: 0 }, data: { label: 'Entry Point', screenId: null, nodeType: 'entry-point' } as FlowNodeData },

    // Screen 1: Dashboard
    { id: 'n-dashboard', type: 'screen', position: { x: 300, y: 120 }, data: { label: 'Investimentos', screenId: 'screen-1772804298368', nodeType: 'screen', description: 'Dashboard de investimentos com gráficos e lista de produtos' } as FlowNodeData },

    // Action: tap product
    { id: 'n-action-product', type: 'action', position: { x: 300, y: 280 }, data: { label: 'Tap Renda Protegida', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Renda Protegida' } as FlowNodeData },

    // Screen 2: Product detail
    { id: 'n-detail', type: 'screen', position: { x: 300, y: 420 }, data: { label: 'Detalhes do Investimento', screenId: 'screen-1772804352514', nodeType: 'screen', description: 'Detalhes do produto. Estado investido mostra saldo e ações; não investido mostra info e CTA.' } as FlowNodeData },

    // Action: invest button (not-invested state)
    { id: 'n-action-investir', type: 'action', position: { x: 180, y: 580 }, data: { label: 'Tap Investir', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Investir' } as FlowNodeData },

    // Action: deposit shortcut (invested state)
    { id: 'n-action-depositar', type: 'action', position: { x: 460, y: 580 }, data: { label: 'Tap Depositar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },

    // Screen 3: Amount entry
    { id: 'n-amount', type: 'screen', position: { x: 300, y: 720 }, data: { label: 'Investir', screenId: 'screen-1772804781705', nodeType: 'screen', description: 'Entrada de valor com cálculo de rendimento estimado' } as FlowNodeData },

    // Action: confirm
    { id: 'n-action-confirmar', type: 'action', position: { x: 300, y: 880 }, data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar' } as FlowNodeData },

    // API call
    { id: 'n-api-invest', type: 'api-call', position: { x: 300, y: 1020 }, data: { label: 'Create investment', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments' } as FlowNodeData },

    // Decision
    { id: 'n-decision', type: 'decision', position: { x: 300, y: 1160 }, data: { label: 'Success?', screenId: null, nodeType: 'decision', description: 'Did the investment succeed?' } as FlowNodeData },

    // Processing
    { id: 'n-processing', type: 'screen', position: { x: 180, y: 1320 }, data: { label: 'Processing', screenId: 'teste3-processing', nodeType: 'screen', description: 'Animated loading while investment is processed' } as FlowNodeData },

    // Success
    { id: 'n-success', type: 'screen', position: { x: 180, y: 1480 }, data: { label: 'Investimento realizado', screenId: 'teste3-success', nodeType: 'screen', description: 'Confirmation with transaction summary' } as FlowNodeData },

    // Error
    { id: 'n-error', type: 'error', position: { x: 500, y: 1320 }, data: { label: 'Investment failed', screenId: null, nodeType: 'error', description: 'Show error and return to amount entry' } as FlowNodeData },

    // Action: back to dashboard from success
    { id: 'n-action-ver', type: 'action', position: { x: 180, y: 1640 }, data: { label: 'Tap Ver investimentos', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver investimentos' } as FlowNodeData },
  ]

  const edges = [
    // Entry → Dashboard
    { id: 'e-entry', source: 'entry', target: 'n-dashboard', sourceHandle: 'bottom', targetHandle: 'top' },

    // Dashboard → action(product tap)
    { id: 'e-dash-product', source: 'n-dashboard', target: 'n-action-product', sourceHandle: 'bottom', targetHandle: 'top' },

    // Action → Detail
    { id: 'e-product-detail', source: 'n-action-product', target: 'n-detail', sourceHandle: 'bottom', targetHandle: 'top' },

    // Detail → action(investir) — not-invested path
    { id: 'e-detail-investir', source: 'n-detail', target: 'n-action-investir', sourceHandle: 'bottom', targetHandle: 'top' },

    // Detail → action(depositar) — invested path
    { id: 'e-detail-depositar', source: 'n-detail', target: 'n-action-depositar', sourceHandle: 'bottom', targetHandle: 'top' },

    // Both actions → Amount entry
    { id: 'e-investir-amount', source: 'n-action-investir', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-depositar-amount', source: 'n-action-depositar', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top' },

    // Amount → action(confirmar)
    { id: 'e-amount-confirmar', source: 'n-amount', target: 'n-action-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },

    // Confirm → API
    { id: 'e-confirmar-api', source: 'n-action-confirmar', target: 'n-api-invest', sourceHandle: 'bottom', targetHandle: 'top' },

    // API → Decision
    { id: 'e-api-decision', source: 'n-api-invest', target: 'n-decision', sourceHandle: 'bottom', targetHandle: 'top' },

    // Decision → Processing (success)
    { id: 'e-decision-processing', source: 'n-decision', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top', label: 'Yes' },

    // Decision → Error (failure)
    { id: 'e-decision-error', source: 'n-decision', target: 'n-error', sourceHandle: 'right', targetHandle: 'top', label: 'No' },

    // Processing → Success
    { id: 'e-processing-success', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },

    // Success → action(ver investimentos) → back to dashboard
    { id: 'e-success-ver', source: 'n-success', target: 'n-action-ver', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-ver-dashboard', source: 'n-action-ver', target: 'n-dashboard', sourceHandle: 'bottom', targetHandle: 'top' },

    // Error → back to amount
    { id: 'e-error-amount', source: 'n-error', target: 'n-amount', sourceHandle: 'left', targetHandle: 'right' },
  ]

  bootstrapFlowGraph('teste3', nodes, edges, 2)
}
