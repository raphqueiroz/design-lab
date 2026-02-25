import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { registerComponent } from '../registry'

export interface ListItemProps {
  icon?: ReactNode
  label: string
  description?: string
  rightValue?: string
  showChevron?: boolean
  onPress?: () => void
  disabled?: boolean
  className?: string
}

export default function ListItem({
  icon,
  label,
  description,
  rightValue,
  showChevron = true,
  onPress,
  disabled = false,
  className = '',
}: ListItemProps) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { backgroundColor: 'var(--token-surface-secondary)' }}
      transition={{ duration: 0.15 }}
      onClick={onPress}
      disabled={disabled}
      className={`
        flex items-center w-full px-[var(--token-spacing-md)] py-[var(--token-spacing-3)]
        bg-transparent text-left
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && (
        <span className="shrink-0 mr-[var(--token-spacing-3)] p-[var(--token-spacing-3)] rounded-full bg-[var(--token-neutral-100)] text-text-secondary">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[length:16px] leading-[var(--token-line-height-body-md)] font-semibold text-text-primary truncate">
          {label}
        </p>
        {description && (
          <p className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-neutral-700 truncate">
            {description}
          </p>
        )}
      </div>
      {rightValue && (
        <span className="shrink-0 ml-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-md)] text-text-secondary">
          {rightValue}
        </span>
      )}
      {showChevron && (
        <ChevronRight size={18} className="shrink-0 ml-[var(--token-spacing-1)] text-text-tertiary" />
      )}
    </motion.button>
  )
}

registerComponent({
  name: 'ListItem',
  category: 'display',
  description: 'List row with icon, label, description, right value, and chevron.',
  component: ListItem,
  props: [
    { name: 'icon', type: 'ReactNode', required: false, description: 'Left icon' },
    { name: 'label', type: 'string', required: true, description: 'Primary text' },
    { name: 'description', type: 'string', required: false, description: 'Secondary text' },
    { name: 'rightValue', type: 'string', required: false, description: 'Right-aligned value' },
    { name: 'showChevron', type: 'boolean', required: false, defaultValue: 'true', description: 'Show right chevron' },
    { name: 'onPress', type: '() => void', required: false, description: 'Press handler' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
  ],
})
