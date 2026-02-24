import { useRef, type KeyboardEvent, type ChangeEvent } from 'react'
import { registerComponent } from '../registry'

export interface PinInputProps {
  length?: 4 | 5 | 6
  value?: string
  onChange?: (value: string) => void
  error?: string
  disabled?: boolean
  className?: string
}

export default function PinInput({
  length = 6,
  value = '',
  onChange,
  error,
  disabled = false,
  className = '',
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const hasError = !!error
  const digits = value.split('').slice(0, length)

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    const newValue = newDigits.join('')
    onChange?.(newValue)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const borderColor = hasError
    ? 'border-error'
    : 'border-border-default focus:border-interactive-default'

  return (
    <div className={`flex flex-col items-center gap-[var(--token-spacing-2)] ${className}`}>
      <div className="flex gap-[var(--token-spacing-2)]">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] ?? ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            className={`
              w-[48px] h-[56px] text-center
              text-[length:var(--token-font-size-heading-md)] font-semibold
              bg-surface-primary border rounded-[var(--token-radius-md)]
              outline-none transition-colors duration-[var(--token-transition-fast)]
              text-text-primary
              ${borderColor}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : ''}
            `}
          />
        ))}
      </div>
      {error && (
        <span className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] text-error">
          {error}
        </span>
      )}
    </div>
  )
}

registerComponent({
  name: 'PinInput',
  category: 'inputs',
  description: '4-6 digit code input for verification flows.',
  component: PinInput,
  props: [
    { name: 'length', type: '4 | 5 | 6', required: false, defaultValue: '6', description: 'Number of digits' },
    { name: 'value', type: 'string', required: false, description: 'Current pin string' },
    { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change handler' },
    { name: 'error', type: 'string', required: false, description: 'Error message' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable input' },
  ],
})
