import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import A_Screen1_Hub from './version-a/A_Screen1_Hub'
import B_Screen1_Hub from './version-b/B_Screen1_Hub'
import C_Screen1_Hub from './version-c/C_Screen1_Hub'
import Screen2_InsurancePolicy from './Screen2_InsurancePolicy'

// ── Shared screen defs ──

const hubStates = [
  { id: 'default', name: 'Sem meta', description: 'No goal defined, details tab', isDefault: true, data: { tab: 0 } },
  { id: 'with-goal', name: 'Com meta', description: 'Goal defined, shows progress bar', data: { tab: 0, hasGoal: true } },
  { id: 'goal-reached', name: 'Meta atingida', description: 'Goal reached, 100% progress, success state', data: { tab: 0, hasGoal: true, goalReached: true } },
  { id: 'historico', name: 'Histórico', description: 'History tab active', data: { tab: 1 } },
]

const hubInteractiveElements = [
  { id: 'shortcut-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
  { id: 'shortcut-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
  { id: 'shortcut-criar-meta', component: 'ShortcutButton', label: 'Criar meta' },
  { id: 'shortcut-editar-meta', component: 'ShortcutButton', label: 'Editar meta' },
  { id: 'btn-apolice', component: 'Button', label: 'Ver apólice' },
]

const insuranceDef = {
  id: 'savings-manage-insurance',
  title: 'Insurance Policy',
  description: 'Insurance policy details for savings smart contract coverage.',
  componentsUsed: ['BaseLayout', 'Header', 'Banner', 'Summary', 'GroupHeader', 'DataList', 'Stack'],
  component: Screen2_InsurancePolicy,
}

// ── Version A: Line chart hub ──

const versionAScreens = [
  {
    id: 'savings-manage-a-hub',
    title: 'A: Hub (Chart)',
    description: 'Savings hub with interactive yield line chart, balance, shortcuts, tabs.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'ShortcutButton', 'SegmentedControl', 'ProgressBar', 'Stack', 'Text', 'GroupHeader', 'DataList', 'Banner'],
    component: A_Screen1_Hub,
    states: hubStates,
    interactiveElements: hubInteractiveElements,
  },
  insuranceDef,
]

// ── Version B: Image header hub ──

const versionBScreens = [
  {
    id: 'savings-manage-b-hub',
    title: 'B: Hub (Image)',
    description: 'Savings hub with hero image header, balance, shortcuts, tabs. No chart.',
    componentsUsed: ['BaseLayout', 'ShortcutButton', 'SegmentedControl', 'ProgressBar', 'Stack', 'Text', 'GroupHeader', 'DataList', 'Banner'],
    component: B_Screen1_Hub,
    states: hubStates,
    interactiveElements: hubInteractiveElements,
  },
  insuranceDef,
]

// ── Version C: Radial chart hub ──

const versionCScreens = [
  {
    id: 'savings-manage-c-hub',
    title: 'C: Hub (Radial)',
    description: 'Savings hub with animated radial progress ring for goal tracking.',
    componentsUsed: ['ShortcutButton', 'SegmentedControl', 'Stack', 'Text', 'DataList', 'Banner'],
    component: C_Screen1_Hub,
    states: hubStates,
    interactiveElements: hubInteractiveElements,
  },
  insuranceDef,
]

// ── Register pages ──

const allScreens = [...versionAScreens, ...versionBScreens, ...versionCScreens]
const seen = new Set<string>()
for (const s of allScreens) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Savings',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states as import('../../pages/gallery/pageRegistry').PageStateDefinition[] } : {}),
  })
}

// ── Register flows ──

registerFlow({
  id: 'savings-manage',
  name: 'Caixinha — A: Chart',
  description: 'Savings hub with interactive yield chart, balance display, deposit/withdraw shortcuts.',
  domain: 'savings',
  level: 1,
  linkedFlows: ['savings-withdraw', 'savings-deposit'],
  entryPoints: ['tab-bar', 'dashboard'],
  screens: [...versionAScreens, versionBScreens[0]].map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'savings-manage-b',
  name: 'Caixinha — B: Image',
  description: 'Savings hub with hero image header, no chart. Same actions and content as version A.',
  domain: 'savings',
  level: 1,
  linkedFlows: ['savings-withdraw', 'savings-deposit'],
  entryPoints: ['tab-bar', 'dashboard'],
  screens: versionBScreens.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow graph: Version A ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600
  const xFar = 900

  const nodes = [
    { id: 'n-hub', type: 'screen', position: { x, y: 0 },
      data: { label: 'Hub (Chart)', screenId: 'savings-manage-a-hub', nodeType: 'screen',
              pageId: 'savings-manage-a-hub', description: 'Savings hub with line chart' } as FlowNodeData },

    { id: 'n-tap-resgatar', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'n-tap-apolice', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'n-tap-adicionar', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'n-tap-criar-meta', type: 'action', position: { x: xFar, y: ROW },
      data: { label: 'Tap Criar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Criar meta' } as FlowNodeData },
    { id: 'n-tap-editar-meta', type: 'action', position: { x: xFar, y: ROW * 2 },
      data: { label: 'Tap Editar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Editar meta' } as FlowNodeData },

    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Savings Withdraw', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-withdraw' } as FlowNodeData },
    { id: 'n-insurance', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Insurance Policy', screenId: 'savings-manage-insurance', nodeType: 'screen',
              pageId: 'savings-manage-insurance', description: 'Insurance policy details' } as FlowNodeData },
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xR, y: ROW * 2 },
      data: { label: 'Savings Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-deposit' } as FlowNodeData },

    { id: 'n-note-goal', type: 'note', position: { x: xFar, y: ROW * 3 },
      data: { label: 'Goal Screen', screenId: null, nodeType: 'note',
              description: 'Future: goal creation/editing screen.' } as FlowNodeData },

    // Version B hub (alternate layout)
    { id: 'n-hub-b', type: 'screen', position: { x: -400, y: 0 },
      data: { label: 'Hub (Image)', screenId: 'savings-manage-b-hub', nodeType: 'screen',
              pageId: 'savings-manage-b-hub', description: 'Savings hub with hero image header' } as FlowNodeData },

    { id: 'n-note-alt', type: 'note', position: { x: -400, y: ROW },
      data: { label: 'Version B alternate', screenId: null, nodeType: 'note',
              description: 'Alternate hub layout with hero image instead of chart. Same actions and destinations.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-hub', target: 'n-tap-resgatar', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-hub', target: 'n-tap-apolice', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-hub', target: 'n-tap-adicionar', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-meta', source: 'n-hub', target: 'n-tap-criar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-editar', source: 'n-hub', target: 'n-tap-editar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-4', source: 'n-tap-resgatar', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-apolice', target: 'n-insurance', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-adicionar', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-meta-note', source: 'n-tap-criar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-editar-note', source: 'n-tap-editar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
    // Version B hub → note
    { id: 'e-hub-b-note', source: 'n-hub-b', target: 'n-note-alt', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('savings-manage', nodes, edges, 2)
}

// ── Register flow: Version C ──

registerFlow({
  id: 'savings-manage-c',
  name: 'Caixinha — C: Radial',
  description: 'Savings hub with animated radial progress ring for goal visualization.',
  domain: 'savings',
  level: 1,
  linkedFlows: ['savings-withdraw', 'savings-deposit'],
  entryPoints: ['tab-bar', 'dashboard'],
  screens: versionCScreens.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow graph: Version B (same structure, different hub screen ID) ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600
  const xFar = 900

  const nodes = [
    { id: 'n-hub', type: 'screen', position: { x, y: 0 },
      data: { label: 'Hub (Image)', screenId: 'savings-manage-b-hub', nodeType: 'screen',
              pageId: 'savings-manage-b-hub', description: 'Savings hub with hero image header' } as FlowNodeData },

    { id: 'n-tap-resgatar', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'n-tap-apolice', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'n-tap-adicionar', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'n-tap-criar-meta', type: 'action', position: { x: xFar, y: ROW },
      data: { label: 'Tap Criar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Criar meta' } as FlowNodeData },
    { id: 'n-tap-editar-meta', type: 'action', position: { x: xFar, y: ROW * 2 },
      data: { label: 'Tap Editar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Editar meta' } as FlowNodeData },

    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Savings Withdraw', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-withdraw' } as FlowNodeData },
    { id: 'n-insurance', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Insurance Policy', screenId: 'savings-manage-insurance', nodeType: 'screen',
              pageId: 'savings-manage-insurance', description: 'Insurance policy details' } as FlowNodeData },
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xR, y: ROW * 2 },
      data: { label: 'Savings Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-deposit' } as FlowNodeData },

    { id: 'n-note-goal', type: 'note', position: { x: xFar, y: ROW * 3 },
      data: { label: 'Goal Screen', screenId: null, nodeType: 'note',
              description: 'Future: goal creation/editing screen.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-hub', target: 'n-tap-resgatar', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-hub', target: 'n-tap-apolice', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-hub', target: 'n-tap-adicionar', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-meta', source: 'n-hub', target: 'n-tap-criar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-editar', source: 'n-hub', target: 'n-tap-editar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-4', source: 'n-tap-resgatar', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-apolice', target: 'n-insurance', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-adicionar', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-meta-note', source: 'n-tap-criar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-editar-note', source: 'n-tap-editar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('savings-manage-b', nodes, edges)
}

// ── Flow graph: Version C (radial chart) ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600
  const xFar = 900

  const nodes = [
    { id: 'n-hub', type: 'screen', position: { x, y: 0 },
      data: { label: 'Hub (Radial)', screenId: 'savings-manage-c-hub', nodeType: 'screen',
              pageId: 'savings-manage-c-hub', description: 'Savings hub with radial progress ring' } as FlowNodeData },

    { id: 'n-tap-resgatar', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'n-tap-apolice', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'n-tap-adicionar', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'n-tap-criar-meta', type: 'action', position: { x: xFar, y: ROW },
      data: { label: 'Tap Criar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Criar meta' } as FlowNodeData },
    { id: 'n-tap-editar-meta', type: 'action', position: { x: xFar, y: ROW * 2 },
      data: { label: 'Tap Editar meta', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Editar meta' } as FlowNodeData },

    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Savings Withdraw', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-withdraw' } as FlowNodeData },
    { id: 'n-insurance', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Insurance Policy', screenId: 'savings-manage-insurance', nodeType: 'screen',
              pageId: 'savings-manage-insurance', description: 'Insurance policy details' } as FlowNodeData },
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xR, y: ROW * 2 },
      data: { label: 'Savings Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'savings-deposit' } as FlowNodeData },

    { id: 'n-note-goal', type: 'note', position: { x: xFar, y: ROW * 3 },
      data: { label: 'Goal Screen', screenId: null, nodeType: 'note',
              description: 'Future: goal creation/editing bottom sheet.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-hub', target: 'n-tap-resgatar', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-hub', target: 'n-tap-apolice', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-hub', target: 'n-tap-adicionar', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-meta', source: 'n-hub', target: 'n-tap-criar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-hub-editar', source: 'n-hub', target: 'n-tap-editar-meta', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-4', source: 'n-tap-resgatar', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-apolice', target: 'n-insurance', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-adicionar', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-meta-note', source: 'n-tap-criar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-editar-note', source: 'n-tap-editar-meta', target: 'n-note-goal', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('savings-manage-c', nodes, edges)
}
