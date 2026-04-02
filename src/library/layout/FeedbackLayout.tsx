import { type ReactNode, Children, isValidElement } from 'react'
import Lottie from 'lottie-react'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'
import { useLayout } from './LayoutProvider'
import StickyFooter from './StickyFooter'
import IconButton from '../inputs/IconButton'
import { RiCloseLine } from '@remixicon/react'

import successPendingAnimation from '../../assets/lottie/success-pending.json'

export interface FeedbackLayoutProps {
  /** Lottie animation data. Defaults to success-pending. Pass null to hide. */
  animation?: object | null
  /** Image URL — when provided, renders a 180x180 rounded image instead of Lottie. */
  imageSrc?: string
  /** Close handler — renders close button top-right */
  onClose?: () => void
  children: ReactNode
  className?: string
}

/** Size of the animation in px — designed for 390px device width */
const ANIMATION_SIZE = 180

export default function FeedbackLayout({
  animation = successPendingAnimation,
  imageSrc,
  onClose,
  children,
  className = '',
}: FeedbackLayoutProps) {
  const { isDesktop } = useLayout()

  // Separate StickyFooter from the rest of children
  const childArray = Children.toArray(children)
  const footer = childArray.find(
    (child) => isValidElement(child) && child.type === StickyFooter,
  )
  const rest = childArray.filter(
    (child) => !(isValidElement(child) && child.type === StickyFooter),
  )

  return (
    <div
      data-component="FeedbackLayout"
      className={cn('flex flex-col h-full bg-surface-primary overflow-hidden', className)}
    >
      <div
        className={cn(
          'flex-1 overflow-y-auto',
          isDesktop ? 'pt-[var(--token-spacing-6)]' : 'pt-[var(--safe-area-top,0px)]',
        )}
      >
        <div className="px-[var(--token-spacing-6)] pb-[var(--safe-area-bottom,16px)] flex flex-col gap-[var(--token-spacing-3)]">
          {/* Close button — top-right */}
          {onClose && (
            <div className="flex justify-end">
              <IconButton
                variant="base"
                icon={<RiCloseLine size={24} className="text-content-primary" />}
                onPress={onClose}
              />
            </div>
          )}

          {/* Visual — image or Lottie animation */}
          {imageSrc ? (
            <div
              className="shrink-0 rounded-full overflow-hidden"
              style={{ width: ANIMATION_SIZE, height: ANIMATION_SIZE }}
            >
              <img src={imageSrc} alt="" className="w-full h-full object-cover" />
            </div>
          ) : animation ? (
            <div
              style={{ width: ANIMATION_SIZE, height: ANIMATION_SIZE, marginLeft: -ANIMATION_SIZE * 0.2, marginBottom: 'calc(-1 * var(--token-spacing-6))' }}
              className="shrink-0"
            >
              <Lottie
                animationData={animation}
                loop={false}
                className="w-full h-full"
              />
            </div>
          ) : null}

          {rest}
        </div>
      </div>
      {footer}
    </div>
  )
}

registerComponent({
  name: 'FeedbackLayout',
  category: 'layout',
  description:
    'Success/pending feedback screen with left-aligned Lottie animation, close button top-right, and scrollable content. Use for transaction confirmations, deposit success, and async result screens.',
  component: FeedbackLayout,
  props: [
    {
      name: 'animation',
      type: 'object | null',
      required: false,
      defaultValue: 'success-pending',
      description: 'Lottie animation data. Defaults to success-pending. Pass null to hide.',
    },
    {
      name: 'imageSrc',
      type: 'string',
      required: false,
      description: 'Image URL — renders a 180x180 rounded image instead of Lottie when provided.',
    },
    {
      name: 'onClose',
      type: '() => void',
      required: false,
      description: 'Close handler — renders close button top-right',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content — title, description, banners, data lists. Use StickyFooter as last child for bottom actions.',
    },
  ],
})
