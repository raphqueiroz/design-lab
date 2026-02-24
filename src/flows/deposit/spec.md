# Deposit via PIX — Flow Specification

## Overview
User deposits BRL into their Picnic account using PIX (Brazil's instant payment system). The deposited BRL is converted to USD at the current exchange rate.

---

## Screen 1: Add Funds (Method Selection)

**Layout:** ScreenLayout with Header
**Components:** Header, ListItem, Divider, Text, Icon
**Pattern:** Method selection list

### Content
- Header: "Add funds" with back button
- Section title: "Choose a deposit method"
- ListItem: PIX — "Instant transfer" — "Free" (QrCode icon)
- ListItem: TED — "Bank transfer, 1-2 business days" — "R$ 8.50" (Landmark icon)
- ListItem: Crypto — "BTC, ETH, USDC" — "Network fee" (Bitcoin icon)

### States
- Default: all methods available
- PIX row is tappable → navigates to Screen 2

### Transitions
- Tap PIX → slide left to Screen 2

---

## Screen 2: PIX Deposit (Amount Entry)

**Layout:** FormLayout with Header and bottom CTA
**Components:** Header, CurrencyInput, Card, Text, Amount, Button
**Pattern:** Form with conversion preview

### Content
- Header: "PIX Deposit" with back button
- CurrencyInput: "Amount in BRL" — R$ placeholder
- Conversion preview card (outlined):
  - "You'll receive approximately"
  - Amount in USD (calculated at mock rate 1 USD = 5.12 BRL)
  - "Rate: 1 USD = 5.12 BRL" caption
- Bottom CTA: "Continue" button (primary, full-width)

### States
- Empty: Continue button disabled
- Valid amount (≥ R$ 10.00): Continue enabled, conversion shown
- Error: amount below minimum

### Edge Cases
- Minimum deposit: R$ 10.00
- Maximum deposit: R$ 100,000.00
- Rate updates disclaimer (caption)

### Transitions
- Tap Continue → slide left to Screen 3

---

## Screen 3: PIX Payment (QR Code & Copy)

**Layout:** ScreenLayout with Header
**Components:** Header, Card, Text, Button, Badge
**Pattern:** Payment instruction screen

### Content
- Header: "PIX Payment" with back button
- QR code placeholder (200x200 gray rect with QrCode icon)
- "Scan this QR code with your bank app" body text
- Divider
- PIX copy code section:
  - "Or copy the PIX code" label
  - Code display (truncated, monospace)
  - "Copy code" button (secondary)
- Badge: "Expires in 10:00" (info variant)
- Bottom: "I already paid" button (primary, full-width)

### States
- Default: timer counting down from 10:00
- Code copied: toast "PIX code copied!"
- Timer expired: error state (not implemented in v1)

### Transitions
- Tap "I already paid" → slide left to Screen 4

---

## Screen 4: Processing

**Layout:** ResultLayout (centered)
**Components:** LoadingSpinner, Text
**Pattern:** Processing/loading state

### Content
- LoadingSpinner (lg)
- "Confirming your payment..." heading
- "This usually takes a few seconds" body text

### States
- Loading: spinner animating
- Auto-advances after 2.5 seconds

### Transitions
- Auto → slide left to Screen 5

---

## Screen 5: Deposit Confirmed

**Layout:** ResultLayout with bottom actions
**Components:** SuccessAnimation, Text, Amount, Button
**Pattern:** Success confirmation

### Content
- SuccessAnimation (80px)
- "Deposit confirmed!" heading
- Amount deposited: "R$ 150.00"
- "Your balance has been updated" body text
- New balance preview: "Balance: $ 1,279.30" (caption)
- Bottom actions:
  - "Done" button (primary, full-width)
  - "Share receipt" button (ghost, full-width)

### States
- Animation plays once on mount
- Done → returns to Screen 1
- Share → no-op in v1

### Transitions
- Tap Done → restart flow
