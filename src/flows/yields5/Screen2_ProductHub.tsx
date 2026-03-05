import { useState, useMemo } from 'react'
import { RiArrowDownLine, RiArrowUpLine, RiCheckLine, RiCloseLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import Header from '../../library/navigation/Header'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import GroupHeader from '../../library/navigation/GroupHeader'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import Amount from '../../library/display/Amount'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'
import LineChart from '../../library/display/LineChart'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import ShortcutButton from '../../library/inputs/ShortcutButton'

import {
  MOCK_BALANCE,
  YIELD_TODAY,
  YIELD_MONTH,
  GROSS_APY,
  INSURANCE_COST,
  NET_APY,
  COVERAGE_PERCENT,
  INSURANCE_PROVIDER,
  COVERED_ITEMS,
  NOT_COVERED_ITEMS,
  formatPct,
  formatUsd,
  generateYieldChartData,
} from '../yields2/shared/data'

/**
 * Yields5 — Product Hub
 * Detailed view of the insured yield product after tapping from the dashboard.
 * Includes performance chart, full metrics, and coverage BottomSheet.
 */
export default function Screen2_ProductHub({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [coverageOpen, setCoverageOpen] = useState(false)
  const chartData = useMemo(() => generateYieldChartData(30), [])

  return (
    <BaseLayout>
      <Header title="Renda Protegida" onBack={onBack} />

      <Stack gap="default">
        {/* Balance hero */}
        <div
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1b1b1b 0%, #2d2d2d 100%)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Stack direction="row" align="between">
            <Text variant="caption" className="text-[#8a8a8a]">Saldo alocado</Text>
            <Badge variant="success" size="sm">Protegido</Badge>
          </Stack>

          <Amount value={MOCK_BALANCE} currency="US$" size="lg" className="text-white" />

          <Stack direction="row" gap="default">
            <Text variant="caption" className="text-[var(--color-feedback-success)]">
              +{formatUsd(YIELD_TODAY)} hoje
            </Text>
            <Text variant="caption" className="text-[#8a8a8a]">
              +{formatUsd(YIELD_MONTH)} este mês
            </Text>
          </Stack>
        </div>

        {/* Actions */}
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
            onPress={() => {
              const resolved = onElementTap?.('ShortcutButton: Resgatar')
              if (!resolved) onNext()
            }}
          />
        </Stack>

        {/* Performance chart */}
        <Stack gap="sm">
          <GroupHeader text="Desempenho (30 dias)" />
          <LineChart data={chartData} height={160} variant="area" />
        </Stack>

        {/* Metrics */}
        <Stack gap="none">
          <GroupHeader text="Detalhes do rendimento" />
          <DataList
            data={[
              { label: 'Rendimento bruto', value: `${formatPct(GROSS_APY)} a.a.` },
              { label: 'Custo do seguro', value: `-${formatPct(INSURANCE_COST)} a.a.` },
              { label: 'Rendimento líquido', value: `~${formatPct(NET_APY)} a.a.` },
              { label: 'Rendimento diário', value: formatUsd(YIELD_TODAY) },
              { label: 'Rendimento mensal', value: formatUsd(YIELD_MONTH) },
            ]}
          />
        </Stack>

        {/* Protocol info */}
        <Stack gap="none">
          <GroupHeader text="Protocolo" />
          <DataList
            data={[
              { label: 'Ativo', value: 'sDAI (Savings DAI)' },
              { label: 'Rede', value: 'Gnosis Chain' },
              { label: 'Protocolo', value: 'MakerDAO / Sky' },
              { label: 'Liquidez', value: 'Imediata' },
            ]}
          />
        </Stack>

        {/* Insurance */}
        <Banner
          variant="success"
          title={`Segurado — ${COVERAGE_PERCENT}% cobertura`}
          description={`Via ${INSURANCE_PROVIDER}. Custo de ${formatPct(INSURANCE_COST)} a.a. já incluso.`}
          linkText="Ver detalhes da cobertura"
          onLinkPress={() => setCoverageOpen(true)}
        />
      </Stack>

      {/* Coverage BottomSheet */}
      <BottomSheet open={coverageOpen} onClose={() => setCoverageOpen(false)} title="Cobertura do seguro">
        <Stack gap="default">
          <Stack gap="none">
            <GroupHeader text="O que está coberto" />
            {COVERED_ITEMS.map((item) => (
              <ListItem
                key={item.title}
                title={item.title}
                subtitle={item.description}
                left={
                  <Avatar
                    icon={<RiCheckLine size={16} />}
                    size="sm"
                    className="bg-[var(--color-feedback-success-light)] text-[var(--color-feedback-success)]"
                  />
                }
              />
            ))}
          </Stack>
          <Stack gap="none">
            <GroupHeader text="O que NÃO está coberto" />
            {NOT_COVERED_ITEMS.map((item) => (
              <ListItem
                key={item.title}
                title={item.title}
                subtitle={item.description}
                left={
                  <Avatar
                    icon={<RiCloseLine size={16} />}
                    size="sm"
                    className="bg-[var(--color-feedback-error-light)] text-[var(--color-feedback-error)]"
                  />
                }
              />
            ))}
          </Stack>
          <DataList
            data={[
              { label: 'Cobertura', value: `${COVERAGE_PERCENT}%` },
              { label: 'Seguradora', value: INSURANCE_PROVIDER },
              { label: 'Custo', value: `${formatPct(INSURANCE_COST)} a.a. (incluído)` },
            ]}
          />
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
