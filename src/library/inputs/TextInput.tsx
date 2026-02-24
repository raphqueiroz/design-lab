import { type ChangeEvent } from 'react'
import type { ReactNode } from 'react'
import { registerComponent } from '../registry'

export interface TextInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  helperText?: string
  error?: string
  disabled?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  className?: string
}

export default function TextInput({
  label,
  placeholder,
  value,
  onChange,
  helperText,
  error,
  disabled = false,
  prefix,
  suffix,
  className = '',
}: TextInputProps) {
  const hasError = !!error
  const borderColor = hasError
    ? 'border-error focus-within:border-error'
    : 'border-border-default focus-within:border-interactive-default'

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className={`flex flex-col gap-[var(--token-spacing-1)] ${className}`}>
      {label && (
        <label className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-medium text-text-primary">
          {label}
        </label>
      )}
      <div
        className={`
          flex items-center gap-[var(--token-spacing-2)]
          h-[48px] px-[var(--token-spacing-md)]
          bg-surface-primary border rounded-[var(--token-radius-md)]
          transition-colors duration-[var(--token-transition-fast)]
          ${borderColor}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : ''}
        `}
      >
        {prefix && <span className="text-text-tertiary shrink-0">{prefix}</span>}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="
            flex-1 bg-transparent outline-none
            text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)]
            text-text-primary placeholder:text-text-tertiary
          "
        />
        {suffix && <span className="text-text-tertiary shrink-0">{suffix}</span>}
      </div>
      {(helperText || error) && (
        <span
          className={`text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] ${
            hasError ? 'text-error' : 'text-text-tertiary'
          }`}
        >
          {error ?? helperText}
        </span>
      )}
    </div>
  )
}

registerComponent({
  name: 'TextInput',
  category: 'inputs',
  description: 'Text input with label, helper text, error state, prefix/suffix.',
  component: TextInput,
  props: [
    { name: 'label', type: 'string', required: false, description: 'Input label' },
    { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text' },
    { name: 'value', type: 'string', required: false, description: 'Input value' },
    { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change handler' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below input' },
    { name: 'error', type: 'string', required: false, description: 'Error message (overrides helper)' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable input' },
    { name: 'prefix', type: 'ReactNode', required: false, description: 'Left content' },
    { name: 'suffix', type: 'ReactNode', required: false, description: 'Right content' },
  ],
})
