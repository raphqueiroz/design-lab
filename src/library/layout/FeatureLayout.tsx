import { type ReactNode, Children, isValidElement } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'
import { useLayout } from './LayoutProvider'
import StickyFooter from './StickyFooter'
import IconButton from '../inputs/IconButton'

export interface FeatureLayoutProps {
  /** Full-bleed header image URL */
  imageSrc?: string
  /** Alt text for the header image */
  imageAlt?: string
  /** Background color for the hero area (used when imageSrc is omitted) */
  imageBgColor?: string
  /** Content rendered inside the hero area (e.g. title/subtitle overlaid on image or color) */
  imageHeader?: ReactNode
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
  imageBgColor,
  imageHeader,
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
        {/* Header hero — image or solid color */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{ height: resolvedMaxHeight, background: imageBgColor }}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          )}

          {imageHeader && (
            <div className="absolute inset-0 flex flex-col justify-end px-[var(--token-spacing-8)] pb-[var(--token-spacing-8)]">
              {imageHeader}
            </div>
          )}

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
        {/* Full-bleed header hero — image or solid color */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{
            ...(imageSrc ? { maxHeight: resolvedMaxHeight } : { height: resolvedMaxHeight }),
            background: imageBgColor,
          }}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          )}

          {imageHeader && (
            <div className="absolute inset-0 flex flex-col justify-end px-[var(--token-spacing-6)] pb-[var(--token-spacing-12)]">
              {imageHeader}
            </div>
          )}

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

        {/* Content — overlaps hero with rounded top corners */}
        <div className="relative -mt-[20px] rounded-t-[24px] bg-surface-primary px-[var(--token-spacing-6)] pt-[var(--token-spacing-6)] pb-[40px] flex flex-col gap-[var(--token-spacing-4)]">
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
      required: false,
      description: 'URL of the full-bleed header image. Optional if imageBgColor is used.',
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
