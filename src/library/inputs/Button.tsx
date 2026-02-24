import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { registerComponent } from '../registry'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children: ReactNode
  onPress?: () => void
  className?: string
}

const variantStyles = {
  primary:
    'bg-interactive-default text-text-inverse hover:bg-interactive-hover active:bg-interactive-pressed',
  secondary:
    'bg-surface-primary text-text-primary border border-border-default hover:bg-surface-secondary active:bg-neutral-200',
  ghost:
    'bg-transparent text-interactive-default hover:bg-brand-50 active:bg-brand-100',
  destructive:
    'bg-error text-text-inverse hover:bg-[#B91C1C] active:bg-[#991B1B]',
} as const

const sizeStyles = {
  sm: 'h-[36px] px-[var(--token-spacing-md)] text-[length:var(--token-font-size-body-sm)] rounded-[var(--token-radius-sm)]',
  md: 'h-[44px] px-[var(--token-spacing-lg)] text-[length:var(--token-font-size-body-md)] rounded-[var(--token-radius-md)]',
  lg: 'h-[52px] px-[var(--token-spacing-xl)] text-[length:var(--token-font-size-body-lg)] rounded-[var(--token-radius-md)]',
} as const

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onPress,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onPress}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-[var(--token-transition-fast)]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  )
}

registerComponent({
  name: 'Button',
  category: 'inputs',
  description: 'Primary action button with variants, sizes, loading, and disabled states.',
  component: Button,
  variants: ['primary', 'secondary', 'ghost', 'destructive'],
  sizes: ['sm', 'md', 'lg'],
  props: [
    { name: 'variant', type: '"primary" | "secondary" | "ghost" | "destructive"', required: false, defaultValue: 'primary', description: 'Visual style' },
    { name: 'size', type: '"sm" | "md" | "lg"', required: false, defaultValue: 'md', description: 'Button size' },
    { name: 'loading', type: 'boolean', required: false, defaultValue: 'false', description: 'Show loading spinner' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
    { name: 'fullWidth', type: 'boolean', required: false, defaultValue: 'false', description: 'Stretch to full width' },
    { name: 'children', type: 'ReactNode', required: true, description: 'Button label' },
    { name: 'onPress', type: '() => void', required: false, description: 'Click handler' },
  ],
})
