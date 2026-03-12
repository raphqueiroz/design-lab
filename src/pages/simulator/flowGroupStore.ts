/**
 * User-created flow groups — replaces the old parentFlowId hierarchy.
 * Groups are scoped to domains and persisted in localStorage (+ optionally Supabase).
 */

import { supabase, isSupabaseConnected } from '../../lib/supabase'
import { parseIfString } from '../../lib/parseIfString'
import { markSynced, markUnsynced, markError } from '../../lib/syncStore'
import { getAllFlows, duplicateFlowWithId } from './flowRegistry'

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
  archivedFlows: Record<string, string>    // flowId → original domainId
  archivedGroups: Record<string, true>     // groupId → true
  ungroupedOrder: Record<string, string[]> // domainId → ordered flowIds
  deletedFlows?: string[]                  // flow IDs hidden from sidebar (synced via singleton)
}

// ── Storage ──

const STORAGE_KEY = 'picnic-design-lab:flow-groups'

/**
 * Track whether a user-initiated action is writing vs bootstrap/module-scope code.
 * Only user actions should push to Supabase. Bootstrap writes (flow index files,
 * seedDefaultGroups) only write to localStorage.
 */
let userActionsEnabled = false

export function enableUserActions(): void {
  userActionsEnabled = true
}

// ── Code-defaults registry ──
// Flow index files declare their desired group/membership at import time.
// These are held in memory only, never persisted. During hydration (pull),
// code defaults fill gaps — they never overwrite user-curated state from Supabase.

interface CodeGroupDefault {
  name: string
  domainId: string
}

interface CodeMembershipDefault {
  flowId: string
  groupId: string
}

const _codeGroupDefaults = new Map<string, CodeGroupDefault>()   // groupId → default
const _codeMembershipDefaults = new Map<string, CodeMembershipDefault>() // flowId → default

export function declareGroupDefault(name: string, domainId: string): string {
  const id = 'group-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  _codeGroupDefaults.set(id, { name, domainId })
  return id
}

export function declareMembershipDefault(flowId: string, groupId: string): void {
  _codeMembershipDefaults.set(flowId, { flowId, groupId })
}

/**
 * Apply code defaults to a state object (mutates in place).
 * Only adds groups/memberships that don't already exist in state.
 */
function applyCodeDefaults(state: FlowGroupState): void {
  const registeredFlows = new Set(getAllFlows().map((f) => f.id))

  for (const [groupId, def] of _codeGroupDefaults) {
    if (!(groupId in state.groups)) {
      const existing = Object.values(state.groups).filter((g) => g.domainId === def.domainId)
      const maxOrder = existing.reduce((max, g) => Math.max(max, g.order), -1)
      state.groups[groupId] = {
        id: groupId,
        name: def.name,
        domainId: def.domainId,
        order: maxOrder + 1,
        collapsed: false,
      }
    }
  }

  for (const [flowId, def] of _codeMembershipDefaults) {
    if (!registeredFlows.has(flowId)) continue
    if (flowId in state.memberships) continue
    if (!(def.groupId in state.groups)) continue

    const existing = Object.values(state.memberships).filter((m) => m.groupId === def.groupId)
    const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), -1)
    state.memberships[flowId] = {
      flowId,
      groupId: def.groupId,
      order: maxOrder + 1,
    }
  }
}

function readState(): FlowGroupState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const state = raw ? JSON.parse(raw) : { groups: {}, memberships: {} }
    // Backwards compat: ensure archive fields exist
    if (!state.archivedFlows) state.archivedFlows = {}
    if (!state.archivedGroups) state.archivedGroups = {}
    if (!state.ungroupedOrder) state.ungroupedOrder = {}
    // Sync deleted-flows between state and legacy key (both directions)
    const legacyRaw = localStorage.getItem('picnic-design-lab:deleted-flows')
    const legacyDeleted: string[] = legacyRaw ? JSON.parse(legacyRaw) : []
    const stateDeleted: string[] = state.deletedFlows ?? []
    // Merge both sources (union)
    const mergedSet = new Set([...legacyDeleted, ...stateDeleted])
    state.deletedFlows = [...mergedSet]
    // Write back to legacy key so dynamicFlowStore/flowRegistry can read it
    localStorage.setItem('picnic-design-lab:deleted-flows', JSON.stringify(state.deletedFlows))
    // Persist merged state back if deletedFlows was added from legacy key
    if (mergedSet.size > stateDeleted.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
    return state
  } catch {
    return { groups: {}, memberships: {}, archivedFlows: {}, archivedGroups: {}, ungroupedOrder: {}, deletedFlows: [] }
  }
}

function writeState(state: FlowGroupState, isUserAction = false): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  if (isUserAction || userActionsEnabled) {
    markUnsynced()
    upsertToSupabase(state)
  }
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
  if (error) {
    console.error('[flowGroupStore] Supabase upsert failed:', error.message)
    markError()
  } else {
    markSynced()
  }
}

/**
 * PULL: Remote replaces local entirely, then code defaults fill gaps.
 * This is a pure pull — no push-back to Supabase.
 */
export async function hydrateFlowGroupsFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!
      .from('flow_groups')
      .select('*')
      .eq('id', 'singleton')
      .single()

    if (error || !data) {
      // No remote data — apply code defaults to current local state
      const state = readState()
      applyCodeDefaults(state)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      notifyListeners()
      return false
    }

    const parsed: FlowGroupState = parseIfString(data.data)

    if (parsed.groups && parsed.memberships) {
      if (!parsed.archivedFlows) parsed.archivedFlows = {}
      if (!parsed.archivedGroups) parsed.archivedGroups = {}
      if (!parsed.ungroupedOrder) parsed.ungroupedOrder = {}

      // Remote is the base — replaces local entirely
      const state: FlowGroupState = {
        groups: { ...parsed.groups },
        memberships: { ...parsed.memberships },
        archivedFlows: { ...parsed.archivedFlows },
        archivedGroups: { ...parsed.archivedGroups },
        ungroupedOrder: { ...parsed.ungroupedOrder },
        deletedFlows: parsed.deletedFlows ?? [],
      }

      // Apply code defaults: add groups/memberships from flow index files
      // that don't exist in the remote state (new flows not yet pushed)
      applyCodeDefaults(state)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      // Sync deletedFlows to the legacy key so flowRegistry can read it
      if (state.deletedFlows && state.deletedFlows.length > 0) {
        localStorage.setItem('picnic-design-lab:deleted-flows', JSON.stringify(state.deletedFlows))
      }
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
  const id = 'group-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')

  // During bootstrap (before user actions enabled), just register as a code default
  if (!userActionsEnabled) {
    declareGroupDefault(name, domainId)
    // Still write to localStorage for immediate sidebar rendering
    const state = readState()
    if (!(id in state.groups)) {
      const existing = Object.values(state.groups).filter((g) => g.domainId === domainId)
      const maxOrder = existing.reduce((max, g) => Math.max(max, g.order), -1)
      state.groups[id] = { id, name, domainId, order: maxOrder + 1, collapsed: false }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      notifyListeners()
    }
    return state.groups[id] ?? { id, name, domainId, order: 0, collapsed: false }
  }

  const state = readState()
  const existing = Object.values(state.groups).filter((g) => g.domainId === domainId)
  const maxOrder = existing.reduce((max, g) => Math.max(max, g.order), -1)

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
  // During bootstrap, just register as a code default
  if (!userActionsEnabled) {
    declareMembershipDefault(flowId, groupId)
    // Still write to localStorage for immediate sidebar rendering
    const state = readState()
    if (!(flowId in state.memberships) && state.groups[groupId]) {
      _removeFromUngroupedOrderInState(state, state.groups[groupId].domainId, flowId)
      const existing = Object.values(state.memberships).filter((m) => m.groupId === groupId)
      const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), -1)
      state.memberships[flowId] = { flowId, groupId, order: order ?? maxOrder + 1 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      notifyListeners()
    }
    return
  }

  const state = readState()
  const group = state.groups[groupId]
  if (!group) return

  // Remove from ungrouped order since it's now in a group
  _removeFromUngroupedOrderInState(state, group.domainId, flowId)

  const existing = Object.values(state.memberships).filter((m) => m.groupId === groupId)
  const maxOrder = existing.reduce((max, m) => Math.max(max, m.order), -1)

  state.memberships[flowId] = {
    flowId,
    groupId,
    order: order ?? maxOrder + 1,
  }
  writeState(state)
}

export function removeFlowFromGroup(flowId: string, appendToDomainId?: string): void {
  const state = readState()
  const membership = state.memberships[flowId]
  const domainId = appendToDomainId ?? (membership ? state.groups[membership.groupId]?.domainId : undefined)
  delete state.memberships[flowId]
  // Append to ungrouped order if we know the domain
  if (domainId) {
    const order = state.ungroupedOrder[domainId] ?? []
    if (!order.includes(flowId)) {
      state.ungroupedOrder[domainId] = [...order, flowId]
    }
  }
  writeState(state)
}

export function reorderFlowsInGroup(_groupId: string, orderedFlowIds: string[]): void {
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

// ── Public API: archive ──

export function archiveFlow(flowId: string, domainId: string): void {
  const state = readState()
  state.archivedFlows[flowId] = domainId
  writeState(state)
}

export function unarchiveFlow(flowId: string): void {
  const state = readState()
  delete state.archivedFlows[flowId]
  writeState(state)
}

export function archiveGroup(groupId: string): void {
  const state = readState()
  const group = state.groups[groupId]
  if (!group) return
  state.archivedGroups[groupId] = true
  // Archive all flows in the group
  const flowIds = Object.values(state.memberships)
    .filter((m) => m.groupId === groupId)
    .map((m) => m.flowId)
  for (const fid of flowIds) {
    state.archivedFlows[fid] = group.domainId
  }
  writeState(state)
}

export function unarchiveGroup(groupId: string): void {
  const state = readState()
  delete state.archivedGroups[groupId]
  // Unarchive all flows in the group
  const flowIds = Object.values(state.memberships)
    .filter((m) => m.groupId === groupId)
    .map((m) => m.flowId)
  for (const fid of flowIds) {
    delete state.archivedFlows[fid]
  }
  writeState(state)
}

export function isFlowArchived(flowId: string): boolean {
  return flowId in readState().archivedFlows
}

export function isGroupArchived(groupId: string): boolean {
  return groupId in readState().archivedGroups
}

export function getArchivedFlowIds(): string[] {
  return Object.keys(readState().archivedFlows)
}

export function getArchivedGroupIds(): string[] {
  return Object.keys(readState().archivedGroups)
}

export function addDeletedFlow(flowId: string): void {
  const state = readState()
  const set = new Set(state.deletedFlows ?? [])
  set.add(flowId)
  state.deletedFlows = [...set]
  writeState(state, true)
}

export function removeDeletedFlow(flowId: string): void {
  const state = readState()
  state.deletedFlows = (state.deletedFlows ?? []).filter((id) => id !== flowId)
  writeState(state, true)
}

// ── Public API: ungrouped order ──

function _removeFromUngroupedOrderInState(state: FlowGroupState, domainId: string, flowId: string): void {
  const order = state.ungroupedOrder[domainId]
  if (!order) return
  const idx = order.indexOf(flowId)
  if (idx >= 0) order.splice(idx, 1)
  if (order.length === 0) delete state.ungroupedOrder[domainId]
}

export function getUngroupedFlowOrder(domainId: string): string[] {
  return readState().ungroupedOrder[domainId] ?? []
}

export function setUngroupedFlowOrder(domainId: string, orderedIds: string[]): void {
  const state = readState()
  state.ungroupedOrder[domainId] = orderedIds
  writeState(state)
}

export function addToUngroupedOrder(domainId: string, flowId: string, beforeFlowId?: string): void {
  const state = readState()
  const order = state.ungroupedOrder[domainId] ?? []
  // Remove if already present
  const filtered = order.filter((id) => id !== flowId)
  if (beforeFlowId) {
    const idx = filtered.indexOf(beforeFlowId)
    filtered.splice(idx >= 0 ? idx : filtered.length, 0, flowId)
  } else {
    filtered.push(flowId)
  }
  state.ungroupedOrder[domainId] = filtered
  writeState(state)
}

export function removeFromUngroupedOrder(domainId: string, flowId: string): void {
  const state = readState()
  _removeFromUngroupedOrderInState(state, domainId, flowId)
  writeState(state)
}

// ── Rename flow in groups ──

export function renameFlowInGroups(oldId: string, newId: string): void {
  const state = readState()
  let changed = false

  // Re-key membership
  if (state.memberships[oldId]) {
    state.memberships[newId] = { ...state.memberships[oldId], flowId: newId }
    delete state.memberships[oldId]
    changed = true
  }

  // Re-key archived flows
  if (state.archivedFlows[oldId] !== undefined) {
    state.archivedFlows[newId] = state.archivedFlows[oldId]
    delete state.archivedFlows[oldId]
    changed = true
  }

  // Re-key in ungrouped order
  for (const domainId of Object.keys(state.ungroupedOrder)) {
    const order = state.ungroupedOrder[domainId]
    const idx = order.indexOf(oldId)
    if (idx >= 0) {
      order[idx] = newId
      changed = true
    }
  }

  if (changed) writeState(state)
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
    { domain: 'earn', group: 'Reviewed', flowIds: ['caixinha-create', 'caixinha-manage', 'caixinha-deposit-reviewed', 'caixinha-withdraw-reviewed'] },
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

// ── vs1.0 Migration ──

const V1_MIGRATION_KEY = 'picnic-design-lab:v1-migration-done'

export async function migrateV1Flows(): Promise<void> {
  if (localStorage.getItem(V1_MIGRATION_KEY)) return

  const flowsToMigrate = ['flow-poupar', 'savings-deposit', 'savings-manage-b']
  const migratedIds: string[] = []

  for (const id of flowsToMigrate) {
    const targetId = id + '-v1'
    const ok = await duplicateFlowWithId(id, targetId, 'earn')
    if (ok) migratedIds.push(targetId)
  }

  if (migratedIds.length > 0) {
    // Create the "vs1.0" group in the earn domain
    const group = createGroup('vs1.0', 'earn')
    for (const mid of migratedIds) {
      assignFlowToGroup(mid, group.id)
    }
  }

  localStorage.setItem(V1_MIGRATION_KEY, new Date().toISOString())
}
