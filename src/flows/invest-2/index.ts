import { registerFlow } from '@/pages/simulator/flowRegistry'
import { registerPage } from '@/pages/gallery/pageRegistry'
import { bootstrapFlowGraph } from '@/pages/simulator/flowGraphStore'
import { createGroup, assignFlowToGroup, getGroupsForDomain } from '@/pages/simulator/flowGroupStore'
import type { FlowNodeData } from '@/pages/simulator/flowGraph.types'

// ── Screens ──
import Screen0_Dashboard from './Screen0_Dashboard'
import Screen1_Intro from './Screen1_Intro'
import Screen2_Explore from './Screen2_Explore'
import Screen3_AssetHub from './Screen3_AssetHub'
import Screen4_OpenOrders from './Screen4_OpenOrders'
import Screen5_Favorites from './Screen5_Favorites'
import Screen6_Statement from './Screen6_Statement'
import Deposit_Screen1 from './deposit/Screen1_AmountEntry'
import Deposit_Screen1b from './deposit/Screen1b_TpSlConfig'
import Deposit_Screen2 from './deposit/Screen2_Review'
import Deposit_Screen3 from './deposit/Screen3_Processing'
import Deposit_Screen4 from './deposit/Screen4_Success'
import Withdraw_Screen1 from './withdraw/Screen1_AmountEntry'
import Withdraw_Screen1b from './withdraw/Screen1b_TpSlConfig'
import Withdraw_Screen2 from './withdraw/Screen2_Review'
import Withdraw_Screen3 from './withdraw/Screen3_Processing'
import Withdraw_Screen4 from './withdraw/Screen4_Success'
import Receive_Screen1 from './receive/Screen1_Receive'
import Send_Screen1 from './send/Screen1_Send'

// ═══════════════════════════════════════════════════════════════
// 1. EXPLORE FLOW — Dashboard + Intro + Browse + Asset Hub + Supporting
// ═══════════════════════════════════════════════════════════════

const exploreScreenDefs = [
  {
    id: 'inv2-dashboard',
    title: 'Dashboard',
    description: 'Portfolio overview: total value chart, shortcuts, favorites, holdings list. Empty state with featured assets.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'ShortcutButton', 'GroupHeader', 'ListItem', 'Avatar', 'Badge', 'Text', 'Button', 'StickyFooter', 'BottomSheet', 'Stack'],
    component: Screen0_Dashboard,
    interactiveElements: [
      { id: 'sc-negociar', component: 'ShortcutButton', label: 'Negociar' },
      { id: 'sc-receber', component: 'ShortcutButton', label: 'Receber' },
      { id: 'sc-enviar', component: 'ShortcutButton', label: 'Enviar' },
      { id: 'li-ordens', component: 'ListItem', label: 'Ordens abertas' },
      { id: 'li-extrato', component: 'ListItem', label: 'Extrato' },
      { id: 'li-explorar', component: 'ListItem', label: 'Explorar mais ativos' },
      { id: 'li-btc-fav', component: 'ListItem', label: 'Bitcoin' },
      { id: 'li-eth-fav', component: 'ListItem', label: 'Ethereum' },
      { id: 'btn-explorar', component: 'Button', label: 'Explorar ativos' },
    ],
    states: [
      { id: 'portfolio', name: 'Portfolio', description: 'User has positions — shows value + holdings', isDefault: true, data: { dashboard: 'portfolio' } },
      { id: 'empty', name: 'Empty', description: 'No investments — onboarding with featured assets', data: { dashboard: 'empty' } },
    ],
  },
  {
    id: 'inv2-intro',
    title: 'Intro',
    description: 'FeatureLayout onboarding: benefits by category (Cripto, Commodities, Renda Fixa Digital), risk disclaimer.',
    componentsUsed: ['FeatureLayout', 'Text', 'Summary', 'GroupHeader', 'Banner', 'Button', 'Stack'],
    component: Screen1_Intro,
    interactiveElements: [
      { id: 'btn-start', component: 'Button', label: 'Começar a investir' },
    ],
  },
  {
    id: 'inv2-explore',
    title: 'Explore',
    description: 'Category-filtered asset browser with search, favorites, trending, popular sections, sort dropdown, and favorite toggles.',
    componentsUsed: ['BaseLayout', 'Header', 'SearchBar', 'SegmentedControl', 'Select', 'GroupHeader', 'ListItem', 'Avatar', 'Badge', 'Text', 'Stack'],
    component: Screen2_Explore,
    interactiveElements: [
      { id: 'li-btc', component: 'ListItem', label: 'Bitcoin' },
      { id: 'li-eth', component: 'ListItem', label: 'Ethereum' },
      { id: 'li-sol', component: 'ListItem', label: 'Solana' },
      { id: 'li-aave', component: 'ListItem', label: 'Aave' },
      { id: 'li-xrp', component: 'ListItem', label: 'XRP' },
      { id: 'li-link', component: 'ListItem', label: 'Chainlink' },
      { id: 'li-paxg', component: 'ListItem', label: 'Ouro' },
      { id: 'li-kag', component: 'ListItem', label: 'Prata' },
      { id: 'li-renda-usd', component: 'ListItem', label: 'Renda em Dólar' },
      { id: 'li-renda-brl', component: 'ListItem', label: 'Renda em Real' },
      { id: 'li-renda-eur', component: 'ListItem', label: 'Renda em Euro' },
      { id: 'li-usdc', component: 'ListItem', label: 'USD Coin' },
      { id: 'li-usdt', component: 'ListItem', label: 'Tether' },
      { id: 'li-dai', component: 'ListItem', label: 'Dai' },
    ],
  },
  {
    id: 'inv2-asset-hub',
    title: 'Asset Hub',
    description: 'Hub-style asset page: gradient card, balance/price, chart, shortcuts (invested) or info + CTA (not invested). Favorite toggle, More BottomSheet.',
    componentsUsed: ['BaseLayout', 'Header', 'Avatar', 'Badge', 'Text', 'SegmentedControl', 'LineChart', 'ShortcutButton', 'GroupHeader', 'DataList', 'Banner', 'Summary', 'Button', 'StickyFooter', 'BottomSheet', 'ListItem', 'Stack'],
    component: Screen3_AssetHub,
    interactiveElements: [
      { id: 'sc-comprar', component: 'ShortcutButton', label: 'Comprar' },
      { id: 'sc-vender', component: 'ShortcutButton', label: 'Vender' },
      { id: 'sc-adicionar', component: 'ShortcutButton', label: 'Adicionar' },
      { id: 'sc-resgatar', component: 'ShortcutButton', label: 'Resgatar' },
      { id: 'btn-comprar', component: 'Button', label: 'Comprar' },
      { id: 'btn-investir', component: 'Button', label: 'Investir' },
      { id: 'li-depositar', component: 'ListItem', label: 'Depositar' },
      { id: 'li-enviar', component: 'ListItem', label: 'Enviar' },
    ],
    states: [
      // Volatile — invested
      { id: 'btc-invested', name: 'BTC (investido)', description: 'Bitcoin with position', isDefault: true, data: { assetTicker: 'BTC', invested: true } },
      { id: 'eth-invested', name: 'ETH (investido)', description: 'Ethereum with position', data: { assetTicker: 'ETH', invested: true } },
      { id: 'sol-invested', name: 'SOL (investido)', description: 'Solana with position', data: { assetTicker: 'SOL', invested: true } },
      { id: 'paxg-invested', name: 'Ouro (investido)', description: 'Gold with position', data: { assetTicker: 'PAXG', invested: true } },
      // Volatile — not invested
      { id: 'btc-new', name: 'BTC (novo)', description: 'Bitcoin without position', data: { assetTicker: 'BTC', invested: false } },
      { id: 'aave-new', name: 'AAVE (novo)', description: 'Aave without position', data: { assetTicker: 'AAVE', invested: false } },
      { id: 'kag-new', name: 'Prata (novo)', description: 'Silver without position', data: { assetTicker: 'KAG', invested: false } },
      // Fixed income — invested
      { id: 'renda-usd-invested', name: 'Renda USD (investido)', description: 'USD yield with position', data: { assetTicker: 'RENDA-USD', invested: true } },
      // Fixed income — not invested
      { id: 'renda-brl-new', name: 'Renda BRL (novo)', description: 'BRL yield without position', data: { assetTicker: 'RENDA-BRL', invested: false } },
      { id: 'renda-eur-new', name: 'Renda EUR (novo)', description: 'EUR yield without position', data: { assetTicker: 'RENDA-EUR', invested: false } },
    ],
  },
  {
    id: 'inv2-open-orders',
    title: 'Open Orders',
    description: 'Active TP/SL orders list with cancel option.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'ListItem', 'Avatar', 'Text', 'EmptyState', 'Stack'],
    component: Screen4_OpenOrders,
    interactiveElements: [
      { id: 'li-cancel', component: 'ListItem', label: 'Cancelar ordem' },
    ],
  },
  {
    id: 'inv2-favorites',
    title: 'Favorites',
    description: 'Favorited assets list with asset prices and navigation.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'ListItem', 'Avatar', 'Badge', 'Text', 'EmptyState', 'Stack'],
    component: Screen5_Favorites,
    interactiveElements: [
      { id: 'li-fav-asset', component: 'ListItem', label: 'Bitcoin' },
    ],
  },
  {
    id: 'inv2-statement',
    title: 'Statement',
    description: 'Filterable transaction history across all assets with PDF export.',
    componentsUsed: ['BaseLayout', 'Header', 'Select', 'GroupHeader', 'ListItem', 'Avatar', 'Text', 'Badge', 'Button', 'StickyFooter', 'EmptyState', 'Stack'],
    component: Screen6_Statement,
    interactiveElements: [
      { id: 'btn-pdf', component: 'Button', label: 'Gerar PDF' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 2. DEPOSIT FLOW — Buy / Add (with TP/SL)
// ═══════════════════════════════════════════════════════════════

const depositScreenDefs = [
  {
    id: 'inv2-deposit-amount',
    title: 'Deposit – Amount Entry',
    description: 'CurrencyInput with CalcState machine, balance display, % quick-fill, estimated quantity (volatile) or APY (fixed).',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Banner', 'Skeleton', 'Button', 'StickyFooter', 'Stack'],
    component: Deposit_Screen1,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'Buy Bitcoin', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'Deposit to USD yield', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
  {
    id: 'inv2-deposit-tpsl',
    title: 'Deposit – TP/SL Config',
    description: 'Configure Take Profit and Stop Loss levels with chart overlay, toggles, and price input sheets.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'Toggle', 'BottomSheet', 'CurrencyInput', 'Button', 'StickyFooter', 'Text', 'Stack'],
    component: Deposit_Screen1b,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'TP/SL for BTC buy', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'eth', name: 'ETH', description: 'TP/SL for ETH buy', data: { assetTicker: 'ETH' } },
    ],
  },
  {
    id: 'inv2-deposit-review',
    title: 'Deposit – Review',
    description: 'Order review: asset, value, quantity, fee, TP/SL summary. Fixed income shows yield + redemption details.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'Banner', 'Button', 'StickyFooter', 'Stack'],
    component: Deposit_Screen2,
    interactiveElements: [
      { id: 'btn-confirmar', component: 'Button', label: 'Confirmar compra' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'Buy BTC review', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'USD yield review', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
  {
    id: 'inv2-deposit-processing',
    title: 'Deposit – Processing',
    description: 'LoadingScreen with step messages.',
    componentsUsed: ['LoadingScreen'],
    component: Deposit_Screen3,
  },
  {
    id: 'inv2-deposit-success',
    title: 'Deposit – Success',
    description: 'FeedbackLayout with asset-aware summary.',
    componentsUsed: ['FeedbackLayout', 'Text', 'GroupHeader', 'DataList', 'Banner', 'Button', 'StickyFooter', 'Stack'],
    component: Deposit_Screen4,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'BTC buy success', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'USD deposit success', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 3. WITHDRAW FLOW — Sell / Redeem (with TP/SL)
// ═══════════════════════════════════════════════════════════════

const withdrawScreenDefs = [
  {
    id: 'inv2-withdraw-amount',
    title: 'Withdraw – Amount Entry',
    description: 'CurrencyInput with CalcState, position balance, % quick-fill, estimated sell quantity (volatile) or instant redeem (fixed).',
    componentsUsed: ['BaseLayout', 'Header', 'CurrencyInput', 'DataList', 'Banner', 'Skeleton', 'Button', 'StickyFooter', 'Stack'],
    component: Withdraw_Screen1,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'Sell Bitcoin', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'Redeem from USD yield', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
  {
    id: 'inv2-withdraw-tpsl',
    title: 'Withdraw – TP/SL Config',
    description: 'Configure Take Profit and Stop Loss levels for sell orders.',
    componentsUsed: ['BaseLayout', 'Header', 'LineChart', 'Toggle', 'BottomSheet', 'CurrencyInput', 'Button', 'StickyFooter', 'Text', 'Stack'],
    component: Withdraw_Screen1b,
    interactiveElements: [
      { id: 'btn-continuar', component: 'Button', label: 'Continuar' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'TP/SL for BTC sell', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'eth', name: 'ETH', description: 'TP/SL for ETH sell', data: { assetTicker: 'ETH' } },
    ],
  },
  {
    id: 'inv2-withdraw-review',
    title: 'Withdraw – Review',
    description: 'Sell/redeem review: asset, quantity, value, destination, fee, TP/SL summary.',
    componentsUsed: ['BaseLayout', 'Header', 'GroupHeader', 'DataList', 'Banner', 'Button', 'StickyFooter', 'Stack'],
    component: Withdraw_Screen2,
    interactiveElements: [
      { id: 'btn-confirmar-v', component: 'Button', label: 'Confirmar venda' },
      { id: 'btn-confirmar-f', component: 'Button', label: 'Confirmar resgate' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'Sell BTC review', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'Redeem USD review', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
  {
    id: 'inv2-withdraw-processing',
    title: 'Withdraw – Processing',
    description: 'LoadingScreen with sell step messages.',
    componentsUsed: ['LoadingScreen'],
    component: Withdraw_Screen3,
  },
  {
    id: 'inv2-withdraw-success',
    title: 'Withdraw – Success',
    description: 'FeedbackLayout with sell/redeem summary.',
    componentsUsed: ['FeedbackLayout', 'Text', 'GroupHeader', 'DataList', 'Button', 'StickyFooter', 'Stack'],
    component: Withdraw_Screen4,
    interactiveElements: [
      { id: 'btn-entendi', component: 'Button', label: 'Entendi' },
    ],
    states: [
      { id: 'btc', name: 'BTC', description: 'BTC sell success', isDefault: true, data: { assetTicker: 'BTC' } },
      { id: 'renda-usd', name: 'Renda USD', description: 'USD redeem success', data: { assetTicker: 'RENDA-USD' } },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// 4. RECEIVE FLOW
// ═══════════════════════════════════════════════════════════════

const receiveScreenDefs = [
  {
    id: 'inv2-receive',
    title: 'Receive',
    description: 'Wallet address with QR code, network selector, and copy functionality.',
    componentsUsed: ['BaseLayout', 'Header', 'Select', 'DataList', 'Banner', 'GroupHeader', 'Text', 'Stack'],
    component: Receive_Screen1,
  },
]

// ═══════════════════════════════════════════════════════════════
// 5. SEND FLOW
// ═══════════════════════════════════════════════════════════════

const sendScreenDefs = [
  {
    id: 'inv2-send',
    title: 'Send',
    description: 'Transfer form: address input, amount, network, fee summary.',
    componentsUsed: ['BaseLayout', 'Header', 'TextInput', 'CurrencyInput', 'Select', 'DataList', 'Banner', 'GroupHeader', 'Button', 'StickyFooter', 'Stack'],
    component: Send_Screen1,
    interactiveElements: [
      { id: 'btn-enviar', component: 'Button', label: 'Enviar' },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// REGISTER PAGES (deduplicated)
// ═══════════════════════════════════════════════════════════════

const allScreenDefs = [...exploreScreenDefs, ...depositScreenDefs, ...withdrawScreenDefs, ...receiveScreenDefs, ...sendScreenDefs]
const seen = new Set<string>()

for (const s of allScreenDefs) {
  if (seen.has(s.id)) continue
  seen.add(s.id)
  const states = 'states' in s && Array.isArray(s.states) ? s.states : undefined
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Investments',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
    ...(states ? { states } : {}),
  })
}

// ═══════════════════════════════════════════════════════════════
// REGISTER FLOWS
// ═══════════════════════════════════════════════════════════════

registerFlow({
  id: 'invest-2-explore',
  name: 'Investimentos (Explore)',
  description: 'Dashboard, browse investments by category, asset hub with TP/SL, open orders, favorites, and statement.',
  domain: 'earn',
  level: 1,
  linkedFlows: ['invest-2-deposit', 'invest-2-withdraw', 'invest-2-receive', 'invest-2-send'],
  screens: exploreScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-deposit',
  name: 'Investimentos (Deposit)',
  description: 'Buy volatile assets or deposit into fixed income. Amount entry with quick-fill, TP/SL config, review, processing, success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-explore'],
  entryPoints: ['asset-hub'],
  screens: depositScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-withdraw',
  name: 'Investimentos (Withdraw)',
  description: 'Sell volatile assets or redeem fixed income. Amount entry with quick-fill, TP/SL config, review, processing, success.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-explore'],
  entryPoints: ['asset-hub'],
  screens: withdrawScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-receive',
  name: 'Investimentos (Receive)',
  description: 'Receive crypto: wallet address, QR code, network selection.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-explore'],
  entryPoints: ['dashboard'],
  screens: receiveScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

registerFlow({
  id: 'invest-2-send',
  name: 'Investimentos (Send)',
  description: 'Send crypto: address input, amount, network, fee estimate.',
  domain: 'earn',
  level: 2,
  linkedFlows: ['invest-2-explore'],
  entryPoints: ['dashboard'],
  screens: sendScreenDefs.map(s => ({ ...s, pageId: s.id })),
})

// ═══════════════════════════════════════════════════════════════
// FLOW GRAPHS
// ═══════════════════════════════════════════════════════════════

const ROW = 120
const x = 300
const xL = 0
const xR = 600

// ── Explore Flow Graph (Dashboard → Explore → AssetHub + supporting screens) ──
{
  const nodes = [
    // Row 0: Dashboard
    { id: 'n-dash', type: 'screen', position: { x, y: 0 },
      data: { label: 'Dashboard', screenId: 'inv2-dashboard', nodeType: 'screen',
              pageId: 'inv2-dashboard', description: 'Portfolio overview: value chart, shortcuts, favorites, holdings' } as FlowNodeData },

    // Row 1: Dashboard actions
    { id: 'n-tap-negociar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Negociar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Negociar' } as FlowNodeData },
    { id: 'n-tap-receber', type: 'action', position: { x: xL, y: ROW },
      data: { label: 'Tap Receber', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Receber' } as FlowNodeData },
    { id: 'n-tap-enviar', type: 'action', position: { x: xR, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Enviar' } as FlowNodeData },

    // Row 2: Dashboard BottomSheet actions
    { id: 'n-tap-ordens', type: 'action', position: { x: xL, y: ROW * 2 },
      data: { label: 'Tap Ordens abertas', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Ordens abertas' } as FlowNodeData },
    { id: 'n-tap-extrato', type: 'action', position: { x: xR, y: ROW * 2 },
      data: { label: 'Tap Extrato', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Extrato' } as FlowNodeData },
    { id: 'n-tap-explorar-mais', type: 'action', position: { x, y: ROW * 2 },
      data: { label: 'Tap Explorar mais / Asset', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Explorar mais ativos' } as FlowNodeData },

    // Row 3: Supporting screens (left/right) + Explore (center)
    { id: 'n-orders', type: 'screen', position: { x: xL, y: ROW * 3 },
      data: { label: 'Open Orders', screenId: 'inv2-open-orders', nodeType: 'screen',
              pageId: 'inv2-open-orders', description: 'Active TP/SL orders list' } as FlowNodeData },
    { id: 'n-statement', type: 'screen', position: { x: xR, y: ROW * 3 },
      data: { label: 'Statement', screenId: 'inv2-statement', nodeType: 'screen',
              pageId: 'inv2-statement', description: 'Filterable transaction history' } as FlowNodeData },

    // Row 3: Explore (center)
    { id: 'n-explore', type: 'screen', position: { x, y: ROW * 3 },
      data: { label: 'Explore', screenId: 'inv2-explore', nodeType: 'screen',
              pageId: 'inv2-explore', description: 'Category-filtered browse with favorites, sort, search' } as FlowNodeData },

    // Row 3.5: Intro (left column, separate entry)
    { id: 'n-intro', type: 'screen', position: { x: xL, y: ROW * 4 },
      data: { label: 'Intro', screenId: 'inv2-intro', nodeType: 'screen',
              pageId: 'inv2-intro', description: 'Feature onboarding: categories + risk disclaimer' } as FlowNodeData },
    { id: 'n-tap-start', type: 'action', position: { x: xL, y: ROW * 5 },
      data: { label: 'Tap Começar a investir', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Começar a investir' } as FlowNodeData },
    { id: 'n-tap-explorar-btn', type: 'action', position: { x, y: ROW * 4 },
      data: { label: 'Tap Explorar ativos (empty)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Explorar ativos' } as FlowNodeData },

    // Row 4: Tap asset from Explore
    { id: 'n-tap-asset', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Tap Asset', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Bitcoin' } as FlowNodeData },

    // Row 5: Asset Hub
    { id: 'n-hub', type: 'screen', position: { x, y: ROW * 6 },
      data: { label: 'Asset Hub', screenId: 'inv2-asset-hub', nodeType: 'screen',
              pageId: 'inv2-asset-hub', description: 'Gradient header, chart, shortcuts, tabs, favorite toggle, More sheet' } as FlowNodeData },
    { id: 'n-note-states', type: 'note', position: { x: xR, y: ROW * 6 },
      data: { label: 'Hub States', screenId: null, nodeType: 'note',
              description: 'Invested: shortcuts + Mais BottomSheet (Enviar/Depositar). Not invested: CTA + Depositar secondary button.' } as FlowNodeData },

    // Row 6: Hub actions
    { id: 'n-tap-buy', type: 'action', position: { x: xL, y: ROW * 7 },
      data: { label: 'Tap Comprar/Adicionar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Comprar' } as FlowNodeData },
    { id: 'n-tap-sell', type: 'action', position: { x: xR, y: ROW * 7 },
      data: { label: 'Tap Vender/Resgatar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ShortcutButton: Vender' } as FlowNodeData },
    { id: 'n-tap-invest-cta', type: 'action', position: { x, y: ROW * 7 },
      data: { label: 'Tap Comprar/Investir CTA', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Comprar' } as FlowNodeData },
    { id: 'n-tap-hub-depositar', type: 'action', position: { x: xL, y: ROW * 8 },
      data: { label: 'Tap Depositar (hub)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Depositar' } as FlowNodeData },
    { id: 'n-tap-hub-enviar', type: 'action', position: { x: xR, y: ROW * 8 },
      data: { label: 'Tap Enviar (hub)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'ListItem: Enviar' } as FlowNodeData },

    // Row 7: Flow references
    { id: 'n-ref-deposit', type: 'flow-reference', position: { x: xL, y: ROW * 9 },
      data: { label: 'Deposit Flow', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-deposit' } as FlowNodeData },
    { id: 'n-ref-withdraw', type: 'flow-reference', position: { x: xR, y: ROW * 9 },
      data: { label: 'Withdraw Flow', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-withdraw' } as FlowNodeData },
    { id: 'n-ref-receive', type: 'flow-reference', position: { x: xL, y: ROW * 2.5 },
      data: { label: 'Receive Flow', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-receive' } as FlowNodeData },
    { id: 'n-ref-send', type: 'flow-reference', position: { x: xR, y: ROW * 2.5 },
      data: { label: 'Send Flow', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-send' } as FlowNodeData },
  ]

  const edges = [
    // Dashboard → actions
    { id: 'e-1', source: 'n-dash', target: 'n-tap-negociar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-2', source: 'n-dash', target: 'n-tap-receber', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-3', source: 'n-dash', target: 'n-tap-enviar', sourceHandle: 'right-source', targetHandle: 'top' },
    // Dashboard → BottomSheet actions
    { id: 'e-4', source: 'n-dash', target: 'n-tap-ordens', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-5', source: 'n-dash', target: 'n-tap-extrato', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-6', source: 'n-dash', target: 'n-tap-explorar-mais', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-6b', source: 'n-dash', target: 'n-tap-explorar-btn', sourceHandle: 'bottom', targetHandle: 'top' },
    // Actions → destinations
    { id: 'e-7', source: 'n-tap-negociar', target: 'n-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-8', source: 'n-tap-receber', target: 'n-ref-receive', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-9', source: 'n-tap-enviar', target: 'n-ref-send', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-10', source: 'n-tap-ordens', target: 'n-orders', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-11', source: 'n-tap-extrato', target: 'n-statement', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12', source: 'n-tap-explorar-mais', target: 'n-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-12b', source: 'n-tap-explorar-btn', target: 'n-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    // Intro → Explore
    { id: 'e-13', source: 'n-intro', target: 'n-tap-start', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-14', source: 'n-tap-start', target: 'n-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    // Explore → Asset Hub
    { id: 'e-15', source: 'n-explore', target: 'n-tap-asset', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-16', source: 'n-tap-asset', target: 'n-hub', sourceHandle: 'bottom', targetHandle: 'top' },
    // Hub → actions
    { id: 'e-17', source: 'n-hub', target: 'n-tap-buy', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-18', source: 'n-hub', target: 'n-tap-sell', sourceHandle: 'right-source', targetHandle: 'top' },
    { id: 'e-19', source: 'n-hub', target: 'n-tap-invest-cta', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-20', source: 'n-hub', target: 'n-tap-hub-depositar', sourceHandle: 'left-source', targetHandle: 'top' },
    { id: 'e-21', source: 'n-hub', target: 'n-tap-hub-enviar', sourceHandle: 'right-source', targetHandle: 'top' },
    // Hub actions → flow references
    { id: 'e-22', source: 'n-tap-buy', target: 'n-ref-deposit', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-23', source: 'n-tap-invest-cta', target: 'n-ref-deposit', sourceHandle: 'left-source', targetHandle: 'right-target' },
    { id: 'e-24', source: 'n-tap-sell', target: 'n-ref-withdraw', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-25', source: 'n-tap-hub-depositar', target: 'n-ref-receive', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-26', source: 'n-tap-hub-enviar', target: 'n-ref-send', sourceHandle: 'bottom', targetHandle: 'top' },
    // Notes
    { id: 'e-note-1', source: 'n-hub', target: 'n-note-states', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('invest-2-explore', nodes, edges, 2)
}

// ── Deposit Flow Graph (with TP/SL step) ──
{
  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Amount Entry', screenId: 'inv2-deposit-amount', nodeType: 'screen',
              pageId: 'inv2-deposit-amount', description: 'CalcState amount entry with % quick-fill' } as FlowNodeData },
    { id: 'n-tap-cont1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar (amount)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tpsl', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'TP/SL Config', screenId: 'inv2-deposit-tpsl', nodeType: 'screen',
              pageId: 'inv2-deposit-tpsl', description: 'Chart overlay with TP/SL toggles and price input' } as FlowNodeData },
    { id: 'n-note-tpsl', type: 'note', position: { x: xR, y: ROW * 2 },
      data: { label: 'TP/SL Optional', screenId: null, nodeType: 'note',
              description: 'User can skip TP/SL (continue with neither enabled). Only shown for volatile assets.' } as FlowNodeData },
    { id: 'n-tap-cont2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Continuar (tpsl)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Review', screenId: 'inv2-deposit-review', nodeType: 'screen',
              pageId: 'inv2-deposit-review', description: 'Order review with TP/SL summary card' } as FlowNodeData },
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Tap Confirmar compra', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar compra' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Process Buy', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/investments/buy',
              description: 'Execute buy order with optional TP/SL levels' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Processing', screenId: 'inv2-deposit-processing', nodeType: 'screen',
              pageId: 'inv2-deposit-processing', description: 'Animated loading with step messages' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Success', screenId: 'inv2-deposit-success', nodeType: 'screen',
              pageId: 'inv2-deposit-success', description: 'Asset-aware confirmation' } as FlowNodeData },
    { id: 'n-tap-entendi', type: 'action', position: { x, y: ROW * 9 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref-explore', type: 'flow-reference', position: { x, y: ROW * 10 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-explore' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-d1', source: 'n-amount', target: 'n-tap-cont1', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d2', source: 'n-tap-cont1', target: 'n-tpsl', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d3', source: 'n-tpsl', target: 'n-tap-cont2', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d4', source: 'n-tap-cont2', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d5', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d6', source: 'n-tap-confirmar', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d7', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d8', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d9', source: 'n-success', target: 'n-tap-entendi', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-d10', source: 'n-tap-entendi', target: 'n-ref-explore', sourceHandle: 'bottom', targetHandle: 'top' },
    // Note
    { id: 'e-dnote', source: 'n-tpsl', target: 'n-note-tpsl', sourceHandle: 'right-source', targetHandle: 'left-target' },
  ]

  bootstrapFlowGraph('invest-2-deposit', nodes, edges, 2)
}

// ── Withdraw Flow Graph (with TP/SL step) ──
{
  const nodes = [
    { id: 'n-amount', type: 'screen', position: { x, y: 0 },
      data: { label: 'Amount Entry', screenId: 'inv2-withdraw-amount', nodeType: 'screen',
              pageId: 'inv2-withdraw-amount', description: 'CalcState withdraw with % quick-fill' } as FlowNodeData },
    { id: 'n-tap-cont1', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Continuar (amount)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-tpsl', type: 'screen', position: { x, y: ROW * 2 },
      data: { label: 'TP/SL Config (Sell)', screenId: 'inv2-withdraw-tpsl', nodeType: 'screen',
              pageId: 'inv2-withdraw-tpsl', description: 'Chart overlay with TP/SL for sell orders' } as FlowNodeData },
    { id: 'n-tap-cont2', type: 'action', position: { x, y: ROW * 3 },
      data: { label: 'Tap Continuar (tpsl)', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Continuar' } as FlowNodeData },
    { id: 'n-review', type: 'screen', position: { x, y: ROW * 4 },
      data: { label: 'Review', screenId: 'inv2-withdraw-review', nodeType: 'screen',
              pageId: 'inv2-withdraw-review', description: 'Sell/redeem review with TP/SL summary' } as FlowNodeData },
    { id: 'n-tap-confirmar', type: 'action', position: { x, y: ROW * 5 },
      data: { label: 'Tap Confirmar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Confirmar venda' } as FlowNodeData },
    { id: 'n-api', type: 'api-call', position: { x, y: ROW * 6 },
      data: { label: 'Process Sell', screenId: null, nodeType: 'api-call',
              apiMethod: 'POST', apiEndpoint: '/api/investments/sell',
              description: 'Execute sell with optional TP/SL levels' } as FlowNodeData },
    { id: 'n-processing', type: 'screen', position: { x, y: ROW * 7 },
      data: { label: 'Processing', screenId: 'inv2-withdraw-processing', nodeType: 'screen',
              pageId: 'inv2-withdraw-processing', description: 'Sell processing animation' } as FlowNodeData },
    { id: 'n-success', type: 'screen', position: { x, y: ROW * 8 },
      data: { label: 'Success', screenId: 'inv2-withdraw-success', nodeType: 'screen',
              pageId: 'inv2-withdraw-success', description: 'Sell/redeem confirmation' } as FlowNodeData },
    { id: 'n-tap-entendi', type: 'action', position: { x, y: ROW * 9 },
      data: { label: 'Tap Entendi', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Entendi' } as FlowNodeData },
    { id: 'n-ref-explore', type: 'flow-reference', position: { x, y: ROW * 10 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-explore' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-w1', source: 'n-amount', target: 'n-tap-cont1', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w2', source: 'n-tap-cont1', target: 'n-tpsl', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w3', source: 'n-tpsl', target: 'n-tap-cont2', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w4', source: 'n-tap-cont2', target: 'n-review', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w5', source: 'n-review', target: 'n-tap-confirmar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w6', source: 'n-tap-confirmar', target: 'n-api', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w7', source: 'n-api', target: 'n-processing', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w8', source: 'n-processing', target: 'n-success', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w9', source: 'n-success', target: 'n-tap-entendi', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-w10', source: 'n-tap-entendi', target: 'n-ref-explore', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('invest-2-withdraw', nodes, edges, 2)
}

// ── Receive Flow Graph (single screen) ──
{
  const nodes = [
    { id: 'n-receive', type: 'screen', position: { x, y: 0 },
      data: { label: 'Receive', screenId: 'inv2-receive', nodeType: 'screen',
              pageId: 'inv2-receive', description: 'QR code, wallet address, network selector' } as FlowNodeData },
  ]

  const edges: { id: string; source: string; target: string; sourceHandle: string; targetHandle: string }[] = []

  bootstrapFlowGraph('invest-2-receive', nodes, edges, 1)
}

// ── Send Flow Graph (single screen) ──
{
  const nodes = [
    { id: 'n-send', type: 'screen', position: { x, y: 0 },
      data: { label: 'Send', screenId: 'inv2-send', nodeType: 'screen',
              pageId: 'inv2-send', description: 'Address, amount, network, fee summary' } as FlowNodeData },
    { id: 'n-tap-enviar', type: 'action', position: { x, y: ROW },
      data: { label: 'Tap Enviar', screenId: null, nodeType: 'action',
              actionType: 'tap', actionTarget: 'Button: Enviar' } as FlowNodeData },
    { id: 'n-ref-explore', type: 'flow-reference', position: { x, y: ROW * 2 },
      data: { label: 'Back to Explore', screenId: null, nodeType: 'flow-reference',
              targetFlowId: 'invest-2-explore' } as FlowNodeData },
  ]

  const edges = [
    { id: 'e-s1', source: 'n-send', target: 'n-tap-enviar', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e-s2', source: 'n-tap-enviar', target: 'n-ref-explore', sourceHandle: 'bottom', targetHandle: 'top' },
  ]

  bootstrapFlowGraph('invest-2-send', nodes, edges, 1)
}

// ═══════════════════════════════════════════════════════════════
// GROUP FLOWS IN SIDEBAR
// ═══════════════════════════════════════════════════════════════

{
  const GROUP_NAME = 'Invest 2'
  const DOMAIN = 'investments'
  const FLOW_IDS = [
    'invest-2-explore',
    'invest-2-deposit',
    'invest-2-withdraw',
    'invest-2-receive',
    'invest-2-send',
  ]

  const existing = getGroupsForDomain(DOMAIN).find((g) => g.name === GROUP_NAME)
  const group = existing ?? createGroup(GROUP_NAME, DOMAIN)

  for (const flowId of FLOW_IDS) {
    assignFlowToGroup(flowId, group.id)
  }
}
