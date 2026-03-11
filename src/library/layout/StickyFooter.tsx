import type { ReactNode } from 'react'
import { useLayout } from './LayoutProvider'
import { registerComponent } from '../registry'

export interface StickyFooterProps {
  children: ReactNode
}

export default function StickyFooter({ children }: StickyFooterProps) {
  const { isDesktop } = useLayout()

  if (isDesktop) {
    return (
      <div data-component="StickyFooter" className="shrink-0 px-[var(--token-spacing-6)] py-[var(--token-spacing-4)]">
        {children}
      </div>
    )
  }

  return (
    <div data-component="StickyFooter" className="relative shrink-0 px-[var(--token-spacing-6)] pt-[var(--token-spacing-4)] pb-[max(var(--token-spacing-4),var(--safe-area-bottom,0px))] bg-surface-primary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 -top-[16px] h-[16px] bg-gradient-to-t from-surface-primary to-transparent"
      />
      {children}
    </div>
  )
}

registerComponent({
  name: 'StickyFooter',
  category: 'layout',
  description: 'Bottom action area. Sticky (fixed to bottom) on mobile, inline on desktop. Use inside BaseLayout as the last child.',
  component: StickyFooter,
  props: [
    { name: 'children', type: 'ReactNode', required: true, description: 'Footer content — typically a Button or button group' },
  ],
})
