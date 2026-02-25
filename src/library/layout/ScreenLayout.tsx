import type { ReactNode } from 'react'
import { registerComponent } from '../registry'

export interface ScreenLayoutProps {
  header?: ReactNode
  children: ReactNode
  bottomCTA?: ReactNode
  className?: string
}

export default function ScreenLayout({
  header,
  children,
  bottomCTA,
  className = '',
}: ScreenLayoutProps) {
  return (
    <div className={`flex flex-col h-full bg-surface-primary ${className}`}>
      {header && <div className="shrink-0">{header}</div>}
      <div className="flex-1 overflow-y-auto">{children}</div>
      {bottomCTA && (
        <div className="shrink-0 p-[var(--token-spacing-md)] bg-surface-primary border-t border-border-default">
          {bottomCTA}
        </div>
      )}
    </div>
  )
}

registerComponent({
  name: 'ScreenLayout',
  category: 'layout',
  description: 'Header + scrollable content + optional sticky bottom CTA.',
  component: ScreenLayout,
  props: [
    { name: 'header', type: 'ReactNode', required: false, description: 'Fixed header' },
    { name: 'children', type: 'ReactNode', required: true, description: 'Scrollable content' },
    { name: 'bottomCTA', type: 'ReactNode', required: false, description: 'Sticky bottom action' },
  ],
})
