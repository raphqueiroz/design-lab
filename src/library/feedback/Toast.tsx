import { motion, AnimatePresence } from 'framer-motion'
import { RiCheckboxCircleLine, RiAlertLine, RiErrorWarningLine, RiInformationLine, RiCloseLine } from '@remixicon/react'
import { registerComponent } from '../registry'

export interface ToastProps {
  variant?: 'success' | 'error' | 'info' | 'warning'
  message: string
  visible?: boolean
  onDismiss?: () => void
  className?: string
}

const config = {
  success: { icon: RiCheckboxCircleLine, bg: 'bg-[var(--token-neutral-900)]', text: 'text-white' },
  error: { icon: RiAlertLine, bg: 'bg-[var(--token-error)]', text: 'text-white' },
  info: { icon: RiInformationLine, bg: 'bg-[var(--token-neutral-900)]', text: 'text-white' },
  warning: { icon: RiErrorWarningLine, bg: 'bg-[var(--token-neutral-900)]', text: 'text-white' },
} as const

export default function Toast({
  variant = 'info',
  message,
  visible = true,
  onDismiss,
  className = '',
}: ToastProps) {
  const { icon: IconComp, bg, text } = config[variant]

  return (
    <AnimatePresence>
      {visible && (
        <div data-component="Toast" className="absolute bottom-[max(var(--token-spacing-6),var(--safe-area-bottom,0px))] left-[var(--token-spacing-4)] right-[var(--token-spacing-4)] z-50 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              pointer-events-auto
              flex items-center gap-[var(--token-spacing-3)]
              px-[var(--token-spacing-4)] py-[var(--token-spacing-3)]
              rounded-[var(--token-radius-sm)] shadow-lg
              w-full max-w-[400px]
              ${bg} ${text} ${className}
            `}
          >
            <IconComp size={18} className="shrink-0" />
            <span className="flex-1 text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium">
              {message}
            </span>
            {onDismiss && (
              <button type="button" onClick={onDismiss} className="shrink-0 opacity-80 hover:opacity-100 cursor-pointer bg-transparent border-none p-0 text-inherit">
                <RiCloseLine size={16} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

registerComponent({
  name: 'Toast',
  category: 'feedback',
  description: 'Brief, non-blocking notification at screen bottom (Material snackbar pattern). Dark background, white text. Auto-positioned fixed at bottom. Use for copy confirmations, save success, and transient alerts.',
  component: Toast,
  variants: ['success', 'error', 'info', 'warning'],
  props: [
    { name: 'variant', type: '"success" | "error" | "info" | "warning"', required: false, defaultValue: 'info', description: 'Toast type' },
    { name: 'message', type: 'string', required: true, description: 'Message text' },
    { name: 'visible', type: 'boolean', required: false, defaultValue: 'true', description: 'Visibility' },
    { name: 'onDismiss', type: '() => void', required: false, description: 'Dismiss handler' },
  ],
})
