import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import Screen1_Intro from './Screen1_Intro'
import Screen2_InsuranceAbout from './Screen2_InsuranceAbout'

// ── Screen definitions ──

const screenDefs = [
  {
    id: 'poupar-intro',
    title: 'Savings Intro',
    description: 'FeatureLayout introducing the yields feature. Highlights automatic earnings, instant withdrawal, and insurance protection with inline "Saiba mais" button to insurance details.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Button', 'Text', 'Badge', 'Summary', 'GroupHeader', 'Link'],
    component: Screen1_Intro,
    interactiveElements: [
      { id: 'btn-ativar', component: 'Button', label: 'Ativar rendimento' },
      { id: 'link-seguro', component: 'Link', label: 'Saiba mais' },
    ],
  },
  {
    id: 'poupar-insurance-about',
    title: 'Insurance Details',
    description: 'Detailed explanation of the OpenCover × Nexus Mutual vault cover. Shows covered events (smart contract bugs, oracle failures, liquidation failures, governance takeovers), coverage details, and exclusions.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Button', 'Banner', 'Summary', 'GroupHeader', 'DataList'],
    component: Screen2_InsuranceAbout,
  },
]

// ── Register pages ──

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'savings',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

// ── Register flow ──

registerFlow({
  id: 'flow-poupar',
  name: 'Savings Onboarding',
  description: 'Introduces the yields feature — automatic USD earnings with insurance protection. Two screens: feature intro and insurance details.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['savings-deposit'],
  entryPoints: ['dashboard', 'savings-hub'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow graph ──

{
  const ROW = 120
  const x = 300
  const xR = 600

  const nodes = [
    // Row 0: Intro screen
    { id: 'n-intro', type: 'screen', position: { x, y: 0 },
      data: { label: 'Savings Intro', screenId: 'poupar-intro', nodeType: 'screen',
              pageId: 'poupar-intro', description: 'FeatureLayout with yields overview and insurance link' } as FlowNodeData },

    // Row 1: Two action paths
    { id: 'n-tap-ativar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Ativar rendimento', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ativar rendimento' } as FlowNodeData },
    { id: 'n-tap-seguro', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Saiba mais', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Link: Saiba mais' } as FlowNodeData },

    // Row 2: Insurance screen (right branch)
    { id: 'n-insurance', type: 'screen', position: { x: xR, y: ROW * 2 },
      data: { label: 'Insurance Details', screenId: 'poupar-insurance-about', nodeType: 'screen',
              pageId: 'poupar-insurance-about', description: 'Detailed insurance coverage explanation' } as FlowNodeData },

    // Row 2: API call to activate (center)
    { id: 'n-api-activate', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Activate Yields', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/savings/activate',
              description: 'Enable automatic yield on user account' } as FlowNodeData },

    // Row 3: Flow reference to savings-deposit
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x, y: ROW * 3 },
      data: { label: 'Savings Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-deposit', description: 'Navigate to deposit flow after activation' } as FlowNodeData },
  ]

  const edges = [
    // Intro → Ativar
    { id: 'e-1', source: 'n-intro', target: 'n-tap-ativar', sourceHandle: 'bottom', targetHandle: 'top' },
    // Intro → Insurance link
    { id: 'e-2', source: 'n-intro', target: 'n-tap-seguro', sourceHandle: 'right-source', targetHandle: 'left-target' },
    // Insurance link → Insurance screen
    { id: 'e-3', source: 'n-tap-seguro', target: 'n-insurance', sourceHandle: 'bottom', targetHandle: 'top' },
    // Ativar → API
    { id: 'e-4', source: 'n-tap-ativar', target: 'n-api-activate', sourceHandle: 'bottom', targetHandle: 'top' },
    // API → Deposit flow
    { id: 'e-5', source: 'n-api-activate', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('flow-poupar', nodes, edges)
}
