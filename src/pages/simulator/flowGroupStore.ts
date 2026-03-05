/**
 * User-created flow groups — replaces the old parentFlowId hierarchy.
 * Groups are scoped to domains and persisted in localStorage (+ optionally Supabase).
 */

import { supabase, isSupabaseConnected } from '../../lib/supabase'
import { getAllFlows } from './flowRegistry'

// ── Types ──

export interface FlowGroup {
  id: string          // 'group-yields-variations'
  name: string        // 'Yields Variations'
  domainId: string    // groups are scoped to a domain
  order: number       // display order within the domain
  collapsed: boolean  // persisted collapse state
}

export interface FlowGroupMembership {
  flowId: string
  groupId: string     // which group this flow belongs to
  order: number       // position within the group
}

interface FlowGroupState {
  groups: Record<string, FlowGroup>
  memberships: Record<string, FlowGroupMembership>  // keyed by flowId
}

// ── Storage ──

const STORAGE_KEY = 'picnic-design-lab:flow-groups'

function readState(): FlowGroupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { groups: {}, memberships: {} }
  } catch {
    return { groups: {}, memberships: {} }
  }
}

function writeState(state: FlowGroupState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  upsertToSupabase(state)
  notifyListeners()
}

// ── Change listeners ──

const listeners = new Set<() => void>()

function notifyListeners(): void {
  listeners.forEach((fn) => fn())
}

export function subscribeToGroupChanges(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

// ── Supabase helpers ──

async function upsertToSupabase(state: FlowGroupState): Promise<void> {
  if (!isSupabaseConnected()) return
  const { error } = await supabase!.from('flow_groups').upsert(
    {
      id: 'singleton',
      data: JSON.stringify(state),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) console.error('[flowGroupStore] Supabase upsert failed:', error.message)
}

export async function hydrateFlowGroupsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!
      .from('flow_groups')
      .select('*')
      .eq('id', 'singleton')
      .single()

    if (error || !data) return false

    const parsed: FlowGroupState =
      typeof data.data === 'string' ? JSON.parse(data.data) : data.data

    if (parsed.groups && parsed.memberships) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      notifyListeners()
      return true
    }
    return false
  } catch {
    return false
  }
}

// ── Public API: groups ──

export function getGroupsForDomain(domainId: string): FlowGroup[] {
  const { groups } = readState()
  return Object.values(groups)
    .filter((g) => g.domainId === domainId)
    .sort((a, b) => a.order - b.order)
}

export function getGroup(groupId: string): FlowGroup | undefined {
  return readState().groups[groupId]
}

export function createGroup(name: string, domainId: string): FlowGroup {
  const state = readState()
  const existing = Object.values(state.groups).filter((g) => g.domainId === domainId)
  const maxOrder = existing.reduce((max, g) => Math.max(max, g.order), -1)

  const id = 'group-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  const group: FlowGroup = {
    id,
    name,
    domainId,
    order: maxOrder + 1,
    collapsed: false,
  }

  state.groups[id] = group
  writeState(state)
  return group
}

export function deleteGroup(groupId: string): void {
  const state = readState()
  delete state.groups[groupId]

  // Clear memberships for this group
  for (const [flowId, membership] of Object.entries(state.memberships)) {
    if (membership.groupId === groupId) {
      delete state.memberships[flowId]
    }
  }

  writeState(state)
}

export function renameGroup(groupId: string, name: string): void {
  const state = readState()
  const group = state.groups[groupId]
  if (!group) return
  group.name = name
  writeState(state)
}

export function setGroupCollapsed(groupId: string, collapsed: boolean): void {
  const state = readState()
  const group = state.groups[groupId]
  if (!group) return
  group.collapsed = collapsed
  writeState(state)
}

// ── Public API: memberships ──

export function getMembershipForFlow(flowId: string): FlowGroupMembership | null {
  return readState().memberships[flowId] ?? null
}

export function getFlowIdsInGroup(groupId: string): string[] {
  const { memberships } = readState()
  return Object.values(memberships)
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => a.order - b.order)
    .map((m) => m.flowId)
}

export function assignFlowToGroup(flowId: string, groupId: string, order?: number): void {
  const state = readState()
  const group = state.groups[groupId]
  if (!group) return

  const existing = Object.values(state.memberships).filter((m) => m.groupId === groupId)
  const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), -1)

  state.memberships[flowId] = {
    flowId,
    groupId,
    order: order ?? maxOrder + 1,
  }
  writeState(state)
}

export function removeFlowFromGroup(flowId: string): void {
  const state = readState()
  delete state.memberships[flowId]
  writeState(state)
}

export function reorderFlowsInGroup(groupId: string, orderedFlowIds: string[]): void {
  const state = readState()
  for (let i = 0; i < orderedFlowIds.length; i++) {
    const flowId = orderedFlowIds[i]
    if (state.memberships[flowId]) {
      state.memberships[flowId].order = i
    }
  }
  writeState(state)
}

export function reorderGroupsInDomain(domainId: string, orderedGroupIds: string[]): void {
  const state = readState()
  for (let i = 0; i < orderedGroupIds.length; i++) {
    const group = state.groups[orderedGroupIds[i]]
    if (group && group.domainId === domainId) {
      group.order = i
    }
  }
  writeState(state)
}

// ── Seed from old parentFlowId hierarchy ──

export function seedDefaultGroups(_allFlows?: unknown): void {
  const state = readState()

  // Only seed if no groups exist yet
  if (Object.keys(state.groups).length > 0) return

  const seeds: { domain: string; group: string; flowIds: string[] }[] = [
    { domain: 'cards', group: 'Card Detail', flowIds: ['card-info', 'edit-daily-limits', 'rename-virtual-card', 'remove-virtual-card', 'report-card-loss', 'apple-pay-setup'] },
    { domain: 'cards', group: 'Card Actions', flowIds: ['create-virtual-card', 'update-phone'] },
    { domain: 'earn', group: 'Caixinha Dólar', flowIds: ['caixinha-dolar', 'caixinha-deposit', 'caixinha-withdraw'] },
    { domain: 'earn', group: 'Yields 2', flowIds: ['yields2', 'yields2-deposit', 'yields2-withdraw'] },
    { domain: 'earn', group: 'Yields 3', flowIds: ['yields3', 'yields3-deposit', 'yields3-withdraw'] },
    { domain: 'earn', group: 'Yields 4', flowIds: ['yields4', 'yields4-deposit', 'yields4-withdraw'] },
    { domain: 'earn', group: 'Yields 5', flowIds: ['yields5', 'yields5-deposit', 'yields5-withdraw'] },
    { domain: 'add-funds', group: 'ACH Deposit', flowIds: ['deposit-ach', 'noah-registration'] },
  ]

  // Only seed flows that actually exist in the registry
  const registeredFlows = new Set(getAllFlows().map((f) => f.id))

  let groupOrder = 0
  for (const seed of seeds) {
    const id = 'group-' + seed.group.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
    state.groups[id] = {
      id,
      name: seed.group,
      domainId: seed.domain,
      order: groupOrder++,
      collapsed: false,
    }

    let flowOrder = 0
    for (const flowId of seed.flowIds) {
      if (registeredFlows.has(flowId)) {
        state.memberships[flowId] = {
          flowId,
          groupId: id,
          order: flowOrder++,
        }
      }
    }
  }

  writeState(state)
}
