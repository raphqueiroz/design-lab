import { useState, useEffect, useRef, useMemo } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
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
import { MOCK_RATE, USD_ICON, BRL_ICON, DESTINATIONS, rawDigitsFromAmount } from '../shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function B_Screen1_Amount({ onNext, onBack }: FlowScreenProps) {
  const [usdValue, setUsdValue] = useState('')
  const [brlValue, setBrlValue] = useState('')
  const [lastEdited, setLastEdited] = useState<'usd' | 'brl'>('usd')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDest, setSelectedDest] = useState('pix')
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

  const currentDest = useMemo(
    () => DESTINATIONS.find((d) => d.id === selectedDest) ?? DESTINATIONS[0],
    [selectedDest],
  )

  return (
    <BaseLayout>
      <Header title="" onClose={onBack} />

      <Stack gap="none">
        <CurrencyInput
          label="Você envia"
          value={displayUsd}
          onChange={handleUsdChange}
          tokenIcon={USD_ICON}
          currencySymbol="US$"
        />

        <Divider />

        <CurrencyInput
          label="Destinatário recebe"
          value={displayBrl}
          onChange={handleBrlChange}
          tokenIcon={BRL_ICON}
          currencySymbol="R$"
        />

        <ListItem
          title="Destino"
          subtitle={currentDest.title}
          inverted
          right={
            <Button variant="primary" size="sm" onPress={() => setSheetOpen(true)}>
              Mudar
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
              { label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4).replace('.', ',')}` },
              { label: 'Taxa de saque', value: 'Grátis' },
              { label: 'Prazo estimado', value: '1-2 dias úteis' },
              { label: 'VET', value: 'US$ 1 ⇄ R$ 5,4434', info: () => {} },
            ]}
          />

          <Banner variant="neutral" title="Prazo estimado: 1-2 dias úteis" />
        </Stack>
      )}

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={onNext}>
          Continuar
        </Button>
      </StickyFooter>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Para onde deseja sacar?"
      >
        <Stack gap="none">
          {DESTINATIONS.map((dest) => (
            <ListItem
              key={dest.id}
              title={dest.title}
              subtitle={dest.subtitle}
              left={
                dest.icon.startsWith('http') ? (
                  <Avatar src={dest.icon} size="md" />
                ) : (
                  <Avatar initials={dest.icon} size="md" />
                )
              }
              onPress={() => {
                setSelectedDest(dest.id)
                setSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
