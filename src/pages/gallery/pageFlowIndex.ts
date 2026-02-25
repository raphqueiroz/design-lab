/**
 * Reverse index: pageId → flowIds that reference it.
 * Rebuilt on demand from the flow registry.
 */

import { getAllFlows } from '../simulator/flowRegistry'

export interface PageFlowRef {
  flowId: string
  flowName: string
  screenId: string
  screenTitle: string
}

export function getFlowsForPage(pageId: string): PageFlowRef[] {
  const refs: PageFlowRef[] = []
  for (const flow of getAllFlows()) {
    for (const screen of flow.screens) {
      if (screen.pageId === pageId) {
        refs.push({
          flowId: flow.id,
          flowName: flow.name,
          screenId: screen.id,
          screenTitle: screen.title,
        })
      }
    }
  }
  return refs
}

export function getFlowCountForPage(pageId: string): number {
  let count = 0
  for (const flow of getAllFlows()) {
    if (flow.screens.some((s) => s.pageId === pageId)) {
      count++
    }
  }
  return count
}
