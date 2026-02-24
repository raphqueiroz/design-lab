import type { ReactNode } from 'react'
import { registerComponent } from '../registry'
import type { TypographyVariant } from '../../tokens'

export interface TextProps {
  variant?: TypographyVariant
  color?: string
  align?: 'left' | 'center' | 'right'
  children: ReactNode
  className?: string
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label'
}

const variantStyles: Record<TypographyVariant, string> = {
  display:
    'text-[length:var(--token-font-size-display)] leading-[var(--token-line-height-display)] font-semibold',
  'heading-lg':
    'text-[length:var(--token-font-size-heading-lg)] leading-[var(--token-line-height-heading-lg)] font-semibold',
  'heading-md':
    'text-[length:var(--token-font-size-heading-md)] leading-[var(--token-line-height-heading-md)] font-semibold',
  'heading-sm':
    'text-[length:var(--token-font-size-heading-sm)] leading-[var(--token-line-height-heading-sm)] font-medium',
  'body-lg':
    'text-[length:var(--token-font-size-body-lg)] leading-[var(--token-line-height-body-lg)] font-normal',
  'body-md':
    'text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] font-normal',
  'body-sm':
    'text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] font-normal',
  caption:
    'text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-normal',
}

const defaultTag: Record<TypographyVariant, TextProps['as']> = {
  display: 'h1',
  'heading-lg': 'h2',
  'heading-md': 'h3',
  'heading-sm': 'h4',
  'body-lg': 'p',
  'body-md': 'p',
  'body-sm': 'p',
  caption: 'span',
}

export default function Text({
  variant = 'body-md',
  color,
  align = 'left',
  children,
  className = '',
  as,
}: TextProps) {
  const Tag = as ?? defaultTag[variant] ?? 'p'
  const colorStyle = color ? { color: `var(--token-${color})` } : undefined
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

  return (
    <Tag className={`${variantStyles[variant]} ${alignClass} ${className}`} style={colorStyle}>
      {children}
    </Tag>
  )
}

registerComponent({
  name: 'Text',
  category: 'foundations',
  description: 'Wraps all text content, enforcing the type scale.',
  component: Text,
  variants: [
    'display',
    'heading-lg',
    'heading-md',
    'heading-sm',
    'body-lg',
    'body-md',
    'body-sm',
    'caption',
  ],
  props: [
    { name: 'variant', type: 'TypographyVariant', required: false, defaultValue: 'body-md', description: 'Typography scale variant' },
    { name: 'color', type: 'string', required: false, description: 'Token color name (e.g. "text-secondary")' },
    { name: 'align', type: '"left" | "center" | "right"', required: false, defaultValue: 'left', description: 'Text alignment' },
    { name: 'children', type: 'ReactNode', required: true, description: 'Text content' },
    { name: 'as', type: 'HTML tag', required: false, description: 'Override the rendered HTML element' },
  ],
})
