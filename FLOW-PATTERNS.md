# FLOW-PATTERNS.md

The authoritative guide for flow graph authoring in Picnic Design Lab. **Read this before creating or modifying any flow's `index.ts`.**

For screen composition and UI components, see `PATTERNS.md`. This document covers the graph — the `saveFlowGraph()` block that defines navigation, system context, and cross-flow linking.

---

## 1. Flow-First Principle

**Define the graph BEFORE writing screens.** The graph is the spec.

A flow without a graph is just a slideshow. The graph documents:
- What the user can tap and where it leads
- What API calls happen between screens
- What decisions the system makes (KYC checks, payment status, etc.)
- How this flow connects to other flows
- What overlays exist and how they're triggered

**Rules:**
1. **No direct screen-to-screen edges** — every transition between two screens must pass through at least one intermediate node (action, api-call, decision, delay) that explains WHY the transition happens. A user action, a system call, or a decision must always justify moving from one screen to the next.
2. Every `onElementTap()` call in a screen MUST be backed by an action node in the graph
3. Every `linkedFlows` entry MUST have a `flow-reference` node reachable via action nodes
4. Every BottomSheet MUST have an overlay node with `parentScreenNodeId`
5. `saveFlowGraph()` MUST be called in `index.ts` — never rely on auto-generation for non-trivial flows

Auto-generation (`flowGraphAutoGen.ts`) produces a linear screen chain only. It has no knowledge of interactive elements, API calls, decisions, or cross-flow links. Use it only as a fallback for flows you haven't authored yet.

---

## 2. The `index.ts` Authoring Order

Write your flow's `index.ts` in this exact order:

### Step 1 — Define `screenDefs[]`

Each screen definition must include `interactiveElements` for every tappable UI element:

```ts
const screenDefs = [
  {
    id: 'my-flow-hub',
    title: 'Hub Screen',
    description: 'What this screen does and why.',
    componentsUsed: ['BaseLayout', 'Header', 'ShortcutButton', 'Stack'],
    component: Screen1_Hub,
    interactiveElements: [
      { id: 'shortcut-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'shortcut-withdraw', component: 'ShortcutButton', label: 'Sacar' },
      { id: 'btn-details', component: 'Button', label: 'Ver detalhes' },
    ],
  },
  // ...more screens
]
```

The `interactiveElements` array is the source of truth for what the user can tap. Every entry here must have a matching action node in the graph.

### Step 2 — `registerPage()` loop

```ts
for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'YourArea',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...('states' in s && s.states ? { states: s.states } : {}),
  })
}
```

### Step 3 — `registerFlow()`

```ts
registerFlow({
  id: 'my-flow',
  name: 'My Flow',
  description: 'What this flow accomplishes.',
  domain: 'domain-name',
  linkedFlows: ['child-flow-a', 'child-flow-b'],  // IDs of flows navigable from this one
  entryPoints: ['dashboard-shortcut'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})
```

### Step 4 — `saveFlowGraph()` block

This is the most important part. See Sections 3–6 for how to write it.

```ts
{
  const ROW = 120
  const x = 300    // spine
  const xL = 0     // left column
  const xR = 600   // right column

  const nodes = [ /* ... */ ]
  const edges = [ /* ... */ ]

  saveFlowGraph('my-flow', nodes, edges)
}
```

### Step 5 — Verify

Before committing, check:
- Every `interactiveElements` label has a matching action node (`actionTarget` matches exactly)
- Every `linkedFlows` ID has a reachable `flow-reference` node
- Every BottomSheet has an overlay node
- No screen calls `onNext()` unconditionally after `onElementTap()`

---

## 3. Node Type Reference

All node types are defined in `src/pages/simulator/flowGraph.types.ts`. The `FlowNodeData` interface is the data payload for each node.

### `screen`

A visible screen the user sees.

| Field | Required | Description |
|-------|----------|-------------|
| `screenId` | Yes | Must match a screen `id` from `screenDefs[]` |
| `pageId` | Yes | Must match a registered page ID (usually same as `screenId`) |
| `label` | Yes | Human-readable name shown on the graph node |
| `description` | Recommended | What this screen does (maps to production page name) |

```ts
{ id: 'n-amount', type: 'screen', position: { x, y: ROW * 2 },
  data: { label: 'Amount Entry', screenId: 'deposit-v2-amount',
          nodeType: 'screen', pageId: 'deposit-v2-amount',
          description: 'Dual currency BRL/EUR input' } as FlowNodeData }
```

### `action`

A user interaction that triggers navigation. **The bridge between screens and destinations.**

| Field | Required | Description |
|-------|----------|-------------|
| `actionTarget` | Yes | Exact string matching the `onElementTap()` call: `'Component: Label'` |
| `actionType` | Yes | One of: `'tap'`, `'swipe'`, `'input'`, `'scroll'`, `'long-press'` |
| `label` | Yes | Human-readable description (e.g., `'Tap Continuar'`) |

```ts
{ id: 'n-tap-continue', type: 'action', position: { x, y: ROW * 3 },
  data: { label: 'Tap Continuar', screenId: null, nodeType: 'action',
          actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData }
```

**Critical:** The `actionTarget` must match the screen's `onElementTap()` string exactly. The navigation engine (`resolveScreenElementTarget`) does an exact string comparison.

### `flow-reference`

A link to another registered flow.

| Field | Required | Description |
|-------|----------|-------------|
| `targetFlowId` | Yes | Must match a registered flow's `id` |
| `label` | Yes | Name of the target flow |

```ts
{ id: 'n-ref-activate', type: 'flow-reference', position: { x: xR, y: ROW * 4 },
  data: { label: 'Activate Card', screenId: null, nodeType: 'flow-reference',
          targetFlowId: 'card-activate' } as FlowNodeData }
```

### `overlay`

A BottomSheet, Modal, Dialog, or other overlay surface.

| Field | Required | Description |
|-------|----------|-------------|
| `overlayType` | Yes | One of: `'bottom-sheet'`, `'modal'`, `'dialog'`, `'popover'`, `'toast'` |
| `parentScreenNodeId` | Yes | The `id` of the screen node this overlay belongs to |
| `interactiveElements` | Optional | Array of `{ id, component, label }` for tappable items inside the overlay |
| `label` | Yes | Overlay name |

```ts
{ id: 'n-payment-sheet', type: 'overlay', position: { x: xL, y: ROW * 3 },
  data: { label: 'Payment Method', screenId: null, nodeType: 'overlay',
          overlayType: 'bottom-sheet', parentScreenNodeId: 'n-amount',
          description: 'Select payment currency',
          interactiveElements: [
            { id: 'li-brl', component: 'ListItem', label: 'Real Brasileiro' },
            { id: 'li-usd', component: 'ListItem', label: 'Dólar Americano' },
          ] } as FlowNodeData }
```

### `api-call`

A backend API call that happens between screens.

| Field | Required | Description |
|-------|----------|-------------|
| `apiMethod` | Yes | One of: `'GET'`, `'POST'`, `'PUT'`, `'DELETE'` |
| `apiEndpoint` | Yes | The endpoint path (e.g., `'/api/ramp/brla/create-order'`) |
| `description` | Recommended | What the API does, what service it calls |

```ts
{ id: 'n-api-quote', type: 'api-call', position: { x, y: ROW * 4 },
  data: { label: 'Get Swap Quote', screenId: null, nodeType: 'api-call',
          apiMethod: 'POST', apiEndpoint: '/api/swap/quote',
          description: 'Quote BRLA → EURe swap' } as FlowNodeData }
```

### `decision`

A branching point where the system chooses a path.

| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | The question being decided (e.g., `'KYC OK?'`, `'Order status?'`) |
| `description` | Recommended | What conditions determine the branches |

Outgoing edges MUST have `label` fields describing each branch (e.g., `'Yes'`/`'No'`, `'paid'`/`'expired'`).

```ts
{ id: 'n-kyc-check', type: 'decision', position: { x, y: ROW },
  data: { label: 'KYC OK?', screenId: null, nodeType: 'decision',
          description: 'Check kycLevel and deposit limits' } as FlowNodeData }
```

### `delay`

A wait/polling/webhook step.

| Field | Required | Description |
|-------|----------|-------------|
| `delayType` | Yes | One of: `'timer'`, `'polling'`, `'webhook'`, `'event'` |
| `delayDuration` | Optional | Estimated duration (e.g., `'1s interval'`, `'~30s'`, `'20min'`) |
| `description` | Recommended | What is being waited for |

```ts
{ id: 'n-poll-status', type: 'delay', position: { x, y: ROW * 9 },
  data: { label: 'Poll order status (1s)', screenId: null, nodeType: 'delay',
          delayType: 'polling', delayDuration: '1s interval',
          description: 'POST /api/ramp/order-details' } as FlowNodeData }
```

### `error`

A terminal or redirect state (expired, failed, blocked).

| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | What went wrong |
| `description` | Recommended | What happens next (redirect, retry, etc.) |

```ts
{ id: 'n-expired', type: 'error', position: { x: xR, y: ROW * 10 },
  data: { label: 'PIX Expired', screenId: null, nodeType: 'error',
          description: 'Timer expired after 20min. Status → expired.' } as FlowNodeData }
```

### `note`

A documentation annotation. Not part of navigation — purely informational.

| Field | Required | Description |
|-------|----------|-------------|
| `label` | Yes | Note title |
| `description` | Yes | The note content |

```ts
{ id: 'n-note-status', type: 'note', position: { x: xR, y: ROW * 7 },
  data: { label: 'Status Machine', screenId: null, nodeType: 'note',
          description: 'paymentPending → paid → mintQueued → mintSuccess' } as FlowNodeData }
```

---

## 4. The `onElementTap` Contract

`onElementTap` is how screen components communicate user interactions to the graph navigation engine. Getting this wrong is the #1 cause of broken flow navigation.

### Format

The string passed to `onElementTap()` must follow the format:

```
'Component: Label'
```

Where `Component` is the component name and `Label` is the visible UI text. Examples:
- `'Button: Continuar'`
- `'ShortcutButton: Depositar'`
- `'ListItem: Alterar PIN'`
- `'IconButton: QR Code'`

### Graph Side

For every `onElementTap()` call, there must be a chain in the graph:

```
screen node → action node (actionTarget matches exactly) → destination
```

The destination can be:
- Another `screen` node
- A `flow-reference` node (cross-flow navigation)
- A pass-through chain (api-call → screen, decision → screen, etc.)

### Screen Side — Correct Pattern

```tsx
// CORRECT: Check the return value
const handleContinue = () => {
  const resolved = onElementTap?.('Button: Continuar')
  if (!resolved) onNext()
}
```

`onElementTap()` returns `true` if the graph resolved a target for that element. If it returns `false` (no matching action node found), fall back to `onNext()` for linear navigation.

### Screen Side — WRONG Pattern

```tsx
// WRONG: onNext() always fires, defeating graph navigation
const handleContinue = () => {
  onElementTap?.('Button: Continuar')
  onNext()  // ← This overrides the graph resolution!
}
```

Calling `onNext()` unconditionally after `onElementTap()` means the player always advances linearly, ignoring the graph's action nodes entirely. This is the most common bug.

### When `onElementTap` Is Not Needed

Simple screens with a single CTA that always advances to the next screen don't need `onElementTap`:

```tsx
// Simple linear advance — no onElementTap needed
const handleContinue = () => onNext()
```

Use `onElementTap` when:
- The screen has multiple tappable elements that go to different destinations
- A button should navigate to a different flow (cross-flow link)
- The graph has non-linear paths from this screen

---

## 5. Cross-Flow Linking

Cross-flow navigation connects flows together. It requires coordination between `registerFlow()` and the graph.

### Requirements

1. Every flow ID listed in `linkedFlows` must have a `flow-reference` node in the graph
2. The `flow-reference` node must be reachable via action nodes from a screen
3. The target flow must be registered (via `registerFlow()`) in its own `index.ts`

### Pattern

```
screen → action(actionTarget: 'ShortcutButton: Depositar') → flow-reference(targetFlowId: 'deposit-flow')
```

In the graph:

```ts
// Screen node
{ id: 'n-hub', type: 'screen', ... }

// Action node — actionTarget matches the onElementTap() call
{ id: 'n-tap-deposit', type: 'action', position: { x, y: ROW * 2 },
  data: { label: 'Tap Depositar', screenId: null, nodeType: 'action',
          actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData }

// Flow reference node — targetFlowId matches the registered flow ID
{ id: 'n-ref-deposit', type: 'flow-reference', position: { x, y: ROW * 3 },
  data: { label: 'Deposit Flow', screenId: null, nodeType: 'flow-reference',
          targetFlowId: 'deposit-flow' } as FlowNodeData }

// Edges
{ id: 'e-1', source: 'n-hub', target: 'n-tap-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
{ id: 'e-2', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
```

In the screen:

```tsx
const handleDeposit = () => {
  const resolved = onElementTap?.('ShortcutButton: Depositar')
  if (!resolved) onNext()
}
```

### `parentFlowId` vs. `linkedFlows`

- **`parentFlowId`**: Sidebar nesting only. Tells the UI to show this flow as a child in the flow list. Does NOT create navigation links.
- **`linkedFlows`**: Declares navigable connections. Every ID here must have a `flow-reference` node in the graph.

---

## 6. Graph Layout Conventions

Follow these conventions for consistent, readable graphs. Extracted from the canonical example `src/flows/deposit-v2/index.ts`.

### 3-Column Layout

```ts
const ROW = 120      // vertical spacing between rows
const x = 300        // center spine — main flow path
const xL = 0         // left column — overlays, async jobs, notes
const xR = 600       // right column — errors, branches, webhooks
```

- **Center spine (`x = 300`)**: Screen nodes, action nodes, API calls, decisions — the main happy path
- **Left column (`xL = 0`)**: Overlay nodes, async background jobs, notes
- **Right column (`xR = 600`)**: Error states, alternative branches, webhooks

### Vertical Spacing

Each row is `ROW * n` where `n` is the row number (0-indexed). This gives `120px` between node centers.

### Edge Handles

Edges connect via named handles on each node:

| Direction | Source Handle | Target Handle | When to use |
|-----------|-------------|--------------|-------------|
| Vertical (down) | `bottom` | `top` | Main spine flow |
| Right branch | `right-source` | `left-target` | Spine → error/branch (right column) |
| Left branch | `left-source` | `right-target` | Spine → overlay/async (left column) |

### Node ID Convention

Use `n-` prefix followed by a descriptive slug:

```
n-amount          (screen)
n-tap-continuar   (action)
n-api-quote       (api-call)
n-kyc-decision    (decision)
n-expired         (error)
n-ref-deposit     (flow-reference)
n-payment-sheet   (overlay)
n-poll-status     (delay)
n-note-status     (note)
```

### Edge ID Convention

Use `e-` prefix. Sequential numbering for the main spine (`e-1`, `e-2`, ...), descriptive slugs for branches (`e-webhook`, `e-ref-ach`, `e-sheet`).

---

## 7. Complete Worked Example

A hub flow with 2 sub-flows, demonstrating the full `index.ts` pattern. Based on the card-management pattern but with complete graph definitions.

```ts
import { registerFlow } from '../../pages/simulator/flowRegistry'
import { saveFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_Hub from './Screen1_Hub'
import Screen2_DetailEntry from './Screen2_DetailEntry'
import Screen3_Success from './Screen3_Success'

// ── Step 1: Define screen defs with interactiveElements ──

const hubScreens = [
  {
    id: 'wallet-hub',
    title: 'Wallet Hub',
    description: 'Wallet overview with balance and shortcut actions.',
    componentsUsed: ['BaseLayout', 'Header', 'Amount', 'ShortcutButton', 'Stack'],
    component: Screen1_Hub,
    interactiveElements: [
      { id: 'shortcut-deposit', component: 'ShortcutButton', label: 'Depositar' },
      { id: 'shortcut-withdraw', component: 'ShortcutButton', label: 'Sacar' },
    ],
  },
]

const depositScreens = [
  {
    id: 'wallet-deposit-entry',
    title: 'Deposit – Amount',
    description: 'User enters the deposit amount.',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'StickyFooter', 'Button'],
    component: Screen2_DetailEntry,
    interactiveElements: [
      { id: 'btn-continue', component: 'Button', label: 'Continuar' },
    ],
  },
  {
    id: 'wallet-deposit-success',
    title: 'Deposit – Success',
    description: 'Deposit confirmation screen.',
    componentsUsed: ['FeedbackLayout', 'StickyFooter', 'Button', 'DataList'],
    component: Screen3_Success,
    interactiveElements: [
      { id: 'btn-done', component: 'Button', label: 'Concluir' },
    ],
  },
]

const allScreens = [...hubScreens, ...depositScreens]

// ── Step 2: Register pages ──

for (const s of allScreens) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Wallet',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

// ── Step 3: Register flows ──

registerFlow({
  id: 'wallet-hub',
  name: 'Wallet Hub',
  description: 'Wallet overview with shortcuts to deposit and withdraw.',
  domain: 'wallet',
  linkedFlows: ['wallet-deposit', 'wallet-withdraw'],
  screens: hubScreens.map((s) => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'wallet-deposit',
  name: 'Wallet Deposit',
  description: 'Deposit money into wallet.',
  domain: 'wallet',
  level: 2,
  parentFlowId: 'wallet-hub',
  screens: depositScreens.map((s) => ({ ...s, pageId: s.id })),
})

// ── Step 4: saveFlowGraph() ──

{
  const ROW = 120
  const x = 300
  const xL = 0
  const xR = 600

  const nodes = [
    // Row 0: Hub screen
    { id: 'n-hub', type: 'screen', position: { x, y: 0 },
      data: { label: 'Wallet Hub', screenId: 'wallet-hub', nodeType: 'screen',
              pageId: 'wallet-hub' } as FlowNodeData },

    // Row 1: Action nodes for each shortcut button
    { id: 'n-tap-deposit', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Depositar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Depositar' } as FlowNodeData },
    { id: 'n-tap-withdraw', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Sacar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Sacar' } as FlowNodeData },

    // Row 2: Flow reference nodes for each sub-flow
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 2 },
      data: { label: 'Wallet Deposit', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'wallet-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 2 },
      data: { label: 'Wallet Withdraw', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'wallet-withdraw' } as FlowNodeData },
  ]

  const edges = [
    // Hub → action nodes (left and right branches)
    { id: 'e-1', source: 'n-hub', target: 'n-tap-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-2', source: 'n-hub', target: 'n-tap-withdraw', sourceHandle: 'right-source', targetHandle: 'left-target' },
    // Action → flow-reference
    { id: 'e-3', source: 'n-tap-deposit', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-withdraw', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  saveFlowGraph('wallet-hub', nodes, edges)
}

// ── Step 5: Verify ──
// ✓ 'ShortcutButton: Depositar' → n-tap-deposit (actionTarget) → n-ref-deposit (targetFlowId: 'wallet-deposit')
// ✓ 'ShortcutButton: Sacar' → n-tap-withdraw (actionTarget) → n-ref-withdraw (targetFlowId: 'wallet-withdraw')
// ✓ linkedFlows ['wallet-deposit', 'wallet-withdraw'] both have flow-reference nodes
// ✓ No unconditional onNext() after onElementTap() in screens
```

The corresponding hub screen would use `onElementTap` like this:

```tsx
export default function Screen1_Hub({ onNext, onElementTap }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Minha Carteira" />
      <Stack>
        <Amount value={1234.56} currency="USD" />
        <Stack direction="horizontal" gap="sm">
          <ShortcutButton
            icon={<PlusIcon />}
            label="Depositar"
            onPress={() => {
              const resolved = onElementTap?.('ShortcutButton: Depositar')
              if (!resolved) onNext()
            }}
          />
          <ShortcutButton
            icon={<ArrowUpIcon />}
            label="Sacar"
            onPress={() => {
              const resolved = onElementTap?.('ShortcutButton: Sacar')
              if (!resolved) onNext()
            }}
          />
        </Stack>
      </Stack>
    </BaseLayout>
  )
}
```

---

## 8. Completion Checklist

Before committing a flow, verify every item:

- [ ] No direct screen-to-screen edges — every transition has an intermediate node (action, api-call, decision, delay)
- [ ] Every tappable element has an `interactiveElements` entry AND a graph action node
- [ ] Every `actionTarget` in the graph matches the screen's `onElementTap()` call string exactly
- [ ] Every `linkedFlows` ID has a reachable `flow-reference` node
- [ ] Every BottomSheet has an overlay node with `parentScreenNodeId`
- [ ] No screen calls `onNext()` unconditionally after `onElementTap()`
- [ ] `saveFlowGraph()` is called in `index.ts`
- [ ] `description` is populated on all non-trivial nodes
- [ ] Screen nodes have both `screenId` and `pageId` set
- [ ] Decision nodes have labeled outgoing edges (e.g., `'Yes'`/`'No'`)
- [ ] Node IDs use `n-` prefix with descriptive slugs
- [ ] Graph uses 3-column layout (`xL=0`, `x=300`, `xR=600`)

---

## Canonical Reference

`src/flows/deposit-v2/index.ts` is the gold-standard example of a complete flow graph. It demonstrates all node types, 3-column layout, proper edge handles, and comprehensive descriptions. Study it before writing your first graph.
