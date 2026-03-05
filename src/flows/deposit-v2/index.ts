import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_AmountEntry from './Screen1_AmountEntry'
import Screen3_PixPayment from './Screen3_PixPayment'
import Screen4_Processing from './Screen4_Processing'
import Screen5_Success from './Screen5_Success'

const screenDefs = [
  {
    id: 'deposit-v2-amount',
    title: 'Amount Entry',
    description: 'Dual currency input with bi-directional conversion. Shows skeleton while calculating, then reveals fee breakdown and benefit banner.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'Button', 'Divider', 'ListItem', 'Avatar', 'DataList', 'Banner', 'Skeleton', 'BottomSheet', 'StickyFooter', 'Stack'],
    component: Screen1_AmountEntry,
    states: [
      { id: 'default', name: 'Empty', description: 'No amount entered yet', isDefault: true, data: {} },
      { id: 'loading', name: 'Calculating', description: 'Amount entered, calculating conversion', data: { initialAmount: '10000', initialCalcState: 'loading' } },
      { id: 'ready', name: 'Ready', description: 'Calculation complete, CTA enabled', data: { initialAmount: '10000', initialCalcState: 'ready' } },
      { id: 'error', name: 'Error', description: 'Amount too low or validation error', data: { initialAmount: '50', initialCalcState: 'error' } },
    ],
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
      { id: 'btn-change', component: 'Button', label: 'Mudar' },
      { id: 'input-receive', component: 'CurrencyInput', label: 'Receba (USD)' },
      { id: 'input-pay', component: 'CurrencyInput', label: 'Pague (BRL)' },
      { id: 'li-payment-method', component: 'ListItem', label: 'Você paga em' },
    ],
  },
  {
    id: 'deposit-v2-pix-payment',
    title: 'PIX Payment',
    description: 'PIX code display with copy action, countdown timer, QR code button, and payment details.',
    componentsUsed: ['BaseLayout', 'Header', 'Banner', 'Button', 'IconButton', 'DataList', 'ListItem', 'GroupHeader', 'Text', 'Toast', 'Countdown', 'BottomSheet', 'StickyFooter', 'Stack'],
    component: Screen3_PixPayment,
    states: [
      { id: 'default', name: 'Active', description: 'PIX code is active and timer is running', isDefault: true, data: {} },
      { id: 'error-expired', name: 'Expired', description: 'PIX timer has expired', data: { initialExpired: true } },
    ],
    interactiveElements: [
      { id: 'btn-copy', component: 'Button', label: 'Copiar código' },
      { id: 'btn-qr', component: 'IconButton', label: 'QR Code' },
    ],
  },
  {
    id: 'deposit-v2-processing',
    title: 'Processing',
    description: 'Animated loading state with rotating messages and progress bar. Auto-advances after ~5.5 seconds.',
    componentsUsed: ['LoadingScreen'],
    component: Screen4_Processing,
  },
  {
    id: 'deposit-v2-success',
    title: 'Success',
    description: 'Deposit confirmed with savings nudge banner and transaction summary.',
    componentsUsed: ['FeedbackLayout', 'Button', 'DataList', 'Banner', 'GroupHeader', 'Text', 'StickyFooter', 'Stack'],
    component: Screen5_Success,
    interactiveElements: [
      { id: 'btn-invest', component: 'Button', label: 'Investir agora' },
      { id: 'btn-done', component: 'Button', label: 'Concluir' },
    ],
  },
]

// Register each screen as a standalone page (with states when defined)
for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Transactions',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}

registerFlow({
  id: 'deposit-pix-v2',
  name: 'Deposit via PIX',
  description: 'Card PIX deposit: user enters BRL amount, BRLA mints tokens via PIX, backend executes subsequent swap (BRLA → EURe) to fund Gnosis Pay card.',
  domain: 'add-funds',
  level: 2,
  linkedFlows: ['deposit-ach', 'invest-earn-5pct'],
  entryPoints: ['dashboard-add-funds', 'quick-action'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// Bootstrap flow graph mirroring the real Card PIX Deposit production flow
{
  const ROW = 120
  const x = 300 // spine
  const xL = 0 // left column (overlays, async jobs)
  const xR = 600 // right column (errors, webhooks)

  const nodes = [
    // ── Row 0: KYC Check ──
    { id: 'n-api-kyc', type: 'api-call', position: { x, y: 0 }, data: { label: 'Check KYC Level', screenId: null, nodeType: 'api-call', apiMethod: 'GET', apiEndpoint: '/api/ramp/brla/get-kyc-level', description: 'getBrlaKycInfo() → BRLA GET /v1/superuser/kyc/info' } as FlowNodeData },

    // ── Row 1: KYC Decision ──
    { id: 'n-kyc-decision', type: 'decision', position: { x, y: ROW }, data: { label: 'KYC OK?', screenId: null, nodeType: 'decision', description: 'Check kycLevel and deposit limits from BrlaKycInfo' } as FlowNodeData },
    { id: 'n-kyc-redirect', type: 'error', position: { x: xR, y: ROW }, data: { label: 'KYC / Email Verification', screenId: null, nodeType: 'error', description: 'Redirect to KYC flow (useBrlaKycLevelChecker)' } as FlowNodeData },

    // ── Row 2: Amount Entry screen ──
    { id: 'n-amount', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Amount Entry', screenId: 'deposit-v2-amount', nodeType: 'screen', pageId: 'deposit-v2-amount', description: 'CardDepositPixInputPage — dual currency BRL/EUR input' } as FlowNodeData },

    // ── Row 3: Payment method overlay (left) + Tap Continuar action (spine) ──
    { id: 'n-payment-sheet', type: 'overlay', position: { x: xL, y: ROW * 3 }, data: { label: 'Payment Method', screenId: null, nodeType: 'overlay', overlayType: 'bottom-sheet', parentScreenNodeId: 'n-amount', description: 'Select payment currency: BRL (PIX), USD (Wire), EUR (SEPA), or Crypto', interactiveElements: [{ id: 'li-brl', component: 'ListItem', label: 'Real Brasileiro' }, { id: 'li-usd', component: 'ListItem', label: 'Dólar Americano' }, { id: 'li-eur', component: 'ListItem', label: 'Euro' }, { id: 'li-crypto', component: 'ListItem', label: 'Criptomoedas' }] } as FlowNodeData },
    { id: 'n-tap-continuar', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },

    // ── Row 4: Tap USD action (left) + Swap Quote (spine) ──
    { id: 'n-tap-usd', type: 'action', position: { x: xL, y: ROW * 4 }, data: { label: 'User taps Dólar Americano', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Dólar Americano' } as FlowNodeData },
    { id: 'n-api-quote', type: 'api-call', position: { x, y: ROW * 4 }, data: { label: 'Get Swap Quote', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/swap/quote', description: 'usePixToCryptoTxs — quote BRLA → EURe with isCardPixDeposit: true. User signs swap transaction.' } as FlowNodeData },

    // ── Row 5: Wire ref (left) + Create Order (spine) ──
    { id: 'n-ref-ach', type: 'flow-reference', position: { x: xL, y: ROW * 5 }, data: { label: 'Deposit via Wire', screenId: null, nodeType: 'flow-reference', targetFlowId: 'deposit-ach' } as FlowNodeData },
    { id: 'n-api-create-order', type: 'api-call', position: { x, y: ROW * 5 }, data: { label: 'Create PIX Order', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/ramp/brla/create-pix-to-brla-order', description: 'createPixToBrlaOrder() → BRLA POST /v1/superuser/buy/static-pix. Includes subsequentSwap. Dedup check. Inserts rampOrder (status: paymentPending).' } as FlowNodeData },

    // ── Row 6: Generate PIX QR ──
    { id: 'n-api-static-pix', type: 'api-call', position: { x, y: ROW * 6 }, data: { label: 'Generate PIX QR', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/ramp/brla/create-static-pix', description: 'staticPix() — local EMV payload + QR code generation' } as FlowNodeData },

    // ── Row 7: PIX Payment screen + Notes (left) + Status note (right) ──
    { id: 'n-pix', type: 'screen', position: { x, y: ROW * 7 }, data: { label: 'PIX Payment', screenId: 'deposit-v2-pix-payment', nodeType: 'screen', pageId: 'deposit-v2-pix-payment', description: 'CardDepositPixPayment — QR code display, copy-paste code, 20min countdown (usePixCountdown)' } as FlowNodeData },
    { id: 'n-note-pix', type: 'note', position: { x: xL, y: ROW * 7 }, data: { label: 'PIX Notes', screenId: null, nodeType: 'note', description: 'PIX payments expire after 20min (ORDER_EXPIRATION_TIME). BRLA webhook also pushes MINT events asynchronously.' } as FlowNodeData },
    { id: 'n-note-status', type: 'note', position: { x: xR, y: ROW * 7 }, data: { label: 'Ramp Order Status Machine', screenId: null, nodeType: 'note', description: 'paymentPending → paid → mintQueued → mintSuccess → swapExecuted. Also: paymentPending → expired, mintQueued → mintFailed.' } as FlowNodeData },

    // ── Row 8: User pays via PIX (action) ──
    { id: 'n-user-pays', type: 'action', position: { x, y: ROW * 8 }, data: { label: 'User pays via PIX', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'User completes PIX payment in banking app' } as FlowNodeData },

    // ── Row 9: Poll Order Status + Webhook (right) ──
    { id: 'n-poll-order', type: 'delay', position: { x, y: ROW * 9 }, data: { label: 'Poll order-details (1s)', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'useBrlaRampOrderData → POST /api/ramp/brla/order-details → getAndUpdateBrlaOrder() → BRLA GET /v1/superuser/buy/static-pix/history' } as FlowNodeData },
    { id: 'n-webhook', type: 'delay', position: { x: xR, y: ROW * 9 }, data: { label: 'BRLA Webhook', screenId: null, nodeType: 'delay', delayType: 'webhook', description: 'POST /api/ramp/brla/webhook (MINT event) → processWebhookMintEvent() → rampOrder status: mintSuccess' } as FlowNodeData },

    // ── Row 10: Order Decision + Expired (right) ──
    { id: 'n-order-status', type: 'decision', position: { x, y: ROW * 10 }, data: { label: 'Order status?', screenId: null, nodeType: 'decision', description: 'RampOrderStatus: paymentPending → paid → mintQueued → mintSuccess' } as FlowNodeData },
    { id: 'n-expired', type: 'error', position: { x: xR, y: ROW * 10 }, data: { label: 'PIX Expired', screenId: null, nodeType: 'error', description: 'ORDER_EXPIRATION_TIME: 20 minutes. Status → expired.' } as FlowNodeData },

    // ── Row 11: Processing screen + Backend swap (left) ──
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 11 }, data: { label: 'Processing', screenId: 'deposit-v2-processing', nodeType: 'screen', pageId: 'deposit-v2-processing', description: 'CardDepositPixStatus — Processing swap...' } as FlowNodeData },
    { id: 'n-backend-swap', type: 'api-call', position: { x: xL, y: ROW * 11 }, data: { label: 'Execute Subsequent Swap', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: 'backend job', description: 'process-subsequent-swaps-continuous-job: on mintSuccess, execute CowSwap (BRLA → EURe). Create/update swap record.' } as FlowNodeData },

    // ── Row 12: Poll Swap Status ──
    { id: 'n-poll-swap', type: 'delay', position: { x, y: ROW * 12 }, data: { label: 'Poll swap/status (1s)', screenId: null, nodeType: 'delay', delayType: 'polling', delayDuration: '1s interval', description: 'POST /api/swap/status — poll until swap completes or fails' } as FlowNodeData },

    // ── Row 13: Swap Decision + Failed (right) ──
    { id: 'n-swap-decision', type: 'decision', position: { x, y: ROW * 13 }, data: { label: 'Swap result?', screenId: null, nodeType: 'decision', description: 'Swap complete → success. Swap failed → fallback.' } as FlowNodeData },
    { id: 'n-swap-failed', type: 'error', position: { x: xR, y: ROW * 13 }, data: { label: 'Swap Failed (Fallback)', screenId: null, nodeType: 'error', description: 'CardDepositPixFallbackStatus — BRLA minted but swap to EURe failed' } as FlowNodeData },

    // ── Row 14: Success screen + Reconcile (left) ──
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 14 }, data: { label: 'Success', screenId: 'deposit-v2-success', nodeType: 'screen', pageId: 'deposit-v2-success', description: 'CardDepositPixSuccess — card funded' } as FlowNodeData },
    { id: 'n-reconcile', type: 'api-call', position: { x: xL, y: ROW * 14 }, data: { label: 'Reconcile Transaction', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: 'backend job', description: 'Change stream on rampOrders → reconcileTransaction() → upsert unifiedTransactions + send push/email notification' } as FlowNodeData },
  ]

  const edges = [
    // Main spine: KYC → Amount → Tap Continuar → Quote → Order → PIX QR → Payment → User pays → Poll → Decision → Processing → Poll Swap → Decision → Success
    { id: 'e-1', source: 'n-api-kyc', target: 'n-kyc-decision', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-kyc-decision', target: 'n-kyc-redirect', sourceHandle: 'right-source', targetHandle: 'left-target', label: 'No' },
    { id: 'e-3', source: 'n-kyc-decision', target: 'n-amount', sourceHandle: 'bottom', targetHandle: 'top', label: 'Yes' },
    { id: 'e-4', source: 'n-amount', target: 'n-tap-continuar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-tap-continuar', target: 'n-api-quote', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-api-quote', target: 'n-api-create-order', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-api-create-order', target: 'n-api-static-pix', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-api-static-pix', target: 'n-pix', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-pix', target: 'n-user-pays', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-user-pays', target: 'n-poll-order', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-poll-order', target: 'n-order-status', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-order-status', target: 'n-expired', sourceHandle: 'right-source', targetHandle: 'left-target', label: 'expired' },
    { id: 'e-13', source: 'n-order-status', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top', label: 'paid / mintSuccess' },
    { id: 'e-14', source: 'n-processing', target: 'n-poll-swap', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-15', source: 'n-poll-swap', target: 'n-swap-decision', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-16', source: 'n-swap-decision', target: 'n-swap-failed', sourceHandle: 'right-source', targetHandle: 'left-target', label: 'Failed' },
    { id: 'e-17', source: 'n-swap-decision', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top', label: 'Complete' },

    // Webhook feeds into poll (horizontal from right)
    { id: 'e-webhook', source: 'n-webhook', target: 'n-poll-order', sourceHandle: 'left-source', targetHandle: 'right-target' },

    // Backend swap job runs alongside processing (horizontal from spine to left)
    { id: 'e-backend-swap', source: 'n-processing', target: 'n-backend-swap', sourceHandle: 'left-source', targetHandle: 'right-target' },

    // Reconcile runs after success (horizontal from spine to left)
    { id: 'e-reconcile', source: 'n-success', target: 'n-reconcile', sourceHandle: 'left-source', targetHandle: 'right-target' },

    // Payment method overlay (horizontal from spine to left)
    { id: 'e-sheet', source: 'n-amount', target: 'n-payment-sheet', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-tap-usd', source: 'n-payment-sheet', target: 'n-tap-usd', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-ref-ach', source: 'n-tap-usd', target: 'n-ref-ach', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('deposit-pix-v2', nodes, edges)
}
