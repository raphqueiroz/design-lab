import { type ChangeEvent, type ReactNode, useRef, useEffect } from 'react'
import { RiErrorWarningLine } from '@remixicon/react'
import { registerComponent } from '../registry'

const DEFAULT_TOKEN_ICON = 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png'

export interface CurrencyInputProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  /** Token avatar — URL string or ReactNode (e.g. web3icons SVG component) */
  tokenIcon?: string | ReactNode
  /** Currency symbol displayed before the value (e.g. "US$", "R$") */
  currencySymbol?: string
  /** Number of decimal places (default 2). Use 5 for crypto amounts. */
  decimals?: number
  /** Secondary converted value displayed below the amount (e.g. "≈ US$ 102,82") */
  secondaryValue?: string
  helperText?: string
  /** Formatted balance string displayed below the input (e.g. "US$ 1.250,00") */
  balance?: string
  /** Called when the balance text is tapped — typically fills max amount */
  onBalanceTap?: () => void
  /** When true, balance text turns red with an alert icon to indicate insufficient funds */
  balanceError?: boolean
  error?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

function formatCurrency(raw: string, decimals = 2): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  const divisor = Math.pow(10, decimals)
  const value = parseInt(digits, 10) / divisor
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function toRawDigits(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

/** Inter variable: open 4, 6, 9 (ss01) + flat-top 3 (cv05) + lining proportional numerals */
const digitFeatures = "'ss01' 1, 'cv05' 1, 'lnum' 1, 'pnum' 1"

/** Barlow Condensed for currency symbol */
const symbolFeatures = "'salt' 1, 'ordn' 1, 'kern' 0, 'calt' 0"

export default function CurrencyInput({
  label,
  value = '',
  onChange,
  tokenIcon = DEFAULT_TOKEN_ICON,
  currencySymbol,
  decimals = 2,
  secondaryValue,
  helperText,
  balance,
  onBalanceTap,
  balanceError = false,
  error,
  disabled = false,
  readOnly = false,
  className = '',
}: CurrencyInputProps) {
  const hasError = !!error
  const displayValue = formatCurrency(value, decimals)
  const hasValue = displayValue.length > 0
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  // Resize input width to match content so the symbol stays tight to the first digit
  useEffect(() => {
    if (inputRef.current && measureRef.current) {
      const text = displayValue || inputRef.current.placeholder
      measureRef.current.textContent = text
      inputRef.current.style.width = `${measureRef.current.offsetWidth + 4}px`
    }
  }, [displayValue])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = toRawDigits(e.target.value)
    onChange?.(raw)
  }

  const valueColor = hasValue ? 'text-content-primary' : 'text-content-tertiary'

  return (
    <div data-component="CurrencyInput" className={`flex flex-col gap-[8px] items-end pt-[6px] pb-[var(--token-spacing-4)] ${className}`}>
      {label && (
        <span className="text-[14px] font-medium leading-[22px] text-content-secondary">
          {label}
        </span>
      )}

      <div className={`flex items-center justify-between w-full ${disabled ? 'opacity-50' : ''}`}>
        {/* Token avatar */}
        {typeof tokenIcon === 'string' ? (
          <img
            src={tokenIcon}
            alt=""
            className="w-[40px] h-[40px] rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-[40px] h-[40px] shrink-0 flex items-center justify-center">
            {tokenIcon}
          </div>
        )}

        {/* Currency symbol + value — right-aligned, symbol floats next to first digit */}
        <div className="flex gap-[4px] items-start justify-end flex-1 min-w-0 overflow-hidden">
          {currencySymbol && (
            <span
              className={`shrink-0 text-[28px] font-medium leading-[40px] tracking-[-0.56px] uppercase ${valueColor}`}
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontFeatureSettings: symbolFeatures,
              }}
            >
              {currencySymbol}
            </span>
          )}

          {/* Hidden measurer — mirrors the input font to calculate width */}
          <span
            ref={measureRef}
            aria-hidden
            className="absolute invisible whitespace-pre text-[40px] font-bold leading-[40px]"
            style={{ fontFeatureSettings: digitFeatures }}
          />

          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            className={`bg-transparent outline-none text-[40px] font-bold leading-[40px] ${valueColor} placeholder:text-content-tertiary text-right`}
            style={{ fontFeatureSettings: digitFeatures }}
          />
        </div>
      </div>

      {secondaryValue && (
        <span className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-content-secondary text-right">
          {secondaryValue}
        </span>
      )}

      {balance && (
        <button
          type="button"
          onClick={onBalanceTap}
          disabled={!onBalanceTap}
          className={`flex items-center gap-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] ${balanceError ? 'text-[var(--color-feedback-critical)]' : 'text-content-tertiary'} ${onBalanceTap ? 'cursor-pointer underline decoration-dotted underline-offset-2' : ''}`}
        >
          {balanceError && <RiErrorWarningLine size={18} />}
          Saldo: {balance}
        </button>
      )}

      {(helperText || error) && (
        <span
          className={`text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] ${
            hasError ? 'text-error' : 'text-content-tertiary'
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
  description: 'Large currency display with token avatar and condensed currency symbol. Use for swap amounts, deposit/withdrawal values, and transfer entry.',
  component: CurrencyInput,
  props: [
    { name: 'label', type: 'string', required: false, description: 'Right-aligned label above the value (e.g., "Receba")' },
    { name: 'value', type: 'string', required: false, description: 'Raw digit string' },
    { name: 'onChange', type: '(value: string) => void', required: false, description: 'Change handler (raw digits)' },
    { name: 'tokenIcon', type: 'string', required: false, defaultValue: 'AVAX logo', description: 'URL for the token avatar' },
    { name: 'currencySymbol', type: 'string', required: false, description: 'Currency symbol before the value (e.g. "US$", "R$"). Rendered in Barlow Condensed, floats next to first digit.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below input' },
    { name: 'balance', type: 'string', required: false, description: 'Formatted balance string shown below the input (e.g. "US$ 1.250,00")' },
    { name: 'onBalanceTap', type: '() => void', required: false, description: 'Called when balance is tapped — typically fills max amount' },
    { name: 'balanceError', type: 'boolean', required: false, defaultValue: 'false', description: 'Turns balance text red with alert icon to indicate insufficient funds' },
    { name: 'error', type: 'string', required: false, description: 'Error message' },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: 'Disable input' },
    { name: 'readOnly', type: 'boolean', required: false, defaultValue: 'false', description: 'Read-only mode (no opacity change)' },
  ],
})
