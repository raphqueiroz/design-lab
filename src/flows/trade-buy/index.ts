/**
 * Trade Buy — independent duplicate of trade-sell flow.
 * Own screen files, own flow graph. Changes here don't affect invest-2-light.
 */
import { registerFlow } from '@/pages/simulator/flowRegistry'
import { registerPage } from '@/pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '@/pages/simulator/flowGraphStore'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '@/pages/simulator/flowGroupStore'
import type { FlowNodeData } from '@/pages/simulator/flowGraph.types'

import Screen1_Trade from './Screen1_Trade'
import Screen2_Review from './Screen2_Review'
import Screen3_Processing from './Screen3_Processing'
import Screen4_Success from './Screen4_Success'

const screenDefs = [
  {
    id: 'tb-trade',
    title: 'Trade – Buy',
    description: 'Buy amount entry with dual currency inputs and payment method selector.',
    componentsUsed: ['Header', 'CurrencyInput', 'ListItem', 'DataList', 'Button', 'Section'],
    component: Screen1_Trade,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc-usd', name: 'BTC Buy (USD)', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'btc-usdt', name: 'BTC Buy (USDT)', data: { assetTicker: 'BTC', payWith: 'USDT' } },
    ],
  },
  {
    id: 'tb-review',
    title: 'Review – Buy',
    description: 'Review buy order with DataList summary.',
    componentsUsed: ['Header', 'DataList', 'GroupHeader', 'Banner', 'Text', 'Button'],
    component: Screen2_Review,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar venda' },
    ],
    states: [
      { id: 'btc-usd', name: 'BTC Buy (USD)', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
      { id: 'btc-usdt', name: 'BTC Buy (USDT)', data: { assetTicker: 'BTC', mode: 'sell', payWith: 'USDT' } },
    ],
  },
  {
    id: 'tb-processing',
    title: 'Processing – Buy',
    description: 'LoadingScreen with step messages.',
    componentsUsed: ['LoadingScreen'],
    component: Screen3_Processing,
    states: [
      { id: 'btc', name: 'BTC', isDefault: true, data: { assetTicker: 'BTC' } },
    ],
  },
  {
    id: 'tb-success',
    title: 'Success – Buy',
    description: 'FeedbackLayout with transaction summary.',
    componentsUsed: ['FeedbackLayout', 'DataList', 'GroupHeader', 'Text', 'Button'],
    component: Screen4_Success,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'btc-usd', name: 'BTC Buy (USD)', isDefault: true, data: { assetTicker: 'BTC', mode: 'sell' } },
      { id: 'btc-usdt', name: 'BTC Buy (USDT)', data: { assetTicker: 'BTC', mode: 'sell', payWith: 'USDT' } },
    ],
  },
]

// Register pages
const seen = new Set<string>()
for (const s of screenDefs) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
  const states = 'states' in s && Array.isArray(s.states) ? s.states : undefined
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Earn',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    states: states?.map(st => ({
      id: st.id,
      name: st.name,
      description: st.description ?? '',
      isDefault: st.isDefault,
      data: st.data,
    })),
  })
}

// Register flow
registerFlow({
  id: 'trade-buy',
  name: 'Trade Buy',
  description: 'Buy path: trade → review → processing → success. Independent screens.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['trade-manage'],
  entryPoints: ['asset-page'],
  screens: screenDefs.map(s => ({ ...s, pageId: s.id })),
})

// Flow graph
const ROW = 120
const x = 300

const nodes = [
  { id: 'n-trade', type: 'screen', position: { x, y: 0 },
    data: { label: 'Trade', screenId: 'tb-trade', nodeType: 'screen', pageId: 'tb-trade', description: 'Amount + payment' } as FlowNodeData },
  { id: 'n-tap-continue', type: 'action', position: { x, y: ROW },
    data: { label: 'Tap Continuar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
  { id: 'n-review', type: 'screen', position: { x, y: ROW * 2 },
    data: { label: 'Review', screenId: 'tb-review', nodeType: 'screen', pageId: 'tb-review', description: 'Order summary' } as FlowNodeData },
  { id: 'n-tap-confirm', type: 'action', position: { x, y: ROW * 3 },
    data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
  { id: 'n-api', type: 'api-call', position: { x, y: ROW * 4 },
    data: { label: 'Execute', screenId: null, nodeType: 'api-call', apiMethod: 'POST', apiEndpoint: '/api/investments/buy', description: 'Execute order' } as FlowNodeData },
  { id: 'n-processing', type: 'screen', position: { x, y: ROW * 5 },
    data: { label: 'Processing', screenId: 'tb-processing', nodeType: 'screen', pageId: 'tb-processing', description: 'Loading steps' } as FlowNodeData },
  { id: 'n-success', type: 'screen', position: { x, y: ROW * 6 },
    data: { label: 'Success', screenId: 'tb-success', nodeType: 'screen', pageId: 'tb-success', description: 'Transaction result' } as FlowNodeData },
  { id: 'n-tap-done', type: 'action', position: { x, y: ROW * 7 },
    data: { label: 'Tap Entendi', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
  { id: 'n-ref', type: 'flow-reference', position: { x, y: ROW * 8 },
    data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference', targetFlowId: 'trade-manage' } as FlowNodeData },
]

const edges = [
  { id: 'e-1', source: 'n-trade', target: 'n-tap-continue', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-2', source: 'n-tap-continue', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-3', source: 'n-review', target: 'n-tap-confirm', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-4', source: 'n-tap-confirm', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-5', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-6', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-7', source: 'n-success', target: 'n-tap-done', sourceHandle: 'bottom', targetHandle: 'top' },
  { id: 'e-8', source: 'n-tap-done', target: 'n-ref', sourceHandle: 'bottom', targetHandle: 'top' },
]

bootstrapFlowGraph('trade-buy', nodes, edges, 10)

// Sidebar group
{
  const GROUP_NAME = 'Trading'
  const DOMAIN = 'earn'
  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)
  assignFlowToGroup('trade-buy', group.id)
}
