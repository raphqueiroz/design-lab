import type { ReactNode } from 'react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'

export interface GroupHeaderProps {
  text: string
  subtitle?: string
  icon?: ReactNode
  className?: string
}

export default function GroupHeader({ text, subtitle, icon, className = '' }: GroupHeaderProps) {
  return (
    <div data-component="GroupHeader" className={cn('w-full pt-[var(--token-spacing-3)] pb-[var(--token-spacing-3)] mb-[var(--token-spacing-2)] border-b border-[var(--token-neutral-100)]', className)}>
      <div className="flex items-center gap-[var(--token-spacing-2)]">
        {icon && <span className="shrink-0 text-content-secondary">{icon}</span>}
        <div className="flex flex-col gap-[var(--token-spacing-1)]">
          <span className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium text-content-secondary">
            {text}
          </span>
          {subtitle && (
            <span className="text-[length:var(--token-font-size-body-xs)] leading-[var(--token-line-height-body-xs)] text-content-tertiary">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

registerComponent({
  name: 'GroupHeader',
  category: 'presentation',
  description: 'Section divider with label. Use to separate groups in lists and settings. Supports optional subtitle and icon.',
  component: GroupHeader,
  props: [
    { name: 'text', type: 'string', required: true, description: 'Header text' },
    { name: 'subtitle', type: 'string', required: false, description: 'Secondary description text' },
    { name: 'icon', type: 'ReactNode', required: false, description: 'Leading icon element' },
  ],
})
