/**
 * Centralized sync status with explicit Pull/Push model.
 *
 * PULL = Supabase → localStorage (remote replaces local)
 * PUSH = localStorage → Supabase (local replaces remote)
 *
 * Individual saves are localStorage-only. Supabase writes happen
 * exclusively via the Push button. Subscriptions notify of remote
 * changes but don't auto-hydrate.
 */

import { supabase, isSupabaseConnected } from './supabase'
import { hydrateGraphsFromSupabase } from '../pages/simulator/flowGraphStore'
import { hydrateDynamicFlowsFromSupabase, getDynamicFlows } from '../pages/simulator/dynamicFlowStore'
import { hydrateFlowGroupsFromSupabase } from '../pages/simulator/flowGroupStore'
import { hydratePageOverridesFromSupabase } from '../pages/gallery/pageStore'
import { hydrateDynamicPagesFromSupabase, getDynamicPages } from '../pages/gallery/dynamicPageStore'
import { hydrateTokensFromSupabase } from '../lib/tokenStore'
import { hydrateCommentsFromSupabase, getAllCommentEntries } from '../pages/simulator/canvasCommentStore'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'unsynced' | 'remote-updated' | 'error' | 'local'

type Listener = (status: SyncStatus) => void

let currentStatus: SyncStatus = isSupabaseConnected() ? 'idle' : 'local'
const listeners = new Set<Listener>()

/** Cooldown window after push/pull to ignore our own Postgres change events. */
let ignoreRemoteUntil = 0

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

// ── Pull (Supabase → localStorage) ──

/**
 * Pull all data from Supabase into localStorage.
 * Remote replaces local. Code defaults fill gaps (handled by each store's hydrate).
 * Returns true if at least one store hydrated successfully.
 */
export async function pullFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) {
    setStatus('local')
    return false
  }

  setStatus('syncing')

  try {
    // Flow groups must hydrate first — it populates the deleted-flows list
    // that dynamicFlows and graphs need to filter against.
    const groupsOk = await hydrateFlowGroupsFromSupabase()

    const restResults = await Promise.all([
      hydrateGraphsFromSupabase(),
      hydrateDynamicFlowsFromSupabase(),
      hydratePageOverridesFromSupabase(),
      hydrateDynamicPagesFromSupabase(),
      hydrateTokensFromSupabase(),
      hydrateCommentsFromSupabase(),
    ])

    const results = [restResults[0], restResults[1], groupsOk, ...restResults.slice(2)]

    const allSucceeded = results.every(Boolean)
    const anySucceeded = results.some(Boolean)
    ignoreRemoteUntil = Date.now() + 3000
    setStatus(allSucceeded ? 'synced' : anySucceeded ? 'error' : 'error')
    if (!allSucceeded) {
      const storeNames = ['graphs', 'dynamicFlows', 'flowGroups', 'pageOverrides', 'dynamicPages', 'tokens', 'comments']
      const failed = storeNames.filter((_, i) => !results[i])
      console.error('[syncStore] Pull partially failed. Failed stores:', failed.join(', '))
    }
    return anySucceeded
  } catch {
    setStatus('error')
    return false
  }
}

/** @deprecated Use pullFromSupabase() instead */
export const syncAll = pullFromSupabase

// ── Push (localStorage → Supabase) ──

/** Upsert an array of items to a Supabase table. Returns error strings. */
async function upsertMany<T>(
  table: string,
  items: T[],
  mapFn: (item: T) => Record<string, unknown>,
  conflictKey: string,
): Promise<string[]> {
  const errors: string[] = []
  for (const item of items) {
    const row = mapFn(item)
    const { error } = await supabase!.from(table).upsert(row, { onConflict: conflictKey })
    if (error) errors.push(`${table}/${row[conflictKey] ?? '?'}: ${error.message}`)
  }
  return errors
}

/** Upsert a raw localStorage JSON blob as individual rows. Returns error strings. */
async function upsertLocalStorageEntries(
  storageKey: string,
  table: string,
  mapFn: (key: string, value: unknown) => Record<string, unknown>,
  conflictKey: string,
): Promise<string[]> {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return []
  const entries = Object.entries(JSON.parse(raw))
  const errors: string[] = []
  for (const [key, value] of entries) {
    const row = mapFn(key, value)
    const { error } = await supabase!.from(table).upsert(row, { onConflict: conflictKey })
    if (error) errors.push(`${table}/${key}: ${error.message}`)
  }
  return errors
}

/**
 * Push all localStorage data to Supabase.
 * Local replaces remote for all stores.
 */
export async function pushAllToSupabase(): Promise<boolean> {
  if (!isSupabaseConnected() || !supabase) return false

  setStatus('syncing')
  const now = new Date().toISOString()

  try {
    // 0. Delete flows that were removed locally
    const deletedRaw = localStorage.getItem('picnic-design-lab:deleted-flows')
    if (deletedRaw) {
      const deletedIds: string[] = JSON.parse(deletedRaw)
      for (const id of deletedIds) {
        await supabase.from('dynamic_flows').delete().eq('id', id)
        await supabase.from('flow_graphs').delete().eq('flow_id', id)
      }
    }

    const allErrors = (await Promise.all([
      // 1. Dynamic flows
      upsertMany('dynamic_flows', getDynamicFlows(), (flow) => ({
        id: flow.id, name: flow.name, description: flow.description, domain: flow.domain,
        screens: JSON.stringify(flow.screens), spec_content: flow.specContent ?? null,
        level: flow.level ?? null,
        linked_flows: flow.linkedFlows ? JSON.stringify(flow.linkedFlows) : null,
        entry_points: flow.entryPoints ? JSON.stringify(flow.entryPoints) : null,
        updated_at: now,
      }), 'id'),

      // 2. Flow graphs
      upsertLocalStorageEntries('picnic-design-lab:flow-graphs', 'flow_graphs', (flowId, graph) => {
        const g = graph as { nodes: unknown[]; edges: unknown[] }
        return { flow_id: flowId, nodes: JSON.stringify(g.nodes), edges: JSON.stringify(g.edges), updated_at: now }
      }, 'flow_id'),

      // 3. Flow groups (singleton)
      (async () => {
        const raw = localStorage.getItem('picnic-design-lab:flow-groups')
        if (!raw) return []
        const { error } = await supabase!.from('flow_groups').upsert(
          { id: 'singleton', data: raw, updated_at: now },
          { onConflict: 'id' },
        )
        return error ? [`flow_groups: ${error.message}`] : []
      })(),

      // 4. Dynamic pages
      upsertMany('dynamic_pages', getDynamicPages(), (page) => ({
        id: page.id, name: page.name, description: page.description, area: page.area,
        components_used: JSON.stringify(page.componentsUsed), updated_at: now,
      }), 'id'),

      // 5. Page overrides
      upsertLocalStorageEntries('picnic-design-lab:page-overrides', 'page_overrides', (pageId, data) => {
        const d = data as { name?: string; description?: string }
        return { page_id: pageId, name: d.name ?? null, description: d.description ?? null, updated_at: now }
      }, 'page_id'),

      // 6. Token overrides
      upsertLocalStorageEntries('picnic-design-lab:token-overrides', 'token_overrides', (_cssVar, value) => ({
        css_var: _cssVar, value, updated_at: now,
      }), 'css_var'),

      // 7. Canvas comments
      upsertMany('canvas_comments', getAllCommentEntries(), (entry) => ({
        flow_id: entry.flowId,
        comments: JSON.stringify(entry.comments),
        updated_at: now,
      }), 'flow_id'),
    ])).flat()

    if (allErrors.length > 0) {
      console.error('[syncStore] pushAllToSupabase errors:', allErrors)
      setStatus('error')
      return false
    }

    ignoreRemoteUntil = Date.now() + 3000
    setStatus('synced')
    return true
  } catch (e) {
    console.error('[syncStore] pushAllToSupabase failed:', e)
    setStatus('error')
    return false
  }
}

// ── Status helpers ──

/** Mark status as unsynced (call when localStorage changes without pushing). */
export function markUnsynced(): void {
  if (isSupabaseConnected()) setStatus('unsynced')
}

/** Mark status as remote-updated (call from real-time subscriptions). */
export function markRemoteUpdated(): void {
  // Only transition from synced → remote-updated.
  // Don't overwrite 'unsynced' — local changes take priority.
  // Ignore events during cooldown after our own push/pull.
  if (Date.now() < ignoreRemoteUntil) return
  if (isSupabaseConnected() && currentStatus === 'synced') setStatus('remote-updated')
}

/** Check if there are unpushed local changes. */
export function hasUnpushedChanges(): boolean {
  return currentStatus === 'unsynced'
}
