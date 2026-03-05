# Claude Code Prompt: Page States & Page IDs

## Context

Design Lab is a React component library and flow simulator for Picnic fintech. Pages are registered via `registerPage()` and displayed in a gallery. Flows compose pages into multi-step sequences via `registerFlow()`.

Read the PRD at `PRD.md` in this repo for full context — specifically **Item 4 (Page States)** and **Item 9 (Page IDs)**.

---

## Task 1: Page IDs

### Desired Outcome

Every page in Design Lab must have a **unique, human-readable, deterministic ID** that follows a consistent convention.

**Requirements:**

- Define a naming convention for page IDs (e.g. `{domain}-{flow}-{screen-name}` or similar). Pick the best pattern based on what already exists in the codebase.
- Eliminate any dynamic/timestamp-based IDs (like `page-${Date.now()}`). Every page must have a stable, predictable ID.
- IDs must be unique across the entire app. Add a build-time or dev-time check that throws if duplicate IDs are detected.
- Migrate all existing pages to use the new convention.
- Update `registerPage()` and `registerFlow()` types/validation as needed.

---

## Task 2: Page States

### Desired Outcome

A system that lets Design Lab display different **visual states** of any page (loading, error, empty, success, partial data, skeleton, etc.) — **without modifying the page component code at all**.

This is the critical constraint: **page components must remain identical to how they'd be written in production TSX.** The state simulation must live entirely outside the page component.

**Requirements:**

- Each page can declare which states it supports (e.g. `states: ['default', 'loading', 'empty', 'error']`). This declaration lives in the page registration metadata, NOT inside the component.
- The active state is controlled externally — via the page gallery UI, flow viewer, or URL params. The page component itself never knows about Design Lab states.
- State switching works by intercepting/mocking the data layer that the page consumes. For example: if a page reads from a context or hook, the state system provides different data shapes for each state. The page just renders what it receives, exactly like production.
- The page gallery and flow viewer should show a state switcher UI (tabs, dropdown, or similar) so users can toggle between states.
- Default state is always the "happy path" / success state.
- States should be previewable in the catalog/gallery view — ideally as thumbnails or a quick-switch mechanism.

**What this is NOT:**

- This is NOT a Storybook-style args/controls system where you tweak individual props.
- This is NOT conditional rendering inside the page component.
- This IS an external data/context mocking system that makes the page believe it's in a different state.

---

## Approach

Use plan mode. Investigate the existing codebase patterns (`registerPage`, `registerFlow`, `FlowScreenProps`, `activeStateId`, page gallery, etc.) and propose the best implementation. The solution should feel native to the existing architecture.
