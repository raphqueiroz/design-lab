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
    await supabase!.from('flow_graphs').upsert(
      {
        flow_id: flowId,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
        updated_at: updatedAt,
      },
      { onConflict: 'flow_id' },
    )
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

// ── Supabase → localStorage hydration ──

export async function hydrateGraphsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!.from('flow_graphs').select('*')
    if (error) return false

    const all: Record<string, FlowGraph> = {}
    for (const row of data ?? []) {
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
