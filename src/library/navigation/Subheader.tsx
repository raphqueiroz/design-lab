import { type ReactNode, useState } from 'react'
import { RiArrowUpDownLine } from '@remixicon/react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'
import Button from '../inputs/Button'

export interface SortOption {
  value: string
  label: string
}

export interface SubheaderProps {
  /** Section title text */
  text: string
  /** Description text below the title */
  description?: string
  /** Label for the trailing pill button */
  actionLabel?: string
  /** Callback when the pill button is pressed */
  onAction?: () => void
  /** Sort options — renders a sort pill with dropdown */
  sortOptions?: SortOption[]
  /** Currently selected sort value */
  sortValue?: string
  /** Called when a sort option is selected */
  onSortChange?: (value: string) => void
  /** Custom trailing content */
  right?: ReactNode
  /** Title size — 'lg' (default 24px heading) or 'sm' (16px body) */
  size?: 'lg' | 'sm'
  className?: string
}

export default function Subheader({ text, description, actionLabel, onAction, sortOptions, sortValue, onSortChange, right, size = 'lg', className }: SubheaderProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const activeSort = sortOptions?.find(o => o.value === sortValue)

  return (
    <div data-component="Subheader" className={cn('flex items-center justify-between px-[var(--token-spacing-6)] pt-[var(--token-spacing-3)] pb-[var(--token-spacing-4)]', className)}>
      <div className="flex flex-col">
        <span
          data-text-id={text}
          className={cn(
            'font-semibold text-[var(--color-content-primary)] leading-none',
            size === 'sm' ? 'text-[16px] tracking-normal text-[var(--color-content-secondary)]' : 'text-[24px] tracking-[-0.5px]',
          )}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {text}
        </span>
        {description && (
          <span className="text-[16px] text-[var(--color-content-secondary)] mt-1 pb-2">
            {description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-[var(--token-spacing-2)]">
        {right}
        {sortOptions && sortOptions.length > 0 && (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOpen(!sortOpen)}
              className="inline-flex items-center gap-1.5 h-[36px] px-[16px] rounded-full border-none cursor-pointer bg-[var(--color-content-primary)] text-white text-[13px] font-semibold"
            >
              <RiArrowUpDownLine size={15} />
              {activeSort?.label ?? 'Ordenar'}
            </motion.button>
            <AnimatePresence>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 z-40 rounded-2xl overflow-hidden min-w-[160px]"
                    style={{
                      background: 'var(--color-surface-primary)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                      border: '1px solid var(--color-neutral-100)',
                      transformOrigin: 'top right',
                    }}
                  >
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { onSortChange?.(opt.value); setSortOpen(false) }}
                        className="block w-full text-left px-4 py-3 border-none cursor-pointer transition-colors"
                        style={{
                          background: opt.value === sortValue ? 'var(--color-neutral-50)' : 'transparent',
                          color: opt.value === sortValue ? 'var(--color-content-primary)' : 'var(--color-content-secondary)',
                          fontSize: 15,
                          fontWeight: opt.value === sortValue ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onPress={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

registerComponent({
  name: 'Subheader',
  category: 'presentation',
  description: 'Large section title for page content areas. Supports trailing pill button, sort dropdown, and custom right content.',
  component: Subheader,
  props: [
    { name: 'text', type: 'string', required: true, description: 'Section title' },
    { name: 'description', type: 'string', required: false, description: 'Description text below the title' },
    { name: 'actionLabel', type: 'string', required: false, description: 'Trailing pill button label' },
    { name: 'onAction', type: '() => void', required: false, description: 'Pill button callback' },
    { name: 'sortOptions', type: 'SortOption[]', required: false, description: 'Sort dropdown options' },
    { name: 'sortValue', type: 'string', required: false, description: 'Current sort value' },
    { name: 'onSortChange', type: '(value: string) => void', required: false, description: 'Sort change callback' },
    { name: 'right', type: 'ReactNode', required: false, description: 'Custom trailing content' },
  ],
})
