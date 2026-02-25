import type { Page } from './pageRegistry'
import type { PageGraphNode } from './pageGallery.types'
import { getFlowCountForPage } from './pageFlowIndex'

const CARD_WIDTH = 220
const CARD_HEIGHT = 120
const GAP_X = 40
const GAP_Y = 40
const COLS = 4

export function autoLayoutPageNodes(pages: Page[]): PageGraphNode[] {
  return pages.map((page, index) => {
    const col = index % COLS
    const row = Math.floor(index / COLS)

    return {
      id: `page-node-${page.id}`,
      type: 'pageCard',
      position: {
        x: col * (CARD_WIDTH + GAP_X),
        y: row * (CARD_HEIGHT + GAP_Y),
      },
      data: {
        label: page.name,
        pageId: page.id,
        description: page.description,
        area: page.area,
        componentsUsed: page.componentsUsed,
        flowCount: getFlowCountForPage(page.id),
      },
      draggable: false,
      selectable: true,
    }
  })
}
