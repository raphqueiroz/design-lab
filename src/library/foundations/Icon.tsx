import type { LucideIcon } from 'lucide-react'
import { registerComponent } from '../registry'

export interface IconProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

export default function Icon({ icon: LucideIcon, size = 'md', color, className = '' }: IconProps) {
  const px = sizeMap[size]
  const colorStyle = color ? `var(--token-${color})` : 'currentColor'

  return <LucideIcon size={px} color={colorStyle} className={className} strokeWidth={1.75} />
}

registerComponent({
  name: 'Icon',
  category: 'foundations',
  description: 'Wrapper for Lucide icons with size tokens.',
  component: Icon,
  sizes: ['sm', 'md', 'lg'],
  props: [
    { name: 'icon', type: 'LucideIcon', required: true, description: 'Lucide icon component' },
    { name: 'size', type: '"sm" | "md" | "lg"', required: false, defaultValue: 'md', description: 'Icon size' },
    { name: 'color', type: 'string', required: false, description: 'Token color name' },
  ],
})
