import { registerFlow } from '../../pages/simulator/flowRegistry'
import { bootstrapFlowGraph } from '../../pages/simulator/flowGraphStore'
import type { FlowNodeData } from '../../pages/simulator/flowGraph.types'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_PerksHome from './Screen1_PerksHome'
import Screen2_BenefitsPromos from './Screen2_BenefitsPromos'
import Screen3_DollarRate from './Screen3_DollarRate'
import Screen4_Conversion from './Screen4_Conversion'
import Screen5_SavingsBreakdown from './Screen5_SavingsBreakdown'
import Screen6_Share from './Screen6_Share'
import specContent from './spec.md?raw'

const screenDefs = [
  {
    id: 'perks-home',
    title: 'Perks Home',
    description: 'Hero landing page showcasing Picnic benefits with CTA to explore more.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Text', 'Badge', 'Summary', 'Banner', 'Button', 'StickyFooter'],
    component: Screen1_PerksHome,
    interactiveElements: [
      { id: 'btn-explore', component: 'Button', label: 'Explorar benefícios' },
    ],
  },
  {
    id: 'perks-benefits-promos',
    title: 'Benefits & Promos',
    description: 'Segmented list of highlights (fee-free conversion, cashback) and referral program.',
    componentsUsed: ['Header', 'BaseLayout', 'SegmentedControl', 'ListItem', 'Divider', 'Badge', 'Text'],
    component: Screen2_BenefitsPromos,
    interactiveElements: [
      { id: 'seg-highlights', component: 'SegmentedControl', label: 'Destaques' },
      { id: 'seg-promos', component: 'SegmentedControl', label: 'Promoções' },
      { id: 'li-dollar-rate', component: 'ListItem', label: 'Dólar sem taxas' },
      { id: 'li-cashback', component: 'ListItem', label: 'Cashback' },
    ],
  },
  {
    id: 'perks-dollar-rate',
    title: 'Dollar Rate Detail',
    description: 'Explains competitive dollar conversion rate with benefits breakdown.',
    componentsUsed: ['FeatureLayout', 'Stack', 'Text', 'Button', 'IconButton', 'Link', 'BottomSheet', 'ListItem', 'StickyFooter'],
    component: Screen3_DollarRate,
    interactiveElements: [
      { id: 'btn-convert', component: 'Button', label: 'Converter agora' },
      { id: 'btn-share', component: 'IconButton', label: 'Compartilhar' },
    ],
  },
  {
    id: 'perks-conversion',
    title: 'Currency Conversion',
    description: 'BRL to USD conversion form with real-time rate preview.',
    componentsUsed: ['Header', 'FormLayout', 'CurrencyInput', 'Card', 'Text', 'Amount', 'Button'],
    component: Screen4_Conversion,
    interactiveElements: [
      { id: 'input-brl', component: 'CurrencyInput', label: 'Valor (BRL)' },
      { id: 'btn-convert', component: 'Button', label: 'Converter' },
    ],
  },
  {
    id: 'perks-savings-breakdown',
    title: 'Savings Breakdown',
    description: 'Comparison table showing Picnic vs market fees with total savings.',
    componentsUsed: ['Text', 'Spacer', 'Divider', 'Amount'],
    component: Screen5_SavingsBreakdown,
  },
  {
    id: 'perks-share',
    title: 'Share',
    description: 'Share savings and referral code via WhatsApp, Instagram, email, or link.',
    componentsUsed: ['Header', 'BaseLayout', 'Text', 'Card', 'Badge', 'Amount', 'Toast', 'Spacer'],
    component: Screen6_Share,
    interactiveElements: [
      { id: 'btn-whatsapp', component: 'Button', label: 'WhatsApp' },
      { id: 'btn-copy-link', component: 'Button', label: 'Copiar link' },
    ],
  },
] as const

for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Perks',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

registerFlow({
  id: 'perks-benefits',
  name: 'Perks & Benefits',
  description: 'User explores Picnic benefits — competitive dollar rates, cashback program, and referral rewards — with conversion flow and social sharing.',
  domain: 'perks',
  specContent,
  linkedFlows: ['deposit-pix-v2'],
  entryPoints: ['tab-bar', 'onboarding'],
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})

// ── Bootstrap flow graph ──
{
  const ROW = 120
  const x = 300
  const xR = 600

  const nodes = [
    // Row 0: Perks Home
    { id: 'n-home', type: 'screen', position: { x, y: 0 }, data: { label: 'Perks Home', screenId: 'perks-home', nodeType: 'screen', pageId: 'perks-home', description: 'Hero landing page showcasing Picnic benefits' } as FlowNodeData },

    // Row 1: Action — tap explore
    { id: 'n-tap-explore', type: 'action', position: { x, y: ROW }, data: { label: 'Tap Explorar benefícios', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Explorar benefícios' } as FlowNodeData },

    // Row 2: Benefits & Promos
    { id: 'n-benefits', type: 'screen', position: { x, y: ROW * 2 }, data: { label: 'Benefits & Promos', screenId: 'perks-benefits-promos', nodeType: 'screen', pageId: 'perks-benefits-promos', description: 'Segmented list of highlights and referral program' } as FlowNodeData },

    // Row 3: Action — tap dollar rate
    { id: 'n-tap-dollar', type: 'action', position: { x, y: ROW * 3 }, data: { label: 'Tap Dólar sem taxas', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'ListItem: Dólar sem taxas' } as FlowNodeData },

    // Row 4: Dollar Rate Detail
    { id: 'n-dollar-rate', type: 'screen', position: { x, y: ROW * 4 }, data: { label: 'Dollar Rate Detail', screenId: 'perks-dollar-rate', nodeType: 'screen', pageId: 'perks-dollar-rate', description: 'Competitive dollar conversion rate details' } as FlowNodeData },

    // Row 5: Action — tap convert
    { id: 'n-tap-convert', type: 'action', position: { x, y: ROW * 5 }, data: { label: 'Tap Converter agora', screenId: null, nodeType: 'action', actionType: 'tap', actionTarget: 'Button: Converter agora' } as FlowNodeData },

    // Row 6: Conversion
    { id: 'n-conversion', type: 'screen', position: { x, y: ROW * 6 }, data: { label: 'Currency Conversion', screenId: 'perks-conversion', nodeType: 'screen', pageId: 'perks-conversion', description: 'BRL to USD conversion form' } as FlowNodeData },

    // Row 7: Savings Breakdown
    { id: 'n-savings', type: 'screen', position: { x, y: ROW * 7 }, data: { label: 'Savings Breakdown', screenId: 'perks-savings-breakdown', nodeType: 'screen', pageId: 'perks-savings-breakdown', description: 'Picnic vs market fees comparison' } as FlowNodeData },

    // Row 8: Share
    { id: 'n-share', type: 'screen', position: { x, y: ROW * 8 }, data: { label: 'Share', screenId: 'perks-share', nodeType: 'screen', pageId: 'perks-share', description: 'Share savings and referral code' } as FlowNodeData },

    // Flow reference for deposit-pix-v2 (reachable from conversion context)
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xR, y: ROW * 6 }, data: { label: 'Deposit via PIX', screenId: null, nodeType: 'flow-reference', targetFlowId: 'deposit-pix-v2', description: 'User wants to add funds to convert' } as FlowNodeData },
  ]

  const edges = [
    // Main spine
    { id: 'e-1', source: 'n-home', target: 'n-tap-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-tap-explore', target: 'n-benefits', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-3', source: 'n-benefits', target: 'n-tap-dollar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-4', source: 'n-tap-dollar', target: 'n-dollar-rate', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-5', source: 'n-dollar-rate', target: 'n-tap-convert', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6', source: 'n-tap-convert', target: 'n-conversion', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-7', source: 'n-conversion', target: 'n-savings', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-savings', target: 'n-share', sourceHandle: 'bottom', targetHandle: 'top' },
    // Flow reference branch
    { id: 'e-ref-deposit', source: 'n-conversion', target: 'n-ref-deposit', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('perks-benefits', nodes, edges)
}
