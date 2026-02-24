import type { ComponentType } from 'react'

export interface ComponentMeta {
  name: string
  category: 'foundations' | 'inputs' | 'display' | 'feedback' | 'navigation' | 'layout'
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  variants?: string[]
  sizes?: string[]
  props: PropMeta[]
}

export interface PropMeta {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description: string
}

const registry = new Map<string, ComponentMeta>()

export function registerComponent(meta: ComponentMeta): void {
  registry.set(meta.name, meta)
}

export function getComponent(name: string): ComponentMeta | undefined {
  return registry.get(name)
}

export function getComponentsByCategory(category: ComponentMeta['category']): ComponentMeta[] {
  return Array.from(registry.values()).filter((c) => c.category === category)
}

export function getAllComponents(): ComponentMeta[] {
  return Array.from(registry.values())
}

export { registry }
