import { Info } from 'lucide-react'
import { registerComponent } from '../registry'

export interface SavingsCardProps {
  label: string
  amount: string
  actionLabel?: string
  onAction?: () => void
  onPress?: () => void
  onInfo?: () => void
  backgroundSrc: string
  className?: string
}

export default function SavingsCard({
  label,
  amount,
  actionLabel,
  onAction,
  onPress,
  onInfo,
  backgroundSrc,
  className = '',
}: SavingsCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--token-radius-lg)] px-[var(--token-spacing-md)] py-[var(--token-spacing-md)] flex flex-col justify-between ${className}`}
      style={{ minHeight: 171 }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[var(--token-radius-lg)] pointer-events-none">
        <img
          src={backgroundSrc}
          alt=""
          className="absolute h-full left-[-47%] top-0 w-[157%] max-w-none object-cover"
        />
      </div>

      {onInfo && (
        <button
          type="button"
          onClick={onInfo}
          className="absolute top-[var(--token-spacing-md)] right-[var(--token-spacing-md)] w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-interactive-secondary cursor-pointer"
        >
          <Info size={24} className="text-content-primary" />
        </button>
      )}

      <div
        className={`relative flex flex-col gap-[4px] ${onPress ? 'cursor-pointer' : ''}`}
        onClick={onPress}
        role={onPress ? 'button' : undefined}
        tabIndex={onPress ? 0 : undefined}
      >
        <span className="text-[12px] leading-[1.5] font-medium text-white tracking-[0.12px]">
          {label}
        </span>
        <span
          className="text-[42px] leading-[48px] font-semibold text-white tracking-[-2.1px] tabular-nums"
          style={{ fontFeatureSettings: "'ss01' 1" }}
        >
          {amount}
        </span>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="relative mt-auto w-fit bg-[var(--token-content-primary)] text-white text-[14px] leading-[22px] font-semibold px-[14px] py-[6px] rounded-[var(--token-radius-full)] cursor-pointer hover:opacity-90 transition-opacity"
          style={{ fontFeatureSettings: "'ss01' 1" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

registerComponent({
  name: 'SavingsCard',
  category: 'display',
  description: 'Promotional card showing savings amount with background image and action button.',
  component: SavingsCard,
  props: [
    { name: 'label', type: 'string', required: true, description: 'Small label above the amount' },
    { name: 'amount', type: 'string', required: true, description: 'Formatted amount string' },
    { name: 'actionLabel', type: 'string', required: false, description: 'Button label' },
    { name: 'onAction', type: '() => void', required: false, description: 'Action button handler' },
    { name: 'onPress', type: '() => void', required: false, description: 'Tap handler for the amount area' },
    { name: 'onInfo', type: '() => void', required: false, description: 'Info button handler' },
    { name: 'backgroundSrc', type: 'string', required: true, description: 'Background image URL' },
  ],
})
