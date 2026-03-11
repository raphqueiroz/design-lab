import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { RiLoaderLine } from '@remixicon/react'
import { registerComponent } from '../registry'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children: ReactNode
  subtitle?: string
  onPress?: () => void
  className?: string
  style?: React.CSSProperties
}

const variantStyles = {
  primary:
    'bg-[var(--color-interactive-default)] text-[var(--color-content-primary)] font-semibold hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-pressed)]',
  secondary:
    'bg-[var(--color-interactive-primary)] text-[var(--color-content-inverse)] font-semibold hover:opacity-80 active:opacity-70',
  ghost:
    'bg-transparent text-[var(--color-interactive-primary)] font-medium hover:bg-[var(--color-interactive-primary)]/5 active:bg-[var(--color-interactive-primary)]/10',
  destructive:
    'bg-[var(--color-error)] text-white font-medium hover:bg-[#B91C1C] active:bg-[#991B1B]',
} as const

const primarySizeStyles = {
  sm: 'h-[36px] px-[16px] text-[14px] rounded-full',
  md: 'h-[56px] px-[24px] text-[16px] tracking-[-0.16px] rounded-[12px]',
  lg: 'h-[56px] px-[24px] text-[16px] tracking-[-0.16px] rounded-[12px]',
} as const

const sizeStyles = {
  sm: 'h-[36px] px-[16px] text-[13px] rounded-[8px]',
  md: 'h-[44px] px-[24px] text-[15px] rounded-[12px]',
  lg: 'h-[52px] px-[32px] text-[17px] rounded-[12px]',
} as const

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  subtitle,
  onPress,
  className = '',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      data-component="Button"
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onPress}
      disabled={isDisabled}
      style={style}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-[var(--token-transition-fast)]
        ${variantStyles[variant]}
        ${variant === 'primary' ? primarySizeStyles[size] : sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <RiLoaderLine size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="animate-spin" />
      ) : subtitle ? (
        <span className="flex justify-between w-full">
          <span>{children}</span>
          <span className="text-sm opacity-80">{subtitle}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}

registerComponent({
  name: 'Button',
  category: 'actions',
  description: 'Triggers an action. `primary` for main action, `secondary` for alternatives, `ghost` for inline, `destructive` for irreversible.',
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
    { name: 'subtitle', type: 'string', required: false, description: 'Secondary text shown to the right' },
    { name: 'onPress', type: '() => void', required: false, description: 'Click handler' },
  ],
})
