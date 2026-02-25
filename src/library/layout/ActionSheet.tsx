import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerComponent } from '../registry'

export interface ActionSheetItem {
  label: string
  icon?: ReactNode
  destructive?: boolean
  onPress: () => void
}

export interface ActionSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  actions: ActionSheetItem[]
  className?: string
}

export default function ActionSheet({
  open,
  onClose,
  title,
  actions,
  className = '',
}: ActionSheetProps) {
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
              pb-[var(--token-spacing-xl)]
              ${className}
            `}
          >
            <div className="flex justify-center pt-[var(--token-spacing-2)] pb-[var(--token-spacing-1)]">
              <div className="w-[36px] h-[4px] rounded-[var(--token-radius-full)] bg-neutral-300" />
            </div>
            {title && (
              <p className="px-[var(--token-spacing-md)] py-[var(--token-spacing-3)] text-center text-[length:var(--token-font-size-body-sm)] text-text-secondary">
                {title}
              </p>
            )}
            <div className="px-[var(--token-spacing-sm)]">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onPress()
                    onClose()
                  }}
                  className={`
                    flex items-center gap-[var(--token-spacing-3)] w-full
                    px-[var(--token-spacing-md)] py-[var(--token-spacing-3)]
                    rounded-[var(--token-radius-md)]
                    text-[length:var(--token-font-size-body-md)]
                    transition-colors duration-[var(--token-transition-fast)]
                    hover:bg-surface-secondary cursor-pointer
                    ${action.destructive ? 'text-error' : 'text-content-primary'}
                  `}
                >
                  {action.icon && <span className="shrink-0">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
            <div className="px-[var(--token-spacing-sm)] mt-[var(--token-spacing-2)]">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-[var(--token-spacing-3)] rounded-[var(--token-radius-md)] text-[length:var(--token-font-size-body-md)] font-medium text-text-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

registerComponent({
  name: 'ActionSheet',
  category: 'layout',
  description: 'List of actions in a bottom sheet.',
  component: ActionSheet,
  props: [
    { name: 'open', type: 'boolean', required: true, description: 'Visibility state' },
    { name: 'onClose', type: '() => void', required: true, description: 'Close handler' },
    { name: 'title', type: 'string', required: false, description: 'Sheet title' },
    { name: 'actions', type: 'ActionSheetItem[]', required: true, description: 'List of action items' },
  ],
})
