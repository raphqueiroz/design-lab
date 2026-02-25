/**
 * Persistence for user-created (dynamic) pages.
 * These pages use PlaceholderScreen components and are stored in localStorage.
 */

const STORAGE_KEY = 'picnic-design-lab:dynamic-pages'

export interface DynamicPageDef {
  id: string
  name: string
  description: string
  area: string
  componentsUsed: string[]
}

// ── localStorage layer ──

function readAll(): Record<string, DynamicPageDef> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, DynamicPageDef>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ── Public API ──

export function getDynamicPages(): DynamicPageDef[] {
  return Object.values(readAll())
}

export function getDynamicPage(id: string): DynamicPageDef | null {
  return readAll()[id] ?? null
}

export function saveDynamicPage(page: DynamicPageDef): void {
  const all = readAll()
  all[page.id] = page
  writeAll(all)
}

export function deleteDynamicPage(id: string): void {
  const all = readAll()
  delete all[id]
  writeAll(all)
}
