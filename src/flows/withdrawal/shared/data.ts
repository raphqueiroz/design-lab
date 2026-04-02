import { USD_FLAG, BRL_FLAG } from '@/lib/flags'

export const MOCK_RATE = 5.4583
export const USD_ICON = USD_FLAG
export const BRL_ICON = BRL_FLAG

export const DESTINATIONS = [
  { id: 'pix', title: 'PIX', subtitle: 'Receba em reais na sua conta bancária', icon: BRL_ICON },
  {
    id: 'picnic-account',
    title: 'Conta Picnic',
    subtitle: 'Transferir para outra conta Picnic',
    icon: '🏦',
  },
  {
    id: 'picnic-user',
    title: 'Usuário Picnic',
    subtitle: 'Envie para um contato no Picnic',
    icon: '👤',
  },
  {
    id: 'foreign',
    title: 'Conta Estrangeira',
    subtitle: 'Transferência internacional em dólar',
    icon: USD_ICON,
  },
]

export const SAVED_RECIPIENTS = [
  { id: '1', name: 'Conta Bradesco', detail: 'PIX: ***456', type: 'pix' },
  { id: '2', name: 'Maria Santos', detail: 'PIX: maria@email.com', type: 'pix' },
  { id: '3', name: 'João Silva', detail: '@joao.picnic', type: 'picnic-user' },
  { id: '4', name: 'Minha conta Picnic', detail: 'ID: ***321', type: 'picnic-account' },
  { id: '5', name: 'Chase Checking', detail: 'ACH: ***789', type: 'foreign' },
]

export type Destination = (typeof DESTINATIONS)[number]
export type Recipient = (typeof SAVED_RECIPIENTS)[number]

export function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

export function formatUsd(amount: number): string {
  return `US$ ${amount.toFixed(2).replace('.', ',')}`
}

export function formatBrl(amount: number): string {
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
}
