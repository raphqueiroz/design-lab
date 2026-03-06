/**
 * @screen Detalhes do Investimento
 * @description Detalhes sobre o investimento, com tudo o que o usuário precisa saber.
 *   Dois estados: investido e não investido, cada um com ações específicas.
 */
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Header from '@/library/navigation/Header'
import GroupHeader from '@/library/navigation/GroupHeader'
import Button from '@/library/inputs/Button'
import ShortcutButton from '@/library/inputs/ShortcutButton'
import Text from '@/library/foundations/Text'
import Divider from '@/library/foundations/Divider'
import Amount from '@/library/display/Amount'
import Badge from '@/library/display/Badge'
import DataList from '@/library/display/DataList'
import Banner from '@/library/display/Banner'
import Card from '@/library/display/Card'

import {
  GROSS_APY,
  INSURANCE_COST,
  NET_APY,
  COVERAGE_PERCENT,
  INSURANCE_PROVIDER,
  MOCK_BALANCE,
  YIELD_TODAY,
  YIELD_MONTH,
  formatPct,
  formatUsd,
} from '../yields2/shared/data'

export default function Screen({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isInvested } = useScreenData<{ isInvested?: boolean }>()

  if (isInvested) {
    return (
      <BaseLayout>
        <Header title="Renda Protegida" onBack={onBack} />
        <Stack gap="default">
          <Card variant="elevated">
            <Stack gap="sm">
              <Stack direction="row" align="between">
                <Text variant="caption" color="content-secondary">Saldo investido</Text>
                <Badge variant="success" size="sm">Segurado</Badge>
              </Stack>
              <Amount value={MOCK_BALANCE} currency="US$" size="lg" />
              <Text variant="caption" className="text-[var(--color-feedback-success)]">
                +US$ {YIELD_TODAY.toFixed(2).replace('.', ',')} hoje
              </Text>
            </Stack>
          </Card>

          <Stack direction="row" gap="lg" align="center" className="justify-center">
            <ShortcutButton
              icon={<RiArrowDownLine size={20} />}
              label="Depositar"
              variant="primary"
              onPress={() => {
                const resolved = onElementTap?.('ShortcutButton: Depositar')
                if (!resolved) onNext()
              }}
            />
            <ShortcutButton
              icon={<RiArrowUpLine size={20} />}
              label="Resgatar"
              variant="secondary"
              disabled
            />
          </Stack>

          <Divider />

          <Stack gap="none">
            <GroupHeader text="Performance" />
            <DataList
              data={[
                { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
                { label: 'Rendimento diário', value: formatUsd(YIELD_TODAY) },
                { label: 'Rendimento mensal', value: formatUsd(YIELD_MONTH) },
                { label: 'Cobertura', value: `${COVERAGE_PERCENT}%` },
              ]}
            />
          </Stack>

          <Banner
            variant="success"
            collapsable
            title="Seus fundos são segurados"
            description={`${COVERAGE_PERCENT}% de cobertura via ${INSURANCE_PROVIDER}.`}
          />
        </Stack>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <Header title="Renda Protegida" onBack={onBack} />
      <Stack gap="default">
        <Stack gap="sm" align="center">
          <Badge variant="success" size="md">Segurado</Badge>
          <Text variant="display">~{formatPct(NET_APY)} a.a.</Text>
          <Text variant="body-sm" color="content-secondary">
            sDAI na Gnosis Chain com seguro automático
          </Text>
        </Stack>

        <Divider />

        <Stack gap="none">
          <GroupHeader text="Rendimento" />
          <DataList
            data={[
              { label: 'Rendimento bruto', value: `${formatPct(GROSS_APY)} a.a.` },
              { label: 'Custo do seguro', value: `-${formatPct(INSURANCE_COST)} a.a.` },
              { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
              { label: 'Acúmulo', value: 'Diário' },
              { label: 'Liquidez', value: 'Imediata' },
            ]}
          />
        </Stack>

        <Stack gap="none">
          <GroupHeader text="Protocolo e risco" />
          <DataList
            data={[
              { label: 'Protocolo', value: 'MakerDAO (sDAI)' },
              { label: 'Rede', value: 'Gnosis Chain' },
              { label: 'Ativo', value: 'Savings DAI' },
              { label: 'Risco', value: 'Médio-baixo' },
              { label: 'Auditoria', value: 'ChainSecurity, Trail of Bits' },
            ]}
          />
        </Stack>

        <Banner
          variant="neutral"
          title="Informação importante"
          description="Rendimentos passados não garantem resultados futuros. O seguro cobre eventos específicos de protocolo, não flutuações de mercado."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={() => {
          const handled = onElementTap?.('Button: Investir')
          if (!handled) onNext()
        }}>
          Investir
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
