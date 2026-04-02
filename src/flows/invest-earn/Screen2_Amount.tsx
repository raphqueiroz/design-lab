import { useState, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import { USD_FLAG, BRL_FLAG } from '@/lib/flags'
import Header from '../../library/navigation/Header'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Button from '../../library/inputs/Button'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import Text from '../../library/foundations/Text'
import Divider from '../../library/foundations/Divider'
import { DataListSkeleton, BannerSkeleton } from '../../library/feedback/Skeleton'

const MOCK_RATE = 5.4583

const FUNDING_SOURCES = [
  {
    id: 'usd-balance',
    title: 'USD Balance',
    subtitle: 'Available: US$ 4,230.00',
    icon: USD_FLAG,
  },
  {
    id: 'pix',
    title: 'Deposit with PIX',
    subtitle: 'Pay in BRL, earn in USD',
    icon: BRL_FLAG,
  },
]

type CalcState = 'idle' | 'loading' | 'ready'

export default function Screen2_Amount({ onNext, onBack }: FlowScreenProps) {
  const { initialCalcState, initialAmount } = useScreenData<{ initialCalcState?: CalcState; initialAmount?: string }>()
  const [usdValue, setUsdValue] = useState(initialAmount ?? '')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState('usd-balance')
  const [calcState, setCalcState] = useState<CalcState>(initialCalcState ?? 'idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const isValid = usdAmount >= 1

  const isPix = selectedSource === 'pix'
  const brlEquivalent = usdAmount * MOCK_RATE

  const effectiveCalcState = initialCalcState ?? calcState

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1000)
    } else {
      setCalcState('idle')
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isValid, usdValue])

  const handleSelectSource = (id: string) => {
    setSelectedSource(id)
    setSheetOpen(false)
  }

  const currentSource = FUNDING_SOURCES.find((s) => s.id === selectedSource) ?? FUNDING_SOURCES[0]

  return (
    <BaseLayout>
      <Header title="Amount" onBack={onBack} />

      <Stack gap="none">
        <CurrencyInput
          label="Deposit"
          value={usdValue}
          onChange={setUsdValue}
          tokenIcon={USD_FLAG}
          currencySymbol="US$"
        />

        {isPix && (
          <>
            <Divider />
            <ListItem
              title="You pay"
              subtitle={isValid ? `R$ ${brlEquivalent.toFixed(2)}` : 'Enter an amount'}
              inverted
              trailing={null}
            />
          </>
        )}

        <ListItem
          title="Funding source"
          subtitle={currentSource.title}
          left={<Avatar src={currentSource.icon} size="sm" />}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setSheetOpen(true)}>
              Change
            </Button>
          }
          trailing={null}
        />
      </Stack>

      {effectiveCalcState === 'loading' && (
        <Stack gap="none">
          <DataListSkeleton rows={3} />
          <BannerSkeleton />
        </Stack>
      )}

      {effectiveCalcState === 'ready' && (
        <Stack gap="none">
          <DataList
            data={[
              { label: 'Annual yield', value: '5.00% APY' },
              { label: 'Monthly earnings (est.)', value: `US$ ${(usdAmount * 0.05 / 12).toFixed(2)}` },
              ...(isPix
                ? [{ label: 'Exchange rate', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4)}` }]
                : []),
              { label: 'Fee', value: 'Free' },
            ]}
          />
          <Banner
            variant="success"
            title={`You'll earn ~US$ ${(usdAmount * 0.05).toFixed(2)} per year`}
          />
        </Stack>
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid || effectiveCalcState !== 'ready'} onPress={onNext}>
          {isPix ? 'Continue to PIX payment' : 'Confirm deposit'}
        </Button>
      </StickyFooter>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Funding source"
      >
        <Stack gap="none">
          <Text variant="body-sm" color="content-secondary">
            Choose where the funds come from
          </Text>
          {FUNDING_SOURCES.map((source) => (
            <ListItem
              key={source.id}
              title={source.title}
              subtitle={source.subtitle}
              left={<Avatar src={source.icon} size="md" />}
              onPress={() => handleSelectSource(source.id)}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
