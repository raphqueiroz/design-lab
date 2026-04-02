import { useState, useCallback } from 'react'
import { colors, spacing, spacingNamed, typography, radii } from '../../tokens'
import {
  RiHomeLine, RiSearchLine, RiSettingsLine, RiUserLine, RiNotificationLine,
  RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiCloseLine, RiAddLine,
  RiDeleteBinLine, RiEditLine, RiShareLine, RiHeartLine, RiStarLine,
  RiFileCopyLine, RiDownloadLine, RiUploadLine, RiRefreshLine, RiMoreLine,
  RiEyeLine, RiEyeOffLine, RiLockLine, RiLockUnlockLine, RiInformationLine,
  RiAlertLine, RiQuestionLine, RiTimeLine, RiCalendarLine, RiMapPinLine,
  RiPhoneLine, RiMailLine, RiCameraLine, RiImageLine, RiFileLine,
  RiFolderLine, RiLinksLine, RiExternalLinkLine, RiFilterLine, RiSortAsc,
  RiMenuLine, RiGridLine, RiListUnordered, RiWalletLine, RiSwapLine,
  RiSendPlaneLine, RiQrCodeLine,
} from '@remixicon/react'
import type { RemixiconComponentType } from '@remixicon/react'
import VoiceAndTonePage from './VoiceAndTonePage'

interface FoundationDetailProps {
  foundation: string
}

export default function FoundationDetail({ foundation }: FoundationDetailProps) {
  switch (foundation) {
    case 'Colors':
      return <ColorsPage />
    case 'Typography':
      return <TypographyPage />
    case 'Spacing':
      return <SpacingPage />
    case 'Radii':
      return <RadiiPage />
    case 'Icons':
      return <IconsPage />
    case 'VoiceAndTone':
      return <VoiceAndTonePage />
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
          Unknown foundation
        </div>
      )
  }
}

/* ─── Shared ─── */

function SectionTitle({ children, description }: { children: string; description?: string }) {
  return (
    <div className="mb-[var(--token-spacing-4)]">
      <h3 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text">
        {children}
      </h3>
      {description && (
        <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary mt-[var(--token-spacing-1)]">
          {description}
        </p>
      )}
    </div>
  )
}

function PageTitle({ children, description }: { children: string; description?: string }) {
  return (
    <div className="mb-[var(--token-spacing-8)]">
      <h2 className="text-[length:var(--token-font-size-heading-lg)] font-semibold text-shell-text">
        {children}
      </h2>
      {description && (
        <p className="text-[length:var(--token-font-size-body-md)] text-shell-text-tertiary mt-[var(--token-spacing-2)]">
          {description}
        </p>
      )}
    </div>
  )
}

function CopyIndicator({ copied }: { copied: string | null }) {
  if (!copied) return null
  return (
    <div className="fixed bottom-[var(--token-spacing-6)] left-1/2 -translate-x-1/2 z-50 px-[var(--token-spacing-4)] py-[var(--token-spacing-2)] bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] text-[length:var(--token-font-size-body-sm)] text-shell-text shadow-lg animate-fade-in">
      Copied: <span className="font-mono">{copied}</span>
    </div>
  )
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }, [])
  return { copied, copy }
}

/* ─── Colors ─── */

function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((c) => {
    const v = parseInt(c, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getContrastText(hex: string): string {
  return getLuminance(hex) > 0.4 ? '#171717' : '#FFFFFF'
}

function SwatchStrip({ label, swatches, onCopy }: { label: string; swatches: { name: string; value: string }[]; onCopy: (v: string) => void }) {
  return (
    <div className="mb-[var(--token-spacing-6)]">
      <SectionTitle>{label}</SectionTitle>
      <div className="flex gap-[var(--token-spacing-1)] rounded-[var(--token-radius-md)] overflow-hidden">
        {swatches.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => onCopy(s.value)}
            className="flex-1 h-[80px] flex flex-col items-center justify-end pb-[var(--token-spacing-2)] cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: s.value }}
            title={`${s.name} — ${s.value} (click to copy)`}
          >
            <span className="text-[length:10px] font-mono font-medium leading-none" style={{ color: getContrastText(s.value) }}>
              {s.name}
            </span>
            <span className="text-[length:10px] font-mono leading-none mt-[2px] opacity-70" style={{ color: getContrastText(s.value) }}>
              {s.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SwatchGrid({ label, description, swatches, onCopy }: { label: string; description?: string; swatches: { name: string; value: string }[]; onCopy: (v: string) => void }) {
  return (
    <div className="mb-[var(--token-spacing-8)]">
      <SectionTitle description={description}>{label}</SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-[var(--token-spacing-3)]">
        {swatches.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => onCopy(s.value)}
            className="flex flex-col gap-[var(--token-spacing-1)] cursor-pointer group text-left"
            title={`Click to copy ${s.value}`}
          >
            <div
              className="h-[80px] rounded-[var(--token-radius-md)] border border-shell-border flex items-end justify-between px-[var(--token-spacing-2)] pb-[var(--token-spacing-2)] transition-transform group-hover:scale-[1.02] group-active:scale-[0.98]"
              style={{ backgroundColor: s.value }}
            >
              <span className="text-[length:10px] font-mono opacity-80" style={{ color: getContrastText(s.value) }}>
                {s.value}
              </span>
            </div>
            <span className="text-[length:var(--token-font-size-caption)] text-shell-text font-medium">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function objectToSwatches(obj: Record<string, string>, prefix = '') {
  return Object.entries(obj).map(([key, value]) => ({
    name: prefix ? `${prefix}-${key}` : key,
    value,
  }))
}

function ColorsPage() {
  const { copied, copy } = useCopy()

  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        <PageTitle description="Color tokens for brand identity, semantics, and UI surfaces.">Colors</PageTitle>

        {/* Brand palettes as strips */}
        <SwatchStrip label="Brand" swatches={objectToSwatches(colors.brand, 'brand')} onCopy={copy} />
        <SwatchStrip label="Brand Core" swatches={objectToSwatches(colors.brandCore, 'core')} onCopy={copy} />
        <SwatchStrip label="Brand Lime" swatches={objectToSwatches(colors.brandLime, 'lime')} onCopy={copy} />
        <SwatchStrip label="Brand Grape" swatches={objectToSwatches(colors.brandGrape, 'grape')} onCopy={copy} />
        <SwatchStrip label="Brand Guava" swatches={objectToSwatches(colors.brandGuava, 'guava')} onCopy={copy} />

        {/* Semantic/functional palettes as grids */}
        <SwatchGrid label="Semantic" description="Status and notification colors." swatches={objectToSwatches(colors.semantic)} onCopy={copy} />
        <SwatchGrid label="Feedback" description="Success, warning, and critical states." swatches={objectToSwatches(colors.feedback)} onCopy={copy} />
        <SwatchGrid label="Neutral" description="Grayscale palette for text, borders, and backgrounds." swatches={objectToSwatches(colors.neutral, 'neutral')} onCopy={copy} />
        <SwatchGrid label="Surface" description="Background layers and elevation." swatches={objectToSwatches(colors.surface)} onCopy={copy} />
        <SwatchGrid label="Content" description="Text and icon colors." swatches={objectToSwatches(colors.content)} onCopy={copy} />
        <SwatchGrid label="Interactive" description="Buttons, links, and interactive element states." swatches={objectToSwatches(colors.interactive)} onCopy={copy} />
        <SwatchGrid label="Border" description="Dividers and outlines." swatches={objectToSwatches(colors.border)} onCopy={copy} />
      </div>
      <CopyIndicator copied={copied} />
    </div>
  )
}

/* ─── Typography ─── */

type TypoSpec = { fontSize: string; lineHeight: string; fontWeight: number }

const typeGroups: { title: string; description: string; keys: string[] }[] = [
  { title: 'Headings', description: 'Display and heading styles for titles and section headers.', keys: ['display', 'heading-lg', 'heading-md', 'heading-sm'] },
  { title: 'Body', description: 'Body copy for paragraphs and descriptions.', keys: ['body-lg', 'body-md', 'body-sm'] },
  { title: 'Detail', description: 'Small text for captions, labels, and metadata.', keys: ['caption'] },
]

const specimens: Record<string, string> = {
  display: 'Suas finanças no modo Picnic.',
  'heading-lg': 'Zero taxa de verdade.',
  'heading-md': 'Abre o olho pro custo total.',
  'heading-sm': 'Viajar sem susto no extrato.',
  'body-lg': 'A conta digital internacional mais inteligente do Brasil. Sem IOF, sem taxa escondida.',
  'body-md': 'Pagar tudo em outro país sem travar: café, metrô, mercado. Seu dinheiro, seu de verdade.',
  'body-sm': 'IOF: zero. Taxa Picnic: zero. Anuidade: zero. Pegadinha: zero.',
  caption: '5–10% mais barato que Wise. Faz a conta.',
}

function TypographyPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        <PageTitle description="Type scale for all text styles. Uses the system font stack.">Typography</PageTitle>

        {typeGroups.map((group) => (
          <div key={group.title} className="mb-[var(--token-spacing-10)]">
            <SectionTitle description={group.description}>{group.title}</SectionTitle>
            <div className="flex flex-col">
              {group.keys.map((key) => {
                const spec = typography[key as keyof typeof typography] as TypoSpec
                return (
                  <div
                    key={key}
                    className="flex items-baseline gap-[var(--token-spacing-6)] py-[var(--token-spacing-4)] border-b border-shell-border"
                  >
                    <div className="w-[140px] shrink-0">
                      <span className="text-[length:var(--token-font-size-body-sm)] font-semibold text-shell-text">{key}</span>
                      <div className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mt-[var(--token-spacing-0-5)] font-mono">
                        {spec.fontSize} / {spec.lineHeight} / {spec.fontWeight}
                      </div>
                    </div>
                    <span
                      style={{ fontSize: spec.fontSize, lineHeight: spec.lineHeight, fontWeight: spec.fontWeight }}
                      className="text-shell-text"
                    >
                      {specimens[key] || 'The quick brown fox jumps over the lazy dog'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Spacing ─── */

const spacingUsage: { value: string; token: string; alias?: string; usage: string }[] = [
  { value: '0px', token: '0', usage: 'No gap' },
  { value: '2px', token: '0.5', usage: 'Hairline dividers' },
  { value: '4px', token: '1', alias: 'xs', usage: 'Tight inner padding (icon to label)' },
  { value: '8px', token: '2', alias: 'sm', usage: 'Between closely related items' },
  { value: '12px', token: '3', usage: 'Card inner padding, list item gaps' },
  { value: '16px', token: '4', alias: 'md', usage: 'Standard padding, Stack default gap' },
  { value: '20px', token: '5', usage: 'Medium spacing' },
  { value: '24px', token: '6', alias: 'lg', usage: 'BaseLayout gap between sections, screen margins' },
  { value: '32px', token: '8', alias: 'xl', usage: 'Between major sections' },
  { value: '40px', token: '10', usage: 'Large vertical spacing' },
  { value: '48px', token: '12', alias: '2xl', usage: 'Extra large spacing' },
  { value: '64px', token: '16', usage: 'Page-level padding' },
  { value: '80px', token: '20', usage: 'Maximum spacing' },
]

const layoutRules = [
  { label: 'BaseLayout gap', value: '24px', token: 'lg', description: 'Vertical gap between top-level children (Sections). Also horizontal margins.' },
  { label: 'Section gap', value: '12px', token: '3', description: 'Gap between Section title and its content.' },
  { label: 'Stack default', value: '16px', token: 'md', description: 'Default gap for Stack children. Overridable via gap prop.' },
  { label: 'Stack sm', value: '8px', token: 'sm', description: 'Tight vertical grouping — related items.' },
  { label: 'Stack none', value: '0px', token: '0', description: 'Flush grouping — GroupHeader + content.' },
  { label: 'Stack lg', value: '24px', token: 'lg', description: 'Loose vertical grouping — distinct blocks.' },
]

function SpacingPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        <PageTitle description="Spacing scale for margins, paddings, and gaps. Only use values from this scale — no magic numbers.">Spacing</PageTitle>

        {/* Scale with real-size visual representation */}
        <SectionTitle description="Each bar represents the actual pixel size of the token.">Scale</SectionTitle>
        <div className="flex flex-col gap-[var(--token-spacing-1)] mb-[var(--token-spacing-10)]">
          {spacingUsage.map((s) => {
            const px = parseInt(s.value)
            return (
              <div key={s.token} className="flex items-center gap-[var(--token-spacing-3)] py-[2px]">
                <span className="w-[28px] text-right text-[length:var(--token-font-size-body-sm)] font-semibold text-shell-text tabular-nums">
                  {s.token}
                </span>
                <span className="w-[40px] text-right text-[length:var(--token-font-size-caption)] font-mono text-shell-text-tertiary">
                  {s.value}
                </span>
                {s.alias ? (
                  <span className="w-[28px] text-[length:var(--token-font-size-caption)] font-medium text-[#28D278]">
                    {s.alias}
                  </span>
                ) : (
                  <span className="w-[28px]" />
                )}
                {/* Real-size bar */}
                <div
                  className="h-[16px] rounded-[2px] bg-[#28D278] shrink-0"
                  style={{ width: px === 0 ? '1px' : `${px}px` }}
                />
                <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary ml-[var(--token-spacing-2)] truncate">
                  {s.usage}
                </span>
              </div>
            )
          })}
        </div>

        {/* Layout rules */}
        <SectionTitle description="How spacing is applied through layout components.">Layout Rules</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[var(--token-spacing-4)] mb-[var(--token-spacing-10)]">
          {layoutRules.map((rule) => (
            <div key={rule.label} className="bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] p-[var(--token-spacing-4)]">
              <div className="flex items-center justify-between mb-[var(--token-spacing-2)]">
                <span className="text-[length:var(--token-font-size-body-sm)] font-semibold text-shell-text">{rule.label}</span>
                <div className="flex items-center gap-[var(--token-spacing-1)]">
                  <span className="text-[length:var(--token-font-size-caption)] font-mono text-[#28D278]">{rule.token}</span>
                  <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary">= {rule.value}</span>
                </div>
              </div>
              <p className="text-[length:var(--token-font-size-caption)] text-shell-text-secondary leading-relaxed">{rule.description}</p>
              {/* Visual preview */}
              <div className="mt-[var(--token-spacing-3)] flex items-center gap-[var(--token-spacing-2)]">
                <div className="h-[8px] bg-[#28D278] rounded-[2px]" style={{ width: `${parseInt(rule.value)}px` }} />
                <span className="text-[length:10px] font-mono text-shell-text-tertiary">{rule.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Composition example */}
        <SectionTitle description="Screen → BaseLayout (24px gap) → Section (12px gap) → Stack (configurable gap).">Composition</SectionTitle>
        <div className="bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] p-[var(--token-spacing-5)]">
          <code className="text-[length:var(--token-font-size-caption)] font-mono text-shell-text-secondary leading-relaxed whitespace-pre">{`BaseLayout               ← 24px horizontal margins
  ├── Section              ← 24px gap between sections (from BaseLayout)
  │   ├── GroupHeader      ← 12px gap to content (from Section)
  │   └── Stack gap="sm"   ← 8px between items
  │       ├── ListItem
  │       └── ListItem
  ├── Section
  │   └── Stack            ← 16px default gap
  │       ├── Card
  │       └── Card
  └── StickyFooter`}</code>
        </div>
      </div>
    </div>
  )
}

/* ─── Radii ─── */

function RadiiPage() {
  const entries = Object.entries(radii) as [string, string][]

  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        <PageTitle description="Border radius tokens for corners and shapes.">Radius</PageTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[var(--token-spacing-6)]">
          {entries.map(([name, value]) => (
            <div key={name} className="bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] p-[var(--token-spacing-5)] flex flex-col items-center">
              <div
                className="w-[100px] h-[100px] bg-interactive-default mb-[var(--token-spacing-4)]"
                style={{ borderRadius: value }}
              />
              <span className="text-[length:var(--token-font-size-body-sm)] font-semibold text-shell-text">{name}</span>
              <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mt-[2px]">{value}</span>
              <span className="text-[length:var(--token-font-size-caption)] font-mono text-shell-text-tertiary mt-[var(--token-spacing-1)]">
                --token-radius-{name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Icons ─── */

const iconGroups: { label: string; icons: { name: string; importName: string; Icon: RemixiconComponentType }[] }[] = [
  {
    label: 'Navigation',
    icons: [
      { name: 'Home', importName: 'RiHomeLine', Icon: RiHomeLine },
      { name: 'Search', importName: 'RiSearchLine', Icon: RiSearchLine },
      { name: 'Menu', importName: 'RiMenuLine', Icon: RiMenuLine },
      { name: 'Arrow Left', importName: 'RiArrowLeftLine', Icon: RiArrowLeftLine },
      { name: 'Arrow Right', importName: 'RiArrowRightLine', Icon: RiArrowRightLine },
      { name: 'External Link', importName: 'RiExternalLinkLine', Icon: RiExternalLinkLine },
      { name: 'Link', importName: 'RiLinksLine', Icon: RiLinksLine },
    ],
  },
  {
    label: 'Actions',
    icons: [
      { name: 'Add', importName: 'RiAddLine', Icon: RiAddLine },
      { name: 'Edit', importName: 'RiEditLine', Icon: RiEditLine },
      { name: 'Delete', importName: 'RiDeleteBinLine', Icon: RiDeleteBinLine },
      { name: 'Copy', importName: 'RiFileCopyLine', Icon: RiFileCopyLine },
      { name: 'Share', importName: 'RiShareLine', Icon: RiShareLine },
      { name: 'Download', importName: 'RiDownloadLine', Icon: RiDownloadLine },
      { name: 'Upload', importName: 'RiUploadLine', Icon: RiUploadLine },
      { name: 'Refresh', importName: 'RiRefreshLine', Icon: RiRefreshLine },
      { name: 'Filter', importName: 'RiFilterLine', Icon: RiFilterLine },
      { name: 'Sort', importName: 'RiSortAsc', Icon: RiSortAsc },
      { name: 'Send', importName: 'RiSendPlaneLine', Icon: RiSendPlaneLine },
      { name: 'Close', importName: 'RiCloseLine', Icon: RiCloseLine },
      { name: 'Check', importName: 'RiCheckLine', Icon: RiCheckLine },
      { name: 'More', importName: 'RiMoreLine', Icon: RiMoreLine },
    ],
  },
  {
    label: 'Status',
    icons: [
      { name: 'Info', importName: 'RiInformationLine', Icon: RiInformationLine },
      { name: 'Alert', importName: 'RiAlertLine', Icon: RiAlertLine },
      { name: 'Question', importName: 'RiQuestionLine', Icon: RiQuestionLine },
      { name: 'Eye', importName: 'RiEyeLine', Icon: RiEyeLine },
      { name: 'Eye Off', importName: 'RiEyeOffLine', Icon: RiEyeOffLine },
      { name: 'Lock', importName: 'RiLockLine', Icon: RiLockLine },
      { name: 'Unlock', importName: 'RiLockUnlockLine', Icon: RiLockUnlockLine },
      { name: 'Notification', importName: 'RiNotificationLine', Icon: RiNotificationLine },
    ],
  },
  {
    label: 'Content',
    icons: [
      { name: 'Heart', importName: 'RiHeartLine', Icon: RiHeartLine },
      { name: 'Star', importName: 'RiStarLine', Icon: RiStarLine },
      { name: 'User', importName: 'RiUserLine', Icon: RiUserLine },
      { name: 'Settings', importName: 'RiSettingsLine', Icon: RiSettingsLine },
      { name: 'Time', importName: 'RiTimeLine', Icon: RiTimeLine },
      { name: 'Calendar', importName: 'RiCalendarLine', Icon: RiCalendarLine },
      { name: 'Map Pin', importName: 'RiMapPinLine', Icon: RiMapPinLine },
      { name: 'Phone', importName: 'RiPhoneLine', Icon: RiPhoneLine },
      { name: 'Mail', importName: 'RiMailLine', Icon: RiMailLine },
      { name: 'Camera', importName: 'RiCameraLine', Icon: RiCameraLine },
      { name: 'Image', importName: 'RiImageLine', Icon: RiImageLine },
      { name: 'File', importName: 'RiFileLine', Icon: RiFileLine },
      { name: 'Folder', importName: 'RiFolderLine', Icon: RiFolderLine },
      { name: 'Grid', importName: 'RiGridLine', Icon: RiGridLine },
      { name: 'List', importName: 'RiListUnordered', Icon: RiListUnordered },
    ],
  },
  {
    label: 'Commerce',
    icons: [
      { name: 'Wallet', importName: 'RiWalletLine', Icon: RiWalletLine },
      { name: 'Swap', importName: 'RiSwapLine', Icon: RiSwapLine },
      { name: 'QR Code', importName: 'RiQrCodeLine', Icon: RiQrCodeLine },
    ],
  },
]

function IconsPage() {
  const [search, setSearch] = useState('')
  const { copied, copy } = useCopy()
  const query = search.toLowerCase()

  const filteredGroups = iconGroups.map((g) => ({
    ...g,
    icons: g.icons.filter((i) => i.name.toLowerCase().includes(query) || i.importName.toLowerCase().includes(query)),
  })).filter((g) => g.icons.length > 0)

  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        <PageTitle description="Remix Icon (line style). Click any icon to copy its import name.">Icons</PageTitle>

        {/* Search */}
        <div className="mb-[var(--token-spacing-6)]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="w-full max-w-[320px] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] bg-shell-surface border border-shell-border rounded-[var(--token-radius-sm)] text-[length:var(--token-font-size-body-sm)] text-shell-text placeholder:text-shell-text-tertiary outline-none focus:border-shell-selected-text transition-colors"
          />
        </div>

        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-[var(--token-spacing-8)]">
            <SectionTitle>{group.label}</SectionTitle>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-[var(--token-spacing-2)]">
              {group.icons.map(({ name, importName, Icon }) => (
                <button
                  key={importName}
                  type="button"
                  onClick={() => copy(importName)}
                  title={`import { ${importName} } from '@remixicon/react'`}
                  className="flex flex-col items-center justify-center gap-[var(--token-spacing-1)] p-[var(--token-spacing-4)] aspect-square bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] hover:border-shell-selected-text transition-colors cursor-pointer group"
                >
                  <Icon size={24} className="text-shell-text group-hover:text-shell-selected-text transition-colors shrink-0" />
                  <span className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary text-center leading-tight">{name}</span>
                  <span className="text-[length:9px] font-mono text-shell-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight">
                    {importName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary">No icons match "{search}"</p>
        )}
      </div>
      <CopyIndicator copied={copied} />
    </div>
  )
}
