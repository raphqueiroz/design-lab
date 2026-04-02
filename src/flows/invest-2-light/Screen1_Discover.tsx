/**
 * Discover — dark-themed asset discovery/explore screen.
 * Filterable by category + search. Sections: Maiores altas, Mais negociados, Todos.
 * Pure custom Tailwind + inline styles + Framer Motion. NO library components.
 */
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  RiArrowLeftLine, RiSearchLine,
} from '@remixicon/react'
import IconButton from '@/library/inputs/IconButton'
import { stagger } from './shared/animations'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  ASSETS,
} from './shared/data'
import type { AssetCategory } from './shared/data'
import {
  BG, BG_CARD, BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY,
  fadeUp,
} from './shared/theme'
import { CategoryPill } from './Screen1_Discover.parts'
import { FavoriteCard } from './Screen0_Dashboard.parts'
import AssetListItem from './shared/AssetListItem'
import Subheader from '@/library/navigation/Subheader'

type SortOptionValue = 'name' | 'price-desc' | 'price-asc' | 'change-desc'

const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'change-desc', label: 'Maior alta' },
]

const CATEGORIES: { id: 'all' | AssetCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'crypto', label: 'Cripto' },
  { id: 'commodity', label: 'Commodities' },
  { id: 'fixed-income', label: 'Renda Fixa' },
  { id: 'stablecoin', label: 'Stablecoins' },
]


export default function Screen1_Discover({ onBack, onElementTap, onNext }: FlowScreenProps) {
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | AssetCategory>('all')
  const [sort, setSort] = useState<SortOptionValue>('name')

  // Trending = highest 24h change
  const trending = useMemo(() =>
    [...ASSETS]
      .filter(a => a.change24h != null)
      .sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))
      .slice(0, 5),
    [],
  )

  // Most traded (popular tag)
  const mostTraded = useMemo(() =>
    ASSETS.filter(a => a.tags?.includes('popular')).slice(0, 6),
    [],
  )

  const isSearching = search.trim().length > 0
  const isFiltered = activeCategory !== 'all'

  // Filtered assets
  const filteredAssets = useMemo(() => {
    let list = [...ASSETS]

    // Category filter
    if (isFiltered) {
      list = list.filter(a => a.category === activeCategory)
    }

    // Search filter
    if (isSearching) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q),
      )
    }

    // Sort
    switch (sort) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-desc':
        list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case 'price-asc':
        list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case 'change-desc':
        list.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0))
        break
    }

    return list
  }, [search, activeCategory, sort, isSearching, isFiltered])

  const handleAssetTap = (name: string) => {
    const handled = onElementTap?.(`ListItem: ${name}`)
    if (!handled) onNext()
  }

  // Show sections when "all" + no search
  const showSections = !isSearching && !isFiltered

  return (
    <div className="flex flex-col min-h-screen" style={{ background: BG }}>
      <div style={{ height: 'var(--safe-area-top)' }} />

      {/* Top bar: back + search — padded */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-3 page-pad pt-3 pb-2">
        <IconButton
          variant="base"
          icon={<RiArrowLeftLine size={24} className="text-content-primary" />}
          onPress={onBack}
        />

        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
          style={{
            background: BG_CARD,
            border: `1px solid ${BORDER}`,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: searchFocused ? '0 0 0 2px rgba(255,255,255,0.1)' : 'none',
            borderColor: searchFocused ? 'rgba(255,255,255,0.2)' : BORDER,
          }}
        >
          <RiSearchLine size={16} color={TEXT_TERTIARY} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar ativo..."
            className="flex-1 bg-transparent border-none outline-none"
            style={{
              color: TEXT_PRIMARY,
              fontSize: 14,
              caretColor: TEXT_PRIMARY,
            }}
          />
        </div>
      </motion.div>

      {/* Category pills — padded, scrolls horizontally */}
      <motion.div {...fadeUp(0.05)} className="flex gap-2 page-pad py-3 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <CategoryPill
            key={cat.id}
            label={cat.label}
            active={activeCategory === cat.id}
            onPress={() => setActiveCategory(cat.id)}
          />
        ))}
      </motion.div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {showSections ? (
          <>
            {/* Maiores altas — full bleed section with horizontal scroll */}
            <motion.div {...fadeUp(0.1)} className="mb-5">
              <Subheader text="Maiores altas" description="Ativos com maior valorização nas últimas 24h" />
              <div className="flex gap-2 px-6 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {trending.map((asset, i) => (
                  <motion.div
                    key={asset.ticker}
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: 0.15 + i * 0.06,
                    }}
                  >
                    <FavoriteCard
                      ticker={asset.ticker}
                      onPress={() => handleAssetTap(asset.name)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Mais negociados — full bleed section with horizontal scroll */}
            <motion.div {...fadeUp(0.2)} className="mb-5">
              <Subheader text="Mais negociados" description="Os ativos mais comprados pela comunidade" />
              <div className="flex gap-2 px-6 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {mostTraded.map((asset, i) => (
                  <motion.div
                    key={asset.ticker}
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: 0.3 + i * 0.06,
                    }}
                  >
                    <FavoriteCard
                      ticker={asset.ticker}
                      onPress={() => handleAssetTap(asset.name)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Todos os ativos — full bleed asset list */}
            <motion.div {...fadeUp(0.3)} className="mb-6">
              <Subheader text="Todos os ativos" sortOptions={SORT_OPTIONS} sortValue={sort} onSortChange={v => setSort(v as SortOptionValue)} />
              <div className="flex flex-col">
                {filteredAssets.map(asset => (
                  <AssetListItem
                    key={asset.ticker}
                    ticker={asset.ticker}
                    variant="market"
                    onPress={() => handleAssetTap(asset.name)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* Filtered / Search results — full bleed */
          <motion.div {...fadeUp(0.1)} className="mb-6">
            <Subheader
              text={`${filteredAssets.length} ${filteredAssets.length === 1 ? 'ativo disponível' : 'ativos disponíveis'}`}
              size="sm"
              sortOptions={SORT_OPTIONS}
              sortValue={sort}
              onSortChange={v => setSort(v as SortOptionValue)}
            />

            <div className="flex flex-col">
              {filteredAssets.map(asset => (
                <AssetListItem
                  key={asset.ticker}
                  ticker={asset.ticker}
                  variant="market"
                  onPress={() => handleAssetTap(asset.name)}
                />
              ))}
              {filteredAssets.length === 0 && (
                <motion.div {...stagger(0, 0)} className="flex flex-col items-center py-12">
                  <RiSearchLine size={32} color={TEXT_TERTIARY} />
                  <span className="mt-3" style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                    Nenhum ativo encontrado
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bottom padding */}
        <div style={{ paddingBottom: 'max(var(--safe-area-bottom), 20px)' }} />
      </div>
    </div>
  )
}
