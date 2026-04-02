import { useState, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { useScreenData } from '@/lib/ScreenDataContext'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import StickyFooter from '@/library/layout/StickyFooter'
import Stack from '@/library/layout/Stack'
import Text from '@/library/foundations/Text'
import Badge from '@/library/display/Badge'
import Button from '@/library/inputs/Button'
import GroupHeader from '@/library/navigation/GroupHeader'
import SegmentedControl from '@/library/navigation/SegmentedControl'
import ShortcutButton from '@/library/inputs/ShortcutButton'
import SearchBar from '@/library/inputs/SearchBar'
import LineChart from '@/library/display/LineChart'
import { RiAddLine, RiArrowDownLine, RiHistoryLine } from '@remixicon/react'
import {
  MOCK_POSITIONS, getPortfolioTotal, getPortfolioChange,
  getVariableAssets, getFixedIncomeAssets,
  formatBRL, formatPercentChange, generatePortfolioChartData,
} from './shared/data'
import { AssetRow, PositionRow } from './Screen2_Dashboard.parts'

type DashboardState = 'empty' | 'with-positions'

export default function Screen2_Dashboard({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { initialState } = useScreenData<{ initialState?: DashboardState }>()
  const hasPositions = (initialState ?? 'with-positions') !== 'empty'

  const [tabIndex, setTabIndex] = useState(hasPositions ? 0 : 1)
  const [search, setSearch] = useState('')

  const portfolioData = useMemo(() => generatePortfolioChartData(30), [])
  const totalValue = getPortfolioTotal()
  const totalChange = getPortfolioChange()

  const variableAssets = getVariableAssets()
  const fixedAssets = getFixedIncomeAssets()

  const filteredVariable = useMemo(() => {
    if (!search) return variableAssets
    const q = search.toLowerCase()
    return variableAssets.filter(a => a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q))
  }, [search, variableAssets])

  const filteredFixed = useMemo(() => {
    if (!search) return fixedAssets
    const q = search.toLowerCase()
    return fixedAssets.filter(a => a.name.toLowerCase().includes(q))
  }, [search, fixedAssets])

  const handleAssetTap = (label: string) => {
    const handled = onElementTap?.(label)
    if (!handled) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Investimentos" onClose={onBack} />

      <SegmentedControl
        segments={['Portfólio', 'Explorar']}
        activeIndex={tabIndex}
        onChange={setTabIndex}
      />

      {/* ── Portfólio Tab ── */}
      {tabIndex === 0 && (
        <>
          {hasPositions ? (
            <>
              <Stack gap="sm">
                <Text variant="caption" color="content-secondary">Valor total</Text>
                <Stack direction="row" gap="sm" align="center">
                  <Text variant="display">{formatBRL(totalValue)}</Text>
                  <Badge variant={totalChange >= 0 ? 'lime' : 'error'} size="sm">
                    {formatPercentChange(totalChange)}
                  </Badge>
                </Stack>
              </Stack>

              <LineChart data={portfolioData} variant="baseline" height={160} />

              <Stack direction="row" gap="default" align="center">
                <ShortcutButton
                  icon={<RiAddLine size={20} />}
                  label="Comprar"
                  variant="primary"
                  onPress={() => handleAssetTap('ShortcutButton: Comprar')}
                />
                <ShortcutButton
                  icon={<RiArrowDownLine size={20} />}
                  label="Vender"
                  variant="secondary"
                  onPress={() => handleAssetTap('ShortcutButton: Vender')}
                />
                <ShortcutButton
                  icon={<RiHistoryLine size={20} />}
                  label="Histórico"
                  variant="secondary"
                  disabled
                />
              </Stack>

              <Stack gap="none">
                <GroupHeader text="Suas posições" />
                {MOCK_POSITIONS.map(pos => (
                  <PositionRow
                    key={pos.asset}
                    position={pos}
                    onPress={() => handleAssetTap(`ListItem: ${pos.asset}`)}
                  />
                ))}
              </Stack>
            </>
          ) : (
            <Stack gap="default" align="center" className="py-16">
              <Text variant="heading-md" align="center">Comece a investir</Text>
              <Text variant="body-md" color="content-secondary" align="center">
                Explore os ativos disponíveis e faça seu primeiro investimento.
              </Text>
              <Button variant="primary" onPress={() => setTabIndex(1)}>
                Explorar ativos
              </Button>
            </Stack>
          )}
        </>
      )}

      {/* ── Explorar Tab ── */}
      {tabIndex === 1 && (
        <>
          <SearchBar
            placeholder="Buscar ativos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredVariable.length > 0 && (
            <Stack gap="none">
              <GroupHeader text="Renda Variável" />
              {filteredVariable.map(asset => (
                <AssetRow
                  key={asset.ticker}
                  asset={asset}
                  onPress={() => handleAssetTap(`ListItem: ${asset.name}`)}
                />
              ))}
            </Stack>
          )}

          {filteredFixed.length > 0 && (
            <Stack gap="none">
              <GroupHeader text="Renda Fixa" />
              {filteredFixed.map(asset => (
                <AssetRow
                  key={asset.ticker}
                  asset={asset}
                  onPress={() => handleAssetTap(`ListItem: ${asset.name}`)}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {tabIndex === 0 && hasPositions && (
        <StickyFooter>
          <Button fullWidth variant="primary" onPress={() => setTabIndex(1)}>
            Explorar mais ativos
          </Button>
        </StickyFooter>
      )}
    </BaseLayout>
  )
}
