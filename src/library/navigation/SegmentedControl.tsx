import { useId, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'

export type SegmentItem = string | { label: string; icon?: ReactNode }

export interface SegmentedControlProps {
  segments: SegmentItem[]
  activeIndex: number
  onChange: (index: number) => void
  /** @deprecated pill is now the only style — this prop is ignored */
  variant?: 'default' | 'pill'
  className?: string
  style?: React.CSSProperties
}

function getLabel(seg: SegmentItem): string {
  return typeof seg === 'string' ? seg : seg.label
}

function getIcon(seg: SegmentItem): ReactNode | null {
  return typeof seg === 'string' ? null : (seg.icon ?? null)
}

export default function SegmentedControl({
  segments,
  activeIndex,
  onChange,
  className = '',
  style,
}: SegmentedControlProps) {
  const instanceId = useId()
  return (
    <div
      data-component="SegmentedControl"
      className={cn(
        'flex gap-[4px]',
        className,
      )}
      style={style}
    >
      {segments.map((seg, i) => {
        const label = getLabel(seg)
        const icon = getIcon(seg)
        const isActive = i === activeIndex

        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'relative flex items-center justify-center gap-[6px] border-none',
              'px-[16px] py-[8px] rounded-full',
              'text-[16px] font-semibold',
              'cursor-pointer',
              isActive ? 'text-white' : 'text-content-primary',
            )}
            style={{ background: 'transparent' }}
          >
            {isActive && (
              <motion.span
                layoutId={`seg-bg-${instanceId}`}
                className="absolute inset-0 bg-[var(--color-content-primary)] rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {icon && (
              <span className="relative z-10 flex items-center shrink-0">{icon}</span>
            )}
            <span className="relative z-10">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

registerComponent({
  name: 'SegmentedControl',
  category: 'navigation',
  description: 'Inline tab switcher for filtering or toggling views. Segments can be plain strings or objects with { label, icon }. Use for 2-4 mutually exclusive options within a screen.',
  component: SegmentedControl,
  props: [
    { name: 'segments', type: 'SegmentItem[]', required: true, description: 'Segment labels — string or { label, icon }' },
    { name: 'activeIndex', type: 'number', required: true, description: 'Active segment index' },
    { name: 'onChange', type: '(index: number) => void', required: true, description: 'Change handler' },
  ],
})
