# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Picnic Design Lab — a React-based design system browser, flow prototyper, and engineering handoff tool for a fintech product. It is NOT a production app; it's an internal tool for visualizing and simulating user flows.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build (`tsc -b && vite build`)
- `npm run lint` — ESLint (flat config, ESLint 9)
- No test framework is configured

## Stack

- React 18 + TypeScript 5.9 (strict, `erasableSyntaxOnly`)
- Vite 7 with `@vitejs/plugin-react`
- Tailwind CSS v4 via `@tailwindcss/vite` — **no `tailwind.config.js`**; all tokens configured in CSS `@theme` blocks in `src/index.css`
- `@xyflow/react` for flow graph canvases
- Framer Motion for transitions
- Path alias: `@` → `src/` (configured in both Vite and tsconfig)
- `cn()` from `src/lib/cn.ts` (clsx + tailwind-merge) is the only way to compose class names

## STYLE-GUIDE.md Is Reference

`docs/STYLE-GUIDE.md` contains Picnic's brand copywriting guide and Lemon Pie Style (LPS) image generation guide. **Read it before writing any user-facing pt-BR copy or generating illustrations.** Key rules:

1. Voice is casual but substantive — like a smart friend, not a bank
2. Buttons use infinitive ("Consultar"), body text uses third person
3. Never use crypto jargon (blockchain, USDC, stablecoin) in user-facing copy
4. Images use LPS style — flat illustration, chartreuse + deep greens, risograph grain
5. Use Freepik Mystic API with model `fluid` for image generation

## PATTERNS.md Is Law

`PATTERNS.md` at the project root is the authoritative guide for building flows and screens. **Read it before creating or modifying any flow screen or library component.** Key rules:

1. No arbitrary colors — use CSS variable tokens only
2. No custom typography — use `<Text variant="...">`
3. No new layout containers — use `<BaseLayout>`, `<Stack>`, `<Section>`
4. No re-creating existing components — check the library first
5. No inline spacing magic numbers — use the spacing scale (4/8/12/16/24/32px)
6. **No raw HTML/CSS in flow screens** — compose entirely from `src/library/` components
7. When no component exists, create one in `src/library/` or extend an existing one
8. English for all names, docs, labels, and code. Only in-screen UI copy is pt-BR.

## FLOW-PATTERNS.md Is Law (for Flow Graphs)

`FLOW-PATTERNS.md` is the authoritative guide for defining flow graphs. Read it before creating or modifying any flow's `index.ts`. Key rules:

1. Write the graph before writing screens — the graph is the spec
2. No direct screen-to-screen edges — every transition needs an intermediate node (action, api-call, decision, delay)
3. Every `onElementTap()` call must be backed by an action node in the graph
3. Every `linkedFlows` entry must have a `flow-reference` node
4. Never call `onNext()` unconditionally after `onElementTap()` — check the return value
5. Always call `saveFlowGraph()` in `index.ts` — never rely on auto-generation for non-trivial flows

## Architecture

### Four Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/components` | `LibraryPage` | Design system browser (components, foundations, patterns, screen parts) |
| `/flows` | `SimulatorPage` | Flow prototype player + flow graph canvas editor |
| `/pages` | `PageGalleryPage` | Page gallery showing all registered screens |
| `/map` | `FlowMapPage` | High-level flow relationship map |

### Registration Pattern (Side Effects)

The app uses a side-effect registration pattern. Importing a module registers it:

- **Library components** call `registerComponent()` at module scope → populates the component registry
- **Flow `index.ts`** files call `registerFlow()`, `registerPage()`, and `saveFlowGraph()` → populates flow/page registries and bootstraps the graph
- These imports are triggered from the page components (`SimulatorPage.tsx`, `PageGalleryPage.tsx`, `LibraryPage.tsx`)

### Flow Structure

Each flow lives in `src/flows/<flow-name>/`:

```
index.ts                    — registerFlow() + registerPage() + saveFlowGraph()
Screen1_Name.tsx            — Screen component (default export, receives FlowScreenProps)
Screen1_Name.parts.tsx      — Optional: screen-local sub-components (named exports only)
```

**Screen components** receive `FlowScreenProps` (`onNext`, `onBack`, `overlays?`, `onOpenOverlay?`, `onElementTap?`, `onStateChange?`). They must call `onElementTap('Component: Label')` before `onNext()` for non-linear graph navigation to work.

**Screen states**: Screens can declare `states: PageStateDefinition[]` in their screen defs. The player injects state-specific data via `ScreenDataContext`; screens read it with `useScreenData<T>()`.

**`.parts.tsx` convention**: Screen-local sub-components that are ≥30 lines or have their own state. Named exports only. Never imported by other screens — if reuse is needed, promote to `src/library/`.

### Flow Graph System

Flows have a React Flow directed graph stored in localStorage (+ optionally Supabase). Node types: `screen`, `page`, `decision`, `error`, `flow-reference`, `action`, `overlay`, `api-call`, `delay`, `note`. Navigation is derived from the graph via `flowGraphNavigation.ts` — the player walks edges to build a `NavigableStep[]` path, skipping non-screen pass-through nodes.

**The `onElementTap` contract**: Screens call `onElementTap('Component: Label')` to signal a user interaction. The navigation engine (`resolveScreenElementTarget`) finds action nodes whose `actionTarget` matches exactly, then follows edges to the destination. Screens must check the return value: `const resolved = onElementTap?.('...'); if (!resolved) onNext()`. Calling `onNext()` unconditionally after `onElementTap()` is an anti-pattern that defeats graph navigation.

**Canonical example**: `src/flows/deposit-v2/index.ts` is the gold-standard flow graph — 25 nodes, all node types, 3-column layout, complete descriptions. Study it before authoring a new graph. See `FLOW-PATTERNS.md` for the full guide.

### Persistence

Dual-write pattern: always localStorage (sync), optionally Supabase (async). Supabase client is created from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars; `null` if not configured. Hydration on mount overwrites localStorage from Supabase if data exists.

### Token System

- `src/tokens/tokens.css` — CSS custom properties (`--token-*`) are the source of truth
- `src/tokens/index.ts` — TypeScript mirrors + utilities (`getTokenVar`, `setTokenVar`)
- `src/index.css` — Bridges tokens to Tailwind via `@theme {}` blocks
- Shell chrome (dark IDE-like UI) uses separate `--color-shell-*` tokens

### Key Libraries

| File | Purpose |
|------|---------|
| `src/lib/cn.ts` | `cn()` — clsx + tailwind-merge |
| `src/lib/supabase.ts` | Supabase client (nullable) |
| `src/lib/tokenStore.ts` | Token override persistence |
| `src/lib/ScreenDataContext.tsx` | Context for injecting state data into screens |
| `src/lib/slugify.ts` | Slug/unique ID generation |

### Supplemental Prompts

The `claude-code-prompt-*.md` files in `docs/archive/` are historical task specifications for features that have already been implemented (cross-flow linking, non-UI flow nodes, page states/IDs, one-time patterns). They are kept for reference only. The current authoritative guides are:

- **`PATTERNS.md`** — screen composition, UI components, design tokens
- **`FLOW-PATTERNS.md`** — flow graph authoring, `saveFlowGraph()`, `onElementTap` contract, cross-flow linking

### Session Memory

`MEMORY.md` (in the Claude Code project memory directory) captures session-to-session learnings — common mistakes, user preferences, and anti-patterns observed during flow creation. Consult it before writing new flows.

## Screen Shell (Quick Reference)

Every flow screen follows this skeleton — see PATTERNS.md Section 4 for all patterns:

```
BaseLayout
  ├── Header (title + onBack or onClose)
  ├── ...content (library components only)
  └── StickyFooter
       └── Button variant="primary" fullWidth
```

- `onBack` → back arrow (deeper screen). `onClose` → X button (overlay/entry screen).
- One primary Button per screen, always in StickyFooter.
- Use `Stack` for vertical grouping (gap presets: `none`/`sm`/`default`/`lg`), never manual `flex-col` + `gap`.

## Canonical Examples

Study these files before writing any flow. They are the gold standard.

### Flow Graph
`src/flows/deposit-v2/index.ts` — 25 nodes, 3-column layout, all node types, screen states, interactiveElements, linkedFlows.

### Screens (one per pattern)
| Pattern | File | Key techniques |
|---------|------|----------------|
| Currency Entry + Async Calc | `deposit-v2/Screen1_AmountEntry.tsx` | useScreenData, onStateChange, CalcState machine, skeleton→content, onElementTap |
| Payment Instruction | `deposit-v2/Screen3_PixPayment.tsx` | Copy+Toast, Countdown, GroupHeader+DataList, QR BottomSheet |
| Processing | `deposit-v2/Screen4_Processing.tsx` | LoadingScreen with steps array, autoAdvance, onComplete |
| Success / Confirmation | `deposit-v2/Screen5_Success.tsx` | FeedbackLayout, display title, DataList summary |
| Cards List (Tab Screen) | `card-management/Screen1_CardsList.tsx` | Level-1 tab screen, useScreenData for states, conditional disabled actions |
| Multi-flow + Versions | `caixinha-dolar/index.ts` | parentFlowId, 4-column version comparison, flow-reference linking |

### Anti-Examples (do NOT follow)
- `withdrawal/version-a/` screens — call `onNext` directly, no `onElementTap`. Legacy code.
