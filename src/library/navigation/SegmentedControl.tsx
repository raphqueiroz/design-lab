import { motion } from 'framer-motion'
import { registerComponent } from '../registry'

export interface SegmentedControlProps {
  segments: string[]
  activeIndex: number
  onChange: (index: number) => void
  variant?: 'default' | 'pill'
  className?: string
}

export default function SegmentedControl({
  segments,
  activeIndex,
  onChange,
  variant = 'default',
  className = '',
}: SegmentedControlProps) {
  if (variant === 'pill') {
    return (
      <div
        data-component="SegmentedControl"
        className={`flex gap-[var(--token-spacing-2)] ${className}`}
      >
        {segments.map((seg, i) => (
          <button
            key={seg}
            type="button"
            onClick={() => onChange(i)}
            className={`
              relative px-[16px] py-[8px] rounded-[31px]
              text-[length:var(--token-font-size-body)] leading-[var(--token-line-height-body)] font-semibold
              tracking-[0.175px] cursor-pointer text-content-primary
            `}
          >
            {i === activeIndex && (
              <motion.span
                layoutId={`pill-bg-${className}`}
                className="absolute inset-0 bg-surface-secondary rounded-[31px]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{seg}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      data-component="SegmentedControl"
      className={`
        relative flex p-[2px]
        bg-surface-secondary rounded-[var(--token-radius-md)]
        ${className}
      `}
    >
      <motion.div
        className="absolute top-[2px] bottom-[2px] bg-surface-primary rounded-[10px] shadow-sm"
        initial={false}
        animate={{
          left: `calc(${(activeIndex / segments.length) * 100}% + 2px)`,
          width: `calc(${100 / segments.length}% - 4px)`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      {segments.map((seg, i) => (
        <button
          key={seg}
          type="button"
          onClick={() => onChange(i)}
          className={`
            relative z-10 flex-1 py-[var(--token-spacing-2)]
            text-center text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium
            transition-colors duration-[var(--token-transition-fast)] cursor-pointer
            ${i === activeIndex ? 'text-content-primary' : 'text-content-secondary'}
          `}
        >
          {seg}
        </button>
      ))}
    </div>
  )
}

registerComponent({
  name: 'SegmentedControl',
  category: 'navigation',
  description: 'Inline tab switcher for filtering or toggling views. Use for 2-4 mutually exclusive options within a screen.',
  component: SegmentedControl,
  props: [
    { name: 'segments', type: 'string[]', required: true, description: 'Segment labels' },
    { name: 'activeIndex', type: 'number', required: true, description: 'Active segment index' },
    { name: 'onChange', type: '(index: number) => void', required: true, description: 'Change handler' },
  ],
})
