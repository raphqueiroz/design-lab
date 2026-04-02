import { useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { RiPaletteLine, RiApps2Line, RiLayoutMasonryLine } from '@remixicon/react'

/* Force side-effect registration of all components */
import '../library/foundations'
import '../library/inputs'
import '../library/display'
import '../library/feedback'
import '../library/navigation'
import '../library/layout'

import { getComponentsByCategory } from '../library/registry'
import AppHeader from '../components/AppHeader'
import ComponentSidebar from './library/ComponentSidebar'
import ComponentDetail from './library/ComponentDetail'
import FoundationDetail from './library/FoundationDetail'
import PatternDetail from './library/PatternDetail'
import ScreenPartsDetail from './library/ScreenPartsDetail'
import TokenEditor from './library/TokenEditor'

export type LibraryTab = 'foundations' | 'components' | 'patterns'

const libraryTabs = [
  { key: 'foundations' as const, label: 'Foundations', icon: RiPaletteLine },
  { key: 'components' as const, label: 'Components', icon: RiApps2Line },
  { key: 'patterns' as const, label: 'Patterns', icon: RiLayoutMasonryLine },
]

function getDefaultSelection(tab: LibraryTab): string {
  if (tab === 'foundations') return 'foundation:Colors'
  if (tab === 'patterns') return 'pattern:FormWithValidation'
  // components: pick first from the first non-empty category
  const categories = ['presentation', 'navigation', 'actions', 'inputs', 'feedback', 'layout'] as const
  for (const cat of categories) {
    const items = getComponentsByCategory(cat)
    if (items.length > 0) return items[0].name
  }
  return ''
}

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = searchParams.get('selected')

  const activeTab: LibraryTab = useMemo(() => {
    const t = searchParams.get('tab')
    if (t === 'components' || t === 'patterns') return t
    return 'foundations'
  }, [searchParams])

  const setActiveTab = useCallback((tab: LibraryTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (tab === 'foundations') next.delete('tab'); else next.set('tab', tab)
      next.set('selected', getDefaultSelection(tab))
      return next
    }, { replace: true })
  }, [setSearchParams])

  /* Default to Colors foundation if none selected */
  useEffect(() => {
    if (!selected) {
      setSearchParams({ selected: getDefaultSelection(activeTab) }, { replace: true })
    }
  }, [selected, setSearchParams, activeTab])

  const handleSelect = (name: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('selected', name)
      return next
    })
  }

  function renderContent() {
    if (!selected) {
      return (
        <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
          Select an item from the sidebar
        </div>
      )
    }

    if (selected.startsWith('foundation:')) {
      const foundation = selected.replace('foundation:', '')
      return <FoundationDetail foundation={foundation} />
    }

    if (selected === 'screen-parts') {
      return <ScreenPartsDetail />
    }

    if (selected.startsWith('pattern:')) {
      const pattern = selected.replace('pattern:', '')
      return <PatternDetail pattern={pattern} />
    }

    return <ComponentDetail componentName={selected} />
  }

  const tabActiveIndex = libraryTabs.findIndex((t) => t.key === activeTab)

  const tabToggle = (
    <div className="flex items-center gap-[var(--token-spacing-3)]">
      <div className="relative flex w-[340px] p-[2px] bg-shell-bg rounded-[var(--token-radius-sm)]">
        <motion.div
          className="absolute top-[2px] bottom-[2px] bg-shell-hover rounded-[6px]"
          initial={false}
          animate={{
            left: tabActiveIndex === 0 ? '2px' : tabActiveIndex === 1 ? 'calc(33.333%)' : 'calc(66.666%)',
            width: `calc(33.333% - ${tabActiveIndex === 2 ? 2 : tabActiveIndex === 0 ? 2 : 0}px)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
        {libraryTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative z-10 flex items-center justify-center gap-[var(--token-spacing-1)]
              flex-1 min-w-[80px]
              px-[var(--token-spacing-3)] py-[var(--token-spacing-1)]
              text-[length:var(--token-font-size-caption)] font-medium
              transition-colors cursor-pointer rounded-[6px]
              ${activeTab === tab.key ? 'text-shell-text' : 'text-shell-text-tertiary hover:text-shell-text-secondary'}
            `}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <AppHeader center={tabToggle} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentSidebar selected={selected} onSelect={handleSelect} activeTab={activeTab} />
        {renderContent()}
        {selected === 'foundation:Colors' && <TokenEditor />}
      </div>
    </motion.div>
  )
}
