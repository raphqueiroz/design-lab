import { useState, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import StickyFooter from '../../../library/layout/StickyFooter'
import Stack from '../../../library/layout/Stack'
import BottomSheet from '../../../library/layout/BottomSheet'
import Button from '../../../library/inputs/Button'
import CurrencyInput from '../../../library/inputs/CurrencyInput'
import ListItem from '../../../library/display/ListItem'
import Avatar from '../../../library/display/Avatar'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import Text from '../../../library/foundations/Text'
import Divider from '../../../library/foundations/Divider'
import { DataListSkeleton, BannerSkeleton } from '../../../library/feedback/Skeleton'

import { USD_ICON, MOCK_RATE, FUNDING_SOURCES, formatUsd } from './data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function SharedDepositAmount({ onNext, onBack }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()

  const [usdValue, setUsdValue] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState('usd-balance')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const isValid = usdAmount >= 1
  const isPix = selectedSource === 'pix'
  const brlEquivalent = usdAmount * MOCK_RATE

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isValid) {
      setCalcState('loading')
      timerRef.current = setTimeout(() => setCalcState('ready'), 1000)
    } else {
      setCalcState('idle')
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isValid, usdValue])

  const currentSource = FUNDING_SOURCES.find((s) => s.id === selectedSource) ?? FUNDING_SOURCES[0]

  return (
    <BaseLayout>
      <Header title="Depositar" onBack={onBack} />

      <Stack gap="default">
        {isNewUser && (
          <>
            <Banner
              variant="neutral"
              title="Seus fundos são protegidos"
              description="Depósitos lastreados em títulos do Tesouro americano."
            />
            <DataList
              data={[
                { label: 'Rendimento anual', value: '5,00% a.a.' },
                { label: 'Prazo mínimo', value: 'Nenhum' },
                { label: 'Resgate', value: 'Imediato' },
              ]}
            />
          </>
        )}

        <Stack gap="none">
          <CurrencyInput label="Valor do depósito" value={usdValue} onChange={setUsdValue} tokenIcon={USD_ICON} currencySymbol="US$" />

          {isPix && (
            <>
              <Divider />
              <ListItem
                title="Você paga"
                subtitle={isValid ? `R$ ${brlEquivalent.toFixed(2).replace('.', ',')}` : 'Insira um valor'}
                inverted
                trailing={null}
              />
            </>
          )}

          <ListItem
            title="Fonte de recursos"
            subtitle={currentSource.title}
            left={<Avatar src={currentSource.icon} size="sm" />}
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
            <DataListSkeleton rows={3} />
            <BannerSkeleton />
          </Stack>
        )}

        {calcState === 'ready' && (
          <Stack gap="none">
            <DataList
              data={[
                { label: 'Rendimento anual', value: '5,00% a.a.' },
                { label: 'Rendimento mensal (est.)', value: formatUsd(usdAmount * 0.05 / 12) },
                ...(isPix
                  ? [{ label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4).replace('.', ',')}` }]
                  : []),
                { label: 'Taxa', value: 'Grátis' },
              ]}
            />
            <Banner
              variant="success"
              title={`Rendimento estimado: ~${formatUsd(usdAmount * 0.05)} por ano`}
            />
          </Stack>
        )}
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={onNext}>
          Continuar
        </Button>
      </StickyFooter>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Fonte de recursos">
        <Stack gap="none">
          <Text variant="body-sm" color="content-secondary">
            Escolha de onde vêm os fundos
          </Text>
          {FUNDING_SOURCES.map((source) => (
            <ListItem
              key={source.id}
              title={source.title}
              subtitle={source.subtitle}
              left={<Avatar src={source.icon} size="md" />}
              onPress={() => {
                setSelectedSource(source.id)
                setSheetOpen(false)
              }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
