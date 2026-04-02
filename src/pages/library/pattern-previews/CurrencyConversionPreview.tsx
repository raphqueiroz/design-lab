import { useState, useMemo, useEffect, useRef } from 'react'
import { USD_FLAG, BRL_FLAG, EUR_FLAG } from '@/lib/flags'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import BottomSheet from '../../../library/layout/BottomSheet'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import Divider from '../../../library/foundations/Divider'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import { DataListSkeleton, BannerSkeleton } from '../../../library/feedback/Skeleton'

const MOCK_RATE = 5.4583

const PAYMENT_METHODS = [
  {
    id: 'brl',
    title: 'Brazilian Real',
    subtitle: 'Pay from your bank account via PIX',
    icon: BRL_FLAG,
  },
  {
    id: 'usd',
    title: 'US Dollar',
    subtitle: 'Pay from your US account via ACH',
    icon: USD_FLAG,
  },
  {
    id: 'eur',
    title: 'Euro',
    subtitle: 'Pay from your EU account via SEPA',
    icon: EUR_FLAG,
  },
]

function rawDigitsFromAmount(amount: number): string {
  if (amount <= 0) return ''
  return Math.round(amount * 100).toString()
}

type CalcState = 'idle' | 'loading' | 'ready'

export default function CurrencyConversionPreview() {
  const [usdValue, setUsdValue] = useState('')
  const [brlValue, setBrlValue] = useState('')
  const [lastEdited, setLastEdited] = useState<'usd' | 'brl'>('usd')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('brl')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const brlAmount = parseInt(brlValue || '0', 10) / 100

  const displayUsd = lastEdited === 'usd' ? usdValue : rawDigitsFromAmount(brlAmount / MOCK_RATE)
  const displayBrl = lastEdited === 'brl' ? brlValue : rawDigitsFromAmount(usdAmount * MOCK_RATE)

  const effectiveUsd = parseInt(displayUsd || '0', 10) / 100
  const isValid = effectiveUsd >= 1

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1200)
    } else {
      setCalcState('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isValid, usdValue, brlValue])

  const handleUsdChange = (value: string) => {
    setUsdValue(value)
    setLastEdited('usd')
  }

  const handleBrlChange = (value: string) => {
    setBrlValue(value)
    setLastEdited('brl')
  }

  const handleSelectMethod = (id: string) => {
    setSelectedMethod(id)
    setSheetOpen(false)
  }

  const currentMethod = useMemo(
    () => PAYMENT_METHODS.find((m) => m.id === selectedMethod) ?? PAYMENT_METHODS[0],
    [selectedMethod],
  )

  return (
    <BaseLayout>
      <Header title="" onClose={() => {}} />

      <Stack gap="none">
        <CurrencyInput
          label="You receive"
          value={displayUsd}
          onChange={handleUsdChange}
          tokenIcon={USD_FLAG}
          currencySymbol="US$"
        />

        <Divider />

        <CurrencyInput
          label="You pay"
          value={displayBrl}
          onChange={handleBrlChange}
          tokenIcon={BRL_FLAG}
          currencySymbol="R$"
        />

        <ListItem
          title="You pay with"
          subtitle={currentMethod.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setSheetOpen(true)}>
              Change
            </Button>
          }
          trailing={null}
        />
      </Stack>

      {calcState === 'loading' && (
        <Stack gap="none">
          <DataListSkeleton rows={4} />
          <BannerSkeleton />
        </Stack>
      )}

      {calcState === 'ready' && (
        <Stack gap="none">
          <DataList
            data={[
              { label: 'Payment method', value: 'PIX Transfer' },
              { label: 'Estimated delivery', value: '5 minutes' },
              {
                label: 'Our fee',
                value: (
                  <span className="text-[var(--color-feedback-success)] font-medium">Free</span>
                ),
              },
              {
                label: 'Exchange rate',
                info: () => {},
                value: 'US$ 1 \u21C4 R$ 5.4583',
              },
            ]}
          />
          <Banner variant="success" title="Benefit applied: Convert with zero fees" />
        </Stack>
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'}>
          Continue
        </Button>
      </StickyFooter>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="How do you want to pay?"
      >
        <Stack gap="none">
          {PAYMENT_METHODS.map((method) => (
            <ListItem
              key={method.id}
              title={method.title}
              subtitle={method.subtitle}
              left={<Avatar src={method.icon} size="md" />}
              onPress={() => handleSelectMethod(method.id)}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
