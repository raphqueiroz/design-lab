import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '../../pages/simulator/flowGroupStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'

// ── Create flow screens ──
import Create_Screen1_NameIcon from './create/Screen1_NameIcon'
import Create_Screen2_CurrencyPicker from './create/Screen2_CurrencyPicker'
import Create_Screen3_Confirmation from './create/Screen3_Confirmation'
import Create_Screen4_Success from './create/Screen4_Success'

// ── Manage flow screens ──
import Manage_Screen1_CaixinhaList from './manage/Screen1_CaixinhaList'
import Manage_Screen2_Hub from './manage/Screen2_Hub'
import Manage_Screen3_InsuranceCard from './manage/Screen3_InsuranceCard'
import Manage_Screen4_EditName from './manage/Screen4_EditName'
import Manage_Screen5_DeleteConfirm from './manage/Screen5_DeleteConfirm'

// ── Deposit flow screens ──
import Deposit_Screen1_AmountEntry from './deposit/Screen1_AmountEntry'
import Deposit_Screen2_Review from './deposit/Screen2_Review'
import Deposit_Screen3_Processing from './deposit/Screen3_Processing'
import Deposit_Screen4_Success from './deposit/Screen4_Success'

// ── Withdraw flow screens ──
import Withdraw_Screen1_AmountEntry from './withdraw/Screen1_AmountEntry'
import Withdraw_Screen2_Review from './withdraw/Screen2_Review'
import Withdraw_Screen3_Processing from './withdraw/Screen3_Processing'
import Withdraw_Screen4_Success from './withdraw/Screen4_Success'

// ═══════════════════════════════════════════════════════════════
// 1. CAIXINHA CREATE FLOW
// ═══════════════════════════════════════════════════════════════

const createScreenDefs = [
  {
    id: 'caixinha-create-name',
    title: 'Create – Name & Icon',
    description: 'Name input + icon grid picker with live preview for new caixinha.',
    componentsUsed: ['BaseLayout', 'Header', 'TextInput', 'Card', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Create_Screen1_NameIcon,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'caixinha-create-currency',
    title: 'Create – Currency Picker',
    description: 'Select USD/BRL/EUR with APY display. Tapping a currency navigates directly to confirmation.',
    componentsUsed: ['BaseLayout', 'Header', 'ListItem', 'Avatar', 'Badge', 'Text', 'Stack'],
    component: Create_Screen2_CurrencyPicker,
    interactiveElements: [
      { id: 'li-usd', component: 'ListItem', label: 'Dólar americano' },
      { id: 'li-brl', component: 'ListItem', label: 'Real brasileiro' },
      { id: 'li-eur', component: 'ListItem', label: 'Euro' },
    ],
  },
  {
    id: 'caixinha-create-confirm',
    title: 'Create – Confirmation',
    description: 'Review caixinha details before creation: icon, name, currency, APY, instant redemption.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Create_Screen3_Confirmation,
    interactiveElements: [
      { id: 'btn-criar', component: 'Button', label: 'Criar caixinha' },
    ],
  },
  {
    id: 'caixinha-create-success',
    title: 'Create – Success',
    description: 'Caixinha created feedback with CTAs to add funds or view list.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Create_Screen4_Success,
    interactiveElements: [
      { id: 'btn-add-funds', component: 'Button', label: 'Adicionar fundos' },
      { id: 'btn-ver-caixinhas', component: 'Button', label: 'Ver caixinhas' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. CAIXINHA MANAGE FLOW
// ═══════════════════════════════════════════════════════════════

const manageScreenDefs = [
  {
    id: 'caixinha-manage-list',
    title: 'Manage – Caixinha List',
    description: 'Multi-currency caixinha dashboard with total BRL, per-caixinha cards, and create button.',
    componentsUsed: ['BaseLayout', 'Header', 'Card', 'Badge', 'Button', 'Text', 'Stack'],
    component: Manage_Screen1_CaixinhaList,
    interactiveElements: [
      { id: 'btn-nova', component: 'Button', label: 'Nova Caixinha' },
      { id: 'li-viagem', component: 'ListItem', label: 'viagem-europa' },
      { id: 'li-reserva', component: 'ListItem', label: 'reserva-emergencia' },
      { id: 'li-iphone', component: 'ListItem', label: 'iphone' },
      { id: 'li-poupanca', component: 'ListItem', label: 'poupanca-brl' },
    ],
    states: [
      { id: 'default', name: 'Com caixinhas', description: '4 caixinhas (EUR, 2×USD, BRL)', isDefault: true, data: {} },
      { id: 'pending', name: 'Processando', description: 'Deposit sent but still processing (~3 min)', data: { hasPending: true } },
      { id: 'empty', name: 'Vazio', description: 'New user, no caixinhas', data: { isEmpty: true } },
    ],
  },
  {
    id: 'caixinha-manage-hub',
    title: 'Manage – Hub',
    description: 'Single caixinha detail: chart, currency-aware balance, BRL equivalent, shortcuts, tabs.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'Badge', 'ShortcutButton', 'SegmentedControl', 'DataList', 'Banner', 'Text', 'Stack'],
    component: Manage_Screen2_Hub,
    interactiveElements: [
      { id: 'sc-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
      { id: 'sc-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'sc-editar', component: 'ShortcutButton', label: 'Editar' },
      { id: 'sc-excluir', component: 'ShortcutButton', label: 'Excluir' },
      { id: 'btn-apolice', component: 'Button', label: 'Ver apólice' },
    ],
    states: [
      { id: 'usd', name: 'USD', description: 'Dollar caixinha', isDefault: true, data: { currency: 'USD' } },
      { id: 'brl', name: 'BRL', description: 'Real caixinha', data: { currency: 'BRL' } },
      { id: 'eur', name: 'EUR', description: 'Euro caixinha', data: { currency: 'EUR' } },
      { id: 'zero-balance', name: 'Saldo zerado', description: 'Empty caixinha with delete option', data: { currency: 'USD', isZeroBalance: true } },
    ],
  },
  {
    id: 'caixinha-manage-insurance',
    title: 'Manage – Insurance Card',
    description: 'Nexus Mutual-style green certificate card with coverage details.',
    componentsUsed: ['BaseLayout', 'Header', 'InsurancePolicyCard', 'Summary', 'GroupHeader', 'DataList', 'Stack'],
    component: Manage_Screen3_InsuranceCard,
  },
  {
    id: 'caixinha-manage-edit-name',
    title: 'Manage – Edit Name',
    description: 'Rename caixinha with text input and icon picker.',
    componentsUsed: ['BaseLayout', 'Header', 'TextInput', 'Card', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Manage_Screen4_EditName,
    interactiveElements: [
      { id: 'btn-salvar', component: 'Button', label: 'Salvar' },
    ],
  },
  {
    id: 'caixinha-manage-delete',
    title: 'Manage – Delete Confirm',
    description: 'Confirm deletion of empty caixinha with warning banner.',
    componentsUsed: ['BaseLayout', 'Header', 'Banner', 'DataList', 'GroupHeader', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Manage_Screen5_DeleteConfirm,
    interactiveElements: [
      { id: 'btn-excluir', component: 'Button', label: 'Excluir caixinha' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 3. CAIXINHA DEPOSIT FLOW
// ═══════════════════════════════════════════════════════════════

const depositScreenDefs = [
  {
    id: 'caixinha-deposit-r-amount',
    title: 'Deposit – Amount Entry',
    description: 'Currency-aware amount entry with BRL equivalent and instant redemption callout.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Banner', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Deposit_Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'usd', name: 'Dólar (USD)', description: 'Dollar deposit — pay in USD', isDefault: true, data: { currency: 'USD' } },
      { id: 'eur', name: 'Euro (EUR)', description: 'Pay in EUR, save in USD', data: { currency: 'EUR' } },
    ],
  },
  {
    id: 'caixinha-deposit-r-review',
    title: 'Deposit – Review',
    description: 'Review deposit with instant redemption callout and insurance mention.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'Banner', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Deposit_Screen2_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar depósito' },
    ],
    states: [
      { id: 'usd', name: 'Dólar (USD)', description: 'Dollar deposit review', isDefault: true, data: { currency: 'USD' } },
      { id: 'eur', name: 'Euro (EUR)', description: 'Euro deposit review', data: { currency: 'EUR' } },
    ],
  },
  {
    id: 'caixinha-deposit-r-processing',
    title: 'Deposit – Processing',
    description: 'Loading screen with deposit processing steps.',
    componentsUsed: ['LoadingScreen'],
    component: Deposit_Screen3_Processing,
  },
  {
    id: 'caixinha-deposit-r-success',
    title: 'Deposit – Success',
    description: 'Deposit confirmed with currency-aware summary and instant redemption.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Stack'],
    component: Deposit_Screen4_Success,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'usd', name: 'Dólar (USD)', description: 'Dollar deposit success', isDefault: true, data: { currency: 'USD' } },
      { id: 'eur', name: 'Euro (EUR)', description: 'Euro deposit success', data: { currency: 'EUR' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 4. CAIXINHA WITHDRAW FLOW
// ═══════════════════════════════════════════════════════════════

const withdrawScreenDefs = [
  {
    id: 'caixinha-withdraw-r-amount',
    title: 'Withdraw – Amount Entry',
    description: 'Currency-aware withdrawal with instant redemption badge and BRL equivalent.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Badge', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Withdraw_Screen1_AmountEntry,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'usd', name: 'Dólar (USD)', description: 'Dollar withdrawal', isDefault: true, data: { currency: 'USD' } },
      { id: 'eur', name: 'Euro (EUR)', description: 'Withdraw USD, receive in EUR', data: { currency: 'EUR' } },
    ],
  },
  {
    id: 'caixinha-withdraw-r-review',
    title: 'Withdraw – Review',
    description: 'Withdrawal review with "Prazo: Imediato" in green.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'StickyFooter', 'Button', 'Text', 'Stack'],
    component: Withdraw_Screen2_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar resgate' },
    ],
    states: [
      { id: 'usd', name: 'Dólar (USD)', description: 'Dollar withdrawal review', isDefault: true, data: { currency: 'USD' } },
    ],
  },
  {
    id: 'caixinha-withdraw-r-processing',
    title: 'Withdraw – Processing',
    description: 'Loading screen with withdrawal processing steps.',
    componentsUsed: ['LoadingScreen'],
    component: Withdraw_Screen3_Processing,
  },
  {
    id: 'caixinha-withdraw-r-success',
    title: 'Withdraw – Success',
    description: 'Withdrawal confirmed. Zero-balance state shows delete option.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Stack'],
    component: Withdraw_Screen4_Success,
    interactiveElements: [
      { id: 'btn-excluir', component: 'Button', label: 'Excluir caixinha' },
    ],
    states: [
      { id: 'default', name: 'Com saldo', description: 'Has remaining balance', isDefault: true, data: { currency: 'USD' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGES (deduplicated)
// ═══════════════════════════════════════════════════════════════

const allScreenDefs = [...createScreenDefs, ...manageScreenDefs, ...depositScreenDefs, ...withdrawScreenDefs]
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
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

// ═══════════════════════════════════════════════════════════════
// REGISTER FLOWS
// ═══════════════════════════════════════════════════════════════

registerFlow({
  id: 'caixinha-create',
  name: 'Caixinha Create',
  description: 'Create a new multi-currency caixinha: name, icon, currency, confirm, success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['caixinha-deposit-reviewed', 'caixinha-manage'],
  screens: createScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'caixinha-manage',
  name: 'Caixinha Manage',
  description: 'Multi-currency caixinha management: list, hub, insurance, edit name, delete.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['caixinha-create', 'caixinha-deposit-reviewed', 'caixinha-withdraw-reviewed'],
  screens: manageScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'caixinha-deposit-reviewed',
  name: 'Caixinha Deposit (Reviewed)',
  description: 'Deposit into caixinha with currency-aware amount entry, instant redemption emphasis.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['caixinha-manage'],
  entryPoints: ['caixinha-hub'],
  screens: depositScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'caixinha-withdraw-reviewed',
  name: 'Caixinha Withdraw (Reviewed)',
  description: 'Withdraw from caixinha with instant redemption emphasis. Zero-balance state shows delete.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['caixinha-manage'],
  entryPoints: ['caixinha-hub'],
  screens: withdrawScreenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════════════
// FLOW GRAPHS
// ═══════════════════════════════════════════════════════════════

const ROW = 120
const x = 300
const xL = 0
const xR = 600

// ── Create Flow Graph (linear) ──
{
  const nodes = [
    { id: 'n-name', type: 'screen', position: { x, y: 0 },
      data: { label: 'Name & Icon', screenId: 'caixinha-create-name', nodeType: 'screen',
              pageId: 'caixinha-create-name', description: 'Pick name and icon' } as FlowNodeData },
    { id: 'n-tap-cont-1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-currency', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Currency Picker', screenId: 'caixinha-create-currency', nodeType: 'screen',
              pageId: 'caixinha-create-currency', description: 'Choose USD/BRL/EUR' } as FlowNodeData },
    { id: 'n-tap-currency', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Currency', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Dólar americano' } as FlowNodeData },
    { id: 'n-confirm', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Confirmation', screenId: 'caixinha-create-confirm', nodeType: 'screen',
              pageId: 'caixinha-create-confirm', description: 'Review before creation' } as FlowNodeData },
    { id: 'n-tap-criar', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Tap Criar caixinha', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Criar caixinha' } as FlowNodeData },
    { id: 'n-api-create', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Create Caixinha', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/caixinha/create',
              description: 'Create new caixinha record' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Success', screenId: 'caixinha-create-success', nodeType: 'screen',
              pageId: 'caixinha-create-success', description: 'Caixinha created' } as FlowNodeData },
    // Branches from success
    { id: 'n-tap-add-funds', type: 'action', position: { x: xL, y: ROW * 8 },
      data: { label: 'Tap Adicionar fundos', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Adicionar fundos' } as FlowNodeData },
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 9 },
      data: { label: 'Caixinha Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-deposit-reviewed' } as FlowNodeData },
    { id: 'n-tap-ver', type: 'action', position: { x: xR, y: ROW * 8 },
      data: { label: 'Tap Ver caixinhas', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ver caixinhas' } as FlowNodeData },
    { id: 'n-ref-manage', type: 'flow-reference', position: { x: xR, y: ROW * 9 },
      data: { label: 'Caixinha Manage', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-manage' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-c1', source: 'n-name', target: 'n-tap-cont-1', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c2', source: 'n-tap-cont-1', target: 'n-currency', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c3', source: 'n-currency', target: 'n-tap-currency', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c4', source: 'n-tap-currency', target: 'n-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c5', source: 'n-confirm', target: 'n-tap-criar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c6', source: 'n-tap-criar', target: 'n-api-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c7', source: 'n-api-create', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c8', source: 'n-success', target: 'n-tap-add-funds', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-c9', source: 'n-tap-add-funds', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-c10', source: 'n-success', target: 'n-tap-ver', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-c11', source: 'n-tap-ver', target: 'n-ref-manage', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('caixinha-create', nodes, edges, 2)
}

// ── Manage Flow Graph (hub with branches) ──
{
  const nodes = [
    // Row 0: List
    { id: 'n-list', type: 'screen', position: { x, y: 0 },
      data: { label: 'Caixinha List', screenId: 'caixinha-manage-list', nodeType: 'screen',
              pageId: 'caixinha-manage-list', description: 'Multi-currency dashboard' } as FlowNodeData },

    // Row 1: Tap caixinha
    { id: 'n-tap-caixinha', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Caixinha', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: reserva-emergencia' } as FlowNodeData },

    // Row 2: Hub
    { id: 'n-hub', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Hub', screenId: 'caixinha-manage-hub', nodeType: 'screen',
              pageId: 'caixinha-manage-hub', description: 'Single caixinha detail' } as FlowNodeData },

    // Hub actions (row 3)
    { id: 'n-tap-adicionar', type: 'action', position: { x: xL - 200, y: ROW * 3 },
      data: { label: 'Tap Adicionar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Adicionar' } as FlowNodeData },
    { id: 'n-tap-resgatar', type: 'action', position: { x: xL, y: ROW * 3 },
      data: { label: 'Tap Resgatar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Resgatar' } as FlowNodeData },
    { id: 'n-tap-editar', type: 'action', position: { x: xR, y: ROW * 3 },
      data: { label: 'Tap Editar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Editar' } as FlowNodeData },
    { id: 'n-tap-apolice', type: 'action', position: { x: xR + 200, y: ROW * 3 },
      data: { label: 'Tap Ver apólice', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Ver apólice' } as FlowNodeData },
    { id: 'n-tap-excluir', type: 'action', position: { x: x, y: ROW * 3.5 },
      data: { label: 'Tap Excluir', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Excluir' } as FlowNodeData },

    // Flow references (row 4)
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL - 200, y: ROW * 4 },
      data: { label: 'Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-deposit-reviewed' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xL, y: ROW * 4 },
      data: { label: 'Withdraw', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-withdraw-reviewed' } as FlowNodeData },

    // Edit name screen
    { id: 'n-edit-name', type: 'screen', position: { x: xR, y: ROW * 4 },
      data: { label: 'Edit Name', screenId: 'caixinha-manage-edit-name', nodeType: 'screen',
              pageId: 'caixinha-manage-edit-name', description: 'Rename caixinha' } as FlowNodeData },
    { id: 'n-tap-salvar', type: 'action', position: { x: xR, y: ROW * 5 },
      data: { label: 'Tap Salvar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Salvar' } as FlowNodeData },

    // Insurance screen
    { id: 'n-insurance', type: 'screen', position: { x: xR + 200, y: ROW * 4 },
      data: { label: 'Insurance Card', screenId: 'caixinha-manage-insurance', nodeType: 'screen',
              pageId: 'caixinha-manage-insurance', description: 'Nexus Mutual certificate' } as FlowNodeData },

    // Delete confirm
    { id: 'n-delete', type: 'screen', position: { x, y: ROW * 4.5 },
      data: { label: 'Delete Confirm', screenId: 'caixinha-manage-delete', nodeType: 'screen',
              pageId: 'caixinha-manage-delete', description: 'Confirm caixinha deletion' } as FlowNodeData },

    // New caixinha from list
    { id: 'n-tap-nova', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Nova Caixinha', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Nova Caixinha' } as FlowNodeData },
    { id: 'n-ref-create', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Create Flow', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-create' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-m1', source: 'n-list', target: 'n-tap-caixinha', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-m2', source: 'n-tap-caixinha', target: 'n-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    // Hub → actions
    { id: 'e-m3', source: 'n-hub', target: 'n-tap-adicionar', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-m4', source: 'n-hub', target: 'n-tap-resgatar', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-m5', source: 'n-hub', target: 'n-tap-editar', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-m6', source: 'n-hub', target: 'n-tap-apolice', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-m7', source: 'n-hub', target: 'n-tap-excluir', sourceHandle: 'bottom', targetHandle: 'top' },
    // Actions → destinations
    { id: 'e-m8', source: 'n-tap-adicionar', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-m9', source: 'n-tap-resgatar', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-m10', source: 'n-tap-editar', target: 'n-edit-name', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-m11', source: 'n-tap-apolice', target: 'n-insurance', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-m12', source: 'n-tap-excluir', target: 'n-delete', sourceHandle: 'bottom', targetHandle: 'top' },
    // Edit → Salvar (back to hub)
    { id: 'e-m13', source: 'n-edit-name', target: 'n-tap-salvar', sourceHandle: 'bottom', targetHandle: 'top' },
    // New caixinha from list
    { id: 'e-m14', source: 'n-list', target: 'n-tap-nova', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-m15', source: 'n-tap-nova', target: 'n-ref-create', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('caixinha-manage', nodes, edges, 2)
}

// ── Deposit Flow Graph (linear) ──
{
  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Amount Entry', screenId: 'caixinha-deposit-r-amount', nodeType: 'screen',
              pageId: 'caixinha-deposit-r-amount', description: 'Currency-aware deposit amount' } as FlowNodeData },
    { id: 'n-tap-cont', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'caixinha-deposit-r-review', nodeType: 'screen',
              pageId: 'caixinha-deposit-r-review', description: 'Review deposit details' } as FlowNodeData },
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Confirmar depósito', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar depósito' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Process Deposit', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/caixinha/deposit',
              description: 'Submit deposit to caixinha' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'caixinha-deposit-r-processing', nodeType: 'screen',
              pageId: 'caixinha-deposit-r-processing', description: 'Deposit processing animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'caixinha-deposit-r-success', nodeType: 'screen',
              pageId: 'caixinha-deposit-r-success', description: 'Deposit confirmed' } as FlowNodeData },
    { id: 'n-tap-entendi', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref-manage', type: 'flow-reference', position: { x, y: ROW * 8 },
      data: { label: 'Caixinha Manage', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-manage' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-d1', source: 'n-amount', target: 'n-tap-cont', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d2', source: 'n-tap-cont', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d3', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d4', source: 'n-tap-confirmar', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d5', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d6', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d7', source: 'n-success', target: 'n-tap-entendi', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d8', source: 'n-tap-entendi', target: 'n-ref-manage', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('caixinha-deposit-reviewed', nodes, edges, 2)
}

// ── Withdraw Flow Graph (linear + delete branch) ──
{
  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Amount Entry', screenId: 'caixinha-withdraw-r-amount', nodeType: 'screen',
              pageId: 'caixinha-withdraw-r-amount', description: 'Withdrawal amount with instant badge' } as FlowNodeData },
    { id: 'n-tap-cont', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'Review', screenId: 'caixinha-withdraw-r-review', nodeType: 'screen',
              pageId: 'caixinha-withdraw-r-review', description: 'Confirm withdrawal' } as FlowNodeData },
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Confirmar resgate', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar resgate' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
      data: { label: 'Execute Withdrawal', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/caixinha/withdraw',
              description: 'Redeem caixinha position' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
      data: { label: 'Processing', screenId: 'caixinha-withdraw-r-processing', nodeType: 'screen',
              pageId: 'caixinha-withdraw-r-processing', description: 'Withdrawal processing' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Success', screenId: 'caixinha-withdraw-r-success', nodeType: 'screen',
              pageId: 'caixinha-withdraw-r-success', description: 'Withdrawal confirmed' } as FlowNodeData },
    // Delete branch from success
    { id: 'n-decision-balance', type: 'decision', position: { x: xR, y: ROW * 7 },
      data: { label: 'Saldo = 0?', screenId: null, nodeType: 'decision',
              description: 'Check if caixinha balance is zero after withdrawal' } as FlowNodeData },
    { id: 'n-tap-excluir', type: 'action', position: { x: xR, y: ROW * 8 },
      data: { label: 'Tap Excluir caixinha', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Excluir caixinha' } as FlowNodeData },
    { id: 'n-ref-manage', type: 'flow-reference', position: { x: xR, y: ROW * 9 },
      data: { label: 'Caixinha Manage', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'caixinha-manage', description: 'Return to list after deletion' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-w1', source: 'n-amount', target: 'n-tap-cont', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w2', source: 'n-tap-cont', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w3', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w4', source: 'n-tap-confirmar', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w5', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w6', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    // Delete branch
    { id: 'e-w7', source: 'n-success', target: 'n-decision-balance', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-w8', source: 'n-decision-balance', target: 'n-tap-excluir', sourceHandle: 'bottom', targetHandle: 'top', label: 'Sim' },
    { id: 'e-w9', source: 'n-tap-excluir', target: 'n-ref-manage', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('caixinha-withdraw-reviewed', nodes, edges, 2)
}

// ═══════════════════════════════════════════════════════════════
// GROUP FLOWS IN SIDEBAR
// ═══════════════════════════════════════════════════════════════

{
  const GROUP_NAME = 'Reviewed'
  const DOMAIN = 'earn'
  const FLOW_IDS = ['caixinha-create', 'caixinha-manage', 'caixinha-deposit-reviewed', 'caixinha-withdraw-reviewed']

  // Only create if the group doesn't already exist
  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)

  for (const flowId of FLOW_IDS) {
    assignFlowToGroup(flowId, group.id)
  }
}
