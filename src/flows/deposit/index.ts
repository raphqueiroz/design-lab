import { registerFlow } from '../../pages/simulator/flowRegistry'
import { registerPage } from '../../pages/gallery/pageRegistry'
import Screen1_AddFunds from './Screen1_AddFunds'
import Screen2_PixDeposit from './Screen2_PixDeposit'
import Screen3_PixPayment from './Screen3_PixPayment'
import Screen4_Processing from './Screen4_Processing'
import Screen5_Confirmed from './Screen5_Confirmed'
import specContent from './spec.md?raw'

const screenDefs = [
  {
    id: 'add-funds',
    title: 'Add Funds',
    description: 'Method selection: PIX, TED, or Crypto. User chooses PIX for instant free transfer.',
    componentsUsed: ['Header', 'ScreenLayout', 'ListItem', 'Text', 'Divider', 'Icon'],
    component: Screen1_AddFunds,
  },
  {
    id: 'pix-deposit',
    title: 'PIX Deposit',
    description: 'BRL amount entry with real-time USD conversion preview at mock exchange rate.',
    componentsUsed: ['Header', 'FormLayout', 'CurrencyInput', 'Card', 'Text', 'Amount', 'Button'],
    component: Screen2_PixDeposit,
  },
  {
    id: 'pix-payment',
    title: 'PIX Payment',
    description: 'QR code and copy-paste PIX code for payment. 10-minute expiration timer.',
    componentsUsed: ['Header', 'ScreenLayout', 'Card', 'Text', 'Divider', 'Badge', 'Button', 'Toast', 'Spacer'],
    component: Screen3_PixPayment,
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'Payment confirmation loading state. Auto-advances after 2.5 seconds.',
    componentsUsed: ['ResultLayout', 'LoadingSpinner', 'Text', 'Spacer'],
    component: Screen4_Processing,
  },
  {
    id: 'confirmed',
    title: 'Deposit Confirmed',
    description: 'Success state with animated checkmark, deposited amount, and updated balance.',
    componentsUsed: ['ResultLayout', 'SuccessAnimation', 'Text', 'Amount', 'Button', 'Spacer'],
    component: Screen5_Confirmed,
  },
] as const

// Register each screen as a standalone page
for (const s of screenDefs) {
  registerPage({
    id: s.id,
    name: s.title,
    description: s.description,
    area: 'Transactions',
    componentsUsed: [...s.componentsUsed],
    component: s.component,
  })
}

registerFlow({
  id: 'deposit-pix',
  name: 'Deposit via PIX',
  description: 'User deposits BRL into their Picnic account using PIX, Brazil\'s instant payment system. Funds are converted to USD at the current exchange rate and credited to their crypto wallet balance.',
  area: 'Transactions',
  specContent,
  screens: screenDefs.map((s) => ({ ...s, pageId: s.id })),
})
