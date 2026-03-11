import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '../../pages/simulator/flowGroupStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'

// ── Manage screens (version A) ──
import MVP_Screen1_Dashboard from './manage/Screen1_Dashboard'
import MVP_Screen2_Hub from './manage/Screen2_Hub'

// ── Manage screens (version B — visual) ──
import MVP_Screen1_Dashboard_B from './manage/Screen1_Dashboard_B'
import MVP_Screen2_Hub_B from './manage/Screen2_Hub_B'

// ── Reused screens from savings-reviewed ──
import InsuranceCard from '../savings-reviewed/manage/Screen3_InsuranceCard'
import Deposit_Screen1 from '../savings-reviewed/deposit/Screen1_AmountEntry'
import Deposit_Screen2 from '../savings-reviewed/deposit/Screen2_Review'
import Deposit_Screen3 from '../savings-reviewed/deposit/Screen3_Processing'
import Deposit_Screen4 from '../savings-reviewed/deposit/Screen4_Success'
import Withdraw_Screen1 from '../savings-reviewed/withdraw/Screen1_AmountEntry'
import Withdraw_Screen2 from '../savings-reviewed/withdraw/Screen2_Review'
import Withdraw_Screen3 from '../savings-reviewed/withdraw/Screen3_Processing'
import Withdraw_Screen4 from '../savings-reviewed/withdraw/Screen4_Success'

// ═══════════════════════════════════════════════════════════════
// 1. MANAGE FLOW (MVP)
// ═══════════════════════════════════════════════════════════════

const manageScreenDefs = [
  {
    id: 'caixinha-mvp-dashboard',
    title: 'MVP – Dashboard',
    description: 'Three pre-existing currency caixinhas. Only USD active, EUR/BRL disabled with "Em breve" tag.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Amount', 'Badge', 'GroupHeader', 'Banner', 'Text', 'Avatar'],
    component: MVP_Screen1_Dashboard,
    interactiveElements: [
      { id: 'cc-usd', component: 'CurrencyCard', label: 'Dólar americano' },
    ],
    states: [
      { id: 'default', name: 'Com saldo', description: 'USD caixinha has balance', isDefault: true, data: {} },
      { id: 'new-user', name: 'Novo usuário', description: 'All caixinhas zero balance', data: { hasBalance: false } },
    ],
  },
  {
    id: 'caixinha-mvp-hub',
    title: 'MVP – Hub (USD)',
    description: 'Dollar caixinha detail: chart, balance with yield arrow + BRL equivalent, deposit/withdraw shortcuts, tabs, insurance.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'ShortcutButton', 'SegmentedControl', 'DataList', 'Banner', 'Text', 'Stack'],
    component: MVP_Screen2_Hub,
    interactiveElements: [
      { id: 'sc-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
      { id: 'sc-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'btn-apolice', component: 'Button', label: 'Ver apólice' },
    ],
    states: [
      { id: 'default', name: 'Com saldo', description: 'Has balance, Details tab', isDefault: true, data: {} },
      { id: 'no-balance', name: 'Sem saldo', description: 'Zero balance, Resgatar disabled', data: { hasBalance: false } },
      { id: 'historico', name: 'Histórico', description: 'History tab active', data: { tab: 1 } },
    ],
  },
  {
    id: 'caixinha-mvp-insurance',
    title: 'MVP – Insurance Card',
    description: 'Nexus Mutual-style green certificate card with coverage details.',
    componentsUsed: ['BaseLayout', 'Header', 'InsurancePolicyCard', 'Summary', 'GroupHeader', 'DataList', 'Text', 'Stack'],
    component: InsuranceCard,
  },
]

// ═══════════════════════════════════════════════════════════════
// 1b. MANAGE FLOW — VERSION B (Visual)
// ═══════════════════════════════════════════════════════════════

const manageScreenDefs_B = [
  {
    id: 'caixinha-mvp-b-dashboard',
    title: 'MVP B – Dashboard (Visual)',
    description: 'Dark gradient canvas with glassmorphism currency cards, animated piggy hero, and oversized balance.',
    componentsUsed: ['Stack', 'Text', 'Badge', 'GlassCurrencyCard', 'InsurancePill', 'BalanceDisplay'],
    component: MVP_Screen1_Dashboard_B,
    interactiveElements: [
      { id: 'cc-usd', component: 'CurrencyCard', label: 'Dólar americano' },
    ],
    states: [
      { id: 'default', name: 'Com saldo', description: 'USD caixinha has balance', isDefault: true, data: {} },
      { id: 'new-user', name: 'Novo usuário', description: 'All caixinhas zero balance', data: { hasBalance: false } },
    ],
  },
  {
    id: 'caixinha-mvp-b-hub',
    title: 'MVP B – Hub (Visual)',
    description: 'Full-bleed gradient hero with chart flowing behind balance, circular FABs, pull-up white card.',
    componentsUsed: ['Stack', 'Text', 'Badge', 'LineChart', 'SegmentedControl', 'IconButton', 'BalanceDisplay'],
    component: MVP_Screen2_Hub_B,
    interactiveElements: [
      { id: 'sc-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
      { id: 'sc-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'btn-apolice', component: 'Button', label: 'Ver apólice' },
    ],
    states: [
      { id: 'default', name: 'Com saldo', description: 'Has USD balance', isDefault: true, data: {} },
      { id: 'new-user', name: 'Sem saldo', description: 'Zero balance, first visit', data: { hasBalance: false } },
    ],
  },
  {
    id: 'caixinha-mvp-insurance',
    title: 'MVP – Insurance Card',
    description: 'Nexus Mutual-style green certificate card with coverage details.',
    componentsUsed: ['BaseLayout', 'Header', 'InsurancePolicyCard', 'Summary', 'GroupHeader', 'DataList', 'Text', 'Stack'],
    component: InsuranceCard,
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. DEPOSIT FLOW (MVP — reuses reviewed screens, USD only)
// ═══════════════════════════════════════════════════════════════

const depositScreenDefs = [
  {
    id: 'caixinha-mvp-deposit-amount',
    title: 'MVP Deposit – Amount',
    description: 'USD amount entry with BRL equivalent and instant redemption callout.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Banner', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Deposit_Screen1,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-mvp-deposit-review',
    title: 'MVP Deposit – Review',
    description: 'Review deposit with instant redemption callout and insurance mention.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'Banner', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Deposit_Screen2,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar depósito' },
    ],
  },
  {
    id: 'caixinha-mvp-deposit-processing',
    title: 'MVP Deposit – Processing',
    description: 'Loading screen with deposit processing steps.',
    componentsUsed: ['LoadingScreen'],
    component: Deposit_Screen3,
  },
  {
    id: 'caixinha-mvp-deposit-success',
    title: 'MVP Deposit – Success',
    description: 'Deposit confirmed with USD summary and instant redemption.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Stack'],
    component: Deposit_Screen4,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 3. WITHDRAW FLOW (MVP — reuses reviewed screens, USD only)
// ═══════════════════════════════════════════════════════════════

const withdrawScreenDefs = [
  {
    id: 'caixinha-mvp-withdraw-amount',
    title: 'MVP Withdraw – Amount',
    description: 'USD withdrawal with instant redemption badge and BRL equivalent.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Badge', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Withdraw_Screen1,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-mvp-withdraw-review',
    title: 'MVP Withdraw – Review',
    description: 'Withdrawal review with "Prazo: Imediato" in green.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Withdraw_Screen2,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar resgate' },
    ],
  },
  {
    id: 'caixinha-mvp-withdraw-processing',
    title: 'MVP Withdraw – Processing',
    description: 'Loading screen with withdrawal processing steps.',
    componentsUsed: ['LoadingScreen'],
    component: Withdraw_Screen3,
  },
  {
    id: 'caixinha-mvp-withdraw-success',
    title: 'MVP Withdraw – Success',
    description: 'Withdrawal confirmed with USD summary.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'DataList', 'GroupHeader', 'Text', 'Stack'],
    component: Withdraw_Screen4,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGES (deduplicated)
// ═══════════════════════════════════════════════════════════════

const allScreenDefs = [...manageScreenDefs, ...manageScreenDefs_B, ...depositScreenDefs, ...withdrawScreenDefs]
const seen = new Set<string>()

for (const s of allScreenDefs) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && Array.isArray(s.states) ? { states: s.states } : {}),
  })
}

// ═══════════════════════════════════════════════════════════════
// REGISTER FLOWS
// ═══════════════════════════════════════════════════════════════

const FLOW_IDS = ['caixinha-mvp', 'caixinha-mvp-b', 'caixinha-mvp-deposit', 'caixinha-mvp-withdraw']

registerFlow({
  id: 'caixinha-mvp',
  name: 'Caixinha MVP',
  description: 'MVP savings: pre-existing USD/EUR/BRL caixinhas. Only USD active, others coming soon.',
  domain: 'earn',
  level: 1,
  screens: manageScreenDefs.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    componentsUsed: s.componentsUsed,
    component: s.component,
    ...(s.interactiveElements ? { interactiveElements: s.interactiveElements } : {}),
    ...('states' in s && Array.isArray(s.states) ? { states: s.states } : {}),
  })),
  linkedFlows: [
    'caixinha-mvp-deposit',
    'caixinha-mvp-withdraw',
  ],
})

registerFlow({
  id: 'caixinha-mvp-b',
  name: 'Caixinha MVP B (Visual)',
  description: 'Version B: dark gradient canvas, glassmorphism cards, animated chart hero, circular FABs.',
  domain: 'earn',
  level: 1,
  screens: manageScreenDefs_B.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    componentsUsed: s.componentsUsed,
    component: s.component,
    ...(s.interactiveElements ? { interactiveElements: s.interactiveElements } : {}),
    ...('states' in s && Array.isArray(s.states) ? { states: s.states } : {}),
  })),
  linkedFlows: [
    'caixinha-mvp-deposit',
    'caixinha-mvp-withdraw',
  ],
})

registerFlow({
  id: 'caixinha-mvp-deposit',
  name: 'Caixinha MVP Deposit',
  description: 'Deposit into USD caixinha: amount entry, review, processing, success.',
  domain: 'earn',
  level: 2,
  screens: depositScreenDefs.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    componentsUsed: s.componentsUsed,
    component: s.component,
    ...(s.interactiveElements ? { interactiveElements: s.interactiveElements } : {}),
  })),
  linkedFlows: [
    'caixinha-mvp',
  ],
})

registerFlow({
  id: 'caixinha-mvp-withdraw',
  name: 'Caixinha MVP Withdraw',
  description: 'Withdraw from USD caixinha: amount entry, review, processing, success.',
  domain: 'earn',
  screens: withdrawScreenDefs.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    componentsUsed: s.componentsUsed,
    component: s.component,
    ...(s.interactiveElements ? { interactiveElements: s.interactiveElements } : {}),
  })),
  linkedFlows: [
    'caixinha-mvp',
  ],
})

// ═══════════════════════════════════════════════════════════════
// FLOW GRAPHS
// ═══════════════════════════════════════════════════════════════

const ROW = 120
const xL = 0
const x = 300
const xR = 600

// ── Manage graph ──

bootstrapFlowGraph('caixinha-mvp',
  [
    // Column 1: Main path
    { id: 'screen-dashboard', type: 'screen', position: { x: xL, y: 0 }, data: { label: 'Dashboard', screenId: 'caixinha-mvp-dashboard', nodeType: 'screen', pageId: 'caixinha-mvp-dashboard' } as FlowNodeData },
    { id: 'action-tap-dolar', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap dólar card', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'CurrencyCard: Dólar americano' } as FlowNodeData },
    { id: 'screen-hub', type: 'screen', position: { x: xL, y: ROW * 2 }, data: { label: 'Hub (USD)', screenId: 'caixinha-mvp-hub', nodeType: 'screen', pageId: 'caixinha-mvp-hub' } as FlowNodeData },

    // Column 2: From hub → deposit
    { id: 'action-adicionar', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'ref-deposit', type: 'flow-reference', position: { x, y: ROW * 4 }, data: { label: 'Deposit flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp-deposit' } as FlowNodeData },

    // Column 3: From hub → withdraw
    { id: 'action-resgatar', type: 'action', position: { x: xR, y: ROW * 3 }, data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 4 }, data: { label: 'Withdraw flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp-withdraw' } as FlowNodeData },

    // From hub → insurance
    { id: 'action-apolice', type: 'action', position: { x: xL, y: ROW * 3 }, data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'screen-insurance', type: 'screen', position: { x: xL, y: ROW * 4 }, data: { label: 'Insurance Card', screenId: 'caixinha-mvp-insurance', nodeType: 'screen', pageId: 'caixinha-mvp-insurance' } as FlowNodeData },
  ],
  [
    { id: 'e-dash-tap', source: 'screen-dashboard', target: 'action-tap-dolar' },
    { id: 'e-tap-hub', source: 'action-tap-dolar', target: 'screen-hub' },
    { id: 'e-hub-adicionar', source: 'screen-hub', target: 'action-adicionar' },
    { id: 'e-adicionar-ref', source: 'action-adicionar', target: 'ref-deposit' },
    { id: 'e-hub-resgatar', source: 'screen-hub', target: 'action-resgatar' },
    { id: 'e-resgatar-ref', source: 'action-resgatar', target: 'ref-withdraw' },
    { id: 'e-hub-apolice', source: 'screen-hub', target: 'action-apolice' },
    { id: 'e-apolice-insurance', source: 'action-apolice', target: 'screen-insurance' },
  ],
  4,
)

// ── Manage graph (Version B) ──

bootstrapFlowGraph('caixinha-mvp-b',
  [
    { id: 'screen-dashboard', type: 'screen', position: { x: xL, y: 0 }, data: { label: 'Dashboard B', screenId: 'caixinha-mvp-b-dashboard', nodeType: 'screen', pageId: 'caixinha-mvp-b-dashboard' } as FlowNodeData },
    { id: 'action-tap-dolar', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap dólar card', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'CurrencyCard: Dólar americano' } as FlowNodeData },
    { id: 'screen-hub', type: 'screen', position: { x: xL, y: ROW * 2 }, data: { label: 'Hub B (USD)', screenId: 'caixinha-mvp-b-hub', nodeType: 'screen', pageId: 'caixinha-mvp-b-hub' } as FlowNodeData },

    { id: 'action-adicionar', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'ref-deposit', type: 'flow-reference', position: { x, y: ROW * 4 }, data: { label: 'Deposit flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp-deposit' } as FlowNodeData },

    { id: 'action-resgatar', type: 'action', position: { x: xR, y: ROW * 3 }, data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 4 }, data: { label: 'Withdraw flow', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp-withdraw' } as FlowNodeData },

    { id: 'action-apolice', type: 'action', position: { x: xL, y: ROW * 3 }, data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'screen-insurance', type: 'screen', position: { x: xL, y: ROW * 4 }, data: { label: 'Insurance Card', screenId: 'caixinha-mvp-insurance', nodeType: 'screen', pageId: 'caixinha-mvp-insurance' } as FlowNodeData },
  ],
  [
    { id: 'e-dash-tap', source: 'screen-dashboard', target: 'action-tap-dolar' },
    { id: 'e-tap-hub', source: 'action-tap-dolar', target: 'screen-hub' },
    { id: 'e-hub-adicionar', source: 'screen-hub', target: 'action-adicionar' },
    { id: 'e-adicionar-ref', source: 'action-adicionar', target: 'ref-deposit' },
    { id: 'e-hub-resgatar', source: 'screen-hub', target: 'action-resgatar' },
    { id: 'e-resgatar-ref', source: 'action-resgatar', target: 'ref-withdraw' },
    { id: 'e-hub-apolice', source: 'screen-hub', target: 'action-apolice' },
    { id: 'e-apolice-insurance', source: 'action-apolice', target: 'screen-insurance' },
  ],
  1,
)

// ── Deposit graph ──

bootstrapFlowGraph('caixinha-mvp-deposit',
  [
    { id: 'screen-amount', type: 'screen', position: { x: xL, y: 0 }, data: { label: 'Amount Entry', screenId: 'caixinha-mvp-deposit-amount', nodeType: 'screen', pageId: 'caixinha-mvp-deposit-amount' } as FlowNodeData },
    { id: 'action-continuar', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'screen-review', type: 'screen', position: { x: xL, y: ROW * 2 }, data: { label: 'Review', screenId: 'caixinha-mvp-deposit-review', nodeType: 'screen', pageId: 'caixinha-mvp-deposit-review' } as FlowNodeData },
    { id: 'action-confirmar', type: 'action', position: { x: xL, y: ROW * 3 }, data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar depósito' } as FlowNodeData },
    { id: 'api-deposit', type: 'api-call', position: { x: xL, y: ROW * 4 }, data: { label: 'Process deposit', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/caixinha/deposit' } as FlowNodeData },
    { id: 'screen-processing', type: 'screen', position: { x: xL, y: ROW * 5 }, data: { label: 'Processing', screenId: 'caixinha-mvp-deposit-processing', nodeType: 'screen', pageId: 'caixinha-mvp-deposit-processing' } as FlowNodeData },
    { id: 'screen-success', type: 'screen', position: { x: xL, y: ROW * 6 }, data: { label: 'Success', screenId: 'caixinha-mvp-deposit-success', nodeType: 'screen', pageId: 'caixinha-mvp-deposit-success' } as FlowNodeData },
    { id: 'action-entendi', type: 'action', position: { x: xL, y: ROW * 7 }, data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'ref-manage', type: 'flow-reference', position: { x: xL, y: ROW * 8 }, data: { label: 'Back to manage', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp' } as FlowNodeData },
  ],
  [
    { id: 'e-amount-cont', source: 'screen-amount', target: 'action-continuar' },
    { id: 'e-cont-review', source: 'action-continuar', target: 'screen-review' },
    { id: 'e-review-conf', source: 'screen-review', target: 'action-confirmar' },
    { id: 'e-conf-api', source: 'action-confirmar', target: 'api-deposit' },
    { id: 'e-api-proc', source: 'api-deposit', target: 'screen-processing' },
    { id: 'e-proc-success', source: 'screen-processing', target: 'screen-success' },
    { id: 'e-success-entendi', source: 'screen-success', target: 'action-entendi' },
    { id: 'e-entendi-manage', source: 'action-entendi', target: 'ref-manage' },
  ],
  3,
)

// ── Withdraw graph ──

bootstrapFlowGraph('caixinha-mvp-withdraw',
  [
    { id: 'screen-amount', type: 'screen', position: { x: xL, y: 0 }, data: { label: 'Amount Entry', screenId: 'caixinha-mvp-withdraw-amount', nodeType: 'screen', pageId: 'caixinha-mvp-withdraw-amount' } as FlowNodeData },
    { id: 'action-continuar', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'screen-review', type: 'screen', position: { x: xL, y: ROW * 2 }, data: { label: 'Review', screenId: 'caixinha-mvp-withdraw-review', nodeType: 'screen', pageId: 'caixinha-mvp-withdraw-review' } as FlowNodeData },
    { id: 'action-confirmar', type: 'action', position: { x: xL, y: ROW * 3 }, data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'api-withdraw', type: 'api-call', position: { x: xL, y: ROW * 4 }, data: { label: 'Process withdrawal', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/caixinha/withdraw' } as FlowNodeData },
    { id: 'screen-processing', type: 'screen', position: { x: xL, y: ROW * 5 }, data: { label: 'Processing', screenId: 'caixinha-mvp-withdraw-processing', nodeType: 'screen', pageId: 'caixinha-mvp-withdraw-processing' } as FlowNodeData },
    { id: 'screen-success', type: 'screen', position: { x: xL, y: ROW * 6 }, data: { label: 'Success', screenId: 'caixinha-mvp-withdraw-success', nodeType: 'screen', pageId: 'caixinha-mvp-withdraw-success' } as FlowNodeData },
    { id: 'action-entendi', type: 'action', position: { x: xL, y: ROW * 7 }, data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'ref-manage', type: 'flow-reference', position: { x: xL, y: ROW * 8 }, data: { label: 'Back to manage', screenId: null, nodeType: 'flow-reference', targetFlowId: 'caixinha-mvp' } as FlowNodeData },
  ],
  [
    { id: 'e-amount-cont', source: 'screen-amount', target: 'action-continuar' },
    { id: 'e-cont-review', source: 'action-continuar', target: 'screen-review' },
    { id: 'e-review-conf', source: 'screen-review', target: 'action-confirmar' },
    { id: 'e-conf-api', source: 'action-confirmar', target: 'api-withdraw' },
    { id: 'e-api-proc', source: 'api-withdraw', target: 'screen-processing' },
    { id: 'e-proc-success', source: 'screen-processing', target: 'screen-success' },
    { id: 'e-success-entendi', source: 'screen-success', target: 'action-entendi' },
    { id: 'e-entendi-manage', source: 'action-entendi', target: 'ref-manage' },
  ],
  3,
)

// ═══════════════════════════════════════════════════════════════
// GROUP: "MVP" under Earn domain
// ═══════════════════════════════════════════════════════════════

const DOMAIN = 'earn'
const GROUP_NAME = 'MVP'

const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
const group = existing ?? createGroup(GROUP_NAME, DOMAIN)
for (const flowId of FLOW_IDS) {
  assignFlowToGroup(flowId, group.id)
}
