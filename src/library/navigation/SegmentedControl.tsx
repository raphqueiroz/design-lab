import { motion } from 'framer-motion'
import { registerComponent } from '../registry'

export interface SegmentedControlProps {
  segments: string[]
  activeIndex: number
  onChange: (index: number) => void
  className?: string
}

export default function SegmentedControl({
  segments,
  activeIndex,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div
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
  description: 'Tab switcher with animated indicator.',
  component: SegmentedControl,
  props: [
    { name: 'segments', type: 'string[]', required: true, description: 'Segment labels' },
    { name: 'activeIndex', type: 'number', required: true, description: 'Active segment index' },
    { name: 'onChange', type: '(index: number) => void', required: true, description: 'Change handler' },
  ],
})
