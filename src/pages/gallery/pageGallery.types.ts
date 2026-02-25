import type { Node } from '@xyflow/react'

export interface PageNodeData extends Record<string, unknown> {
  label: string
  pageId: string
  description?: string
  area: string
  componentsUsed: string[]
  flowCount: number
}

export type PageGraphNode = Node<PageNodeData>
