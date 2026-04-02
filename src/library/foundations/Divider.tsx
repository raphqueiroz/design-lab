import { registerComponent } from '../registry'

export interface DividerProps {
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

const spacingMap = {
  sm: 'my-[var(--token-spacing-sm)]',
  md: 'my-[8px]',
  lg: 'my-[var(--token-spacing-lg)]',
} as const

export default function Divider({ spacing = 'md', className = '' }: DividerProps) {
  return (
    <div
      data-component="Divider"
      className={`h-px w-full bg-border-default ${spacingMap[spacing]} ${className}`}
    />
  )
}

registerComponent({
  name: 'Divider',
  category: 'foundations-removed',
  description: 'Thin horizontal line to separate content sections. Use between groups of list items or form fields.',
  component: Divider,
  props: [
    { name: 'spacing', type: '"sm" | "md" | "lg"', required: false, defaultValue: 'md', description: 'Vertical spacing around divider' },
  ],
})
