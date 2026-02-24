import { registerFlow } from '../../pages/simulator/flowRegistry'
import Screen1_AddFunds from './Screen1_AddFunds'
import Screen2_PixDeposit from './Screen2_PixDeposit'
import Screen3_PixPayment from './Screen3_PixPayment'
import Screen4_Processing from './Screen4_Processing'
import Screen5_Confirmed from './Screen5_Confirmed'

registerFlow({
  id: 'deposit-pix',
  name: 'Deposit via PIX',
  area: 'Transactions',
  specPath: '/src/flows/deposit/spec.md',
  screens: [
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
  ],
})
