/**
 * Screen-only parts for the Yields3 Hub.
 * Do not import from other screens — extract to src/library/ if reused.
 */

import { RiCheckLine, RiCloseLine } from '@remixicon/react'
import Stack from '../../library/layout/Stack'
import BottomSheet from '../../library/layout/BottomSheet'
import GroupHeader from '../../library/navigation/GroupHeader'
import ListItem from '../../library/display/ListItem'
import Avatar from '../../library/display/Avatar'
import DataList from '../../library/display/DataList'

import {
  COVERED_ITEMS,
  NOT_COVERED_ITEMS,
  COVERAGE_PERCENT,
  INSURANCE_PROVIDER,
  INSURANCE_COST,
  formatPct,
} from '../yields2/shared/data'

/* ── CoverageBottomSheet ── */

interface CoverageBottomSheetProps {
  open: boolean
  onClose: () => void
}

export function CoverageBottomSheet({ open, onClose }: CoverageBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Cobertura do seguro">
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
      </Stack>
    </BottomSheet>
  )
}
