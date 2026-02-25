import type { ReactNode } from 'react'
import { registerComponent } from '../registry'

export interface TabBarItem {
  id: string
  label: string
  icon: ReactNode
  activeIcon?: ReactNode
}

export interface TabBarProps {
  items: TabBarItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export default function TabBar({
  items,
  activeId,
  onChange,
  className = '',
}: TabBarProps) {
  return (
    <nav
      className={`
        flex items-end justify-around
        h-[56px] px-[var(--token-spacing-sm)]
        bg-surface-primary border-t border-border-default
        ${className}
      `}
    >
      {items.map((item) => {
        const active = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`
              flex flex-col items-center justify-center gap-[2px]
              flex-1 h-full pt-[var(--token-spacing-2)]
              transition-colors duration-[var(--token-transition-fast)]
              cursor-pointer
              ${active ? 'text-interactive-foreground' : 'text-content-tertiary'}
            `}
          >
            <span className="w-[22px] h-[22px] flex items-center justify-center">
              {active && item.activeIcon ? item.activeIcon : item.icon}
            </span>
            <span className="text-[length:10px] leading-[14px] font-medium">
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

registerComponent({
  name: 'TabBar',
  category: 'navigation',
  description: 'Bottom tab navigation bar for 4-5 items.',
  component: TabBar,
  props: [
    { name: 'items', type: 'TabBarItem[]', required: true, description: 'Tab items' },
    { name: 'activeId', type: 'string', required: true, description: 'Active tab ID' },
    { name: 'onChange', type: '(id: string) => void', required: true, description: 'Tab change handler' },
  ],
})
