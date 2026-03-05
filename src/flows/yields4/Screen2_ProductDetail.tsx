import { RiCheckLine, RiCloseLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import Text from '../../library/foundations/Text'
import Badge from '../../library/display/Badge'
import DataList from '../../library/display/DataList'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import Banner from '../../library/display/Banner'
import Divider from '../../library/foundations/Divider'

import {
  GROSS_APY,
  INSURANCE_COST,
  NET_APY,
  COVERAGE_PERCENT,
  INSURANCE_PROVIDER,
  COVERED_ITEMS,
  NOT_COVERED_ITEMS,
  formatPct,
} from '../yields2/shared/data'

/**
 * Yields4 — Product Detail
 * Inspired by Nubank CDB detail: long-scroll product info with
 * terms, risk rating, and full coverage breakdown.
 */
export default function Screen2_ProductDetail({ onNext, onBack }: FlowScreenProps) {
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

        <Stack gap="none">
          <GroupHeader text="Cobertura do seguro" />
          <DataList
            data={[
              { label: 'Cobertura', value: `${COVERAGE_PERCENT}%` },
              { label: 'Seguradora', value: INSURANCE_PROVIDER },
              { label: 'Custo', value: `${formatPct(INSURANCE_COST)} a.a. (incluído)` },
            ]}
          />
        </Stack>

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

        <Banner
          variant="neutral"
          title="Informação importante"
          description="Rendimentos passados não garantem resultados futuros. O seguro cobre eventos específicos de protocolo, não flutuações de mercado."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Ativar Renda Protegida
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
