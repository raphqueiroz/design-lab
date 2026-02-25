/* Token metadata for the token editor UI */

export interface TokenMeta {
  cssVar: string
  label: string
  type: 'color' | 'size' | 'shadow' | 'font' | 'weight'
  defaultValue: string
}

export interface TokenCategory {
  label: string
  tokens: TokenMeta[]
}

export const tokenCategories: TokenCategory[] = [
  {
    label: 'Brand Colors',
    tokens: [
      { cssVar: 'brand-50', label: 'Brand 50', type: 'color', defaultValue: '#E8FAF0' },
      { cssVar: 'brand-100', label: 'Brand 100', type: 'color', defaultValue: '#B8F0D2' },
      { cssVar: 'brand-200', label: 'Brand 200', type: 'color', defaultValue: '#88E6B4' },
      { cssVar: 'brand-300', label: 'Brand 300', type: 'color', defaultValue: '#58DC96' },
      { cssVar: 'brand-400', label: 'Brand 400', type: 'color', defaultValue: '#28D278' },
      { cssVar: 'brand-500', label: 'Brand 500', type: 'color', defaultValue: '#00B84A' },
      { cssVar: 'brand-600', label: 'Brand 600', type: 'color', defaultValue: '#009E3F' },
      { cssVar: 'brand-700', label: 'Brand 700', type: 'color', defaultValue: '#008435' },
      { cssVar: 'brand-800', label: 'Brand 800', type: 'color', defaultValue: '#006A2A' },
      { cssVar: 'brand-900', label: 'Brand 900', type: 'color', defaultValue: '#00501F' },
    ],
  },
  {
    label: 'Semantic Colors',
    tokens: [
      { cssVar: 'success', label: 'Success', type: 'color', defaultValue: '#16A34A' },
      { cssVar: 'success-light', label: 'Success Light', type: 'color', defaultValue: '#DCFCE7' },
      { cssVar: 'warning', label: 'Warning', type: 'color', defaultValue: '#D97706' },
      { cssVar: 'warning-light', label: 'Warning Light', type: 'color', defaultValue: '#FEF3C7' },
      { cssVar: 'error', label: 'Error', type: 'color', defaultValue: '#DC2626' },
      { cssVar: 'error-light', label: 'Error Light', type: 'color', defaultValue: '#FEE2E2' },
      { cssVar: 'info', label: 'Info', type: 'color', defaultValue: '#2563EB' },
      { cssVar: 'info-light', label: 'Info Light', type: 'color', defaultValue: '#DBEAFE' },
    ],
  },
  {
    label: 'Neutrals',
    tokens: [
      { cssVar: 'neutral-50', label: 'Neutral 50', type: 'color', defaultValue: '#F9FAFB' },
      { cssVar: 'neutral-100', label: 'Neutral 100', type: 'color', defaultValue: '#F3F4F6' },
      { cssVar: 'neutral-200', label: 'Neutral 200', type: 'color', defaultValue: '#E5E7EB' },
      { cssVar: 'neutral-300', label: 'Neutral 300', type: 'color', defaultValue: '#D1D5DB' },
      { cssVar: 'neutral-400', label: 'Neutral 400', type: 'color', defaultValue: '#9CA3AF' },
      { cssVar: 'neutral-500', label: 'Neutral 500', type: 'color', defaultValue: '#6B7280' },
      { cssVar: 'neutral-600', label: 'Neutral 600', type: 'color', defaultValue: '#4B5563' },
      { cssVar: 'neutral-700', label: 'Neutral 700', type: 'color', defaultValue: '#374151' },
      { cssVar: 'neutral-800', label: 'Neutral 800', type: 'color', defaultValue: '#1F2937' },
      { cssVar: 'neutral-900', label: 'Neutral 900', type: 'color', defaultValue: '#111827' },
    ],
  },
  {
    label: 'Surfaces',
    tokens: [
      { cssVar: 'background', label: 'Background', type: 'color', defaultValue: '#F5F6F8' },
      { cssVar: 'surface-primary', label: 'Surface Primary', type: 'color', defaultValue: '#FFFFFF' },
      { cssVar: 'surface-secondary', label: 'Surface Secondary', type: 'color', defaultValue: '#F0F1F3' },
      { cssVar: 'surface-elevated', label: 'Surface Elevated', type: 'color', defaultValue: '#FFFFFF' },
    ],
  },
  {
    label: 'Content',
    tokens: [
      { cssVar: 'content-primary', label: 'Content Primary', type: 'color', defaultValue: '#1d211a' },
      { cssVar: 'content-secondary', label: 'Content Secondary', type: 'color', defaultValue: '#4B5563' },
      { cssVar: 'content-tertiary', label: 'Content Tertiary', type: 'color', defaultValue: '#9CA3AF' },
      { cssVar: 'content-inverse', label: 'Content Inverse', type: 'color', defaultValue: '#FFFFFF' },
    ],
  },
  {
    label: 'Interactive',
    tokens: [
      { cssVar: 'interactive-default', label: 'Default', type: 'color', defaultValue: '#c8f91f' },
      { cssVar: 'interactive-hover', label: 'Hover', type: 'color', defaultValue: '#aad41a' },
      { cssVar: 'interactive-pressed', label: 'Pressed', type: 'color', defaultValue: '#8cae16' },
      { cssVar: 'interactive-disabled', label: 'Disabled', type: 'color', defaultValue: '#D1D5DB' },
      { cssVar: 'interactive-foreground', label: 'Foreground', type: 'color', defaultValue: '#4D7C0F' },
    ],
  },
  {
    label: 'Spacing',
    tokens: [
      { cssVar: 'spacing-0', label: '0', type: 'size', defaultValue: '0px' },
      { cssVar: 'spacing-0-5', label: '0.5 (2px)', type: 'size', defaultValue: '2px' },
      { cssVar: 'spacing-1', label: '1 (4px)', type: 'size', defaultValue: '4px' },
      { cssVar: 'spacing-2', label: '2 (8px)', type: 'size', defaultValue: '8px' },
      { cssVar: 'spacing-3', label: '3 (12px)', type: 'size', defaultValue: '12px' },
      { cssVar: 'spacing-4', label: '4 (16px)', type: 'size', defaultValue: '16px' },
      { cssVar: 'spacing-5', label: '5 (20px)', type: 'size', defaultValue: '20px' },
      { cssVar: 'spacing-6', label: '6 (24px)', type: 'size', defaultValue: '24px' },
      { cssVar: 'spacing-8', label: '8 (32px)', type: 'size', defaultValue: '32px' },
      { cssVar: 'spacing-10', label: '10 (40px)', type: 'size', defaultValue: '40px' },
      { cssVar: 'spacing-12', label: '12 (48px)', type: 'size', defaultValue: '48px' },
      { cssVar: 'spacing-16', label: '16 (64px)', type: 'size', defaultValue: '64px' },
      { cssVar: 'spacing-20', label: '20 (80px)', type: 'size', defaultValue: '80px' },
    ],
  },
  {
    label: 'Typography',
    tokens: [
      { cssVar: 'font-size-display', label: 'Display Size', type: 'size', defaultValue: '32px' },
      { cssVar: 'font-size-heading-lg', label: 'Heading LG Size', type: 'size', defaultValue: '24px' },
      { cssVar: 'font-size-heading-md', label: 'Heading MD Size', type: 'size', defaultValue: '20px' },
      { cssVar: 'font-size-heading-sm', label: 'Heading SM Size', type: 'size', defaultValue: '17px' },
      { cssVar: 'font-size-body-lg', label: 'Body LG Size', type: 'size', defaultValue: '17px' },
      { cssVar: 'font-size-body-md', label: 'Body MD Size', type: 'size', defaultValue: '15px' },
      { cssVar: 'font-size-body-sm', label: 'Body SM Size', type: 'size', defaultValue: '13px' },
      { cssVar: 'font-size-caption', label: 'Caption Size', type: 'size', defaultValue: '11px' },
    ],
  },
  {
    label: 'Radii',
    tokens: [
      { cssVar: 'radius-none', label: 'None', type: 'size', defaultValue: '0px' },
      { cssVar: 'radius-sm', label: 'Small', type: 'size', defaultValue: '8px' },
      { cssVar: 'radius-md', label: 'Medium', type: 'size', defaultValue: '12px' },
      { cssVar: 'radius-lg', label: 'Large', type: 'size', defaultValue: '16px' },
      { cssVar: 'radius-xl', label: 'Extra Large', type: 'size', defaultValue: '24px' },
      { cssVar: 'radius-full', label: 'Full', type: 'size', defaultValue: '9999px' },
    ],
  },
  {
    label: 'Shadows',
    tokens: [
      { cssVar: 'shadow-sm', label: 'Small', type: 'shadow', defaultValue: '0px 1px 2px rgba(0, 0, 0, 0.05)' },
      { cssVar: 'shadow-md', label: 'Medium', type: 'shadow', defaultValue: '0px 4px 12px rgba(0, 0, 0, 0.08)' },
      { cssVar: 'shadow-lg', label: 'Large', type: 'shadow', defaultValue: '0px 12px 32px rgba(0, 0, 0, 0.12)' },
    ],
  },
]
