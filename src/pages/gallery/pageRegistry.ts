import type { ComponentType } from 'react'
import type { FlowScreenProps } from '../simulator/flowRegistry'
import { getPageOverrides } from './pageStore'
import { getDynamicPages, type DynamicPageDef } from './dynamicPageStore'
import { createPlaceholderComponent } from '../../flows/PlaceholderScreen'

export interface Page {
  id: string
  name: string
  description: string
  area: string
  componentsUsed: string[]
  component: ComponentType<FlowScreenProps>
  isDynamic?: boolean
}

const pages = new Map<string, Page>()

export function registerPage(page: Page): void {
  pages.set(page.id, page)
}

export function unregisterPage(id: string): void {
  pages.delete(id)
}

export function registerDynamicPage(def: DynamicPageDef): void {
  const page: Page = {
    id: def.id,
    name: def.name,
    description: def.description,
    area: def.area,
    componentsUsed: def.componentsUsed,
    isDynamic: true,
    component: createPlaceholderComponent(def.name, def.description),
  }
  pages.set(page.id, page)
}

export function hydrateDynamicPages(): void {
  const dynamicPages = getDynamicPages()
  for (const def of dynamicPages) {
    registerDynamicPage(def)
  }
}

export function refreshDynamicPage(id: string): void {
  const dynamicPages = getDynamicPages()
  const def = dynamicPages.find((p) => p.id === id)
  if (def) {
    registerDynamicPage(def)
  }
}

export function getPage(id: string): Page | undefined {
  const base = pages.get(id)
  if (!base) return undefined

  const overrides = getPageOverrides(id)
  return {
    ...base,
    name: overrides.name ?? base.name,
    description: overrides.description ?? base.description,
  }
}

export function getBasePage(id: string): Page | undefined {
  return pages.get(id)
}

export function getAllPages(): Page[] {
  return Array.from(pages.keys()).map((id) => getPage(id)!)
}

export function getPagesByArea(): Record<string, Page[]> {
  const grouped: Record<string, Page[]> = {}
  for (const id of pages.keys()) {
    const page = getPage(id)!
    if (!grouped[page.area]) grouped[page.area] = []
    grouped[page.area].push(page)
  }
  return grouped
}
