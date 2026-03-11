import { registerFlow } from '../../pages/simulator/flowRegistry'
import { saveFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '../../pages/simulator/flowGroupStore'
import { getDynamicFlow, saveDynamicFlow } from '../../pages/simulator/dynamicFlowStore'
import Screen1 from './Screen1_Screen'
import Screen2 from './Screen2_Screen'

// ── Screen Definitions ──

const screenDefs = [
  {
    id: 'referral-claim-a',
    title: 'Referral A — Value Proposition',
    description: 'Marketing landing page focused on zero-fees value proposition with email capture. Warm cream background, dark comparison card, feature list.',
    componentsUsed: ['BaseLayout', 'Text', 'Badge', 'Card', 'DataList', 'Stack', 'StickyFooter', 'Button', 'TextInput', 'GroupHeader', 'Avatar'],
    component: Screen1,
    interactiveElements: [
      { id: 'btn-claim', component: 'Button', label: 'Quero meu bônus de US$ 10' },
    ],
  },
  {
    id: 'referral-claim-b',
    title: 'Referral B — Reward First',
    description: 'Marketing landing page leading with the US$ 10 bonus reward. Bolder, more visual with numbered steps and feature pills.',
    componentsUsed: ['BaseLayout', 'Text', 'Badge', 'Card', 'Stack', 'StickyFooter', 'Button', 'Avatar'],
    component: Screen2,
    interactiveElements: [
      { id: 'btn-share', component: 'Button', label: 'Compartilhar convite' },
    ],
  },
]

// ── Register Pages ──

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Authentication',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

// ── Register Flow ──

registerFlow({
  id: 'referral',
  name: 'Referral Claim',
  description: 'Two visual variations of a referral claim landing page for new user acquisition.',
  domain: 'authentication',
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Patch dynamic store (user-created flow has 0 screens — add ours) ──

{
  const dynFlow = getDynamicFlow('referral')
  if (dynFlow && dynFlow.screens.length === 0) {
    saveDynamicFlow({
      ...dynFlow,
      screens: screenDefs.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        componentsUsed: s.componentsUsed,
        filePath: `referral/${s === screenDefs[0] ? 'Screen1_Screen' : 'Screen2_Screen'}.tsx`,
        pageId: s.id,
        interactiveElements: s.interactiveElements,
      })),
    })
  }
}

// ── Sidebar Group ──

const DOMAIN = 'authentication'
const GROUP_NAME = 'Referral'
const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
const group = existing ?? createGroup(GROUP_NAME, DOMAIN)
assignFlowToGroup('referral', group.id)

// ── Flow Graph ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Screen A
    { id: 'n-claim-a', type: 'screen', position: { x, y: 0 },
      data: { label: 'Referral A — Value Prop', screenId: 'referral-claim-a', nodeType: 'screen',
              pageId: 'referral-claim-a', description: 'Zero-fees focused landing with email capture' } as FlowNodeData },

    // Row 1: Action — user taps CTA on Screen A
    { id: 'n-tap-claim', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Claim Bonus', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Quero meu bônus de US$ 10' } as FlowNodeData },

    // Row 2: API call — submit email
    { id: 'n-api-claim', type: 'api-call', position: { x, y: ROW * 2 },
      data: { label: 'Submit Referral Claim', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/referral/claim',
              description: 'Submit email to claim referral bonus' } as FlowNodeData },

    // Row 3: Screen B
    { id: 'n-claim-b', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Referral B — Reward First', screenId: 'referral-claim-b', nodeType: 'screen',
              pageId: 'referral-claim-b', description: 'Reward-first landing with share CTA' } as FlowNodeData },

    // Row 4: Action — user taps share on Screen B
    { id: 'n-tap-share', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Share Invite', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Compartilhar convite' } as FlowNodeData },

    // Note (left column)
    { id: 'n-note', type: 'note', position: { x: xL, y: 0 },
      data: { label: 'Two Variations', screenId: null, nodeType: 'note',
              description: 'Screen A: value-prop focused with email capture. Screen B: reward-first with share CTA. Both are standalone landing pages.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-claim-a', target: 'n-tap-claim', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-claim', target: 'n-api-claim', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-claim', target: 'n-claim-b', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-claim-b', target: 'n-tap-share', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  saveFlowGraph('referral', nodes, edges)
}
