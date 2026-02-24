import { registerComponent } from '../registry'

export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const sizeMap = {
  xs: 'h-[var(--token-spacing-xs)]',
  sm: 'h-[var(--token-spacing-sm)]',
  md: 'h-[var(--token-spacing-md)]',
  lg: 'h-[var(--token-spacing-lg)]',
  xl: 'h-[var(--token-spacing-xl)]',
  '2xl': 'h-[var(--token-spacing-2xl)]',
} as const

export default function Spacer({ size = 'md', className = '' }: SpacerProps) {
  return <div className={`w-full ${sizeMap[size]} ${className}`} aria-hidden="true" />
}

registerComponent({
  name: 'Spacer',
  category: 'foundations',
  description: 'Consistent vertical spacing between elements.',
  component: Spacer,
  sizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
  props: [
    { name: 'size', type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl"', required: false, defaultValue: 'md', description: 'Spacing size' },
  ],
})
