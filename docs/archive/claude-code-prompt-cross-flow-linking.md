# Cross-Flow Linking

## Goal

Enable flows to declare relationships with other flows and visualize these connections in a new "Flow Map" view, so designers and engineers can understand how user journeys span multiple flows.

## Desired Outcome

### 1. Flow relationship declarations

Each flow should be able to declare:
- **`linkedFlows`**: other flows this flow connects to (e.g., deposit links to invest-earn)
- **`entryPoints`**: where users enter this flow from (e.g., "home-card", "quick-action", "deep-link")

These declarations should live in each flow's configuration. The data model should support bidirectional discovery — given any flow, you can find what it links to AND what links to it.

### 2. Flow Map view

Add a new top-level view (accessible alongside Library, Simulator, and Gallery) that shows **all flows as nodes on a canvas** with **edges representing their declared relationships**.

Requirements:
- Each flow appears as a single node (not individual screens) showing flow name, category, and screen count
- Edges between flows are drawn based on `linkedFlows` declarations
- Entry points are visualized as small labeled markers on the flow nodes
- Clicking a flow node navigates to that flow's Simulator view
- The canvas should use the existing @xyflow/react setup — reuse layout patterns already in the project
- Auto-layout flows so the map is readable without manual positioning
- Support zoom and pan like the existing flow diagram canvas

### 3. Connection indicators in Simulator

When viewing a single flow in the Simulator, add visual indicators showing:
- Which other flows link TO this flow (incoming connections)
- Which flows this flow links OUT to (outgoing connections)
- These indicators should be clickable to navigate to the connected flow

### Constraints

- This builds on the flow taxonomy system (flow configs with metadata per flow). If flow configs don't exist yet, create them as part of this work.
- This also builds on the page ID system for stable screen references. If page IDs aren't implemented yet, the flow map can work without them initially — flow-level connections are sufficient for v1.
- The Flow Map is read-only — no drag-to-connect or visual editing of relationships. All connections come from the declared config.
- Keep the implementation simple. The flow map is a navigation and understanding tool, not a full diagramming app.
