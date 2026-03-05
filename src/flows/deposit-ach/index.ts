import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_AccountData from './Screen1_AccountData'
import Screen2_Success from './Screen2_Success'

const screenDefs = [
  {
    id: 'deposit-ach-account-data',
    title: 'Account Data',
    description: 'Bank account details for receiving USD via ACH or Wire. Includes routing number, account number, and bank address with copy actions. "Prazos, limites e taxas" opens a BottomSheet with fee/limit info. "Compartilhar" opens an iOS share sheet simulation.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'IconButton', 'ListItem', 'DataList', 'GroupHeader', 'Summary', 'Text', 'BottomSheet', 'StickyFooter', 'Toast'],
    component: Screen1_AccountData,
    interactiveElements: [
      { id: 'btn-share', component: 'Button', label: 'Compartilhar' },
      { id: 'btn-done', component: 'Button', label: 'Pronto' },
      { id: 'li-limits', component: 'ListItem', label: 'Prazos, limites e taxas' },
    ],
  },
  {
    id: 'deposit-ach-success',
    title: 'Awaiting Payment',
    description: 'Success/pending feedback screen shown after user confirms their bank details. Informs user that they will be notified when the deposit is recognized.',
    componentsUsed: ['FeedbackLayout', 'Stack', 'Button', 'Banner', 'Text', 'StickyFooter'],
    component: Screen2_Success,
    interactiveElements: [
      { id: 'btn-ok', component: 'Button', label: 'Entendi' },
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
  id: 'deposit-ach',
  name: 'Deposit via ACH/Wire',
  description: 'Receive USD into your Picnic account via ACH or Wire transfer. User views their US bank account details, can share them, and confirms when the transfer has been initiated. The deposit appears in the transaction log and a push notification is sent when recognized.',
  domain: 'add-funds',
  level: 2,
  linkedFlows: ['deposit-pix-v2'],
  entryPoints: ['deposit-pix-v2-payment-method'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap flow graph
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Account Data screen
    { id: 'n-account', type: 'screen', position: { x, y: 0 }, data: { label: 'Account Data', screenId: 'deposit-ach-account-data', nodeType: 'screen', pageId: 'deposit-ach-account-data', description: 'Bank account details for receiving USD via ACH/Wire' } as FlowNodeData },

    // Row 0.5: Overlays (left + right)
    { id: 'n-limits-sheet', type: 'overlay', position: { x: xL, y: ROW * 0.5 }, data: { label: 'Limits & Fees', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-account', description: 'Taxas, prazos estimados e limites de transferência' } as FlowNodeData },
    { id: 'n-share-sheet', type: 'overlay', position: { x: xR, y: ROW * 0.5 }, data: { label: 'iOS Share Sheet', screenId: null, nodeType: 'overlay', overlayType: 'dialog', parentScreenNodeId: 'n-account', description: 'Sistema iOS share dialog — compartilhar dados bancários' } as FlowNodeData },

    // Row 1: Action — user taps Pronto
    { id: 'n-tap-done', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Pronto', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Pronto' } as FlowNodeData },

    // Row 2: Success screen
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Awaiting Payment', screenId: 'deposit-ach-success', nodeType: 'screen', pageId: 'deposit-ach-success' } as FlowNodeData },

    // Row 3: Async wait
    { id: 'n-wait', type: 'delay', position: { x, y: ROW * 3 }, data: { label: 'Await bank transfer', screenId: null, nodeType: 'delay', delayType: 'webhook', delayDuration: '~1-3 days', description: 'Banking partner processes the incoming ACH/Wire transfer' } as FlowNodeData },

    // Row 4: Decision + note
    { id: 'n-recognized', type: 'decision', position: { x, y: ROW * 4 }, data: { label: 'Deposit recognized?', screenId: null, nodeType: 'decision', description: 'Banking partner confirms the incoming transfer' } as FlowNodeData },
    { id: 'n-note', type: 'note', position: { x: xL, y: ROW * 3.5 }, data: { label: 'Post-deposit', screenId: null, nodeType: 'note', description: 'When the deposit is recognized: appears in transaction log + push notification sent.' } as FlowNodeData },

    // Flow reference for linkedFlows
    { id: 'n-ref-deposit-pix', type: 'flow-reference', position: { x: xR, y: ROW * 4 }, data: { label: 'Deposit via PIX', screenId: null, nodeType: 'flow-reference', targetFlowId: 'deposit-pix-v2', description: 'Alternative deposit method' } as FlowNodeData },
  ]

  const edges = [
    // Overlays (horizontal from spine)
    { id: 'e-limits', source: 'n-account', target: 'n-limits-sheet', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-share', source: 'n-account', target: 'n-share-sheet', sourceHandle: 'right-source', targetHandle: 'left-target' },
    // Main spine
    { id: 'e-done', source: 'n-account', target: 'n-tap-done', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-to-success', source: 'n-tap-done', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-to-wait', source: 'n-success', target: 'n-wait', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-to-check', source: 'n-wait', target: 'n-recognized', sourceHandle: 'bottom', targetHandle: 'top' },
    // Flow reference (branch from decision)
    { id: 'e-ref-pix', source: 'n-recognized', target: 'n-ref-deposit-pix', sourceHandle: 'right-source', targetHandle: 'left-target', label: 'Switch to PIX' },
  ]

  bootstrapFlowGraph('deposit-ach', nodes, edges)
}
