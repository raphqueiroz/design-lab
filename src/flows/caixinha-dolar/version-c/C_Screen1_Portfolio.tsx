import { useState } from 'react'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react'
import type { FlowScreenProps } from '../../../pages/simulator/flowRegistry'
import { useScreenData } from '../../../lib/ScreenDataContext'
import Header from '../../../library/navigation/Header'
import BaseLayout from '../../../library/layout/BaseLayout'
import Stack from '../../../library/layout/Stack'
import BottomSheet from '../../../library/layout/BottomSheet'
import ShortcutButton from '../../../library/inputs/ShortcutButton'
import Amount from '../../../library/display/Amount'
import DataList from '../../../library/display/DataList'
import Banner from '../../../library/display/Banner'
import GroupHeader from '../../../library/navigation/GroupHeader'
import Text from '../../../library/foundations/Text'

import { ProductListItem, DiscoverSection } from './C_Screen1_Portfolio.parts'
import {
  MOCK_BALANCE, YIELD_TODAY, YIELD_MONTH, TAX_DESCRIPTION,
  formatUsd,
} from '../shared/data'

export default function C_Screen1_Portfolio({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { isNewUser } = useScreenData<{ isNewUser?: boolean }>()

  const [detailSheetOpen, setDetailSheetOpen] = useState(false)

  const totalBalance = isNewUser ? 4230 : 4230 + MOCK_BALANCE

  const handleDeposit = () => {
    setDetailSheetOpen(false)
    const resolved = onElementTap?.('ShortcutButton: Depositar')
    if (!resolved) onNext()
  }

  const handleWithdraw = () => {
    setDetailSheetOpen(false)
    const resolved = onElementTap?.('ShortcutButton: Resgatar')
    if (!resolved) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Investir" onBack={onBack} />

      <Stack gap="default">
        {/* Total patrimony */}
        <Stack gap="sm" align="center">
          <Text variant="caption" color="content-secondary">Patrimônio total</Text>
          <Amount value={totalBalance} currency="US$" size="lg" />
        </Stack>

        {/* Active products */}
        {!isNewUser && (
          <Stack gap="none">
            <GroupHeader text="Seus produtos" />
            <ProductListItem onPress={() => setDetailSheetOpen(true)} />
          </Stack>
        )}

        {/* Discover section for new users */}
        {isNewUser && (
          <DiscoverSection onActivate={onNext} />
        )}
      </Stack>

      {/* Detail BottomSheet */}
      <BottomSheet
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        title="Caixinha do Dólar"
      >
        <Stack gap="default">
          <Stack gap="sm" align="center">
            <Amount value={MOCK_BALANCE} currency="US$" size="lg" />
            <Text variant="caption" className="text-[#22c55e]">
              +{formatUsd(YIELD_TODAY)} hoje
            </Text>
          </Stack>

          <DataList
            data={[
              { label: 'Rendimento anual', value: '5,00% a.a.' },
              { label: 'Rendimento hoje', value: formatUsd(YIELD_TODAY) },
              { label: 'Rendimento este mês', value: formatUsd(YIELD_MONTH) },
              { label: 'Resgate', value: 'Imediato' },
            ]}
          />

          <Stack direction="row" gap="lg" align="center" className="justify-center">
            <ShortcutButton
              icon={<RiArrowDownLine size={20} />}
              label="Depositar"
              variant="primary"
              onPress={handleDeposit}
            />
            <ShortcutButton
              icon={<RiArrowUpLine size={20} />}
              label="Resgatar"
              variant="secondary"
              onPress={handleWithdraw}
            />
          </Stack>

          <Banner
            variant="neutral"
            title="Informações fiscais"
            description={TAX_DESCRIPTION}
            collapsable
            defaultExpanded={false}
          />
        </Stack>
      </BottomSheet>
    </BaseLayout>
  )
}
