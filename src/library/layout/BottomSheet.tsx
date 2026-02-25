import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerComponent } from '../registry'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              bg-surface-elevated
              rounded-t-[var(--token-radius-xl)]
              max-h-[85vh] overflow-hidden
              flex flex-col
              ${className}
            `}
          >
            <div className="flex justify-center pt-[var(--token-spacing-2)] pb-[var(--token-spacing-1)]">
              <div className="w-[36px] h-[4px] rounded-[var(--token-radius-full)] bg-neutral-300" />
            </div>
            {title && (
              <div className="px-[var(--token-spacing-md)] py-[var(--token-spacing-3)]">
                <h2 className="text-[length:var(--token-font-size-heading-sm)] leading-[var(--token-line-height-heading-sm)] font-medium text-content-primary text-center">
                  {title}
                </h2>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-[var(--token-spacing-md)] pb-[var(--token-spacing-xl)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

registerComponent({
  name: 'BottomSheet',
  category: 'layout',
  description: 'Modal overlay sliding from bottom with spring animation.',
  component: BottomSheet,
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Visibility state' },
    { name: 'onClose', type: '() => void', required: true, description: 'Close handler' },
    { name: 'title', type: 'string', required: false, description: 'Sheet title' },
    { name: 'children', type: 'ReactNode', required: true, description: 'Sheet content' },
  ],
})
