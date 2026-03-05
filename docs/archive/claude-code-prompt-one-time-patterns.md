# Claude Code Prompt: One-Time Component Patterns Implementation

## Context

You're working on **Design Lab**, a React component library and flow simulator at the root of this project. The stack is React 18.3.1 + Vite + Tailwind CSS 4 + TypeScript 5.9 + Framer Motion.

**Key structure:**
- `src/library/` — 55+ reusable components with registry pattern (`registry.ts`)
- `src/flows/` — 5 flow domains (deposit, deposit-v2, invest-earn, perks, withdrawal), each with screen components using `FlowScreenProps`
- `src/pages/LibraryPage.tsx` — Component catalog view at `/components` route
- **`patterns.md` does NOT exist yet** — you must CREATE it

---

## Task 1: Create `patterns.md` at project root

Create a new file `patterns.md` with the project's component patterns documentation. Include these sections:

### Content to include:

```markdown
# Design Lab — Component Patterns

## 1. Component Classification

### Library Components (`src/library/`)
Reusable, design-system-grade components. Registered in `registry.ts`, available across all flows and pages.

### Screen Parts (`*.parts.tsx`)
One-time UI elements scoped to a single flow screen. Co-located next to their parent screen file.

---

## 2. One-Time Component Rules

### The `.parts.tsx` Convention

When a flow screen needs extracted sub-components that are NOT reusable:

```
src/flows/deposit/
  DepositAmountScreen.tsx        ← the screen (default export)
  DepositAmountScreen.parts.tsx  ← one-time elements (named exports only)
```

### Inline vs Extract Threshold

| Condition | Action |
|-----------|--------|
| < ~30 lines, no independent state/effects | Keep inline in the screen file |
| ≥ ~30 lines OR has own state/effects | Extract to `.parts.tsx` sibling |

### Extract-When-Reused Rule

1. **Start co-located** — every new UI element begins in the screen file or its `.parts.tsx`
2. **Extract on second use** — only move to `src/library/` when a second screen genuinely needs the same component
3. **Never pre-extract** — do not add to the library "just in case"

### Anti-Pattern: Reusing Screen Parts

> ⚠️ **Screen parts (`.parts.tsx`) must NEVER be imported by other screens or pages.**
>
> If you need similar UI in another screen, that's the signal to extract a proper library component.

**Enforcement layers:**
1. **File convention** — `.parts.tsx` suffix signals "do not reuse"
2. **Export discipline** — named exports only, no default export, never re-exported through barrel files
3. **This rule** — screen parts are excluded from consideration when building new screens

### Consolidation Workflow

Periodically review the Screen Parts catalog (`/components?tab=screen-parts`) to:
1. Sort parts by visual/functional similarity
2. Spot duplicates or near-duplicates across flows
3. Extract common patterns into `src/library/` as proper components
4. Delete the `.parts.tsx` originals after extraction
```

---

## Task 2: Create the Screen Parts catalog scanner

Create `src/library/screen-parts-catalog.ts`:

```typescript
import { ComponentMeta } from './registry';

export interface ScreenPart {
  /** Named export identifier */
  name: string;
  /** Parent screen file (without .parts.tsx) */
  screen: string;
  /** Flow domain (e.g. "deposit", "withdrawal") */
  flow: string;
  /** Full import path */
  path: string;
}

/**
 * Auto-discovers all .parts.tsx files under src/flows/.
 * Uses Vite's import.meta.glob for zero-config discovery.
 */
export function getScreenParts(): ScreenPart[] {
  const modules = import.meta.glob('/src/flows/**/*.parts.tsx', { eager: true });
  const parts: ScreenPart[] = [];

  for (const [path, mod] of Object.entries(modules)) {
    const module = mod as Record<string, unknown>;
    // Extract flow name from path: /src/flows/{flow}/...
    const flowMatch = path.match(/\/src\/flows\/([^/]+)\//);
    const flow = flowMatch?.[1] ?? 'unknown';

    // Extract screen name: remove .parts.tsx, take filename
    const screenMatch = path.match(/\/([^/]+)\.parts\.tsx$/);
    const screen = screenMatch?.[1] ?? 'unknown';

    // Collect all named exports that look like components (PascalCase functions/classes)
    for (const [exportName, exportValue] of Object.entries(module)) {
      if (
        exportName === 'default' ||
        typeof exportValue !== 'function' ||
        exportName[0] !== exportName[0].toUpperCase()
      ) continue;

      parts.push({ name: exportName, screen, flow, path });
    }
  }

  return parts.sort((a, b) => a.flow.localeCompare(b.flow) || a.screen.localeCompare(b.screen));
}
```

---

## Task 3: Add "Screen Parts" tab to LibraryPage

Open `src/pages/LibraryPage.tsx` and add a new tab called **"Screen Parts"**.

**Requirements:**
- Add a tab toggle (alongside existing category filters) that switches to a read-only catalog view
- Use URL search param `?tab=screen-parts` to activate it
- Import and call `getScreenParts()` from the new catalog module
- Display parts grouped by flow → screen, showing:
  - Flow name as section header
  - Screen name as sub-header
  - Each part's export name
  - A badge or label: "screen-only · do not reuse"
- If no `.parts.tsx` files exist yet, show an empty state: "No screen parts found. As you create `.parts.tsx` files in `src/flows/`, they'll appear here automatically."
- Keep the existing component library view intact — the tab just toggles between library components and screen parts
- Style consistently with the existing LibraryPage design (use existing Tailwind classes/patterns)

---

## Task 4: Create one example `.parts.tsx` file

Pick any existing flow screen (e.g. in `src/flows/deposit/`) and create a sibling `.parts.tsx` file with a small placeholder component to verify the catalog scanner works.

Example:

```typescript
// src/flows/deposit/DepositAmountScreen.parts.tsx

/**
 * Screen-only parts for DepositAmountScreen.
 * ⚠️ Do not import from other screens — extract to src/library/ if reuse is needed.
 */

export function AmountKeypad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  // Placeholder — replace with real implementation
  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {['1','2','3','4','5','6','7','8','9','','0','←'].map(key => (
        <button
          key={key}
          className="h-12 rounded-lg bg-gray-100 text-lg font-medium hover:bg-gray-200 transition-colors"
          onClick={() => key === '←' ? onDelete() : key && onDigit(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
```

Adapt the filename to match an actual screen file that exists in the project. Check what screens exist first.

---

## Execution Notes

- **Read existing files before editing** — especially `LibraryPage.tsx` and `registry.ts` to match patterns
- **Do NOT modify `registry.ts`** — screen parts live outside the registry
- **Test that `npm run dev` still works** after all changes
- **Commit message**: `feat: add one-time component patterns (.parts.tsx convention + screen parts catalog)`
