/**
 * Screen-only parts for the Caixinha Hub (Version B).
 */

import { RiArrowDownLine, RiArrowUpLine, RiPercentLine } from '@remixicon/react'
import Stack from '../../../../library/layout/Stack'
import Text from '../../../../library/foundations/Text'
import Avatar from '../../../../library/display/Avatar'
import ListItem from '../../../../library/display/ListItem'
import GroupHeader from '../../../../library/navigation/GroupHeader'

/* ── HistoryTab ── */

interface HistoryTabProps {
  onElementTap?: (label: string) => boolean
}

export function HistoryTab({ onElementTap }: HistoryTabProps) {
  return (
    <Stack gap="default">
      <GroupHeader text="Hoje" />

      <ListItem
        title="Rendimento creditado"
        subtitle="+US$ 0,17"
        left={
          <Avatar
            size="md"
            icon={<RiPercentLine size={16} />}
            bgColor="#dcfce7"
            iconColor="#22c55e"
          />
        }
        right={
          <Stack gap="none" align="end">
            <Text variant="body-sm" className="font-semibold text-[#22c55e]">+US$ 0,17</Text>
            <Text variant="caption" className="text-[#8a8a8a]">Yield</Text>
          </Stack>
        }
        onPress={() => onElementTap?.('ListItem: Rendimento')}
      />

      <GroupHeader text="Ontem" />

      <ListItem
        title="Rendimento creditado"
        subtitle="+US$ 0,17"
        left={
          <Avatar
            size="md"
            icon={<RiPercentLine size={16} />}
            bgColor="#dcfce7"
            iconColor="#22c55e"
          />
        }
        right={
          <Stack gap="none" align="end">
            <Text variant="body-sm" className="font-semibold text-[#22c55e]">+US$ 0,17</Text>
            <Text variant="caption" className="text-[#8a8a8a]">Yield</Text>
          </Stack>
        }
      />

      <ListItem
        title="Depósito"
        subtitle="Saldo USD"
        left={
          <Avatar
            size="md"
            icon={<RiArrowDownLine size={16} />}
            bgColor="#dbeafe"
            iconColor="#3b82f6"
          />
        }
        right={
          <Stack gap="none" align="end">
            <Text variant="body-sm" className="font-semibold">+US$ 500,00</Text>
            <Text variant="caption" className="text-[#8a8a8a]">Depósito</Text>
          </Stack>
        }
      />

      <GroupHeader text="28 fev 2026" />

      <ListItem
        title="Resgate"
        subtitle="Para saldo USD"
        left={
          <Avatar
            size="md"
            icon={<RiArrowUpLine size={16} />}
            bgColor="#fee2e2"
            iconColor="#ef4444"
          />
        }
        right={
          <Stack gap="none" align="end">
            <Text variant="body-sm" className="font-semibold">-US$ 200,00</Text>
            <Text variant="caption" className="text-[#8a8a8a]">Resgate</Text>
          </Stack>
        }
      />
    </Stack>
  )
}
