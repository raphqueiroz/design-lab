import { motion } from 'framer-motion'
import { registerComponent } from '../registry'

export interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export default function Toggle({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}: ToggleProps) {
  const handlePress = () => {
    if (!disabled) onChange?.(!checked)
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={disabled}
      className={`flex items-center justify-between gap-[var(--token-spacing-3)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {label && (
        <span className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] text-text-primary">
          {label}
        </span>
      )}
      <motion.div
        animate={{
          backgroundColor: checked ? 'var(--token-interactive-default)' : 'var(--token-neutral-300)',
        }}
        transition={{ duration: 0.2 }}
        className="relative w-[50px] h-[30px] rounded-[var(--token-radius-full)] shrink-0"
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] w-[26px] h-[26px] rounded-[var(--token-radius-full)] bg-white shadow-sm"
        />
      </motion.div>
    </button>
  )
}

registerComponent({
  name: 'Toggle',
  category: 'inputs',
  description: 'Toggle switch with animated thumb.',
  component: Toggle,
  props: [
    { name: 'checked', type: 'boolean', required: false, defaultValue: 'false', description: 'Whether on' },
    { name: 'onChange', type: '(checked: boolean) => void', required: false, description: 'Toggle handler' },
    { name: 'label', type: 'string', required: false, description: 'Label text' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
  ],
})
