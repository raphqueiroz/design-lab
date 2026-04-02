import { useState, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import { useScreenData } from '../../lib/ScreenDataContext'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import Header from '../../library/navigation/Header'
import Button from '../../library/inputs/Button'
import CurrencyInput from '../../library/inputs/CurrencyInput'
import Divider from '../../library/foundations/Divider'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import { DataListSkeleton, BannerSkeleton } from '../../library/feedback/Skeleton'

import {
  USD_ICON,
  MOCK_RATE,
  FUNDING_SOURCES,
  GROSS_APY,
  INSURANCE_COST,
  NET_APY,
  formatUsd,
  formatPct,
} from '../yields2/shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function Screen4_DepositAmount({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
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

  useEffect(() => {
    if (!onStateChange) return
    const stateMap: Record<CalcState, string> = { idle: 'default', loading: 'loading', ready: 'ready' }
    onStateChange(stateMap[calcState])
  }, [calcState, onStateChange])

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
  const monthlyEst = usdAmount * NET_APY / 12

  return (
    <BaseLayout>
      <Header title="Depositar" onBack={onBack} />

      <Stack gap="default">
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
            <DataListSkeleton rows={5} />
            <BannerSkeleton />
          </Stack>
        )}

        {calcState === 'ready' && (
          <Stack gap="none">
            <DataList
              data={[
                { label: 'Rendimento bruto', value: `${formatPct(GROSS_APY)} a.a.` },
                { label: 'Custo do seguro', value: `-${formatPct(INSURANCE_COST)} a.a.` },
                { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
                { label: 'Rendimento mensal (est.)', value: formatUsd(monthlyEst) },
                ...(isPix
                  ? [{ label: 'Câmbio', value: `US$ 1 ⇄ R$ ${MOCK_RATE.toFixed(4).replace('.', ',')}` }]
                  : []),
                { label: 'Taxa', value: 'Grátis' },
              ]}
            />
            <Banner variant="success" title="Protegido por seguro — 97,5% via OpenCover" />
          </Stack>
        )}
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={() => {
          const handled = onElementTap?.('Button: Continuar')
          if (!handled) onNext()
        }}>
          Continuar
        </Button>
      </StickyFooter>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Fonte de recursos">
        <Stack gap="none">
          {FUNDING_SOURCES.map((source) => (
            <ListItem
              key={source.id}
              title={source.title}
              subtitle={source.subtitle}
              left={<Avatar src={source.icon} size="md" />}
              onPress={() => { setSelectedSource(source.id); setSheetOpen(false) }}
            />
          ))}
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
