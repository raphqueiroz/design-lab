import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { registerComponent } from '../registry'

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export default function Checkbox({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled) onChange?.(!checked)
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={disabled}
      className={`flex items-center gap-[var(--token-spacing-3)] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <motion.div
        animate={{
          backgroundColor: checked ? 'var(--token-interactive-default)' : 'transparent',
          borderColor: checked ? 'var(--token-interactive-default)' : 'var(--token-border-strong)',
        }}
        transition={{ duration: 0.15 }}
        className="w-[22px] h-[22px] rounded-[var(--token-radius-sm)] border-2 flex items-center justify-center shrink-0"
      >
        {checked && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15 }}>
            <Check size={14} color="var(--token-text-inverse)" strokeWidth={2.5} />
          </motion.div>
        )}
      </motion.div>
      {label && (
        <span className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] text-text-primary">
          {label}
        </span>
      )}
    </button>
  )
}

registerComponent({
  name: 'Checkbox',
  category: 'inputs',
  description: 'Checkbox with label and animated check mark.',
  component: Checkbox,
  props: [
    { name: 'checked', type: 'boolean', required: false, defaultValue: 'false', description: 'Whether checked' },
    { name: 'onChange', type: '(checked: boolean) => void', required: false, description: 'Toggle handler' },
    { name: 'label', type: 'string', required: false, description: 'Label text' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable interaction' },
  ],
})
