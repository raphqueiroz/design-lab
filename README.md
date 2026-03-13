# Picnic Design Lab

**Codename: Napkin** — An AI-assisted design tool for prototyping fintech UX flows directly in code.

Design Lab is an internal tool where designers and engineers at Picnic build, simulate, and hand off user flows. Instead of static mockups, flows are real React components composed from a shared design system — and Claude Code is the primary authoring interface.

> Currently a standalone repo (`usePicnic/design-lab`). Will move to the monorepo.

---

## Getting started

```bash
git clone <repo-url>
cd design-lab
npm install
npm run dev
```

Then open Claude Code in the same directory. The `CLAUDE.md` file gives Claude full context about the codebase, patterns, and conventions.

### Environment variables

The app works fully offline without any configuration — all data persists in localStorage. To enable **shared sync** with the team's Supabase database (flow graphs, sidebar groups, token overrides):

1. Copy the example file: `cp .env.example .env`
2. Ask Raph for the real values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart the dev server

Without these variables, the Pull/Push sync buttons in the header won't connect — everything else works normally.

### Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint (flat config, ESLint 9) |

---

## How it works

There are two workflows for creating a flow:

### Describe & generate

Tell Claude Code what you want in plain language. It will:
1. Define the flow graph (screens, actions, API calls, decisions, cross-flow links)
2. Generate all screen components using the design system
3. Register everything so it appears in the sidebar

Example: *"Create a deposit flow with amount entry, PIX payment instructions, processing screen, and success confirmation."*

### Manual sketch

1. Open the **Flow** view and create nodes manually in the graph canvas
2. Create blank screen files for each screen node
3. Describe each screen to Claude Code one at a time

---

## Three views per flow

Every flow has three views, accessible from the top of the simulator:

| View | What you see |
|------|-------------|
| **Flow** | Directed graph showing system rules + user journey. Node types: screen, action, api-call, decision, delay, overlay, flow-reference, error, note. |
| **Design** | Side-by-side screen preview — see all screens at once, compare states. |
| **Prototype** | Interactive simulation — tap through the flow as a user would. |

---

## Sidebar & domain organization

Flows are organized into **10 domains**:

Authentication, Onboarding, Dashboard, Cards, Add Funds, Send Funds, Perks, Earn, Transaction History, Settings

Within each domain, flows can be grouped together. Groups and flows support drag-and-drop reordering and archiving.

---

## Design system

~50 library components across 6 categories:

| Category | Examples |
|----------|---------|
| **Layout** | `BaseLayout`, `Stack`, `Section`, `StickyFooter`, `BottomSheet`, `Modal`, `FeedbackLayout` |
| **Navigation** | `Header`, `TabBar`, `Sidebar`, `SegmentedControl`, `GroupHeader`, `Breadcrumb` |
| **Inputs** | `Button`, `TextInput`, `CurrencyInput`, `Toggle`, `Select`, `RadioGroup`, `Checkbox`, `SearchBar`, `ShortcutButton` |
| **Display** | `ListItem`, `DataList`, `Card`, `Tag`, `Badge`, `Avatar`, `Amount`, `ProgressBar`, `LineChart`, `Summary` |
| **Foundations** | `Text`, `Divider`, `Link` |
| **Feedback** | `Toast`, `LoadingScreen`, `LoadingSpinner`, `Skeleton`, `EmptyState`, `Countdown`, `Tooltip` |

### Token system

Design tokens are CSS custom properties (`--token-*`) defined in `src/tokens/tokens.css`. They bridge to Tailwind via `@theme` blocks in `src/index.css` — no `tailwind.config.js` file. Class names are composed exclusively through `cn()` (clsx + tailwind-merge).

---

## Documentation guides

Three markdown files govern how flows and screens are built. Claude Code reads these automatically via `CLAUDE.md`.

| File | Governs |
|------|---------|
| **`PATTERNS.md`** | Screen composition, UI component rules, spacing scale, anti-patterns. The golden rule: no raw HTML in flow screens — compose entirely from library components. |
| **`FLOW-PATTERNS.md`** | Flow graph authoring, node types, the `onElementTap` contract, cross-flow linking. The golden rule: define the graph before writing screens. |
| **`docs/STYLE-GUIDE.md`** | pt-BR copywriting voice (casual but substantive), button copy conventions (infinitive, not imperative), and the Lemon Pie Style (LPS) illustration guide. |

---

## MCP integrations

Design Lab's Claude Code environment connects to several external tools via MCP:

| Integration | What it does |
|-------------|-------------|
| **Figma** | Read designs, extract design context, Code Connect mappings between Figma components and codebase components |
| **Freepik Mystic** | Generate illustrations in the Lemon Pie Style (LPS) — flat, chartreuse + deep green, risograph grain |
| **Chrome automation** | Browser automation for testing prototypes, recording GIFs, reading console output |
| **Supabase** | Persistence backend — flow graphs, sidebar groups, token overrides |
| **Linear** | Issue tracking — read/create issues, link work to flows |
| **Slack** | Team communication — share flows, get feedback |
| **Vercel** | Deploy previews and production builds |

---

## Persistence

Dual-write pattern:
- **localStorage** (always, synchronous) — the local source of truth
- **Supabase** (optional, async) — shared persistence when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are configured

Sync controls live in the AppHeader:
- **Pull** — Supabase overwrites localStorage (remote wins)
- **Push** — localStorage overwrites Supabase (local wins)

---

## Stack

React 18, TypeScript 5.9, Vite 7, Tailwind CSS v4, `@xyflow/react` (flow canvases), Framer Motion (transitions).

---

## For Claude Code users

If you're opening this repo in Claude Code for the first time:

1. `CLAUDE.md` is loaded automatically — it contains all conventions and architecture details
2. `PATTERNS.md` and `FLOW-PATTERNS.md` are referenced there as authoritative guides
3. The canonical example flow is `src/flows/deposit-v2/` — study its `index.ts` and screens before writing new flows
4. Always run `npx tsc --noEmit` before finishing work to catch build errors early
