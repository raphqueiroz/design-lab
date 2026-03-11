import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RiAddLine } from '@remixicon/react'

/* Auto-discover all flow registrations */
import.meta.glob('../flows/*/index.ts', { eager: true })

import AppHeader from '../components/AppHeader'
import PageGalleryCanvas from './gallery/PageGalleryCanvas'
import NewPageDialog from './gallery/NewPageDialog'
import { getAllPages, getPage, hydrateDynamicPages, registerDynamicPage } from './gallery/pageRegistry'
import { subscribeToPageChanges } from './gallery/pageStore'
import { saveDynamicPage, subscribeToDynamicPageChanges } from './gallery/dynamicPageStore'
import { slugify, uniqueId } from '../lib/slugify'
import { pullFromSupabase } from '../lib/syncStore'
import { migrateHardcodedFlows, migrateStaleScreenPaths } from './simulator/flowMigration'
import { hydrateDynamicFlows } from './simulator/flowRegistry'

export default function PageGalleryPage() {
  const [, setVersion] = useState(0)
  const [showNewDialog, setShowNewDialog] = useState(false)

  useEffect(() => {
    migrateHardcodedFlows()
    migrateStaleScreenPaths()
    hydrateDynamicFlows()
    hydrateDynamicPages()
    setVersion((v) => v + 1)
  }, [])

  const handleSynced = useCallback(() => {
    hydrateDynamicPages()
    setVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    pullFromSupabase().then((ok) => {
      if (ok) {
        hydrateDynamicPages()
        setVersion((v) => v + 1)
      }
    })
    const unsub = subscribeToPageChanges(() => { setVersion((v) => v + 1) })
    const unsubDynPages = subscribeToDynamicPageChanges(() => {
      hydrateDynamicPages()
      setVersion((v) => v + 1)
    })
    return () => {
      unsub?.()
      unsubDynPages?.()
    }
  }, [])

  const handleCreatePage = useCallback((name: string, area: string, description: string) => {
    const id = uniqueId('page-' + slugify(name), (id) => !!getPage(id))
    const def = { id, name, description, area, componentsUsed: [] }
    saveDynamicPage(def)
    registerDynamicPage(def)
    setVersion((v) => v + 1)
    setShowNewDialog(false)
  }, [])

  const pages = getAllPages()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col min-h-0"
    >
      <AppHeader
        onSynced={handleSynced}
        actions={
          <button
            type="button"
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-[var(--token-spacing-1)] px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] font-medium text-shell-bg bg-shell-selected-text rounded-[var(--token-radius-sm)] cursor-pointer hover:bg-[#6EE7A0] transition-colors"
          >
            <RiAddLine size={14} />
            New Page
          </button>
        }
      />

      {/* Sub-header */}
      <div className="h-[40px] flex items-center px-[var(--token-spacing-md)] border-b border-shell-border bg-shell-surface shrink-0">
        <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main canvas */}
      <div className="flex-1 flex overflow-hidden">
        {pages.length > 0 ? (
          <PageGalleryCanvas
            pages={pages}
            onPageChanged={() => setVersion((v) => v + 1)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
            <div className="text-center">
              <p className="text-[length:var(--token-font-size-body)] mb-[var(--token-spacing-2)]">No pages yet</p>
              <button
                type="button"
                onClick={() => setShowNewDialog(true)}
                className="text-[length:var(--token-font-size-body-sm)] text-shell-selected-text hover:text-[#6EE7A0] cursor-pointer"
              >
                Create your first page
              </button>
            </div>
          </div>
        )}
      </div>

      {showNewDialog && (
        <NewPageDialog
          onClose={() => setShowNewDialog(false)}
          onCreate={handleCreatePage}
        />
      )}
    </motion.div>
  )
}
