import { useState, type ReactNode } from 'react'
import { RiInformationLine, RiFileCopyLine, RiArrowDownSLine } from '@remixicon/react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerComponent } from '../registry'
import { cn } from '../../lib/cn'

export interface DataListBreakdownItem {
  label: string
  value?: string
}

export interface DataListItem {
  label: string
  value: string | ReactNode
  secondaryValue?: string
  info?: string | (() => void)
  copyable?: boolean
  onCopy?: () => void
  breakdown?: DataListBreakdownItem[]
  /** Action slot for vertical variant — accepts a ReactNode (pill Button, IconButton, etc.) */
  action?: ReactNode
}

/** Each entry in data can be a single item or an array of items displayed side by side */
export type DataListEntry = DataListItem | DataListItem[]

export interface DataListProps {
  data: DataListEntry[]
  variant?: 'horizontal' | 'vertical'
  className?: string
}

// ── Horizontal variant (default) ──

function BreakdownTimeline({ items }: { items: DataListBreakdownItem[] }) {
  return (
    <div className="flex flex-col mt-[var(--token-spacing-3)]">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-[var(--token-spacing-3)]">
          <div className="flex flex-col items-center w-[12px] shrink-0">
            <div className="w-[6px] h-[6px] rounded-full bg-[var(--token-neutral-300)] mt-[7px] shrink-0" />
            {idx < items.length - 1 && (
              <div className="w-[1px] flex-1 bg-[var(--token-neutral-200)] my-[2px]" />
            )}
          </div>
          <div className="flex items-center justify-between flex-1 pb-[var(--token-spacing-2)] min-h-[28px]">
            <span className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-content-tertiary">
              {item.label}
            </span>
            {item.value && (
              <span className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-content-tertiary">
                {item.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function HorizontalRow({ item, isLast }: { item: DataListItem; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = item.breakdown && item.breakdown.length > 0

  const handleCopy = () => {
    if (item.onCopy) {
      item.onCopy()
    } else if (typeof item.value === 'string') {
      navigator.clipboard.writeText(item.value)
    }
  }

  return (
    <div
      className={cn(
        'w-full border-b border-[var(--token-neutral-100)]',
        isLast && 'border-b-0',
      )}
    >
      <div className="flex items-center justify-between py-[var(--token-spacing-3)]">
        <div className="flex items-center gap-[var(--token-spacing-1)]">
          <span data-text-id={item.label} className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] text-content-secondary">
            {item.label}
          </span>
          {item.info && (
            <button
              type="button"
              onClick={typeof item.info === 'function' ? item.info : undefined}
              className="shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
            >
              <RiInformationLine size={18} className="text-content-tertiary" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-[var(--token-spacing-2)]">
          <div className="flex flex-col items-end">
            {typeof item.value === 'string' ? (
              <span data-text-id={item.value} className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] font-medium text-content-primary tabular-nums">
                {item.value}
              </span>
            ) : (
              item.value
            )}
            {item.secondaryValue && (
              <span data-text-id={item.secondaryValue} className="text-[length:var(--token-font-size-body-sm)] leading-[var(--token-line-height-body-sm)] text-content-tertiary tabular-nums">
                {item.secondaryValue}
              </span>
            )}
          </div>

          {item.copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
            >
              <RiFileCopyLine size={16} className="text-content-tertiary" />
            </button>
          )}

          {hasBreakdown && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <RiArrowDownSLine size={18} className="text-content-tertiary" />
              </motion.div>
            </button>
          )}
        </div>
      </div>

      {hasBreakdown && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <BreakdownTimeline items={item.breakdown!} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// ── Vertical variant ──
// Matches Figma: label on top (body-md, secondary), value below (body-md, medium, primary),
// optional action slot on the right of the value row (pill button or icon button).
// Gap between label and value: 8px. Row padding: py-12. Border-bottom separator.

function VerticalCell({ item }: { item: DataListItem }) {
  const handleCopy = () => {
    if (item.onCopy) {
      item.onCopy()
    } else if (typeof item.value === 'string') {
      navigator.clipboard.writeText(item.value)
    }
  }

  return (
    <div className="flex flex-col gap-[var(--token-spacing-2)] flex-1 min-w-0">
      {/* Label */}
      <div className="flex items-center gap-[var(--token-spacing-1)] pr-[var(--token-spacing-2)]">
        <span data-text-id={item.label} className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] text-content-secondary">
          {item.label}
        </span>
        {item.info && (
          <button
            type="button"
            onClick={typeof item.info === 'function' ? item.info : undefined}
            className="shrink-0 flex items-center justify-center cursor-pointer bg-transparent border-none p-0"
          >
            <RiInformationLine size={18} className="text-content-tertiary" />
          </button>
        )}
      </div>

      {/* Value + action row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex-1 min-w-0">
          {typeof item.value === 'string' ? (
            <span data-text-id={item.value} className="text-[length:var(--token-font-size-body-md)] leading-[var(--token-line-height-body-md)] font-medium text-content-primary tabular-nums">
              {item.value}
            </span>
          ) : (
            item.value
          )}
        </div>

        {/* Action slot: pill button, icon button, or copy button */}
        {(item.action || item.copyable) && (
          <div className="shrink-0 ml-[var(--token-spacing-3)]">
            {item.copyable && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center rounded-full bg-[var(--color-interaction-primary)] px-[var(--token-spacing-3)] py-[var(--token-spacing-2)] cursor-pointer border-none"
              >
                <span className="text-[length:var(--token-font-size-caption)] leading-[1.5] font-semibold text-white whitespace-nowrap">
                  Copiar
                </span>
              </button>
            )}
            {item.action}
          </div>
        )}
      </div>
    </div>
  )
}

function VerticalRow({ items, isLast }: { items: DataListItem[]; isLast: boolean }) {
  const isSideBySide = items.length > 1

  return (
    <div
      className={cn(
        'w-full border-b border-[var(--token-neutral-100)]',
        isLast && 'border-b-0',
      )}
    >
      <div className={cn(
        'flex py-[var(--token-spacing-3)]',
        isSideBySide ? 'flex-row items-start' : 'flex-col',
      )}>
        {items.map((item, idx) => (
          <VerticalCell key={idx} item={item} />
        ))}
      </div>
    </div>
  )
}

// ── Main Component ──

export default function DataList({
  data,
  variant = 'horizontal',
  className = '',
}: DataListProps) {
  if (variant === 'vertical') {
    // Normalize entries: single items become [item], arrays stay as-is
    const rows = data.map((entry) => (Array.isArray(entry) ? entry : [entry]))
    return (
      <div data-component="DataList" className={cn('w-full flex flex-col', className)}>
        {rows.map((items, idx) => (
          <VerticalRow
            key={idx}
            items={items}
            isLast={idx === rows.length - 1}
          />
        ))}
      </div>
    )
  }

  // Horizontal variant — entries must be single items
  const items = data.map((entry) => (Array.isArray(entry) ? entry[0] : entry))
  return (
    <div data-component="DataList" className={cn('w-full flex flex-col', className)}>
      {items.map((item, idx) => (
        <HorizontalRow
          key={idx}
          item={item}
          isLast={idx === items.length - 1}
        />
      ))}
    </div>
  )
}

registerComponent({
  name: 'DataList',
  category: 'presentation',
  description: 'Key-value table showing labeled rows with values, optional secondary values, expandable breakdowns, and copy/action slots. Horizontal variant: label left, value right. Vertical variant: label top, value below, action right. Vertical supports side-by-side items via array entries in data.',
  component: DataList,
  variants: ['horizontal', 'vertical'],
  props: [
    { name: 'data', type: '(DataListItem | DataListItem[])[]', required: true, description: 'Array of rows. Each entry is a single item or array of items (side by side in vertical variant).' },
    { name: 'variant', type: '"horizontal" | "vertical"', required: false, defaultValue: 'horizontal', description: 'Layout direction: horizontal (label left, value right) or vertical (label top, value below)' },
  ],
})
