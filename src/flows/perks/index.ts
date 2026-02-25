import { registerFlow } from '../../pages/simulator/flowRegistry'
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
    componentsUsed: ['Text', 'Button', 'Spacer'],
    component: Screen1_PerksHome,
  },
  {
    id: 'benefits-promos',
    title: 'Benefits & Promos',
    description: 'Segmented list of highlights (fee-free conversion, cashback) and referral program.',
    componentsUsed: ['Header', 'ScreenLayout', 'SegmentedControl', 'ListItem', 'Divider', 'Badge', 'Text'],
    component: Screen2_BenefitsPromos,
  },
  {
    id: 'dollar-rate',
    title: 'Dollar Rate Detail',
    description: 'Explains competitive dollar conversion rate with benefits breakdown.',
    componentsUsed: ['Header', 'ScreenLayout', 'Text', 'Button', 'Card', 'Spacer', 'Divider'],
    component: Screen3_DollarRate,
  },
  {
    id: 'perks-conversion',
    title: 'Currency Conversion',
    description: 'BRL to USD conversion form with real-time rate preview.',
    componentsUsed: ['Header', 'FormLayout', 'CurrencyInput', 'Card', 'Text', 'Amount', 'Button'],
    component: Screen4_Conversion,
  },
  {
    id: 'savings-breakdown',
    title: 'Savings Breakdown',
    description: 'Comparison table showing Picnic vs market fees with total savings.',
    componentsUsed: ['Text', 'Spacer', 'Divider', 'Amount'],
    component: Screen5_SavingsBreakdown,
  },
  {
    id: 'perks-share',
    title: 'Share',
    description: 'Share savings and referral code via WhatsApp, Instagram, email, or link.',
    componentsUsed: ['Header', 'ScreenLayout', 'Text', 'Card', 'Badge', 'Amount', 'Toast', 'Spacer'],
    component: Screen6_Share,
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
  area: 'Perks',
  specContent,
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})
