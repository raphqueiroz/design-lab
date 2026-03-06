/**
 * One-time migration: copy all registered (hardcoded) flows into the dynamic store.
 *
 * After migration, the dynamic store is the sole source of truth.
 * The index.ts files still exist for fresh installs — they seed on first load,
 * then this migration copies everything to the dynamic store.
 */

import { getAllFlows, type Flow, type InteractiveElement } from './flowRegistry'
import { getDynamicFlow, saveDynamicFlow, type DynamicFlowDef } from './dynamicFlowStore'
import { resolveFilePath, hasFileOnDisk } from './screenResolver'

const MIGRATION_FLAG = 'picnic-design-lab:hardcoded-migration-v1'
const MIGRATION_V2_FLAG = 'picnic-design-lab:hardcoded-migration-v2'

// Read persisted metadata overrides (name/description/domain) for hardcoded flows.
// After migration these are baked into the dynamic store and the overrides system is removed.
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

export function migrateHardcodedFlows(): void {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_FLAG)) return

  const allFlows = getAllFlows()
  const overrides = readOverrides()

  let migrated = 0

  for (const flow of allFlows) {
    // Skip if already in dynamic store
    if (getDynamicFlow(flow.id)) continue

    const override = overrides[flow.id]
    const def = flowToDynamicDef(flow, override)
    saveDynamicFlow(def)
    migrated++
  }

  // Set migration flag
  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString())

  if (migrated > 0) {
    console.log(`[flowMigration] Migrated ${migrated} flows to dynamic store`)
  }
}

/**
 * V2 migration: refresh dynamic store entries whose screen files no longer exist on disk.
 * This handles the case where screen files were renamed/replaced but the dynamic store
 * still references the old file paths.
 */
export function migrateStaleScreenPaths(): void {
  if (localStorage.getItem(MIGRATION_V2_FLAG)) return

  const allFlows = getAllFlows()
  let refreshed = 0

  for (const flow of allFlows) {
    const dynFlow = getDynamicFlow(flow.id)
    if (!dynFlow) continue

    // Check if any screen in the dynamic store references a file that no longer exists
    const hasStaleFiles = dynFlow.screens.some(
      (s) => s.filePath && !hasFileOnDisk(s.filePath),
    )
    if (!hasStaleFiles) continue

    // Replace the dynamic store entry with the current static definition
    const def = flowToDynamicDef(flow)
    saveDynamicFlow(def)
    refreshed++
  }

  localStorage.setItem(MIGRATION_V2_FLAG, new Date().toISOString())

  if (refreshed > 0) {
    console.log(`[flowMigration] Refreshed ${refreshed} flows with stale screen paths`)
  }
}

function flowToDynamicDef(flow: Flow, override?: FlowMetaOverride): DynamicFlowDef {
  return {
    id: flow.id,
    name: override?.name ?? flow.name,
    description: override?.description ?? flow.description,
    domain: override?.domain ?? flow.domain,
    specContent: flow.specContent,
    level: flow.level,
    linkedFlows: flow.linkedFlows ? [...flow.linkedFlows] : undefined,
    entryPoints: flow.entryPoints ? [...flow.entryPoints] : undefined,
    screens: flow.screens.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      componentsUsed: [...s.componentsUsed],
      filePath: resolveFilePath(s.component) ?? undefined,
      pageId: s.pageId,
      states: s.states ? s.states.map((st) => ({ ...st })) : undefined,
      interactiveElements: s.interactiveElements
        ? s.interactiveElements.map((ie: InteractiveElement) => ({ ...ie }))
        : undefined,
    })),
  }
}
