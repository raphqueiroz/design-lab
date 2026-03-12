/**
 * Persistence for all flows (unified model).
 * Every flow — whether originally from index.ts or user-created — is stored here.
 * Screen components are resolved at runtime via screenResolver.ts.
 */

import { supabase, isSupabaseConnected } from '../../lib/supabase'
import { parseIfString } from '../../lib/parseIfString'
import { markSynced, markUnsynced, markError } from '../../lib/syncStore'
import { updateScreenMeta } from './flowFileApi'

const DELETED_KEY = 'picnic-design-lab:deleted-flows'

function readDeletedFlowIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const STORAGE_KEY = 'picnic-design-lab:dynamic-flows'

export interface DynamicScreen {
  id: string
  title: string
  description: string
  componentsUsed: string[]
  /** Relative path to the .tsx file, e.g. 'deposit-v2/Screen1_AmountEntry.tsx' */
  filePath?: string
  /** Reference to a standalone Page entity in the page registry */
  pageId?: string
  /** Screen state definitions (for the page gallery state switcher) */
  states?: { id: string; name: string; description?: string; isDefault?: boolean; data?: Record<string, unknown> }[]
  /** Interactive elements declared by the screen (for onElementTap matching) */
  interactiveElements?: readonly { id: string; component: string; label: string }[]
}

export interface DynamicFlowDef {
  id: string
  name: string
  description: string
  domain: string
  screens: DynamicScreen[]
  specContent?: string
  /** Navigation level: 1 = shows TabBar, 2 = hides it. */
  level?: 1 | 2
  /** IDs of flows this flow navigates to */
  linkedFlows?: string[]
  /** Labels describing how users enter this flow */
  entryPoints?: string[]
  /** ISO timestamp of last modification (for sync conflict resolution) */
  updatedAt?: string
}

// ── localStorage layer ──

function readAll(): Record<string, DynamicFlowDef> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, DynamicFlowDef>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ── Supabase helpers ──

async function upsertFlowToSupabase(flow: DynamicFlowDef): Promise<void> {
  if (!isSupabaseConnected()) return
  markUnsynced()
  const { error } = await supabase!.from('dynamic_flows').upsert(
    {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      domain: flow.domain,
      screens: JSON.stringify(flow.screens),
      spec_content: flow.specContent ?? null,
      level: flow.level ?? null,
      linked_flows: flow.linkedFlows ? JSON.stringify(flow.linkedFlows) : null,
      entry_points: flow.entryPoints ? JSON.stringify(flow.entryPoints) : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) {
    console.error('[dynamicFlowStore] Supabase upsert failed:', error.message)
    markError()
  } else {
    markSynced()
  }
}

// ── Public API ──

export function getDynamicFlows(): DynamicFlowDef[] {
  return Object.values(readAll())
}

export function getDynamicFlow(id: string): DynamicFlowDef | null {
  return readAll()[id] ?? null
}

export function saveDynamicFlow(flow: DynamicFlowDef): void {
  const all = readAll()
  flow.updatedAt = new Date().toISOString()
  all[flow.id] = flow
  writeAll(all)
  upsertFlowToSupabase(flow)
}

export async function deleteDynamicFlow(id: string): Promise<void> {
  const all = readAll()
  delete all[id]
  writeAll(all)

  if (isSupabaseConnected()) {
    const { error } = await supabase!.from('dynamic_flows').delete().eq('id', id)
    if (error) console.error('[dynamicFlowStore] Supabase delete failed:', error.message)
  }
}

export function addScreenToFlow(flowId: string, screen: DynamicScreen): void {
  const all = readAll()
  const flow = all[flowId]
  if (!flow) return
  flow.screens.push(screen)
  flow.updatedAt = new Date().toISOString()
  writeAll(all)
  upsertFlowToSupabase(flow)
}

export function removeScreenFromFlow(flowId: string, screenId: string): void {
  const all = readAll()
  const flow = all[flowId]
  if (!flow) return
  flow.screens = flow.screens.filter((s) => s.id !== screenId)
  flow.updatedAt = new Date().toISOString()
  writeAll(all)
  upsertFlowToSupabase(flow)
}

export function updateScreenInFlow(
  flowId: string,
  screenId: string,
  updates: Partial<Omit<DynamicScreen, 'id'>>,
): void {
  const all = readAll()
  const flow = all[flowId]
  if (!flow) return
  const screen = flow.screens.find((s) => s.id === screenId)
  if (!screen) return
  Object.assign(screen, updates)
  flow.updatedAt = new Date().toISOString()
  writeAll(all)
  upsertFlowToSupabase(flow)

  // Auto-sync title/description to .tsx file comment block
  if (screen.filePath && (updates.title || updates.description)) {
    updateScreenMeta(screen.filePath, screen.title, screen.description)
  }
}

// ── Rename ──

export async function renameDynamicFlow(oldId: string, newId: string): Promise<void> {
  const all = readAll()
  const flow = all[oldId]
  if (!flow) return

  // Update the flow: new id, name = newId, update screen IDs
  delete all[oldId]
  flow.id = newId
  flow.name = newId
  flow.screens = flow.screens.map((s) => {
    // Screen IDs typically start with the flow ID prefix — replace only at the start
    const newScreenId = s.id.startsWith(oldId) ? newId + s.id.slice(oldId.length) : s.id
    return { ...s, id: newScreenId }
  })
  all[newId] = flow
  writeAll(all)

  // Supabase: delete old, upsert new
  if (isSupabaseConnected()) {
    await supabase!.from('dynamic_flows').delete().eq('id', oldId)
  }
  await upsertFlowToSupabase(flow)
}

// ── Supabase → localStorage hydration ──

export async function hydrateDynamicFlowsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!.from('dynamic_flows').select('*')
    if (error) return false

    const rows = data ?? []
    if (rows.length === 0) return true // empty table is valid — nothing to hydrate

    const all = readAll()
    const deleted = readDeletedFlowIds()

    // Remove any locally-stored flows that are now in the deleted list
    for (const id of deleted) {
      if (id in all) delete all[id]
    }

    for (const row of rows) {
      if (deleted.has(row.id)) continue

      const local = all[row.id]
      const remoteTime = row.updated_at ? new Date(row.updated_at).getTime() : 0
      const localTime = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0

      if (!local || remoteTime >= localTime) {
        // Remote is newer or no local version — accept remote
        all[row.id] = {
          id: row.id,
          name: row.name,
          description: row.description,
          domain: row.domain,
          screens: parseIfString(row.screens),
          updatedAt: row.updated_at,
          ...(row.spec_content ? { specContent: row.spec_content } : {}),
          ...(row.level != null ? { level: row.level } : {}),
          ...(row.linked_flows ? { linkedFlows: parseIfString(row.linked_flows) } : {}),
          ...(row.entry_points ? { entryPoints: parseIfString(row.entry_points) } : {}),
        }
      }
      // else: local is newer — keep local (it was already pushed to Supabase async)
    }

    writeAll(all)
    return true
  } catch {
    return false
  }
}

// ── Real-time subscription ──

export function subscribeToDynamicFlowChanges(onUpdate: () => void): (() => void) | null {
  if (!isSupabaseConnected()) return null

  const channel = supabase!
    .channel('dynamic-flow-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'dynamic_flows' }, () => {
      hydrateDynamicFlowsFromSupabase().then(() => onUpdate())
    })
    .subscribe()

  return () => {
    supabase!.removeChannel(channel)
  }
}

// ── Domain migration: savings → earn ──

const SAVINGS_MIGRATION_KEY = 'picnic-design-lab:savings-to-earn-done'

export function migrateSavingsToEarnDomain(): void {
  if (localStorage.getItem(SAVINGS_MIGRATION_KEY)) return

  const all = readAll()
  let changed = false
  for (const flow of Object.values(all)) {
    if (flow.domain === 'savings') {
      flow.domain = 'earn'
      flow.updatedAt = new Date().toISOString()
      changed = true
    }
  }
  if (changed) {
    writeAll(all)
    // Push updates to Supabase
    for (const flow of Object.values(all)) {
      if (flow.domain === 'earn') upsertFlowToSupabase(flow)
    }
  }

  // Also fix flowGroupStore archived flows and ungrouped order keyed under 'savings'
  const groupsRaw = localStorage.getItem('picnic-design-lab:flow-groups')
  if (groupsRaw) {
    try {
      const state = JSON.parse(groupsRaw)
      let groupsChanged = false

      // Re-key archivedFlows: savings → earn
      if (state.archivedFlows) {
        for (const [flowId, domainId] of Object.entries(state.archivedFlows)) {
          if (domainId === 'savings') {
            state.archivedFlows[flowId] = 'earn'
            groupsChanged = true
          }
        }
      }

      // Re-key groups with domainId: 'savings'
      if (state.groups) {
        for (const group of Object.values(state.groups) as { domainId: string }[]) {
          if (group.domainId === 'savings') {
            group.domainId = 'earn'
            groupsChanged = true
          }
        }
      }

      // Merge ungroupedOrder['savings'] into ungroupedOrder['earn']
      if (state.ungroupedOrder?.savings) {
        const savingsOrder = state.ungroupedOrder.savings as string[]
        const earnOrder = (state.ungroupedOrder.earn ?? []) as string[]
        state.ungroupedOrder.earn = [...earnOrder, ...savingsOrder.filter((id: string) => !earnOrder.includes(id))]
        delete state.ungroupedOrder.savings
        groupsChanged = true
      }

      if (groupsChanged) {
        localStorage.setItem('picnic-design-lab:flow-groups', JSON.stringify(state))
      }
    } catch { /* ignore parse errors */ }
  }

  localStorage.setItem(SAVINGS_MIGRATION_KEY, new Date().toISOString())
}
