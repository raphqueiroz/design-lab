import { type ReactNode, Children, isValidElement } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'
import { useLayout } from './LayoutProvider'
import StickyFooter from './StickyFooter'
import IconButton from '../inputs/IconButton'

export interface FeatureLayoutProps {
  /** Full-bleed header image URL */
  imageSrc: string
  /** Alt text for the header image */
  imageAlt?: string
  /** Max height of the header image area (mobile default 280, desktop 340) */
  imageMaxHeight?: number
  /** Called when the close button is pressed */
  onClose?: () => void
  /** Optional node rendered over the image at bottom-left (e.g. Badge) */
  imageOverlay?: ReactNode
  children: ReactNode
  className?: string
}

export default function FeatureLayout({
  imageSrc,
  imageAlt = '',
  imageMaxHeight,
  onClose,
  imageOverlay,
  children,
  className,
}: FeatureLayoutProps) {
  const { isDesktop } = useLayout()

  const resolvedMaxHeight = imageMaxHeight ?? (isDesktop ? 340 : 280)

  const childArray = Children.toArray(children)
  const footer = childArray.find(
    (child) => isValidElement(child) && child.type === StickyFooter,
  )
  const rest = childArray.filter(
    (child) => !(isValidElement(child) && child.type === StickyFooter),
  )

  // Desktop: inline card layout with rounded corners, no sticky footer
  if (isDesktop) {
    return (
      <div
        data-component="FeatureLayout"
        className={cn(
          'flex flex-col bg-surface-primary overflow-hidden rounded-[var(--token-radius-lg)]',
          className,
        )}
      >
        {/* Header image — rounded top corners */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{ height: resolvedMaxHeight }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />

          {onClose && (
            <div className="absolute top-[var(--token-spacing-8)] right-[var(--token-spacing-8)]">
              <IconButton
                variant="base"
                inverted
                icon={<RiCloseLine size={24} />}
                onPress={onClose}
              />
            </div>
          )}

          {imageOverlay && (
            <div className="absolute bottom-[var(--token-spacing-6)] left-[var(--token-spacing-6)]">
              {imageOverlay}
            </div>
          )}
        </div>

        {/* Content — 32px padding on desktop */}
        <div className="px-[var(--token-spacing-8)] pt-[var(--token-spacing-8)] pb-[var(--token-spacing-4)] flex flex-col gap-[var(--token-spacing-4)]">
          {rest}
        </div>

        {/* Footer — inline, right-aligned on desktop */}
        {footer && (
          <div className="px-[var(--token-spacing-8)] pb-[var(--token-spacing-8)] flex justify-end">
            <div>{footer}</div>
          </div>
        )}
      </div>
    )
  }

  // Mobile: full-screen layout with sticky footer and gradient fade
  return (
    <div
      data-component="FeatureLayout"
      className={cn('flex flex-col h-full bg-surface-primary overflow-hidden', className)}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Full-bleed header image */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{ maxHeight: resolvedMaxHeight }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />

          {onClose && (
            <div className="absolute top-[var(--safe-area-top,12px)] right-[var(--token-spacing-6)]">
              <IconButton
                variant="base"
                inverted
                icon={<RiCloseLine size={24} />}
                onPress={onClose}
              />
            </div>
          )}

          {imageOverlay && (
            <div className="absolute bottom-[var(--token-spacing-6)] left-[var(--token-spacing-6)]">
              {imageOverlay}
            </div>
          )}
        </div>

        {/* Content — 24px padding on mobile */}
        <div className="px-[var(--token-spacing-6)] pt-[var(--token-spacing-6)] pb-[40px] flex flex-col gap-[var(--token-spacing-4)]">
          {rest}
        </div>
      </div>

      {/* Sticky footer with gradient fade */}
      {footer && (
        <div className="relative shrink-0">
          <div className="absolute -top-16 left-0 right-0 h-16 bg-gradient-to-t from-surface-primary to-transparent pointer-events-none" />
          {footer}
        </div>
      )}
    </div>
  )
}

registerComponent({
  name: 'FeatureLayout',
  category: 'layout',
  description:
    'Responsive layout for feature introduction pages. Mobile: full-bleed header image, sticky footer with gradient fade. Desktop: rounded card with inline right-aligned footer.',
  component: FeatureLayout,
  props: [
    {
      name: 'imageSrc',
      type: 'string',
      required: true,
      description: 'URL of the full-bleed header image.',
    },
    {
      name: 'imageAlt',
      type: 'string',
      required: false,
      defaultValue: "''",
      description: 'Alt text for the header image.',
    },
    {
      name: 'imageMaxHeight',
      type: 'number',
      required: false,
      defaultValue: '280 (mobile) / 340 (desktop)',
      description: 'Height of the header image area in pixels. Defaults differ by breakpoint.',
    },
    {
      name: 'onClose',
      type: '() => void',
      required: false,
      description: 'Called when the close button is pressed. If omitted, no close button is shown.',
    },
    {
      name: 'imageOverlay',
      type: 'ReactNode',
      required: false,
      description:
        'Optional node rendered over the image at bottom-left. Typically a Badge component.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        'Page content. Use Text, Stack, Summary, Banner, etc. Use StickyFooter as last child for bottom CTA.',
    },
  ],
})
