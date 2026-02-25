import type { ComponentType } from 'react'
import { getFlowOverrides } from './flowStore'
import { getDynamicFlows, type DynamicFlowDef } from './dynamicFlowStore'
import { createPlaceholderComponent } from '../../flows/PlaceholderScreen'

export interface FlowScreen {
  id: string
  title: string
  description: string
  componentsUsed: string[]
  component: ComponentType<FlowScreenProps>
  /** Optional reference to a standalone Page entity in the page registry */
  pageId?: string
}

export interface FlowScreenProps {
  onNext: () => void
  onBack: () => void
}

export interface Flow {
  id: string
  name: string
  description: string
  area: string
  screens: FlowScreen[]
  specContent?: string
  isDynamic?: boolean
}

const flows = new Map<string, Flow>()

export function registerFlow(flow: Flow): void {
  flows.set(flow.id, flow)
}

export function unregisterFlow(id: string): void {
  flows.delete(id)
}

/** Register a dynamic flow from the dynamicFlowStore data model. */
export function registerDynamicFlow(def: DynamicFlowDef): void {
  const flow: Flow = {
    id: def.id,
    name: def.name,
    description: def.description,
    area: def.area,
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

/** Returns the flow with localStorage overrides merged in. */
export function getFlow(id: string): Flow | undefined {
  const base = flows.get(id)
  if (!base) return undefined

  const overrides = getFlowOverrides(id)
  return {
    ...base,
    name: overrides.name ?? base.name,
    description: overrides.description ?? base.description,
    specContent: overrides.spec ?? base.specContent,
    screens: base.screens.map((s) => {
      const so = overrides.screens?.[s.id]
      return {
        ...s,
        title: so?.title ?? s.title,
        description: so?.description ?? s.description,
      }
    }),
  }
}

/** Returns base flow without overrides (for reset comparisons). */
export function getBaseFlow(id: string): Flow | undefined {
  return flows.get(id)
}

export function getAllFlows(): Flow[] {
  return Array.from(flows.keys()).map((id) => getFlow(id)!)
}

export function getFlowsByArea(): Record<string, Flow[]> {
  const grouped: Record<string, Flow[]> = {}
  for (const id of flows.keys()) {
    const flow = getFlow(id)!
    if (!grouped[flow.area]) grouped[flow.area] = []
    grouped[flow.area].push(flow)
  }
  return grouped
}
