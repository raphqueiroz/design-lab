import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_CardsList from './Screen1_CardsList'
import Screen2_CardInfo from './Screen2_CardInfo'
import Screen3_CreateVirtualName from './Screen3_CreateVirtualName'
import Screen4_CreateVirtualProcessing from './Screen4_CreateVirtualProcessing'
import Screen5_CreateVirtualSuccess from './Screen5_CreateVirtualSuccess'
import Screen6_EditLimits from './Screen6_EditLimits'
import Screen7_LimitsSuccess from './Screen7_LimitsSuccess'
import Screen8_RenameCard from './Screen8_RenameCard'
import Screen9_RenameSuccess from './Screen9_RenameSuccess'
import Screen10_RemoveConfirm from './Screen10_RemoveConfirm'
import Screen11_RemoveSuccess from './Screen11_RemoveSuccess'
import Screen12_ReportLoss from './Screen12_ReportLoss'
import Screen13_ReportLossSuccess from './Screen13_ReportLossSuccess'
import Screen14_ApplePayProcessing from './Screen14_ApplePayProcessing'
import Screen15_ApplePaySuccess from './Screen15_ApplePaySuccess'
import Screen16_UpdatePhoneInput from './Screen16_UpdatePhoneInput'
import Screen17_UpdatePhoneVerify from './Screen17_UpdatePhoneVerify'
import Screen18_UpdatePhoneSuccess from './Screen18_UpdatePhoneSuccess'

// ── Screen Definitions ──

const cardsListScreens = [
  {
    id: 'cards-list',
    title: 'Cards List',
    description: 'Level-1 tab screen listing all user cards (physical + virtual) with contextual action buttons.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'ListItem', 'Avatar', 'Badge', 'Text', 'GroupHeader', 'ShortcutButton'],
    component: Screen1_CardsList,
    states: [
      { id: 'default', name: 'One Virtual Card', description: 'User has only the default virtual card', isDefault: true, data: { cards: [{ id: 'v1', type: 'virtual', name: 'Cartão Virtual', last4: '7328', frozen: false }] } },
      { id: 'with-physical', name: 'Virtual + Physical', description: 'User has 1 virtual and 1 physical card', data: { cards: [{ id: 'p1', type: 'physical', name: 'Cartão Físico', last4: '4521', frozen: false }, { id: 'v1', type: 'virtual', name: 'Cartão Virtual', last4: '7328', frozen: false }] } },
      { id: 'multiple-virtual', name: 'Multiple Virtual', description: 'User has several virtual cards', data: { cards: [{ id: 'v1', type: 'virtual', name: 'Cartão Virtual', last4: '7328', frozen: false }, { id: 'v2', type: 'virtual', name: 'Compras Online', last4: '9102', frozen: false }, { id: 'v3', type: 'virtual', name: 'Assinaturas', last4: '5567', frozen: true }] } },
      { id: 'full', name: 'Physical + Multiple Virtual', description: 'User has 1 physical and multiple virtual cards', data: { cards: [{ id: 'p1', type: 'physical', name: 'Cartão Físico', last4: '4521', frozen: false }, { id: 'v1', type: 'virtual', name: 'Cartão Virtual', last4: '7328', frozen: false }, { id: 'v2', type: 'virtual', name: 'Compras Online', last4: '9102', frozen: false }] } },
    ],
    interactiveElements: [
      { id: 'li-card', component: 'ListItem', label: 'Card Item' },
      { id: 'btn-create-virtual', component: 'ListItem', label: 'Criar cartão virtual' },
      { id: 'btn-request-physical', component: 'ListItem', label: 'Pedir cartão físico' },
      { id: 'btn-update-phone', component: 'ListItem', label: 'Atualizar meu telefone' },
    ],
  },
]

const cardInfoScreens = [
  {
    id: 'card-info',
    title: 'Card Info',
    description: 'Card details with number, expiry, CVV, copy action, and contextual shortcuts. Different menus for virtual vs physical cards.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Text', 'DataList', 'ShortcutButton', 'Modal', 'Toast', 'BottomSheet'],
    component: Screen2_CardInfo,
    states: [
      { id: 'default', name: 'Virtual Active', description: 'Virtual card in active state', isDefault: true, data: { cardType: 'virtual', frozen: false, name: 'Cartão Virtual', last4: '7328', number: '5432 8901 2345 7328', expiry: '12/28', cvv: '421' } },
      { id: 'virtual-frozen', name: 'Virtual Frozen', description: 'Virtual card frozen — data dimmed, copy hidden, action changes to unfreeze', data: { cardType: 'virtual', frozen: true, name: 'Cartão Virtual', last4: '7328', number: '5432 8901 2345 7328', expiry: '12/28', cvv: '421' } },
      { id: 'physical-active', name: 'Physical Active', description: 'Physical card in active state with physical-specific shortcuts', data: { cardType: 'physical', frozen: false, name: 'Cartão Físico', last4: '4521', number: '5432 1234 5678 4521', expiry: '06/29', cvv: '892' } },
      { id: 'physical-frozen', name: 'Physical Frozen', description: 'Physical card frozen — data dimmed, copy hidden', data: { cardType: 'physical', frozen: true, name: 'Cartão Físico', last4: '4521', number: '5432 1234 5678 4521', expiry: '06/29', cvv: '892' } },
    ],
    interactiveElements: [
      { id: 'action-limits', component: 'DataList', label: 'Limites diários' },
      { id: 'shortcut-rename', component: 'ShortcutButton', label: 'Renomear' },
      { id: 'shortcut-freeze', component: 'ShortcutButton', label: 'Congelar' },
      { id: 'shortcut-remove', component: 'ShortcutButton', label: 'Remover' },
      { id: 'shortcut-apple-pay', component: 'ShortcutButton', label: 'Apple Pay' },
      { id: 'shortcut-pin', component: 'ShortcutButton', label: 'Ver senha' },
      { id: 'shortcut-report-loss', component: 'ShortcutButton', label: 'Reportar perda' },
    ],
  },
]

const createVirtualScreens = [
  {
    id: 'create-virtual-name',
    title: 'Create Virtual Card – Name',
    description: 'User chooses a name for their new virtual card.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Text', 'TextInput', 'Button'],
    component: Screen3_CreateVirtualName,
    interactiveElements: [
      { id: 'btn-create', component: 'Button', label: 'Criar cartão' },
    ],
  },
  {
    id: 'create-virtual-processing',
    title: 'Create Virtual Card – Processing',
    description: 'Processing animation while virtual card is being created.',
    componentsUsed: ['LoadingScreen'],
    component: Screen4_CreateVirtualProcessing,
  },
  {
    id: 'create-virtual-success',
    title: 'Create Virtual Card – Success',
    description: 'Confirmation that virtual card was created, shows card name and last 4 digits.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'DataList', 'Button'],
    component: Screen5_CreateVirtualSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Ver meus cartões' },
    ],
  },
]

const editLimitsScreens = [
  {
    id: 'edit-limits',
    title: 'Edit Daily Limits',
    description: 'Shared daily limits editor. Limits apply across all cards.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Slider', 'DataList', 'Banner', 'Button', 'Text'],
    component: Screen6_EditLimits,
    interactiveElements: [
      { id: 'btn-save', component: 'Button', label: 'Salvar alterações' },
    ],
  },
  {
    id: 'edit-limits-success',
    title: 'Edit Daily Limits – Success',
    description: 'Confirmation that daily limits were updated.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'DataList', 'Button'],
    component: Screen7_LimitsSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Voltar' },
    ],
  },
]

const renameScreens = [
  {
    id: 'rename-card',
    title: 'Rename Virtual Card',
    description: 'Input screen to rename a virtual card.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Text', 'TextInput', 'Button'],
    component: Screen8_RenameCard,
    interactiveElements: [
      { id: 'btn-save', component: 'Button', label: 'Salvar' },
    ],
  },
  {
    id: 'rename-success',
    title: 'Rename Virtual Card – Success',
    description: 'Confirmation that the card was renamed.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'Button'],
    component: Screen9_RenameSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Voltar' },
    ],
  },
]

const removeScreens = [
  {
    id: 'remove-card-confirm',
    title: 'Remove Virtual Card – Confirm',
    description: 'Confirmation screen before removing a virtual card. Shows card name and warns about irreversibility.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Text', 'Banner', 'DataList', 'Button'],
    component: Screen10_RemoveConfirm,
    interactiveElements: [
      { id: 'btn-remove', component: 'Button', label: 'Remover cartão' },
      { id: 'btn-cancel', component: 'Button', label: 'Cancelar' },
    ],
  },
  {
    id: 'remove-card-success',
    title: 'Remove Virtual Card – Success',
    description: 'Confirmation that the virtual card was removed.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'Button'],
    component: Screen11_RemoveSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Ver meus cartões' },
    ],
  },
]

const reportLossScreens = [
  {
    id: 'report-loss',
    title: 'Report Loss or Theft',
    description: 'Explains that the physical card will be cancelled and a replacement sent. Two options: lost or stolen.',
    componentsUsed: ['BaseLayout', 'Header', 'Stack', 'Text', 'Banner', 'ListItem'],
    component: Screen12_ReportLoss,
    interactiveElements: [
      { id: 'btn-lost', component: 'ListItem', label: 'Perdi meu cartão' },
      { id: 'btn-stolen', component: 'ListItem', label: 'Meu cartão foi roubado' },
    ],
  },
  {
    id: 'report-loss-success',
    title: 'Report Loss – Success',
    description: 'Confirmation that the card was disabled and a new one is on the way.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'DataList', 'Button'],
    component: Screen13_ReportLossSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Ver meus cartões' },
    ],
  },
]

const applePayScreens = [
  {
    id: 'apple-pay-processing',
    title: 'Add to Apple Pay – Processing',
    description: 'Processing animation while adding card to Apple Pay.',
    componentsUsed: ['LoadingScreen'],
    component: Screen14_ApplePayProcessing,
  },
  {
    id: 'apple-pay-success',
    title: 'Add to Apple Pay – Success',
    description: 'Confirmation that the card was added to Apple Pay.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'Button'],
    component: Screen15_ApplePaySuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Entendi' },
    ],
  },
]

const updatePhoneScreens = [
  {
    id: 'update-phone-input',
    title: 'Update Phone – Enter Number',
    description: 'User enters their new phone number.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Text', 'TextInput', 'Button'],
    component: Screen16_UpdatePhoneInput,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'update-phone-verify',
    title: 'Update Phone – Verify',
    description: 'User enters the verification code sent to their new phone number.',
    componentsUsed: ['BaseLayout', 'Header', 'StickyFooter', 'Stack', 'Text', 'PinInput', 'Button'],
    component: Screen17_UpdatePhoneVerify,
    interactiveElements: [
      { id: 'btn-verify', component: 'Button', label: 'Verificar' },
    ],
  },
  {
    id: 'update-phone-success',
    title: 'Update Phone – Success',
    description: 'Confirmation that phone number was updated.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Stack', 'Text', 'Button'],
    component: Screen18_UpdatePhoneSuccess,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Voltar' },
    ],
  },
]

const allScreens = [
  ...cardsListScreens,
  ...cardInfoScreens,
  ...createVirtualScreens,
  ...editLimitsScreens,
  ...renameScreens,
  ...removeScreens,
  ...reportLossScreens,
  ...applePayScreens,
  ...updatePhoneScreens,
]

// ── Register Pages ──

for (const s of allScreens) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Cards',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

// ── Register Flows ──

registerFlow({
  id: 'card-list',
  name: 'Cards',
  description: 'Cards tab: list of physical and virtual cards with actions to create, manage, and configure cards.',
  domain: 'cards',
  level: 1,
  linkedFlows: ['card-info', 'create-virtual-card', 'update-phone'],
  screens: cardsListScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'card-info',
  name: 'Card Info',
  description: 'Card details with number, expiry, CVV, daily limits, and card-specific actions (freeze, rename, remove, Apple Pay).',
  domain: 'cards',
  level: 2,

  linkedFlows: ['edit-daily-limits', 'rename-virtual-card', 'remove-virtual-card', 'report-card-loss', 'apple-pay-setup'],
  screens: cardInfoScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'create-virtual-card',
  name: 'Create Virtual Card',
  description: 'Create a new virtual card: choose name → processing → success.',
  domain: 'cards',
  level: 2,

  screens: createVirtualScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'edit-daily-limits',
  name: 'Edit Daily Limits',
  description: 'Edit shared daily transaction limits across all cards.',
  domain: 'cards',
  level: 2,

  screens: editLimitsScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'rename-virtual-card',
  name: 'Rename Virtual Card',
  description: 'Rename a virtual card with a new custom name.',
  domain: 'cards',
  level: 2,

  screens: renameScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'remove-virtual-card',
  name: 'Remove Virtual Card',
  description: 'Confirm and remove a virtual card permanently.',
  domain: 'cards',
  level: 2,

  screens: removeScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'report-card-loss',
  name: 'Report Card Loss',
  description: 'Report a physical card as lost or stolen. Card is cancelled and replacement is sent.',
  domain: 'cards',
  level: 2,

  screens: reportLossScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'apple-pay-setup',
  name: 'Add to Apple Pay',
  description: 'Add a card to Apple Pay wallet.',
  domain: 'cards',
  level: 2,

  screens: applePayScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'update-phone',
  name: 'Update Phone Number',
  description: 'Update the phone number associated with cards. Enter new number → verify → success.',
  domain: 'cards',
  level: 2,

  screens: updatePhoneScreens.map((s) => ({ ...s, pageId: s.id })),
})

// ── Flow Graph: card-list ──
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Cards List screen
    { id: 'n-list', type: 'screen', position: { x, y: 0 }, data: { label: 'Cards List', screenId: 'cards-list', nodeType: 'screen', pageId: 'cards-list', description: 'Tab screen showing all user cards and action buttons.' } as FlowNodeData },

    // Row 1: Action nodes for list interactions
    { id: 'n-tap-card', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Card Item', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Card Item' } as FlowNodeData },
    { id: 'n-tap-create', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Criar cartão virtual', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Criar cartão virtual' } as FlowNodeData },
    { id: 'n-tap-phone', type: 'action', position: { x: xR, y: ROW }, data: { label: 'Tap Atualizar telefone', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Atualizar meu telefone' } as FlowNodeData },

    // Row 2: Flow references
    { id: 'n-ref-info', type: 'flow-reference', position: { x: xL, y: ROW * 2 }, data: { label: 'Card Info', screenId: null, nodeType: 'flow-reference', targetFlowId: 'card-info' } as FlowNodeData },
    { id: 'n-ref-create', type: 'flow-reference', position: { x, y: ROW * 2 }, data: { label: 'Create Virtual Card', screenId: null, nodeType: 'flow-reference', targetFlowId: 'create-virtual-card' } as FlowNodeData },
    { id: 'n-ref-phone', type: 'flow-reference', position: { x: xR, y: ROW * 2 }, data: { label: 'Update Phone', screenId: null, nodeType: 'flow-reference', targetFlowId: 'update-phone' } as FlowNodeData },

    // Note: request physical card (dead end for now)
    { id: 'n-tap-physical', type: 'action', position: { x: xR, y: ROW * 3 }, data: { label: 'Tap Pedir cartão físico', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Pedir cartão físico' } as FlowNodeData },
    { id: 'n-note-physical', type: 'note', position: { x: xR, y: ROW * 4 }, data: { label: 'Physical Card Request', screenId: null, nodeType: 'note', description: 'Future flow: address confirmation → processing → success. Stub for now.' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-list', target: 'n-tap-card', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-list', target: 'n-tap-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-list', target: 'n-tap-phone', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-4', source: 'n-tap-card', target: 'n-ref-info', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-create', target: 'n-ref-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-phone', target: 'n-ref-phone', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-list', target: 'n-tap-physical', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-8', source: 'n-tap-physical', target: 'n-note-physical', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('card-list', nodes, edges)
}

// ── Flow Graph: card-info ──
{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    { id: 'n-info', type: 'screen', position: { x, y: 0 }, data: { label: 'Card Info', screenId: 'card-info', nodeType: 'screen', pageId: 'card-info', description: 'Card details, copy number, shortcuts. Different actions for virtual vs physical.' } as FlowNodeData },

    // Virtual card actions
    { id: 'n-tap-rename', type: 'action', position: { x: xL, y: ROW }, data: { label: 'Tap Renomear', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Renomear' } as FlowNodeData },
    { id: 'n-tap-freeze', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Congelar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Congelar' } as FlowNodeData },
    { id: 'n-tap-remove', type: 'action', position: { x: xR, y: ROW }, data: { label: 'Tap Remover', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Remover' } as FlowNodeData },

    // Row 2: destinations for virtual actions
    { id: 'n-ref-rename', type: 'flow-reference', position: { x: xL, y: ROW * 2 }, data: { label: 'Rename Virtual Card', screenId: null, nodeType: 'flow-reference', targetFlowId: 'rename-virtual-card' } as FlowNodeData },
    { id: 'n-freeze-modal', type: 'overlay', position: { x, y: ROW * 2 }, data: { label: 'Freeze Confirmation', screenId: null, nodeType: 'overlay', overlayType: 'modal', parentScreenNodeId: 'n-info', description: 'Modal: "Tem certeza que deseja congelar este cartão?" → Toast feedback' } as FlowNodeData },
    { id: 'n-ref-remove', type: 'flow-reference', position: { x: xR, y: ROW * 2 }, data: { label: 'Remove Virtual Card', screenId: null, nodeType: 'flow-reference', targetFlowId: 'remove-virtual-card' } as FlowNodeData },

    // Shared actions (both card types)
    { id: 'n-tap-limits', type: 'action', position: { x: xL, y: ROW * 3 }, data: { label: 'Tap Limites diários', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Limites diários' } as FlowNodeData },
    { id: 'n-tap-apple-pay', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Apple Pay', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Apple Pay' } as FlowNodeData },

    { id: 'n-ref-limits', type: 'flow-reference', position: { x: xL, y: ROW * 4 }, data: { label: 'Edit Daily Limits', screenId: null, nodeType: 'flow-reference', targetFlowId: 'edit-daily-limits' } as FlowNodeData },
    { id: 'n-ref-apple-pay', type: 'flow-reference', position: { x, y: ROW * 4 }, data: { label: 'Add to Apple Pay', screenId: null, nodeType: 'flow-reference', targetFlowId: 'apple-pay-setup' } as FlowNodeData },

    // Physical-only actions
    { id: 'n-tap-pin', type: 'action', position: { x: xL, y: ROW * 5 }, data: { label: 'Tap Ver senha', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Ver senha' } as FlowNodeData },
    { id: 'n-tap-report', type: 'action', position: { x: xR, y: ROW * 5 }, data: { label: 'Tap Reportar perda', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ShortcutButton: Reportar perda' } as FlowNodeData },

    { id: 'n-pin-sheet', type: 'overlay', position: { x: xL, y: ROW * 6 }, data: { label: 'PIN BottomSheet', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-info', description: 'Shows the 4-digit card PIN' } as FlowNodeData },
    { id: 'n-ref-report', type: 'flow-reference', position: { x: xR, y: ROW * 6 }, data: { label: 'Report Card Loss', screenId: null, nodeType: 'flow-reference', targetFlowId: 'report-card-loss' } as FlowNodeData },
  ]

  const edges = [
    // Virtual actions
    { id: 'e-1', source: 'n-info', target: 'n-tap-rename', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-info', target: 'n-tap-freeze', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-info', target: 'n-tap-remove', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-4', source: 'n-tap-rename', target: 'n-ref-rename', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-freeze', target: 'n-freeze-modal', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-remove', target: 'n-ref-remove', sourceHandle: 'bottom', targetHandle: 'top' },
    // Shared actions
    { id: 'e-7', source: 'n-info', target: 'n-tap-limits', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-8', source: 'n-info', target: 'n-tap-apple-pay', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-limits', target: 'n-ref-limits', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-apple-pay', target: 'n-ref-apple-pay', sourceHandle: 'bottom', targetHandle: 'top' },
    // Physical actions
    { id: 'e-11', source: 'n-info', target: 'n-tap-pin', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-12', source: 'n-info', target: 'n-tap-report', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-13', source: 'n-tap-pin', target: 'n-pin-sheet', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-14', source: 'n-tap-report', target: 'n-ref-report', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('card-info', nodes, edges)
}

// ── Flow Graph: create-virtual-card ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-name', type: 'screen', position: { x, y: 0 }, data: { label: 'Choose Name', screenId: 'create-virtual-name', nodeType: 'screen', pageId: 'create-virtual-name' } as FlowNodeData },
    { id: 'n-tap-create', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Criar cartão', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Criar cartão' } as FlowNodeData },
    { id: 'n-api-create', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Create Card', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/cards/virtual', description: 'Creates virtual card with custom name' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Processing', screenId: 'create-virtual-processing', nodeType: 'screen', pageId: 'create-virtual-processing' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 4 }, data: { label: 'Success', screenId: 'create-virtual-success', nodeType: 'screen', pageId: 'create-virtual-success' } as FlowNodeData },
    { id: 'n-tap-done', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Ver meus cartões', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver meus cartões' } as FlowNodeData },
    { id: 'n-ref-list', type: 'flow-reference', position: { x, y: ROW * 6 }, data: { label: 'Cards List', screenId: null, nodeType: 'flow-reference', targetFlowId: 'card-list' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-name', target: 'n-tap-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-create', target: 'n-api-create', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-create', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-success', target: 'n-tap-done', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-done', target: 'n-ref-list', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('create-virtual-card', nodes, edges)
}

// ── Flow Graph: edit-daily-limits ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-edit', type: 'screen', position: { x, y: 0 }, data: { label: 'Edit Limits', screenId: 'edit-limits', nodeType: 'screen', pageId: 'edit-limits' } as FlowNodeData },
    { id: 'n-tap-save', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Salvar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Salvar alterações' } as FlowNodeData },
    { id: 'n-api-save', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Update Limits', screenId: null, nodeType: 'api-call', apiMethod: 'PUT', apiEndpoint: '/api/cards/limits', description: 'Updates shared daily limits' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Success', screenId: 'edit-limits-success', nodeType: 'screen', pageId: 'edit-limits-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-edit', target: 'n-tap-save', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-save', target: 'n-api-save', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-save', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('edit-daily-limits', nodes, edges)
}

// ── Flow Graph: rename-virtual-card ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-rename', type: 'screen', position: { x, y: 0 }, data: { label: 'Rename Card', screenId: 'rename-card', nodeType: 'screen', pageId: 'rename-card' } as FlowNodeData },
    { id: 'n-tap-save', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Salvar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Salvar' } as FlowNodeData },
    { id: 'n-api-rename', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Rename Card', screenId: null, nodeType: 'api-call', apiMethod: 'PUT', apiEndpoint: '/api/cards/:id/name' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Success', screenId: 'rename-success', nodeType: 'screen', pageId: 'rename-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-rename', target: 'n-tap-save', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-save', target: 'n-api-rename', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-rename', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('rename-virtual-card', nodes, edges)
}

// ── Flow Graph: remove-virtual-card ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-confirm', type: 'screen', position: { x, y: 0 }, data: { label: 'Confirm Remove', screenId: 'remove-card-confirm', nodeType: 'screen', pageId: 'remove-card-confirm' } as FlowNodeData },
    { id: 'n-tap-remove', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Remover cartão', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Remover cartão' } as FlowNodeData },
    { id: 'n-api-remove', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Delete Card', screenId: null, nodeType: 'api-call', apiMethod: 'DELETE', apiEndpoint: '/api/cards/:id' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Card Removed', screenId: 'remove-card-success', nodeType: 'screen', pageId: 'remove-card-success' } as FlowNodeData },
    { id: 'n-tap-done', type: 'action', position: { x, y: ROW * 4 }, data: { label: 'Tap Ver meus cartões', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver meus cartões' } as FlowNodeData },
    { id: 'n-ref-list', type: 'flow-reference', position: { x, y: ROW * 5 }, data: { label: 'Cards List', screenId: null, nodeType: 'flow-reference', targetFlowId: 'card-list' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-confirm', target: 'n-tap-remove', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-remove', target: 'n-api-remove', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-remove', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-success', target: 'n-tap-done', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-done', target: 'n-ref-list', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('remove-virtual-card', nodes, edges)
}

// ── Flow Graph: report-card-loss ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-report', type: 'screen', position: { x, y: 0 }, data: { label: 'Report Loss', screenId: 'report-loss', nodeType: 'screen', pageId: 'report-loss' } as FlowNodeData },
    { id: 'n-tap-lost', type: 'action', position: { x: 0, y: ROW }, data: { label: 'Tap Perdi meu cartão', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Perdi meu cartão' } as FlowNodeData },
    { id: 'n-tap-stolen', type: 'action', position: { x: 600, y: ROW }, data: { label: 'Tap Meu cartão foi roubado', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Meu cartão foi roubado' } as FlowNodeData },
    { id: 'n-api-cancel', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Cancel Card', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/cards/:id/cancel', description: 'Cancels card and triggers replacement shipment' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Card Disabled', screenId: 'report-loss-success', nodeType: 'screen', pageId: 'report-loss-success' } as FlowNodeData },
    { id: 'n-tap-done', type: 'action', position: { x, y: ROW * 4 }, data: { label: 'Tap Ver meus cartões', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Ver meus cartões' } as FlowNodeData },
    { id: 'n-ref-list', type: 'flow-reference', position: { x, y: ROW * 5 }, data: { label: 'Cards List', screenId: null, nodeType: 'flow-reference', targetFlowId: 'card-list' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-report', target: 'n-tap-lost', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-report', target: 'n-tap-stolen', sourceHandle: 'right-source', targetHandle: 'left-target' },
    { id: 'e-3', source: 'n-tap-lost', target: 'n-api-cancel', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-stolen', target: 'n-api-cancel', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-api-cancel', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-success', target: 'n-tap-done', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-tap-done', target: 'n-ref-list', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('report-card-loss', nodes, edges)
}

// ── Flow Graph: apple-pay-setup ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-processing', type: 'screen', position: { x, y: 0 }, data: { label: 'Adding to Apple Pay', screenId: 'apple-pay-processing', nodeType: 'screen', pageId: 'apple-pay-processing' } as FlowNodeData },
    { id: 'n-api-add', type: 'api-call', position: { x, y: ROW }, data: { label: 'Provision Card', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/cards/:id/apple-pay', description: 'Provisions card to Apple Pay via issuer tokenization' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Added to Apple Pay', screenId: 'apple-pay-success', nodeType: 'screen', pageId: 'apple-pay-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-processing', target: 'n-api-add', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-api-add', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('apple-pay-setup', nodes, edges)
}

// ── Flow Graph: update-phone ──
{
  const ROW = 120
  const x = 300

  const nodes = [
    { id: 'n-input', type: 'screen', position: { x, y: 0 }, data: { label: 'Enter Number', screenId: 'update-phone-input', nodeType: 'screen', pageId: 'update-phone-input' } as FlowNodeData },
    { id: 'n-tap-continue', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-api-send-code', type: 'api-call', position: { x, y: ROW * 2 }, data: { label: 'Send Verification', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/phone/verify', description: 'Sends SMS verification code to new phone number' } as FlowNodeData },
    { id: 'n-verify', type: 'screen', position: { x, y: ROW * 3 }, data: { label: 'Verify Code', screenId: 'update-phone-verify', nodeType: 'screen', pageId: 'update-phone-verify' } as FlowNodeData },
    { id: 'n-tap-verify', type: 'action', position: { x, y: ROW * 4 }, data: { label: 'Tap Verificar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Verificar' } as FlowNodeData },
    { id: 'n-api-confirm', type: 'api-call', position: { x, y: ROW * 5 }, data: { label: 'Confirm Phone', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/phone/confirm', description: 'Validates code and updates phone number' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 }, data: { label: 'Phone Updated', screenId: 'update-phone-success', nodeType: 'screen', pageId: 'update-phone-success' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-1', source: 'n-input', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-continue', target: 'n-api-send-code', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-api-send-code', target: 'n-verify', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-verify', target: 'n-tap-verify', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-verify', target: 'n-api-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-api-confirm', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('update-phone', nodes, edges)
}
