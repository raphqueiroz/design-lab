/**
 * Flow graph persistence — Supabase with localStorage fallback.
 *
 * Follows the exact same dual-write pattern as flowStore.ts.
 * Write path: Supabase (if connected) + localStorage (always, as cache/fallback).
 * Read path: localStorage first (instant), then Supabase hydrate overwrites.
 */

import type { Node, Edge } from '@xyflow/react'
import { supabase, isSupabaseConnected } from '../../lib/supabase'
import type { FlowGraph } from './flowGraph.types'
import { isFlowDeleted } from './flowRegistry'

const STORAGE_KEY = 'picnic-design-lab:flow-graphs'

// ── localStorage layer ──

function readAllGraphs(): Record<string, FlowGraph> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAllGraphs(data: Record<string, FlowGraph>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ── Public API ──

/**
 * Bootstrap a flow graph from code defaults.
 * Only writes if no existing graph is found OR if graphVersion changed
 * (indicating the code definition was updated).
 * Does NOT write to Supabase (hydration handles remote state).
 */
export function bootstrapFlowGraph(flowId: string, nodes: Node[], edges: Edge[], graphVersion?: number): void {
  if (isFlowDeleted(flowId)) return // user deleted this flow — don't recreate
  const existing = readAllGraphs()
  const current = existing[flowId]
  if (current) {
    // If no version provided, never overwrite (backwards compatible)
    if (graphVersion == null) return
    // If version matches or stored version is newer, keep user edits
    if (current.graphVersion != null && current.graphVersion >= graphVersion) return
  }
  existing[flowId] = { flowId, nodes, edges, updatedAt: new Date().toISOString(), graphVersion }
  writeAllGraphs(existing)
}

export function getFlowGraph(flowId: string): FlowGraph | null {
  return readAllGraphs()[flowId] ?? null
}

export async function saveFlowGraph(
  flowId: string,
  nodes: Node[],
  edges: Edge[],
): Promise<void> {
  const updatedAt = new Date().toISOString()

  // localStorage (immediate)
  const all = readAllGraphs()
  all[flowId] = { flowId, nodes, edges, updatedAt }
  writeAllGraphs(all)

  // Supabase (async)
  if (isSupabaseConnected()) {
    const { error } = await supabase!.from('flow_graphs').upsert(
      {
        flow_id: flowId,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        updated_at: updatedAt,
      },
      { onConflict: 'flow_id' },
    )
    if (error) console.error('[flowGraphStore] Supabase upsert failed:', error.message)
  }
}

export async function deleteFlowGraph(flowId: string): Promise<void> {
  const all = readAllGraphs()
  delete all[flowId]
  writeAllGraphs(all)

  if (isSupabaseConnected()) {
    await supabase!.from('flow_graphs').delete().eq('flow_id', flowId)
  }
}

// ── Rename ──

export async function renameFlowGraph(oldId: string, newId: string): Promise<void> {
  const all = readAllGraphs()
  const graph = all[oldId]
  if (!graph) return

  delete all[oldId]

  // Update screenId/pageId in nodes that embed the old ID
  const updatedNodes = graph.nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      ...(typeof n.data.screenId === 'string' && (n.data.screenId as string).includes(oldId)
        ? { screenId: (n.data.screenId as string).replace(oldId, newId) }
        : {}),
      ...(typeof n.data.pageId === 'string' && (n.data.pageId as string).includes(oldId)
        ? { pageId: (n.data.pageId as string).replace(oldId, newId) }
        : {}),
    },
  }))

  all[newId] = { flowId: newId, nodes: updatedNodes, edges: graph.edges, updatedAt: new Date().toISOString() }
  writeAllGraphs(all)

  // Supabase: delete old, upsert new
  if (isSupabaseConnected()) {
    await supabase!.from('flow_graphs').delete().eq('flow_id', oldId)
    await supabase!.from('flow_graphs').upsert(
      {
        flow_id: newId,
        nodes: JSON.stringify(updatedNodes),
        edges: JSON.stringify(graph.edges),
        updated_at: all[newId].updatedAt,
      },
      { onConflict: 'flow_id' },
    )
  }
}

// ── Update flow-reference nodes across ALL graphs ──

export function updateFlowReferencesInAllGraphs(oldFlowId: string, newFlowId: string): void {
  const all = readAllGraphs()
  let changed = false

  for (const [graphFlowId, graph] of Object.entries(all)) {
    if (graphFlowId === newFlowId) continue // skip the renamed flow itself
    let graphChanged = false
    const updatedNodes = graph.nodes.map((n) => {
      if (n.data.nodeType === 'flow-reference' && n.data.targetFlowId === oldFlowId) {
        graphChanged = true
        return { ...n, data: { ...n.data, targetFlowId: newFlowId } }
      }
      return n
    })
    if (graphChanged) {
      all[graphFlowId] = { ...graph, nodes: updatedNodes, updatedAt: new Date().toISOString() }
      changed = true
    }
  }

  if (changed) writeAllGraphs(all)
}

// ── Supabase → localStorage hydration ──

export async function hydrateGraphsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!.from('flow_graphs').select('*')
    if (error) return false

    const rows = data ?? []
    if (rows.length === 0) return false // nothing in Supabase yet — keep localStorage

    const all = readAllGraphs()
    for (const row of rows) {
      all[row.flow_id] = {
        flowId: row.flow_id,
        nodes: JSON.parse(row.nodes),
        edges: JSON.parse(row.edges),
        updatedAt: row.updated_at,
      }
    }
    writeAllGraphs(all)
    return true
  } catch {
    return false
  }
}

// ── Real-time subscription ──

export function subscribeToGraphChanges(onUpdate: () => void): (() => void) | null {
  if (!isSupabaseConnected()) return null

  const channel = supabase!
    .channel('flow-graph-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'flow_graphs' }, () => {
      hydrateGraphsFromSupabase().then(() => onUpdate())
    })
    .subscribe()

  return () => {
    supabase!.removeChannel(channel)
  }
}
