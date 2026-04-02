import type { ReactNode } from 'react'
import { RiArrowRightSLine } from '@remixicon/react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'

export interface ListItemProps {
  title: string
  subtitle?: string
  left?: ReactNode
  right?: ReactNode
  trailing?: ReactNode
  onPress?: () => void
  disabled?: boolean
  inverted?: boolean
  className?: string
}

export default function ListItem({
  title,
  subtitle,
  left,
  right,
  trailing,
  onPress,
  disabled = false,
  inverted = false,
  className,
}: ListItemProps) {
  const showTrailing = trailing !== undefined ? trailing !== null : !!onPress
  const trailingContent = trailing ?? (
    onPress ? <RiArrowRightSLine size={20} className="text-[var(--color-content-tertiary)]" /> : null
  )

  const content = (
    <div className="flex items-center gap-[var(--token-spacing-3)] w-full">
      {left && (
        <div className="shrink-0 flex items-center justify-center">
          {left}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {inverted ? (
          <>
            <span data-text-id={title} className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-[var(--color-content-secondary)] line-clamp-2">
              {title}
            </span>
            {subtitle && (
              <span data-text-id={subtitle} className="text-[length:var(--token-font-size-body-lg)] font-semibold leading-[var(--token-line-height-body-lg)] tracking-[-0.18px] text-[var(--color-content-primary)] truncate">
                {subtitle}
              </span>
            )}
          </>
        ) : (
          <>
            <span data-text-id={title} className="text-[length:var(--token-font-size-body-lg)] font-semibold leading-[var(--token-line-height-body-lg)] tracking-[-0.18px] text-[var(--color-content-primary)] truncate">
              {title}
            </span>
            {subtitle && (
              <span data-text-id={subtitle} className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-[var(--color-content-secondary)] line-clamp-2">
                {subtitle}
              </span>
            )}
          </>
        )}
      </div>

      {right && (
        <div className="shrink-0 flex items-center">
          {right}
        </div>
      )}

      {showTrailing && (
        <div className="shrink-0 flex items-center">
          {trailingContent}
        </div>
      )}
    </div>
  )

  const baseClasses = 'bg-[var(--color-surface-primary)] rounded-[var(--token-radius-lg)] py-[var(--token-spacing-4)]'

  if (onPress) {
    return (
      <button
        data-component="ListItem"
        type="button"
        onClick={onPress}
        disabled={disabled}
        className={cn(
          'w-full flex items-start text-left transition-colors',
          baseClasses,
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-[var(--color-surface-shade)]',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      data-component="ListItem"
      className={cn(
        'w-full flex items-start',
        baseClasses,
        disabled && 'opacity-50',
        className,
      )}
    >
      {content}
    </div>
  )
}

registerComponent({
  name: 'ListItem',
  category: 'navigation',
  description: 'Row of content with flexible slots. Use for navigation, settings, asset lists, and any row-based layout.',
  component: ListItem,
  props: [
    { name: 'title', type: 'string', required: true, description: 'Primary text' },
    { name: 'subtitle', type: 'string', required: false, description: 'Secondary text' },
    { name: 'left', type: 'ReactNode', required: false, description: 'Left slot: avatar, icon, checkbox, radio, etc.' },
    { name: 'right', type: 'ReactNode', required: false, description: 'Right slot 1: icon, button, tag, toggle, text, etc.' },
    { name: 'trailing', type: 'ReactNode', required: false, description: 'Right slot 2: chevron (auto-shown when onPress is set), pass null to hide' },
    { name: 'onPress', type: '() => void', required: false, description: 'Click handler — renders as button and auto-adds chevron trailing' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
    { name: 'inverted', type: 'boolean', required: false, defaultValue: 'false', description: 'Swap title/subtitle emphasis (subtitle becomes bold)' },
  ],
})
