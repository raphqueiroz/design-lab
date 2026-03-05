import type { ComponentType } from 'react'
import type { PageStateDefinition } from '../gallery/pageRegistry'
import { getDynamicFlows, type DynamicFlowDef } from './dynamicFlowStore'
import { createPlaceholderComponent } from '../../flows/PlaceholderScreen'
import { supabase, isSupabaseConnected } from '../../lib/supabase'

export interface InteractiveElement {
  id: string          // e.g. 'btn-continue'
  component: string   // e.g. 'Button'
  label: string       // e.g. 'Continuar'
}

export interface FlowScreen {
  id: string
  title: string
  description: string
  componentsUsed: readonly string[]
  component: ComponentType<FlowScreenProps>
  /** Optional reference to a standalone Page entity in the page registry */
  pageId?: string
  states?: PageStateDefinition[]
  interactiveElements?: readonly InteractiveElement[]
}

export interface FlowScreenProps {
  onNext: () => void
  onBack: () => void
  overlays?: import('./flowGraphNavigation').ScreenOverlayInfo[]
  onOpenOverlay?: (nodeId: string) => void
  /** Called when a user taps an interactive element (e.g. ListItem in a BottomSheet). Label format: "Component: Label". Returns true if the graph resolved a navigation target. */
  onElementTap?: (elementLabel: string) => boolean
  /** Called when the screen's internal state changes (e.g. idle → loading → ready). Reports the matching page state ID. */
  onStateChange?: (stateId: string) => void
}

// ── Domain system ──

export interface DomainDef {
  id: string       // 'cards', 'earn', 'add-funds', etc.
  name: string     // 'Cards'
  order: number    // Display order
}

const domains = new Map<string, DomainDef>()

export function registerDomain(domain: DomainDef): void {
  domains.set(domain.id, domain)
}

export function getDomain(id: string): DomainDef | undefined {
  return domains.get(id)
}

export function getAllDomains(): DomainDef[] {
  return Array.from(domains.values()).sort((a, b) => a.order - b.order)
}

// Register default domains
registerDomain({ id: 'authentication', name: 'Authentication', order: 1 })
registerDomain({ id: 'onboarding', name: 'Onboarding', order: 2 })
registerDomain({ id: 'dashboard', name: 'Dashboard', order: 3 })
registerDomain({ id: 'cards', name: 'Cards', order: 4 })
registerDomain({ id: 'add-funds', name: 'Add Funds', order: 5 })
registerDomain({ id: 'send-funds', name: 'Send Funds', order: 6 })
registerDomain({ id: 'perks', name: 'Perks', order: 7 })
registerDomain({ id: 'earn', name: 'Earn', order: 8 })
registerDomain({ id: 'transaction-history', name: 'Transaction History', order: 9 })
registerDomain({ id: 'settings', name: 'Settings', order: 10 })

// ── Flow registry ──

export interface Flow {
  id: string
  name: string
  description: string
  domain: string
  screens: FlowScreen[]
  specContent?: string
  isDynamic?: boolean
  /** Navigation level for the flow. Level 1 shows TabBar (main tabs), level 2 hides it (deeper screens). Defaults to 1. */
  level?: 1 | 2
  /** IDs of flows this flow navigates to */
  linkedFlows?: string[]
  /** Labels describing how users enter this flow (e.g. 'dashboard-add-funds', 'deep-link') */
  entryPoints?: string[]
}

const flows = new Map<string, Flow>()

// ── Metadata overrides: persist name/description/domain changes for hardcoded flows ──

const OVERRIDES_KEY = 'picnic-design-lab:flow-meta-overrides'

type FlowMetaOverride = { name?: string; description?: string; domain?: string }

function readOverrides(): Record<string, FlowMetaOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeOverrides(overrides: Record<string, FlowMetaOverride>): void {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
}

function saveOverride(id: string, updates: FlowMetaOverride): void {
  const all = readOverrides()
  all[id] = { ...all[id], ...updates }
  writeOverrides(all)

  // Sync to Supabase
  if (isSupabaseConnected()) {
    const merged = all[id]
    supabase!.from('flow_overrides').upsert(
      {
        flow_id: id,
        name: merged.name ?? null,
        description: merged.description ?? null,
        domain: merged.domain ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'flow_id' },
    ).then(({ error }) => {
      if (error) console.error('[flowRegistry] Supabase upsert failed:', error.message)
    })
  }
}

/** Hydrate flow meta overrides from Supabase → localStorage. */
export async function hydrateFlowMetaOverridesFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!.from('flow_overrides').select('*')
    if (error) return false

    const rows = data ?? []
    if (rows.length === 0) return false

    const all = readOverrides()
    for (const row of rows) {
      const override: FlowMetaOverride = {}
      if (row.name != null) override.name = row.name
      if (row.description != null) override.description = row.description
      if (row.domain != null) override.domain = row.domain
      all[row.flow_id] = override
    }
    writeOverrides(all)

    // Re-apply overrides to already-registered flows
    for (const [id, override] of Object.entries(all)) {
      const flow = flows.get(id)
      if (flow && !flow.isDynamic) {
        const patched = { ...flow }
        if (override.name !== undefined) patched.name = override.name
        if (override.description !== undefined) patched.description = override.description
        if (override.domain !== undefined) patched.domain = override.domain
        flows.set(id, patched)
      }
    }

    return true
  } catch {
    return false
  }
}

/** Get all flow meta overrides (for pushAllToSupabase). */
export function getAllFlowMetaOverrides(): Record<string, FlowMetaOverride> {
  return readOverrides()
}

// ── Tombstone: deleted flow IDs persisted across reloads ──

const DELETED_KEY = 'picnic-design-lab:deleted-flows'

function readDeletedFlows(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeDeletedFlows(ids: Set<string>): void {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]))
}

export function isFlowDeleted(flowId: string): boolean {
  return readDeletedFlows().has(flowId)
}

export function markFlowDeleted(flowId: string): void {
  const deleted = readDeletedFlows()
  deleted.add(flowId)
  writeDeletedFlows(deleted)
}

export function unmarkFlowDeleted(flowId: string): void {
  const deleted = readDeletedFlows()
  deleted.delete(flowId)
  writeDeletedFlows(deleted)
}

export function registerFlow(flow: Flow): void {
  if (readDeletedFlows().has(flow.id)) return // user deleted this flow — don't re-register
  if (import.meta.env.DEV && flows.has(flow.id)) {
    throw new Error(`[flowRegistry] Duplicate flow ID: "${flow.id}"`)
  }
  // Apply persisted metadata overrides (name, description, domain)
  const override = readOverrides()[flow.id]
  if (override) {
    const patched = { ...flow }
    if (override.name !== undefined) patched.name = override.name
    if (override.description !== undefined) patched.description = override.description
    if (override.domain !== undefined) patched.domain = override.domain
    flows.set(flow.id, patched)
  } else {
    flows.set(flow.id, flow)
  }
}

export function unregisterFlow(id: string): void {
  flows.delete(id)
}

/** Update mutable fields on a registered flow (name, description, domain). Persists for both dynamic and hardcoded flows. */
export function updateFlowMeta(id: string, updates: { name?: string; description?: string; domain?: string }): void {
  const flow = flows.get(id)
  if (!flow) return
  const updated = { ...flow }
  if (updates.name !== undefined) updated.name = updates.name
  if (updates.description !== undefined) updated.description = updates.description
  if (updates.domain !== undefined) updated.domain = updates.domain
  flows.set(id, updated)
  // Persist overrides for hardcoded flows (dynamic flows are persisted by their own store)
  if (!flow.isDynamic) {
    saveOverride(id, updates)
  }
}

/** Register a dynamic flow from the dynamicFlowStore data model. */
export function registerDynamicFlow(def: DynamicFlowDef): void {
  // Warn on collision with a non-dynamic (hardcoded) flow
  const existing = flows.get(def.id)
  if (existing && !existing.isDynamic) {
    console.warn(`[flowRegistry] Dynamic flow "${def.name}" (${def.id}) collides with hardcoded flow "${existing.name}". Skipping.`)
    return
  }
  const flow: Flow = {
    id: def.id,
    name: def.name,
    description: def.description,
    domain: def.domain,
    specContent: def.specContent,
    isDynamic: true,
    screens: def.screens.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      componentsUsed: s.componentsUsed,
      component: createPlaceholderComponent(s.title, s.description),
    })),
  }
  flows.set(flow.id, flow)
}

/** Hydrate all dynamic flows from localStorage into the registry. */
export function hydrateDynamicFlows(): void {
  const dynamicFlows = getDynamicFlows()
  for (const def of dynamicFlows) {
    registerDynamicFlow(def)
  }
}

/** Re-register a single dynamic flow (after adding/removing screens). */
export function refreshDynamicFlow(id: string): void {
  // Re-read from localStorage and re-register
  const dynamicFlows = getDynamicFlows()
  const def = dynamicFlows.find((f) => f.id === id)
  if (def) {
    registerDynamicFlow(def)
  }
}

export function getFlow(id: string): Flow | undefined {
  return flows.get(id)
}

export function getAllFlows(): Flow[] {
  return Array.from(flows.keys()).map((id) => getFlow(id)!)
}

export function getFlowsByDomain(): Record<string, Flow[]> {
  const grouped: Record<string, Flow[]> = {}
  for (const id of flows.keys()) {
    const flow = getFlow(id)!
    if (!grouped[flow.domain]) grouped[flow.domain] = []
    grouped[flow.domain].push(flow)
  }
  return grouped
}

/** Forward lookup: resolve linkedFlows IDs to Flow objects */
export function getLinkedFlows(flowId: string): Flow[] {
  const flow = getFlow(flowId)
  if (!flow?.linkedFlows) return []
  return flow.linkedFlows
    .map((id) => getFlow(id))
    .filter((f): f is Flow => f !== undefined)
}

/** Reverse lookup: flows whose linkedFlows include this flowId */
export function getFlowsLinkingTo(flowId: string): Flow[] {
  return getAllFlows().filter(
    (f) => f.linkedFlows?.includes(flowId),
  )
}
