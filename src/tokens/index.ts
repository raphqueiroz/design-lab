/* ============================================
   Picnic Design Lab — TypeScript Token Constants
   Mirrors tokens.css for use in JS/TS code.
   ============================================ */

export const colors = {
  brand: {
    50: '#E8FAF0',
    100: '#B8F0D2',
    200: '#88E6B4',
    300: '#58DC96',
    400: '#28D278',
    500: '#00B84A',
    600: '#009E3F',
    700: '#008435',
    800: '#006A2A',
    900: '#00501F',
  },
  semantic: {
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  surface: {
    background: '#F5F6F8',
    primary: '#FFFFFF',
    secondary: '#F0F1F3',
    elevated: '#FFFFFF',
  },
  content: {
    primary: '#1d211a',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  interactive: {
    default: '#c8f91f',
    hover: '#aad41a',
    pressed: '#8cae16',
    disabled: '#D1D5DB',
  },
  border: {
    default: '#E5E7EB',
    strong: '#D1D5DB',
  },
} as const

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const

export const spacingNamed = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const

export const typography = {
  display: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 600,
  },
  'heading-lg': {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 600,
  },
  'heading-md': {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
  },
  'heading-sm': {
    fontSize: '17px',
    lineHeight: '24px',
    fontWeight: 500,
  },
  'body-lg': {
    fontSize: '17px',
    lineHeight: '24px',
    fontWeight: 400,
  },
  'body-md': {
    fontSize: '15px',
    lineHeight: '20px',
    fontWeight: 400,
  },
  'body-sm': {
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: 400,
  },
  caption: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 400,
  },
} as const

export type TypographyVariant = keyof typeof typography

export const radii = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const

export const shadows = {
  sm: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0px 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0px 12px 32px rgba(0, 0, 0, 0.12)',
} as const

export const transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
} as const

export const tokens = {
  colors,
  spacing,
  spacingNamed,
  typography,
  radii,
  shadows,
  transitions,
} as const

export type Tokens = typeof tokens

/* CSS variable accessor for runtime token editing */
export function getTokenVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--token-${name}`)
    .trim()
}

export function setTokenVar(name: string, value: string): void {
  document.documentElement.style.setProperty(`--token-${name}`, value)
}

export function resetTokenVar(name: string): void {
  document.documentElement.style.removeProperty(`--token-${name}`)
}

export function resetAllTokens(): void {
  document.documentElement.removeAttribute('style')
}
