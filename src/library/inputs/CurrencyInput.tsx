import { type ChangeEvent } from 'react'
import { registerComponent } from '../registry'

export interface CurrencyInputProps {
  label?: string
  currency?: string
  value?: string
  onChange?: (value: string) => void
  helperText?: string
  error?: string
  disabled?: boolean
  className?: string
}

function formatCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const cents = parseInt(digits, 10)
  return (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function toRawDigits(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export default function CurrencyInput({
  label,
  currency = 'R$',
  value = '',
  onChange,
  helperText,
  error,
  disabled = false,
  className = '',
}: CurrencyInputProps) {
  const hasError = !!error
  const borderColor = hasError
    ? 'border-error focus-within:border-error'
    : 'border-border-default focus-within:border-interactive-default'

  const displayValue = formatCurrency(value)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = toRawDigits(e.target.value)
    onChange?.(raw)
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
          h-[56px] px-[var(--token-spacing-md)]
          bg-surface-primary border rounded-[var(--token-radius-md)]
          transition-colors duration-[var(--token-transition-fast)]
          ${borderColor}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : ''}
        `}
      >
        <span className="text-[length:var(--token-font-size-heading-md)] font-semibold text-text-secondary">
          {currency}
        </span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0.00"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          className="
            flex-1 bg-transparent outline-none
            text-[length:var(--token-font-size-heading-md)] leading-[var(--token-line-height-heading-md)] font-semibold
            text-text-primary placeholder:text-text-tertiary
          "
        />
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
  name: 'CurrencyInput',
  category: 'inputs',
  description: 'Formatted number input with currency symbol for financial values.',
  component: CurrencyInput,
  props: [
    { name: 'label', type: 'string', required: false, description: 'Input label' },
    { name: 'currency', type: 'string', required: false, defaultValue: 'R$', description: 'Currency symbol' },
    { name: 'value', type: 'string', required: false, description: 'Raw digit string' },
    { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change handler (raw digits)' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below input' },
    { name: 'error', type: 'string', required: false, description: 'Error message' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable input' },
  ],
})
