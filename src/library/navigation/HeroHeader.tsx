import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { registerComponent } from '../registry'

export interface HeroHeaderProps {
  imageSrc: string
  onBack?: () => void
  rightAction?: ReactNode
  height?: number
  className?: string
}

export default function HeroHeader({
  imageSrc,
  onBack,
  rightAction,
  height = 164,
  className = '',
}: HeroHeaderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height, maxHeight: 340 }}
    >
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="relative flex items-center justify-between pt-[var(--safe-area-top,0px)] px-[var(--token-spacing-lg)]">
        <div className="flex flex-1 items-center">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-[40px] h-[40px] flex items-center justify-center rounded-[var(--token-radius-full)] bg-interactive-secondary hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} className="text-content-primary" />
            </button>
          )}
        </div>
        {rightAction && (
          <div className="flex items-center gap-[12px]">{rightAction}</div>
        )}
      </div>
    </div>
  )
}

registerComponent({
  name: 'HeroHeader',
  category: 'navigation',
  description: 'Hero image header with overlaid back button and optional actions.',
  component: HeroHeader,
  props: [
    { name: 'imageSrc', type: 'string', required: true, description: 'Hero background image URL' },
    { name: 'onBack', type: '() => void', required: false, description: 'Back button handler' },
    { name: 'rightAction', type: 'ReactNode', required: false, description: 'Right action element' },
    { name: 'height', type: 'number', required: false, defaultValue: '164', description: 'Header height in pixels' },
  ],
})
