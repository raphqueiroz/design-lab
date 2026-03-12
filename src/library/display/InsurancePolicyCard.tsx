import { cn } from '../../lib/cn'
import Stack from '../layout/Stack'
import Text from '../foundations/Text'

const BG_COLOR = '#1a5c3a'
const BG_LIGHT = '#237a4e'

interface CoverItem {
  label: string
  value: string
}

interface InsurancePolicyCardProps {
  providerName: string
  coverItems: CoverItem[]
  className?: string
}

export default function InsurancePolicyCard({ providerName, coverItems, className }: InsurancePolicyCardProps) {
  return (
    <div
      data-component="InsurancePolicyCard"
      className={cn('relative overflow-hidden rounded-2xl px-5 py-6', className)}
      style={{ backgroundColor: BG_COLOR }}
    >
      {/* Decorative wave gradient */}
      <div
        className="absolute top-0 right-0 w-3/4 h-24 rounded-bl-[60px] opacity-40"
        style={{ background: `linear-gradient(135deg, ${BG_LIGHT} 0%, transparent 70%)` }}
      />

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 text-white/10 text-[64px] font-bold leading-none select-none pointer-events-none">
        NM
      </div>

      <Stack gap="default" className="relative z-10">
        {/* Top section */}
        <div className="flex justify-end">
          <Text variant="body-sm" className="text-white font-semibold">
            {providerName}
          </Text>
        </div>

        {/* Cover info heading */}
        <Text variant="heading-sm" className="text-white">
          Cover Info
        </Text>

        {/* Data rows */}
        <Stack gap="none">
          {coverItems.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                'flex items-center justify-between py-3',
                i < coverItems.length - 1 && 'border-b border-white/15'
              )}
            >
              <span className="text-white/70 text-sm">{item.label}</span>
              <span className="text-white text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </Stack>
      </Stack>
    </div>
  )
}
