/**
 * NavRail — Vertical icon bar for top-level navigation.
 * Sits on the far left of the shell, full height.
 */

import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiPaintBrush } from 'react-icons/hi2'
import {
  RiPuzzleFill, RiFlowChart,
} from '@remixicon/react'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  { to: '/flows', label: 'Flows', icon: <RiFlowChart size={20} /> },
  { to: '/components', label: 'Library', icon: <RiPuzzleFill size={20} /> },
]

function NavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative">
      <Link
        to={item.to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          flex items-center justify-center
          w-[36px] h-[36px] rounded-[8px]
          no-underline transition-colors
          ${isActive
            ? 'bg-shell-hover text-shell-text'
            : 'text-shell-text-tertiary hover:text-shell-text-secondary hover:bg-shell-hover/50'
          }
        `}
      >
        {item.icon}
      </Link>
      {hovered && (
        <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 px-[8px] py-[4px] bg-shell-surface border border-shell-border rounded-[6px] shadow-lg whitespace-nowrap text-[12px] text-shell-text pointer-events-none">
          {item.label}
        </div>
      )}
    </div>
  )
}

export default function NavRail() {
  const location = useLocation()
  const activePrefix = navItems.find((item) => location.pathname.startsWith(item.to))?.to ?? '/flows'

  return (
    <nav className="w-[48px] h-full shrink-0 flex flex-col items-center py-[10px] gap-[4px] bg-shell-bg border-r border-shell-border">
      {/* Logo */}
      <div className="flex items-center justify-center w-[36px] h-[36px] mb-[8px] text-white">
        <HiPaintBrush size={20} />
      </div>

      {navItems.map((item) => (
        <NavItem key={item.to} item={item} isActive={activePrefix === item.to} />
      ))}
    </nav>
  )
}
