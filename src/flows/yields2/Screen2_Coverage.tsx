import { RiCheckLine, RiCloseLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import BaseLayout from '../../library/layout/BaseLayout'
import StickyFooter from '../../library/layout/StickyFooter'
import Stack from '../../library/layout/Stack'
import Header from '../../library/navigation/Header'
import GroupHeader from '../../library/navigation/GroupHeader'
import Button from '../../library/inputs/Button'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import DataList from '../../library/display/DataList'
import Banner from '../../library/display/Banner'

import {
  COVERED_ITEMS,
  NOT_COVERED_ITEMS,
  COVERAGE_PERCENT,
  INSURANCE_PROVIDER,
  INSURANCE_COST,
  formatPct,
} from './shared/data'

export default function Screen2_Coverage({ onNext, onBack }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title="Cobertura do seguro" onBack={onBack} />

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
            { label: 'Custo do seguro', value: `${formatPct(INSURANCE_COST)} a.a.` },
          ]}
        />

        <Banner
          variant="neutral"
          title="O seguro é automático"
          description="A cobertura é ativada no momento do depósito e permanece enquanto seus fundos estiverem alocados."
        />
      </Stack>

      <StickyFooter>
        <Button fullWidth onPress={onNext}>
          Entendi, ativar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
