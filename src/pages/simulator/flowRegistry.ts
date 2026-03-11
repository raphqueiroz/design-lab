import type { ComponentType } from 'react'
import type { PageStateDefinition } from '../gallery/pageRegistry'
import { getDynamicFlows, getDynamicFlow, saveDynamicFlow, renameDynamicFlow, type DynamicFlowDef } from './dynamicFlowStore'
import { createPlaceholderComponent } from '../../flows/PlaceholderScreen'
import { resolveComponent } from './screenResolver'
import { registerPage, getBasePage } from '../gallery/pageRegistry'
import { getFlowGraph, saveFlowGraph as saveFlowGraphStore, renameFlowGraph, updateFlowReferencesInAllGraphs } from './flowGraphStore'
import { renameFlowInGroups } from './flowGroupStore'
import { SLUG_REGEX } from '../../lib/slugify'

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
  /** Screen title from the flow definition — used by scaffold screens */
  screenTitle?: string
  /** Screen description from the flow definition — used by scaffold screens */
  screenDescription?: string
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
  /** Navigation level for the flow. Level 1 shows TabBar (main tabs), level 2 hides it (deeper screens). Defaults to 1. */
  level?: 1 | 2
  /** IDs of flows this flow navigates to */
  linkedFlows?: string[]
  /** Labels describing how users enter this flow (e.g. 'dashboard-add-funds', 'deep-link') */
  entryPoints?: string[]
}

const flows = new Map<string, Flow>()

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

/**
 * Register a flow from an index.ts file (seed).
 * Always registers in memory. The dynamic store may overwrite later during hydration.
 */
export function registerFlow(flow: Flow): void {
  if (readDeletedFlows().has(flow.id)) return
  if (import.meta.env.DEV && flows.has(flow.id) && !getDynamicFlow(flow.id)) {
    throw new Error(`[flowRegistry] Duplicate flow ID: "${flow.id}"`)
  }
  flows.set(flow.id, flow)
}

export function unregisterFlow(id: string): void {
  flows.delete(id)
}

/** Update mutable fields on a registered flow (name, description, domain). Always persists to dynamic store. */
export function updateFlowMeta(id: string, updates: { name?: string; description?: string; domain?: string }): void {
  const flow = flows.get(id)
  if (!flow) return
  const updated = { ...flow }
  if (updates.name !== undefined) updated.name = updates.name
  if (updates.description !== undefined) updated.description = updates.description
  if (updates.domain !== undefined) updated.domain = updates.domain
  flows.set(id, updated)
}

/** Register a flow from the dynamic store data model, resolving components from disk. */
export function registerDynamicFlow(def: DynamicFlowDef): void {
  // Skip deleted flows — tombstone wins over dynamic store
  if (isFlowDeleted(def.id)) return

  // Preserve pageId and component from static registration when dynamic store lacks them
  const existingFlow = flows.get(def.id)
  const staticScreens = new Map<string, FlowScreen>()
  if (existingFlow) {
    for (const s of existingFlow.screens) {
      staticScreens.set(s.id, s)
    }
  }

  const flow: Flow = {
    id: def.id,
    name: def.name,
    description: def.description,
    domain: def.domain,
    specContent: def.specContent,
    level: def.level ?? existingFlow?.level,
    linkedFlows: def.linkedFlows ?? existingFlow?.linkedFlows,
    entryPoints: def.entryPoints ?? existingFlow?.entryPoints,
    screens: def.screens.map((s) => {
      const staticScreen = staticScreens.get(s.id)
      const resolved = resolveComponent(s.filePath)
      const pageId = s.pageId ?? staticScreen?.pageId
      // Fall back: file path → static flow screen → page registry (by pageId or screen id) → placeholder
      const registeredPage = (pageId ? getBasePage(pageId) : undefined) ?? getBasePage(s.id)
      const pageComponent = registeredPage?.component
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        componentsUsed: s.componentsUsed,
        component: resolved ?? staticScreen?.component ?? pageComponent ?? createPlaceholderComponent(s.title, s.description),
        pageId,
        states: s.states as PageStateDefinition[] | undefined,
        interactiveElements: s.interactiveElements,
      }
    }),
  }
  flows.set(flow.id, flow)

  // Register pages for screens that have a pageId (skip if already registered)
  for (const s of flow.screens) {
    if (s.pageId && !getBasePage(s.pageId)) {
      registerPage({
        id: s.pageId,
        name: s.title,
        description: s.description,
        area: def.domain,
        componentsUsed: [...s.componentsUsed],
        component: s.component,
        states: s.states,
      })
    }
  }
}

/** Hydrate all dynamic flows from localStorage into the registry. */
export function hydrateDynamicFlows(): void {
  const deleted = readDeletedFlows()
  const dynamicFlows = getDynamicFlows()
  for (const def of dynamicFlows) {
    if (deleted.has(def.id)) continue
    registerDynamicFlow(def)
  }
}

/** Re-register a single dynamic flow (after adding/removing screens). */
export function refreshDynamicFlow(id: string): void {
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

// ── Duplicate flow with specific ID ──

export async function duplicateFlowWithId(sourceId: string, targetId: string, targetDomain?: string): Promise<boolean> {
  const source = flows.get(sourceId)
  if (!source) return false
  if (flows.has(targetId) || getDynamicFlow(targetId)) return false

  // Copy screen .tsx files to the new flow directory (independent copies)
  const { copyScreenFile } = await import('./flowFileApi')
  const screenFilePaths = await Promise.all(
    source.screens.map(async (s) => {
      const dynScreen = getDynamicFlow(sourceId)?.screens.find((ds) => ds.id === s.id)
      if (!dynScreen?.filePath) return dynScreen?.filePath
      const newPath = await copyScreenFile(dynScreen.filePath, targetId)
      return newPath ?? dynScreen.filePath // fall back to shared file if copy fails
    }),
  )

  const def: DynamicFlowDef = {
    id: targetId,
    name: targetId,
    domain: targetDomain ?? source.domain,
    description: source.description,
    screens: source.screens.map((s, i) => {
      return {
        id: s.id.startsWith(sourceId) ? targetId + s.id.slice(sourceId.length) : s.id,
        title: s.title,
        description: s.description,
        componentsUsed: [...s.componentsUsed],
        filePath: screenFilePaths[i],
        pageId: s.pageId,
        states: s.states?.map((st) => ({ ...st })),
        interactiveElements: s.interactiveElements
          ? s.interactiveElements.map((ie) => ({ ...ie }))
          : undefined,
      }
    }),
  }
  saveDynamicFlow(def)
  registerDynamicFlow(def)

  // Copy flow graph if one exists
  const graph = getFlowGraph(sourceId)
  if (graph) {
    const screenIdMap = new Map(source.screens.map((s, i) => [s.id, def.screens[i].id]))
    const newNodes = graph.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        ...(n.data.screenId && screenIdMap.has(n.data.screenId as string)
          ? { screenId: screenIdMap.get(n.data.screenId as string) }
          : {}),
      },
    }))
    saveFlowGraphStore(targetId, newNodes, [...graph.edges])
  }

  return true
}

// ── Rename flow ID cascade ──

export async function renameFlowIdCascade(oldId: string, newId: string): Promise<boolean> {
  // 1. Validate format and uniqueness
  if (!SLUG_REGEX.test(newId)) return false
  if (flows.has(newId) || getDynamicFlow(newId)) return false
  const oldFlow = flows.get(oldId)
  if (!oldFlow) return false

  // 2. Re-key in the in-memory flows Map
  flows.delete(oldId)
  const updatedFlow = { ...oldFlow, id: newId, name: newId }
  flows.set(newId, updatedFlow)

  // 3. Update linkedFlows arrays in OTHER flows that reference oldId
  for (const [id, f] of flows.entries()) {
    if (id === newId) continue
    if (f.linkedFlows?.includes(oldId)) {
      const updatedLinks = f.linkedFlows.map((lf) => lf === oldId ? newId : lf)
      flows.set(id, { ...f, linkedFlows: updatedLinks })
    }
  }

  // 4. Re-key in the dynamic flow store
  await renameDynamicFlow(oldId, newId)

  // 5. Mark old ID as deleted so the seed registerFlow() is skipped on reload
  markFlowDeleted(oldId)

  // 6. Re-key flow graph
  await renameFlowGraph(oldId, newId)

  // 7. Re-key group memberships
  renameFlowInGroups(oldId, newId)

  // 8. Update flow-reference nodes in ALL other flow graphs
  updateFlowReferencesInAllGraphs(oldId, newId)

  // 9. Update deleted flows set if present
  const deleted = readDeletedFlows()
  if (deleted.has(oldId)) {
    deleted.delete(oldId)
    deleted.add(newId)
    writeDeletedFlows(deleted)
  }

  return true
}
