import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_FirstAccess from './Screen1_FirstAccess'

const screenDefs = [
  {
    id: 'noah-registration-first-access',
    title: 'First Access',
    description: 'Onboarding screen for US bank account feature powered by Noah/GnosisPay. Explains zero fees, transfer limits, and estimated timelines. User activates their USD account to receive ACH/Wire transfers.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Button', 'Badge', 'Banner', 'Summary', 'GroupHeader', 'Text', 'StickyFooter'],
    component: Screen1_FirstAccess,
    interactiveElements: [
      { id: 'btn-activate', component: 'Button', label: 'Ativar minha conta em USD' },
    ],
  },
]

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Transactions',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

registerFlow({
  id: 'noah-registration',
  name: 'Noah Registration',
  description: 'First-time activation of US bank account (Noah/GnosisPay). User learns about zero fees, ACH/Wire support, transfer limits, and activates their USD account through identity verification.',
  domain: 'add-funds',
  level: 2,
  linkedFlows: ['deposit-ach'],
  entryPoints: ['settings-bank-account', 'deposit-method-selector'],

  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap flow graph
{
  const ROW = 120
  const x = 300

  const nodes = [
    // Row 0: First Access screen
    { id: 'n-first-access', type: 'screen', position: { x, y: 0 }, data: { label: 'First Access', screenId: 'noah-registration-first-access', nodeType: 'screen', pageId: 'noah-registration-first-access', description: 'Onboarding screen for US bank account feature' } as FlowNodeData },
    // Row 1: Action — user taps activate
    { id: 'n-tap-activate', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Ativar minha conta em USD', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ativar minha conta em USD' } as FlowNodeData },
    // Row 2: Flow reference to deposit-ach
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x, y: ROW * 2 }, data: { label: 'Deposit via ACH/Wire', screenId: null, nodeType: 'flow-reference', targetFlowId: 'deposit-ach' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-first-access', target: 'n-tap-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-activate', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('noah-registration', nodes, edges)
}
