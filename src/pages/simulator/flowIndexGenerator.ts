/**
 * Pure function that generates an index.ts source string for a flow.
 * Follows the canonical deposit-v2/index.ts pattern.
 * Accepts either a DynamicFlowDef or a FlowIndexDef (built from in-memory Flow).
 */

import type { Node, Edge } from '@xyflow/react'
import type { FlowNodeData } from './flowGraph.types'
import type { DynamicScreen } from './dynamicFlowStore'

/** Minimal flow definition for code generation — works for both dynamic and static flows. */
export interface FlowIndexDef {
  id: string
  name: string
  description?: string
  domain?: string
  level?: 1 | 2
  linkedFlows?: string[]
  entryPoints?: string[]
  screens: DynamicScreen[]
}

interface GenerateFlowIndexInput {
  flow: FlowIndexDef
  nodes: Node[]
  edges: Edge[]
}

/**
 * Derive interactiveElements for each screen by walking the flow graph.
 * For each screen node, find action nodes connected downstream whose
 * actionTarget follows "Component: Label" format.
 */
function deriveInteractiveElements(
  screenNodeId: string,
  nodes: Node[],
  edges: Edge[],
  existingElements?: readonly { id: string; component: string; label: string }[],
): { id: string; component: string; label: string }[] {
  const result = new Map<string, { id: string; component: string; label: string }>()

  // Seed with existing interactiveElements from the DynamicScreen
  if (existingElements) {
    for (const el of existingElements) {
      result.set(`${el.component}:${el.label}`, el)
    }
  }

  // Find action nodes reachable from this screen (one hop via edges)
  const directChildren = edges
    .filter((e) => e.source === screenNodeId)
    .map((e) => e.target)

  for (const childId of directChildren) {
    const childNode = nodes.find((n) => n.id === childId)
    if (!childNode) continue
    const data = childNode.data as FlowNodeData
    if (data.nodeType !== 'action' || !data.actionTarget) continue

    const colonIdx = data.actionTarget.indexOf(': ')
    if (colonIdx === -1) continue

    const component = data.actionTarget.slice(0, colonIdx)
    const label = data.actionTarget.slice(colonIdx + 2)
    const key = `${component}:${label}`

    if (!result.has(key)) {
      const id = `${component.toLowerCase()}-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      result.set(key, { id, component, label })
    }
  }

  return Array.from(result.values())
}

function escapeString(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

function formatArray(arr: string[], indent: string): string {
  if (arr.length === 0) return '[]'
  if (arr.length <= 3 && arr.every((s) => s.length < 20)) {
    return `[${arr.map((s) => `'${escapeString(s)}'`).join(', ')}]`
  }
  const items = arr.map((s) => `${indent}  '${escapeString(s)}',`).join('\n')
  return `[\n${items}\n${indent}]`
}

export function generateFlowIndex({ flow, nodes, edges }: GenerateFlowIndexInput): string {
  // Build a map of screenId → screen node id (for interactive element derivation)
  const screenNodeMap = new Map<string, string>()
  for (const n of nodes) {
    const d = n.data as FlowNodeData
    if ((d.nodeType === 'screen' || d.nodeType === 'page') && d.screenId) {
      screenNodeMap.set(d.screenId, n.id)
    }
  }

  // Build screen defs with derived interactiveElements
  const screenDefs: Array<{
    screen: DynamicScreen
    importName: string
    interactiveElements: { id: string; component: string; label: string }[]
  }> = []

  for (const screen of flow.screens) {
    if (!screen.filePath) continue

    // Derive import name from filePath: "flowId/Screen1_MyScreen.tsx" → "Screen1_MyScreen"
    const fileName = screen.filePath.split('/').pop()?.replace(/\.tsx$/, '')
    if (!fileName) continue
    const importName = fileName

    // Derive interactiveElements from graph
    const graphNodeId = screenNodeMap.get(screen.id)
    const interactiveElements = graphNodeId
      ? deriveInteractiveElements(graphNodeId, nodes, edges, screen.interactiveElements)
      : [...(screen.interactiveElements ?? [])]

    screenDefs.push({ screen, importName, interactiveElements })
  }

  // ── Build the output ──

  const lines: string[] = []

  // Imports
  lines.push("import { registerFlow } from '../../pages/simulator/flowRegistry'")
  lines.push("import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'")
  lines.push("import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'")
  lines.push("import { registerPage } from '../../pages/gallery/pageRegistry'")

  // Screen component imports
  for (const def of screenDefs) {
    lines.push(`import ${def.importName} from './${def.importName}'`)
  }

  lines.push('')
  lines.push('const screenDefs = [')

  for (const def of screenDefs) {
    const s = def.screen
    lines.push('  {')
    lines.push(`    id: '${escapeString(s.id)}',`)
    lines.push(`    title: '${escapeString(s.title)}',`)
    lines.push(`    description: '${escapeString(s.description ?? '')}',`)
    lines.push(`    componentsUsed: ${formatArray([...s.componentsUsed], '    ')},`)
    lines.push(`    component: ${def.importName},`)

    // States
    if (s.states && s.states.length > 0) {
      lines.push('    states: [')
      for (const st of s.states) {
        const parts = [`id: '${escapeString(st.id)}'`, `name: '${escapeString(st.name)}'`]
        if (st.description) parts.push(`description: '${escapeString(st.description)}'`)
        if (st.isDefault) parts.push('isDefault: true')
        if (st.data && Object.keys(st.data).length > 0) {
          parts.push(`data: ${JSON.stringify(st.data)}`)
        } else {
          parts.push('data: {}')
        }
        lines.push(`      { ${parts.join(', ')} },`)
      }
      lines.push('    ],')
    }

    // Interactive elements
    if (def.interactiveElements.length > 0) {
      lines.push('    interactiveElements: [')
      for (const el of def.interactiveElements) {
        lines.push(`      { id: '${escapeString(el.id)}', component: '${escapeString(el.component)}', label: '${escapeString(el.label)}' },`)
      }
      lines.push('    ],')
    }

    lines.push('  },')
  }

  lines.push(']')
  lines.push('')

  // Register pages
  lines.push('// Register each screen as a standalone page (with states when defined)')
  lines.push('const seen = new Set<string>()')
  lines.push('for (const s of screenDefs) {')
  lines.push("  const pid = s.id")
  lines.push('  if (seen.has(pid)) continue')
  lines.push('  seen.add(pid)')
  lines.push('  registerPage({')
  lines.push('    id: pid,')
  lines.push('    name: s.title,')
  lines.push('    description: s.description,')
  lines.push(`    area: '${escapeString(flow.domain ?? 'general')}',`)
  lines.push('    componentsUsed: [...s.componentsUsed],')
  lines.push('    component: s.component,')
  lines.push("    ...('states' in s && s.states ? { states: s.states } : {}),")
  lines.push('  })')
  lines.push('}')
  lines.push('')

  // Register flow
  lines.push('registerFlow({')
  lines.push(`  id: '${escapeString(flow.id)}',`)
  lines.push(`  name: '${escapeString(flow.name)}',`)
  lines.push(`  description: '${escapeString(flow.description ?? '')}',`)
  lines.push(`  domain: '${escapeString(flow.domain ?? 'general')}',`)
  if (flow.level) lines.push(`  level: ${flow.level},`)
  if (flow.linkedFlows && flow.linkedFlows.length > 0) {
    lines.push(`  linkedFlows: ${formatArray(flow.linkedFlows, '  ')},`)
  }
  if (flow.entryPoints && flow.entryPoints.length > 0) {
    lines.push(`  entryPoints: ${formatArray(flow.entryPoints, '  ')},`)
  }
  lines.push('  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),')
  lines.push('})')
  lines.push('')

  // Bootstrap flow graph
  lines.push('// Bootstrap flow graph (preserves user edits — only writes if no graph exists)')
  lines.push('{')

  // Serialize nodes
  lines.push('  const nodes = [')
  for (const n of nodes) {
    const d = n.data as FlowNodeData
    const dataProps: string[] = []
    dataProps.push(`label: '${escapeString(d.label)}'`)
    dataProps.push(`screenId: ${d.screenId ? `'${escapeString(d.screenId)}'` : 'null'}`)
    dataProps.push(`nodeType: '${d.nodeType}'`)
    if (d.description) dataProps.push(`description: '${escapeString(d.description)}'`)
    if (d.pageId) dataProps.push(`pageId: '${escapeString(d.pageId)}'`)
    if (d.targetFlowId) dataProps.push(`targetFlowId: '${escapeString(d.targetFlowId)}'`)
    if (d.actionType) dataProps.push(`actionType: '${d.actionType}'`)
    if (d.actionTarget) dataProps.push(`actionTarget: '${escapeString(d.actionTarget)}'`)
    if (d.overlayType) dataProps.push(`overlayType: '${d.overlayType}'`)
    if (d.parentScreenNodeId) dataProps.push(`parentScreenNodeId: '${escapeString(d.parentScreenNodeId)}'`)
    if (d.apiMethod) dataProps.push(`apiMethod: '${d.apiMethod}'`)
    if (d.apiEndpoint) dataProps.push(`apiEndpoint: '${escapeString(d.apiEndpoint)}'`)
    if (d.delayType) dataProps.push(`delayType: '${d.delayType}'`)
    if (d.delayDuration) dataProps.push(`delayDuration: '${escapeString(d.delayDuration)}'`)
    if (d.interactiveElements && d.interactiveElements.length > 0) {
      const elStr = d.interactiveElements
        .map((el) => `{ id: '${escapeString(el.id)}', component: '${escapeString(el.component)}', label: '${escapeString(el.label)}' }`)
        .join(', ')
      dataProps.push(`interactiveElements: [${elStr}]`)
    }
    if (d.manualEntryPoints && d.manualEntryPoints.length > 0) {
      dataProps.push(`manualEntryPoints: ${formatArray(d.manualEntryPoints, '      ')}`)
    }

    lines.push(`    { id: '${escapeString(n.id)}', type: '${n.type ?? 'screen'}', position: { x: ${Math.round(n.position.x)}, y: ${Math.round(n.position.y)} }, data: { ${dataProps.join(', ')} } as FlowNodeData },`)
  }
  lines.push('  ]')
  lines.push('')

  // Serialize edges
  lines.push('  const edges = [')
  for (const e of edges) {
    const parts = [`id: '${escapeString(e.id)}'`, `source: '${escapeString(e.source)}'`, `target: '${escapeString(e.target)}'`]
    if (e.sourceHandle) parts.push(`sourceHandle: '${escapeString(e.sourceHandle)}'`)
    if (e.targetHandle) parts.push(`targetHandle: '${escapeString(e.targetHandle)}'`)
    if (e.label) parts.push(`label: '${escapeString(String(e.label))}'`)
    lines.push(`    { ${parts.join(', ')} },`)
  }
  lines.push('  ]')
  lines.push('')

  lines.push(`  bootstrapFlowGraph('${escapeString(flow.id)}', nodes, edges)`)
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}
