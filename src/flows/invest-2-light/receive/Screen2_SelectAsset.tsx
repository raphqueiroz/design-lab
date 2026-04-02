/**
 * Select Asset — searchable list of crypto assets for deposit.
 * Uses ListItem with TokenLogoCircle, no separator lines.
 */
import { useState, useMemo } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import { ASSETS } from '../shared/data'
import { getAssetPalette } from '../shared/assetPalette'
import { TokenLogoCircle } from '../shared/TokenLogo'
import BaseLayout from '@/library/layout/BaseLayout'
import Header from '@/library/navigation/Header'
import SearchBar from '@/library/inputs/SearchBar'
import ListItem from '@/library/display/ListItem'

export default function Screen2_SelectAsset({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const [search, setSearch] = useState('')

  const assets = useMemo(() => {
    let list = ASSETS.filter(a => a.category !== 'fixed-income')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q),
      )
    }
    return list
  }, [search])

  const handleSelect = (name: string) => {
    const handled = onElementTap?.(`ListItem: ${name}`)
    if (!handled) onNext()
  }

  return (
    <BaseLayout>
      <Header title="Selecione a criptomoeda" description={`Escolha entre ${ASSETS.filter(a => a.category !== 'fixed-income').length} criptomoedas disponíveis.`} onBack={onBack} />
      <SearchBar value={search} onChange={setSearch} placeholder="Pesquise por nome ou ticker..." />
      <div>
        {assets.map(asset => {
          const palette = getAssetPalette(asset.ticker)
          return (
            <ListItem
              key={asset.ticker}
              title={asset.name}
              subtitle={asset.ticker}
              left={<TokenLogoCircle ticker={asset.ticker} fallbackUrl={asset.icon} size={40} color={palette.bg} />}
              onPress={() => handleSelect(asset.name)}
            />
          )
        })}
        {assets.length === 0 && (
          <div className="flex justify-center py-12">
            <span className="text-content-tertiary text-sm">Nenhum ativo encontrado</span>
          </div>
        )}
      </div>
    </BaseLayout>
  )
}
