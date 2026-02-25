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
    'bg-[#c8f91f] text-[#1d211a] font-semibold hover:bg-[#b8e61a] active:bg-[#a8d315]',
  secondary:
    'bg-[#1d211a] text-[#f9fafb] font-semibold hover:bg-[#2a2f26] active:bg-[#363b32]',
  ghost:
    'bg-transparent text-[#4d7c0f] font-medium hover:bg-[#4d7c0f]/5 active:bg-[#4d7c0f]/10',
  destructive:
    'bg-[#dc2626] text-white font-medium hover:bg-[#B91C1C] active:bg-[#991B1B]',
} as const

const primarySizeStyles = {
  sm: 'h-[36px] px-[16px] text-[14px] rounded-full',
  md: 'h-[44px] px-[24px] text-[16px] tracking-[-0.16px] rounded-[12px]',
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
        ${variant === 'primary' ? primarySizeStyles[size] : sizeStyles[size]}
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
