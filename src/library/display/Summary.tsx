import type { ReactNode } from 'react'
import { RiCheckLine, RiTimeLine } from '@remixicon/react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'

export interface SummaryItem {
  icon: ReactNode
  title: string
  description?: string | ReactNode
  status?: 'none' | 'done' | 'pending'
}

export interface SummaryProps {
  data: SummaryItem[]
  header?: string
  className?: string
}

export default function Summary({
  data,
  header,
  className,
}: SummaryProps) {
  return (
    <div data-component="Summary" className={cn('w-full flex flex-col gap-[var(--token-spacing-md)] py-[var(--token-spacing-4)]', className)}>
      {header && (
        <span className="text-[length:var(--token-font-size-body-lg)] font-semibold leading-[var(--token-line-height-body-lg)] text-[var(--color-content-primary)]">
          {header}
        </span>
      )}
      {data.map((item, idx) => {
        const isDone = item.status === 'done'
        const isPending = item.status === 'pending'
        return (
          <div key={idx} className="flex items-start gap-[var(--token-spacing-3)]">
            <span className={cn(
              'shrink-0 flex items-center justify-center',
              (isDone || isPending) && 'opacity-40',
            )}>
              {item.icon}
            </span>
            <div className="flex flex-col gap-[var(--token-spacing-1)]">
              <span className={cn(
                'text-[length:var(--token-font-size-body-lg)] font-semibold leading-[var(--token-line-height-body-md)] tracking-[-0.16px] inline-flex items-center gap-[var(--token-spacing-1)]',
                isDone ? 'text-[var(--color-content-tertiary)]' : isPending ? 'text-[var(--color-content-secondary)]' : 'text-[var(--color-content-primary)]',
              )}>
                {item.title}
                {isDone && <RiCheckLine size={20} className="text-[var(--color-feedback-success)]" />}
                {isPending && <RiTimeLine size={20} className="text-[var(--color-content-tertiary)]" />}
              </span>
              {item.description && (
                typeof item.description === 'string' ? (
                  <span className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-sm)] text-[var(--color-content-secondary)]">
                    {item.description}
                  </span>
                ) : item.description
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

registerComponent({
  name: 'Summary',
  category: 'presentation',
  description: 'List of steps or tasks with icons and status indicators. Use for instructions, onboarding steps, and checklists.',
  component: Summary,
  props: [
    { name: 'data', type: 'SummaryItem[]', required: true, description: 'Array of items with icon, title, description, and optional status (none, done, pending)' },
    { name: 'header', type: 'string', required: false, description: 'Optional header text above the list' },
  ],
})
