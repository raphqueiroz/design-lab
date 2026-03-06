/**
 * Persistence for all flows (unified model).
 * Every flow — whether originally from index.ts or user-created — is stored here.
 * Screen components are resolved at runtime via screenResolver.ts.
 */

import { supabase, isSupabaseConnected } from '../../lib/supabase'
import { updateScreenMeta } from './flowFileApi'

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
  if (error) console.error('[dynamicFlowStore] Supabase upsert failed:', error.message)
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
  writeAll(all)
  upsertFlowToSupabase(flow)
}

export function removeScreenFromFlow(flowId: string, screenId: string): void {
  const all = readAll()
  const flow = all[flowId]
  if (!flow) return
  flow.screens = flow.screens.filter((s) => s.id !== screenId)
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
  flow.screens = flow.screens.map((s) => ({
    ...s,
    id: s.id.replace(oldId, newId),
  }))
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
    if (rows.length === 0) return false // nothing in Supabase yet — keep localStorage

    const all = readAll()
    for (const row of rows) {
      all[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        domain: row.domain,
        screens: typeof row.screens === 'string' ? JSON.parse(row.screens) : row.screens,
        ...(row.spec_content ? { specContent: row.spec_content } : {}),
        ...(row.level != null ? { level: row.level } : {}),
        ...(row.linked_flows ? { linkedFlows: typeof row.linked_flows === 'string' ? JSON.parse(row.linked_flows) : row.linked_flows } : {}),
        ...(row.entry_points ? { entryPoints: typeof row.entry_points === 'string' ? JSON.parse(row.entry_points) : row.entry_points } : {}),
      }
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
