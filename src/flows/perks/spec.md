# Perks — Benefits & Promos

## Overview
The Perks flow showcases Picnic's value-added features: competitive dollar conversion rates, a cashback program, and a referral system. Users can explore benefits, convert currency at favorable rates, understand the savings breakdown, and share their referral code.

## Flow Steps

### 1. Perks Home
- Dark-themed hero landing page
- Headline: "Cliente Picnic tem mais benefícios!"
- Primary CTA: "Ver mais benefícios" → navigates to benefits list

### 2. Benefits & Promos
- **Segmented control** with two tabs:
  - **Destaques** (Highlights): Lists key benefits — fee-free conversion, referral program, cashback, exclusive offers
  - **Indicações** (Referrals): Shows referral invite CTA and list of referred friends
- Tapping "Conversão sem taxas" → Dollar Rate Detail

### 3. Dollar Rate Detail — "O dólar mais barato do Brasil"
- Explains why Picnic offers the cheapest dollar conversion
- Shows current exchange rate (commercial rate, no hidden spread)
- Three benefit items: no hidden spread, operational savings, instant conversion
- CTA: "Converter agora"

### 4. Currency Conversion
- BRL amount input (pre-filled at R$ 250,89 for demo)
- Real-time USD conversion preview using commercial rate
- Link to savings breakdown: "Como calculamos sua economia"
- CTA: "Converter agora"

### 5. Savings Breakdown — "Como calculamos sua economia"
- Comparison table: Picnic vs. market average
- Line items: Spread/exchange fee, IOF/tariffs, conversion cost
- Total savings highlighted at bottom
- Dismiss: "Entendi"

### 6. Share
- Savings card showing total amount saved (R$ 1.250,00 de economia)
- Share channel grid: WhatsApp, Instagram, E-mail, Copy link
- Referral code card with copy button (PICNIC-AB12)
- Reward info: "Ganhe $5 a cada amigo"

## Components Used
Header, ScreenLayout, FormLayout, SegmentedControl, ListItem, Card, Text, Button, Amount, Badge, Tag, Divider, Spacer, CurrencyInput, Toast, SuccessAnimation

## Design Notes
- Perks Home uses a custom dark green background (#1a2e1a) to differentiate from standard screens
- Brazilian Portuguese (pt-BR) copy throughout
- Currency displays use BRL (R$) by default, USD ($) for converted amounts
- Exchange rate mock: 1 USD = 5.12 BRL
