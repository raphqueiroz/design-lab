import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'

/* Force side-effect registration of all components */
import '../library/foundations'
import '../library/inputs'
import '../library/display'
import '../library/feedback'
import '../library/navigation'
import '../library/layout'

import AppHeader from '../components/AppHeader'
import ComponentSidebar from './library/ComponentSidebar'
import ComponentDetail from './library/ComponentDetail'
import FoundationDetail from './library/FoundationDetail'
import PatternDetail from './library/PatternDetail'
import ScreenPartsDetail from './library/ScreenPartsDetail'
import TokenEditor from './library/TokenEditor'

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = searchParams.get('selected')

  /* Default to Colors foundation if none selected */
  useEffect(() => {
    if (!selected) {
      setSearchParams({ selected: 'foundation:Colors' }, { replace: true })
    }
  }, [selected, setSearchParams])

  const handleSelect = (name: string) => {
    setSearchParams({ selected: name })
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <AppHeader />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentSidebar selected={selected} onSelect={handleSelect} />
        {renderContent()}
        <TokenEditor />
      </div>
    </motion.div>
  )
}
