/**
 * Centralized sync status + manual sync trigger.
 *
 * Tracks whether the last hydration round succeeded or failed,
 * and exposes a `syncAll()` that re-runs every hydrate function.
 */

import { supabase, isSupabaseConnected } from './supabase'
import { hydrateGraphsFromSupabase } from '../pages/simulator/flowGraphStore'
import { hydrateDynamicFlowsFromSupabase, getDynamicFlows } from '../pages/simulator/dynamicFlowStore'
import { hydrateFlowGroupsFromSupabase } from '../pages/simulator/flowGroupStore'
import { hydratePageOverridesFromSupabase } from '../pages/gallery/pageStore'
import { hydrateDynamicPagesFromSupabase, getDynamicPages } from '../pages/gallery/dynamicPageStore'
import { hydrateTokensFromSupabase } from '../lib/tokenStore'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'local'

type Listener = (status: SyncStatus) => void

let currentStatus: SyncStatus = isSupabaseConnected() ? 'idle' : 'local'
const listeners = new Set<Listener>()

export function getSyncStatus(): SyncStatus {
  return currentStatus
}

function setStatus(status: SyncStatus) {
  currentStatus = status
  listeners.forEach((fn) => fn(status))
}

export function subscribeSyncStatus(fn: Listener): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

/**
 * Run all hydration functions. Returns true if at least one succeeded.
 */
export async function syncAll(): Promise<boolean> {
  if (!isSupabaseConnected()) {
    setStatus('local')
    return false
  }

  setStatus('syncing')

  try {
    const results = await Promise.all([
      hydrateGraphsFromSupabase(),
      hydrateDynamicFlowsFromSupabase(),
      hydrateFlowGroupsFromSupabase(),
      hydratePageOverridesFromSupabase(),
      hydrateDynamicPagesFromSupabase(),
      hydrateTokensFromSupabase(),
    ])

    const anySucceeded = results.some(Boolean)
    setStatus(anySucceeded ? 'synced' : 'error')
    return anySucceeded
  } catch {
    setStatus('error')
    return false
  }
}

/** Mark status as synced (call after successful writes or initial hydration). */
export function markSynced(): void {
  if (isSupabaseConnected()) setStatus('synced')
}

/** Mark status as error (call from write failures if desired). */
export function markError(): void {
  if (isSupabaseConnected()) setStatus('error')
}

/**
 * Push all localStorage data to Supabase.
 * Use this to backfill Supabase from existing local data.
 */
export async function pushAllToSupabase(): Promise<boolean> {
  if (!isSupabaseConnected() || !supabase) return false

  setStatus('syncing')
  const errors: string[] = []

  try {
    // 1. Dynamic flows
    const flows = getDynamicFlows()
    for (const flow of flows) {
      const { error } = await supabase.from('dynamic_flows').upsert(
        {
          id: flow.id,
          name: flow.name,
          description: flow.description,
          domain: flow.domain,
          screens: JSON.stringify(flow.screens),
          spec_content: flow.specContent ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      if (error) errors.push(`dynamic_flows/${flow.id}: ${error.message}`)
    }

    // 2. Flow graphs
    const graphsRaw = localStorage.getItem('picnic-design-lab:flow-graphs')
    if (graphsRaw) {
      const graphs = JSON.parse(graphsRaw) as Record<string, { flowId: string; nodes: unknown[]; edges: unknown[] }>
      for (const [flowId, graph] of Object.entries(graphs)) {
        const { error } = await supabase.from('flow_graphs').upsert(
          {
            flow_id: flowId,
            nodes: JSON.stringify(graph.nodes),
            edges: JSON.stringify(graph.edges),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'flow_id' },
        )
        if (error) errors.push(`flow_graphs/${flowId}: ${error.message}`)
      }
    }

    // 3. Flow groups
    const groupsRaw = localStorage.getItem('picnic-design-lab:flow-groups')
    if (groupsRaw) {
      const { error } = await supabase.from('flow_groups').upsert(
        {
          id: 'singleton',
          data: groupsRaw,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      if (error) errors.push(`flow_groups: ${error.message}`)
    }

    // 4. Dynamic pages
    const pages = getDynamicPages()
    for (const page of pages) {
      const { error } = await supabase.from('dynamic_pages').upsert(
        {
          id: page.id,
          name: page.name,
          description: page.description,
          area: page.area,
          components_used: JSON.stringify(page.componentsUsed),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      if (error) errors.push(`dynamic_pages/${page.id}: ${error.message}`)
    }

    // 5. Page overrides
    const overridesRaw = localStorage.getItem('picnic-design-lab:page-overrides')
    if (overridesRaw) {
      const overrides = JSON.parse(overridesRaw) as Record<string, { name?: string; description?: string }>
      for (const [pageId, data] of Object.entries(overrides)) {
        const { error } = await supabase.from('page_overrides').upsert(
          {
            page_id: pageId,
            name: data.name ?? null,
            description: data.description ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'page_id' },
        )
        if (error) errors.push(`page_overrides/${pageId}: ${error.message}`)
      }
    }

    // 6. Token overrides
    const tokensRaw = localStorage.getItem('picnic-design-lab:token-overrides')
    if (tokensRaw) {
      const tokens = JSON.parse(tokensRaw) as Record<string, string>
      for (const [cssVar, value] of Object.entries(tokens)) {
        const { error } = await supabase.from('token_overrides').upsert(
          {
            css_var: cssVar,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'css_var' },
        )
        if (error) errors.push(`token_overrides/${cssVar}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      console.error('[syncStore] pushAllToSupabase errors:', errors)
      setStatus('error')
      return false
    }

    setStatus('synced')
    return true
  } catch (e) {
    console.error('[syncStore] pushAllToSupabase failed:', e)
    setStatus('error')
    return false
  }
}
