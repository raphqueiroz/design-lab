import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { registerComponent } from '../registry'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  label?: string
  placeholder?: string
  options?: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export default function Select({
  label,
  placeholder = 'Select...',
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasError = !!error
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const borderColor = hasError
    ? 'border-error'
    : open
      ? 'border-interactive-default'
      : 'border-border-default'

  return (
    <div ref={ref} className={`relative flex flex-col gap-[var(--token-spacing-1)] ${className}`}>
      {label && (
        <label className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium text-text-primary">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`
          flex items-center justify-between
          h-[48px] px-[var(--token-spacing-md)]
          bg-surface-primary border rounded-[var(--token-radius-md)]
          transition-colors duration-[var(--token-transition-fast)]
          ${borderColor}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : 'cursor-pointer'}
        `}
      >
        <span
          className={`text-[length:var(--token-font-size-body-md)] ${
            selected ? 'text-text-primary' : 'text-text-tertiary'
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-text-tertiary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-full left-0 right-0 z-50 mt-[var(--token-spacing-1)]
              bg-surface-elevated border border-border-default rounded-[var(--token-radius-md)]
              shadow-md overflow-hidden
            "
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value)
                  setOpen(false)
                }}
                className={`
                  w-full px-[var(--token-spacing-md)] py-[var(--token-spacing-3)]
                  text-left text-[length:var(--token-font-size-body-md)]
                  transition-colors duration-[var(--token-transition-fast)]
                  ${option.value === value ? 'bg-brand-50 text-interactive-default' : 'text-text-primary hover:bg-surface-secondary'}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <span className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] text-error">
          {error}
        </span>
      )}
    </div>
  )
}

registerComponent({
  name: 'Select',
  category: 'inputs',
  description: 'Dropdown select with animated open/close.',
  component: Select,
  props: [
    { name: 'label', type: 'string', required: false, description: 'Input label' },
    { name: 'placeholder', type: 'string', required: false, defaultValue: 'Select...', description: 'Placeholder text' },
    { name: 'options', type: 'SelectOption[]', required: false, description: 'List of options' },
    { name: 'value', type: 'string', required: false, description: 'Selected value' },
    { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change handler' },
    { name: 'error', type: 'string', required: false, description: 'Error message' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
  ],
})
