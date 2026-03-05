/**
 * Persistence for user-created (dynamic) flows.
 * These flows use PlaceholderScreen components and are stored in localStorage.
 */

import { supabase, isSupabaseConnected } from '../../lib/supabase'

const STORAGE_KEY = 'picnic-design-lab:dynamic-flows'

export interface DynamicScreen {
  id: string
  title: string
  description: string
  componentsUsed: string[]
}

export interface DynamicFlowDef {
  id: string
  name: string
  description: string
  domain: string
  screens: DynamicScreen[]
  specContent?: string
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
