import { useState } from 'react'
import type { ComponentType } from 'react'
import CurrencyConversionPreview from './pattern-previews/CurrencyConversionPreview'

interface PatternDetailProps {
  pattern: string
}

interface PatternInfo {
  title: string
  description: string
  recipe: string[]
  usage: string
  preview?: ComponentType
}

const patternData: Record<string, PatternInfo> = {
  FormWithValidation: {
    title: 'Form with Validation',
    description: 'A multi-field form with inline validation, error messages, and a sticky submit button. Used for KYC, profile editing, and onboarding.',
    recipe: ['BaseLayout', 'FormLayout', 'TextInput', 'Select', 'Button', 'Banner'],
    usage: 'BaseLayout wraps the page. FormLayout provides consistent spacing between fields. Each TextInput/Select handles its own validation state. A Banner shows form-level errors. Button at the bottom is sticky via FormLayout.',
  },
  ListWithSearch: {
    title: 'List with Search',
    description: 'A filterable list with a search bar at the top, grouped items, and empty state fallback. Used for asset selection, contact lists, and token browsing.',
    recipe: ['BaseLayout', 'Header', 'Section', 'Stack', 'SearchBar', 'GroupHeader', 'ListItem', 'Avatar', 'EmptyState', 'Skeleton'],
    usage: 'Header with back action. SearchBar filters the list. Each group is a Section with GroupHeader. Stack gap="none" holds flush ListItem rows with Avatar on the left. EmptyState when search yields no results. Skeleton rows while loading.',
  },
  ConfirmationFlow: {
    title: 'Confirmation Flow',
    description: 'A review-then-confirm pattern for transactions. Shows a summary of what will happen, then asks for explicit confirmation. Used for sends, swaps, and card orders.',
    recipe: ['BaseLayout', 'Header', 'Card', 'DataList', 'Amount', 'Divider', 'Button', 'Modal'],
    usage: 'Header with title and close. Card contains the DataList of transaction details. Amount shows the primary value prominently. Divider separates sections. Primary Button triggers confirmation. Modal appears for final "Are you sure?" step.',
  },
  EmptyToLoaded: {
    title: 'Empty \u2192 Loaded',
    description: 'The three states of a data screen: skeleton loading, empty state, and populated content. Every list/data screen should handle all three.',
    recipe: ['Skeleton', 'EmptyState', 'ListItem', 'LoadingSpinner'],
    usage: 'On mount, show Skeleton placeholders matching the eventual layout shape. If data returns empty, show EmptyState with illustration and CTA. Once data loads, render the real ListItem rows. Use LoadingSpinner for subsequent page fetches.',
  },
  SettingsGroup: {
    title: 'Settings Group',
    description: 'A grouped list of toggleable or navigable settings. Used for app preferences, notification settings, and security options.',
    recipe: ['BaseLayout', 'Header', 'Section', 'Stack', 'ListItem', 'Toggle', 'Checkbox', 'Badge'],
    usage: 'Each settings group is a Section with a title. Stack gap="none" holds flush ListItem rows with Toggle or Checkbox on the right. ListItem with chevron for drill-down navigation. Badge for status indicators (e.g., "New", "Beta"). BaseLayout provides 24px gap between Sections.',
  },
  CurrencyConversion: {
    title: 'Currency Conversion',
    description: 'Dual currency input with bilateral correlation, transaction details, and payment method selection. Used when the user operates (deposit, withdraw, swap, invest) in one currency while paying with another.',
    recipe: ['BaseLayout', 'Header', 'Stack', 'CurrencyInput', 'Divider', 'ListItem', 'Button', 'DataList', 'DataListSkeleton', 'BannerSkeleton', 'Banner', 'BottomSheet', 'Avatar', 'StickyFooter'],
    usage: 'Two CurrencyInputs stacked in a flush Stack (gap="none") separated by a Divider. Editing one field auto-calculates the other using an exchange rate (bilateral correlation). A ListItem below shows the selected payment method with a "Change" button that opens a BottomSheet with currency options. Once the amount is valid, a simulated loading state shows DataListSkeleton + BannerSkeleton, then resolves to a DataList with transaction details (fees, rate, delivery) and a success Banner. The primary Button in StickyFooter stays disabled until the calculation is ready.',
    preview: CurrencyConversionPreview,
  },
}

export default function PatternDetail({ pattern }: PatternDetailProps) {
  const info = patternData[pattern]
  const [phoneView, setPhoneView] = useState(true)

  if (!info) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        Unknown pattern
      </div>
    )
  }

  const Preview = info.preview

  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px] max-w-[960px]">
        <div className="flex items-start justify-between mb-[var(--token-spacing-2)]">
          <h2 className="text-[length:var(--token-font-size-heading-lg)] font-semibold text-shell-text">
            {info.title}
          </h2>
          {Preview && (
            <button
              type="button"
              onClick={() => setPhoneView(!phoneView)}
              className="px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] text-[length:var(--token-font-size-body-sm)] border border-shell-border rounded-[var(--token-radius-sm)] hover:bg-shell-hover transition-colors cursor-pointer text-shell-text"
            >
              {phoneView ? '\u2194 Expanded' : '\uD83D\uDCF1 Phone (393px)'}
            </button>
          )}
        </div>
        <p className="text-[length:var(--token-font-size-body-md)] text-shell-text-secondary mb-[var(--token-spacing-6)]">
          {info.description}
        </p>

        {/* Interactive preview */}
        {Preview && (
          <div
            className={`
              bg-[#F5F6F8] text-content-primary rounded-[var(--token-radius-lg)] mb-[var(--token-spacing-6)] overflow-hidden
              ${phoneView ? 'max-w-[393px] mx-auto' : ''}
            `}
          >
            <Preview />
          </div>
        )}

        <div className="mb-[var(--token-spacing-6)]">
          <h3 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text mb-[var(--token-spacing-3)]">
            Recipe
          </h3>
          <div className="flex flex-wrap gap-[var(--token-spacing-2)]">
            {info.recipe.map((component) => (
              <span
                key={component}
                className="px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] bg-shell-surface border border-shell-border rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] text-shell-text font-mono"
              >
                {component}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text mb-[var(--token-spacing-3)]">
            How it works
          </h3>
          <p className="text-[length:var(--token-font-size-body-md)] text-shell-text leading-[var(--token-line-height-body-md)]">
            {info.usage}
          </p>
        </div>
      </div>
    </div>
  )
}
