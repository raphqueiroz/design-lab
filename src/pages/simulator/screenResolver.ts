/**
 * Glob-based screen component resolver.
 *
 * Eagerly imports all Screen*.tsx files under src/flows/ and builds
 * bidirectional maps between file paths and components.
 *
 * Key insight: Components imported by index.ts and discovered by this glob
 * are the *same Vite module* — reference equality (===) holds.
 */

import type { ComponentType } from 'react'
import type { FlowScreenProps } from './flowRegistry'

// Eager glob: all Screen*.tsx files under src/flows/
const screenModules = import.meta.glob<{ default: ComponentType<FlowScreenProps> }>(
  '../../flows/**/Screen*.tsx',
  { eager: true },
)

// Maps: relative path ↔ component
const pathToComponent = new Map<string, ComponentType<FlowScreenProps>>()
const componentToPath = new Map<ComponentType<FlowScreenProps>, string>()

for (const [fullPath, mod] of Object.entries(screenModules)) {
  // Skip .parts.tsx files and macOS " 2.tsx" duplicates
  if (fullPath.includes('.parts.') || fullPath.includes(' 2.')) continue

  // Convert '../../flows/deposit-v2/Screen1_AmountEntry.tsx' → 'deposit-v2/Screen1_AmountEntry.tsx'
  const relativePath = fullPath.replace(/^.*?flows\//, '')

  const component = mod.default
  if (!component) continue

  pathToComponent.set(relativePath, component)
  componentToPath.set(component, relativePath)
}

/** Resolve a component from a relative file path (e.g. 'deposit-v2/Screen1_AmountEntry.tsx'). */
export function resolveComponent(filePath: string | undefined): ComponentType<FlowScreenProps> | null {
  if (!filePath) return null
  return pathToComponent.get(filePath) ?? null
}

/** Resolve the file path for a component (reverse lookup via reference equality). */
export function resolveFilePath(component: ComponentType<FlowScreenProps>): string | null {
  return componentToPath.get(component) ?? null
}

/** Check if a screen file exists on disk (discovered by the glob). */
export function hasFileOnDisk(filePath: string): boolean {
  return pathToComponent.has(filePath)
}

/** Get all discovered screen file paths. */
export function getAllScreenPaths(): string[] {
  return Array.from(pathToComponent.keys())
}
