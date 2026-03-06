/**
 * @screen Investir
 * @description Tela de investimento com entrada de valor, cálculo de rendimento
 *   estimado e confirmação.
 */
import { useState, useEffect, useRef } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import CurrencyInput from '@/library/inputs/CurrencyInput'
import Divider from '@/library/foundations/Divider'
import DataList from '@/library/display/DataList'
import Banner from '@/library/display/Banner'
import { DataListSkeleton, BannerSkeleton } from '@/library/feedback/Skeleton'

import { USD_ICON, NET_APY, formatUsd, formatPct } from '../yields2/shared/data'

type CalcState = 'idle' | 'loading' | 'ready'

export default function Screen({ onNext, onBack, onElementTap, onStateChange }: FlowScreenProps) {
  const [usdValue, setUsdValue] = useState('')
  const [calcState, setCalcState] = useState<CalcState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const usdAmount = parseInt(usdValue || '0', 10) / 100
  const isValid = usdAmount >= 1

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

  const monthlyEst = usdAmount * NET_APY / 12

  return (
    <BaseLayout>
      <Header title="Investir" onBack={onBack} />
      <Stack gap="default">
        <CurrencyInput
          label="Valor do investimento"
          value={usdValue}
          onChange={setUsdValue}
          tokenIcon={USD_ICON}
          currencySymbol="US$"
        />

        <Divider />

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
                { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a. (incl. seguro)` },
                { label: 'Rendimento mensal (est.)', value: formatUsd(monthlyEst) },
                { label: 'Taxa', value: 'Grátis' },
              ]}
            />
            <Banner variant="success" title="Protegido por seguro automático" />
          </Stack>
        )}
      </Stack>

      <StickyFooter>
        <Button fullWidth disabled={!isValid || calcState !== 'ready'} onPress={() => {
          const handled = onElementTap?.('Button: Confirmar')
          if (!handled) onNext()
        }}>
          Confirmar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
