import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { registerComponent } from '../registry'

export interface HeaderProps {
  title?: string
  onBack?: () => void
  rightAction?: ReactNode
  className?: string
}

export default function Header({
  title,
  onBack,
  rightAction,
  className = '',
}: HeaderProps) {
  return (
    <div
      className={`
        flex flex-col items-start justify-start gap-2 h-fit
        px-[var(--token-spacing-md)]
        ${className}
      `}
    >
      <div className="w-[40px] shrink-0 bg-neutral-100 rounded-full">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <ArrowLeft size={22} className="text-content-primary" />
          </button>
        )}
      </div>
      <h1 className="flex-1 text-center text-[length:var(--token-font-size-heading-lg)] leading-[var(--token-line-height-heading-lg)] font-semibold tracking-[-1px] text-content-primary truncate">
        {title}
      </h1>
      <div className="w-[40px] shrink-0 flex justify-end">
        {rightAction}
      </div>
    </div>
  )
}

registerComponent({
  name: 'Header',
  category: 'navigation',
  description: 'App header with back button, title, and right action.',
  component: Header,
  props: [
    { name: 'title', type: 'string', required: false, description: 'Header title' },
    { name: 'onBack', type: '() => void', required: false, description: 'Back button handler' },
    { name: 'rightAction', type: 'ReactNode', required: false, description: 'Right action element' },
  ],
})
