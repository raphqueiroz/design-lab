import { Sparkles, Gift, ArrowRight } from 'lucide-react'
import type { FlowScreenProps } from '../../pages/simulator/flowRegistry'
import Text from '../../library/foundations/Text'
import Button from '../../library/inputs/Button'
import Spacer from '../../library/foundations/Spacer'

export default function Screen1_PerksHome({ onNext }: FlowScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[#1a2e1a]">
      {/* Hero illustration area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-[var(--token-spacing-lg)] overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-[#4ADE80]/10" />
          <div className="absolute bottom-[40px] left-[-60px] w-[160px] h-[160px] rounded-full bg-[#4ADE80]/5" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon cluster */}
          <div className="relative mb-[var(--token-spacing-lg)]">
            <div className="w-[80px] h-[80px] rounded-full bg-[#4ADE80]/20 flex items-center justify-center">
              <Sparkles size={40} className="text-[#4ADE80]" />
            </div>
            <div className="absolute -top-2 -right-3 w-[32px] h-[32px] rounded-full bg-[#4ADE80]/30 flex items-center justify-center">
              <Gift size={16} className="text-[#4ADE80]" />
            </div>
          </div>

          <Text variant="heading-lg" align="center" className="!text-white">
            Cliente Picnic tem mais benefícios!
          </Text>
          <Spacer size="md" />
          <Text variant="body-md" align="center" className="!text-white/70">
            Dólar mais barato, cashback exclusivo, indicações que rendem e muito mais.
            Aproveite todas as vantagens de ser Picnic.
          </Text>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 px-[var(--token-spacing-md)] pb-[var(--token-spacing-xl)] pt-[var(--token-spacing-md)]">
        <Button fullWidth size="lg" onPress={onNext}>
          <span className="flex items-center gap-[var(--token-spacing-2)]">
            Ver mais benefícios
            <ArrowRight size={18} />
          </span>
        </Button>
      </div>
    </div>
  )
}
