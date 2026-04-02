/**
 * @screen Referral A — Value Proposition
 * High-converting referral landing: dark premium hero, zero-fees grid,
 * dual reward card, feature strip, social proof, email capture.
 */
import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  RiArrowRightLine,
  RiStarFill,
} from '@remixicon/react'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import TextInput from '@/library/inputs/TextInput'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import Badge from '@/library/display/Badge'
import Avatar from '@/library/display/Avatar'

// ── Zero-fee items ──
const zeroFees = [
  { label: 'IOF', emoji: '🏛️' },
  { label: 'Spread', emoji: '📊' },
  { label: 'Anuidade', emoji: '💳' },
  { label: 'Manutenção', emoji: '🔧' },
]

export default function Screen({ onNext, onElementTap }: FlowScreenProps) {
  const [email, setEmail] = useState('')

  const handleClaim = () => {
    const resolved = onElementTap?.('Button: Quero meu bônus de US$ 10')
    if (!resolved) onNext()
  }

  return (
    <BaseLayout className="!bg-[#FAF7F0] !gap-0">
      {/* ══════ DARK HERO SECTION ══════ */}
      <div className="-mx-[var(--token-spacing-6)] -mt-[var(--token-spacing-6)] px-[24px] pt-[32px] pb-[28px] bg-[#111827] rounded-b-[28px]">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-[24px]">
          <span className="text-[18px] font-bold tracking-[-0.5px] text-white">picnic</span>
          <Badge variant="lime" size="sm">ACESSO VIA INDICAÇÃO</Badge>
        </div>

        {/* Hero headline */}
        <div className="mb-[12px]">
          <Text variant="display" className="!text-white !text-[28px] !leading-[1.15]">
            O dólar mais barato{'\n'}do Brasil.
          </Text>
        </div>
        <div className="mb-[20px]">
          <Text variant="heading-sm" className="!text-[var(--token-brand-400)]">
            Sem IOF. Sem taxas. Sem pegadinha.
          </Text>
        </div>

        {/* Feature pills — simple text */}
        <div className="flex gap-[6px] flex-wrap">
          {['Cartão Visa®', 'Conta global', 'Pix em 5 min'].map((label) => (
            <span key={label} className="bg-white/10 rounded-full px-[10px] py-[5px] text-[11px] font-medium text-white/80 whitespace-nowrap">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ══════ CONTENT ON CREAM ══════ */}
      <div className="flex flex-col gap-[20px] px-0 pt-[24px]">

        {/* ── Dual Reward Card ── */}
        <div className="rounded-[16px] bg-[var(--token-interactive-default)] p-[20px]">
          <div className="flex items-center gap-[4px] mb-[12px]">
            <RiStarFill size={16} className="text-[var(--token-interactive-foreground)]" />
            <span className="text-[12px] font-bold tracking-[1px] text-[var(--token-interactive-foreground)] uppercase">
              Bônus de boas-vindas
            </span>
          </div>
          <div className="flex gap-[12px]">
            {/* You get */}
            <div className="flex-1 bg-white/40 rounded-[12px] p-[14px] text-center">
              <span className="text-[11px] font-medium text-[var(--token-interactive-foreground)] uppercase tracking-[0.5px] block mb-[4px]">
                Você ganha
              </span>
              <span className="text-[28px] font-bold text-[var(--token-interactive-foreground)] leading-none block">
                US$ 10
              </span>
            </div>
            {/* Friend gets */}
            <div className="flex-1 bg-white/40 rounded-[12px] p-[14px] text-center">
              <span className="text-[11px] font-medium text-[var(--token-interactive-foreground)] uppercase tracking-[0.5px] block mb-[4px]">
                Amigo ganha
              </span>
              <span className="text-[28px] font-bold text-[var(--token-interactive-foreground)] leading-none block">
                US$ 10
              </span>
            </div>
          </div>
          <div className="mt-[12px] text-center">
            <span className="text-[12px] text-[var(--token-interactive-foreground)]">
              Gaste US$ 50 nos primeiros 30 dias e o bônus é seu.
            </span>
          </div>
        </div>

        {/* ── Zero Fees Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-[12px]">
            <Text variant="heading-sm">Taxas? Zero. Todas.</Text>
            <Badge variant="warning" size="sm">Só até 30/abr</Badge>
          </div>
          <div className="grid grid-cols-2 gap-[8px]">
            {zeroFees.map((item) => (
              <div key={item.label} className="bg-white rounded-[12px] p-[14px] flex items-center gap-[10px] border border-[var(--color-border-default)]">
                <span className="text-[20px]">{item.emoji}</span>
                <div className="flex flex-col">
                  <span className="text-[12px] text-[var(--color-content-secondary)]">{item.label}</span>
                  <span className="text-[16px] font-bold text-[var(--token-brand-600)]">Zero</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Value Prop ── */}
        <div className="bg-white rounded-[16px] p-[20px] border border-[var(--color-border-default)]">
          <Text variant="body-md" color="content-secondary">
            Conta digital em dólar com cartão Visa® internacional. Deposita via Pix, converte na hora, gasta no mundo todo. Sem surpresas no extrato.
          </Text>
        </div>

        {/* ── Social Proof ── */}
        <div className="flex flex-col items-center gap-[8px]">
          <div className="flex -space-x-3">
            {['Ana', 'Pedro', 'Carla', 'Lucas', 'Bia', 'Gui'].map((name) => (
              <Avatar key={name} initials={name.slice(0, 2)} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-[4px]">
            <div className="flex gap-[2px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <RiStarFill key={i} size={12} className="text-[#FBBF24]" />
              ))}
            </div>
            <Text variant="caption" color="content-secondary">
              12.847 pessoas já indicaram
            </Text>
          </div>
        </div>
      </div>

      {/* ══════ STICKY CTA ══════ */}
      <StickyFooter>
        <Stack gap="sm">
          <TextInput
            placeholder="Seu melhor e-mail"
            value={email}
            onChange={setEmail}
          />
          <Button variant="accent" size="lg" onPress={handleClaim} fullWidth>
            Quero meu bônus de US$ 10 <RiArrowRightLine size={18} className="inline ml-[4px] -mt-[2px]" />
          </Button>
          <Text variant="caption" color="content-tertiary" align="center">
            Grátis · 2 min · Sem compromisso
          </Text>
        </Stack>
      </StickyFooter>
    </BaseLayout>
  )
}
