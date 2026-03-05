# Claude Code Prompt — Non-UI Flow Nodes

> **Context**: This project is a React-based design lab (`src/flows/`, `src/library/`) that uses `@xyflow/react` to render flow diagrams. Currently, the flow canvas only displays UI screen nodes. See `PRD.md` section 3.2 for the full proposal.

---

## Goal

Extend the flow diagram system with **non-UI node types** that represent logic, decisions, and system behavior happening between screens. These nodes appear only on the flow diagram canvas — they do NOT render in prototype/simulator mode.

This transforms the flow canvas from a simple screen sequence into a proper engineering handoff artifact that shows what actually happens between screens.

---

## Desired Outcome

### New node types to support

| Node | Shape/Visual | Purpose |
|------|-------------|---------|
| **Decision** | Diamond | Yes/No or multi-path branching based on a condition (e.g., "Has KYC?") |
| **API Call** | Rectangle with distinct icon/style | Represents a backend request (e.g., "POST /deposits") |
| **Error Branch** | Red-styled path/node | Represents failure handling (e.g., "Timeout → retry screen") |
| **Conditional** | Branching paths | Multi-way routing based on state (e.g., "User tier: basic/premium/vip") |
| **Delay / Timer** | Clock-styled node | Represents a wait or polling step (e.g., "Wait for webhook confirmation") |

### Requirements

1. **Visual distinction**: Non-UI nodes must be visually distinct from screen nodes on the canvas. Use shape, color, or iconography to make the type immediately obvious.

2. **Canvas-only**: These nodes render on the flow diagram view. They are completely invisible in prototype/simulator mode where only screens are navigated.

3. **Edges and connections**: Non-UI nodes connect to screen nodes and to each other using standard @xyflow edges. Decision and Conditional nodes support multiple labeled outgoing edges (e.g., "Yes" / "No", or "basic" / "premium").

4. **Node data model**: Each non-UI node should carry metadata — at minimum a `label` (display name), `type` (decision/api/error/conditional/delay), and an optional `description` field for handoff notes.

5. **Registration**: Non-UI nodes should integrate with however flows currently register their screens and graph structure. A flow should be able to declare both screen nodes and non-UI nodes in its definition.

6. **No prototype impact**: The prototype navigation (stepping through screens) skips non-UI nodes entirely. Screen order in the prototype is unchanged.

7. **Consistent with existing patterns**: Follow the project's existing conventions for node registration, typing, and styling. Investigate the current @xyflow setup before proposing architecture.

### Out of scope

- Executable logic (these nodes are visual documentation only, not runnable)
- Automatic node generation from code analysis
- Cross-flow connections (separate backlog item)

---

## Success Criteria

- At least one existing flow (e.g., deposit-v2 or withdrawal) has non-UI nodes added as a demonstration
- The flow diagram clearly shows the difference between screen nodes and logic nodes
- Prototype mode is unaffected — navigating screens works exactly as before
- New flows can declare non-UI nodes alongside screen nodes without friction
