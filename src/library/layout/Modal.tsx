import { type ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine } from '@remixicon/react'
import { registerComponent } from '../registry'
import Button from '../inputs/Button'

export interface ModalProps {
  title?: string | ReactNode
  message?: string
  isVisible?: boolean
  variant?: 'regular' | 'bottom'
  buttonOneText?: string
  onButtonOnePress?: () => void
  shouldRenderCloseButton?: boolean
  onBackdropPress?: () => void
  children?: ReactNode
  className?: string
}

export default function Modal({
  title,
  message,
  isVisible = false,
  variant = 'regular',
  buttonOneText,
  onButtonOnePress,
  shouldRenderCloseButton = false,
  onBackdropPress,
  children,
  className = '',
}: ModalProps) {
  const [visible, setVisible] = useState(isVisible)

  useEffect(() => {
    setVisible(isVisible)
  }, [isVisible])

  const isBottom = variant === 'bottom'

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onBackdropPress}
            className="absolute inset-0 bg-black/50 z-[999]"
          />

          {/* Modal content */}
          <motion.div
            data-component="Modal"
            initial={isBottom ? { y: '100%', x: '-50%' } : { scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
            animate={isBottom ? { y: 0, x: '-50%' } : { scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={isBottom ? { y: '100%', x: '-50%' } : { scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              absolute z-[1000] bg-white shadow-lg flex flex-col
              ${isBottom
                ? 'bottom-0 left-1/2 w-full max-w-lg rounded-t-2xl p-6 pb-8'
                : 'top-1/2 left-1/2 max-w-[90%] w-[420px] rounded-[var(--token-radius-md)] p-8'
              }
              ${className}
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              {title && (
                typeof title === 'string'
                  ? <h2 className="text-[20px] font-semibold text-[var(--color-content-primary)] flex-1">{title}</h2>
                  : <div className="flex-1">{title}</div>
              )}
              {shouldRenderCloseButton && (
                <button
                  onClick={onBackdropPress}
                  className="w-8 h-8 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center cursor-pointer hover:opacity-70 shrink-0"
                >
                  <RiCloseLine size={18} className="text-[var(--color-content-primary)]" />
                </button>
              )}
            </div>

            {/* Message */}
            {message && (
              <p className="mt-3 text-[14px] text-[var(--color-content-secondary)] leading-[20px]">
                {message}
              </p>
            )}

            {/* Children */}
            {children && <div className="mt-4">{children}</div>}

            {/* Button */}
            {buttonOneText && (
              <div className="mt-6 flex justify-end">
                <Button onPress={onButtonOnePress}>{buttonOneText}</Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

registerComponent({
  name: 'Modal',
  category: 'presentation',
  description: 'Interrupting overlay for decisions. Centered modal on desktop, full-screen on mobile.',
  component: Modal,
  variants: ['regular', 'bottom'],
  props: [
    { name: 'title', type: 'string | ReactNode', required: false, description: 'Modal title' },
    { name: 'message', type: 'string', required: false, description: 'Body message text' },
    { name: 'isVisible', type: 'boolean', required: false, defaultValue: 'false', description: 'Control visibility' },
    { name: 'variant', type: '"regular" | "bottom"', required: false, defaultValue: 'regular', description: 'Positioning variant' },
    { name: 'buttonOneText', type: 'string', required: false, description: 'Primary action button text' },
    { name: 'onButtonOnePress', type: '() => void', required: false, description: 'Primary action handler' },
    { name: 'shouldRenderCloseButton', type: 'boolean', required: false, defaultValue: 'false', description: 'Show close X button' },
    { name: 'onBackdropPress', type: '() => void', required: false, description: 'Backdrop click handler' },
    { name: 'children', type: 'ReactNode', required: false, description: 'Modal body content' },
  ],
})
