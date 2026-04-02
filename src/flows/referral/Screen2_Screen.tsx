/**
 * @screen Referral B — Reward First
 * Bold reward-first landing: oversized bonus hero, share code pill,
 * 3-step strip, progress tracker, FAQ accordion, share CTA.
 */
import { useState } from 'react'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  RiGiftLine,
  RiFileCopyLine,
  RiWhatsappLine,
  RiShareLine,
  RiArrowRightLine,
  RiArrowDownSLine,
  RiCheckboxCircleFill,
} from '@remixicon/react'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'
import Badge from '@/library/display/Badge'
import Avatar from '@/library/display/Avatar'
import ProgressBar from '@/library/display/ProgressBar'

// ── Steps ──
const steps = [
  { num: '01', title: 'Compartilhe seu link', desc: 'Envie pra quem viaja ou quer proteger o dinheiro.' },
  { num: '02', title: 'Amigo abre a conta', desc: 'Cadastro em 2 min, sem burocracia.' },
  { num: '03', title: 'Vocês dois ganham', desc: 'US$ 10 pra cada, creditado na hora.' },
]

// ── FAQ items ──
const faqs = [
  { q: 'Quando recebo o bônus?', a: 'Assim que seu amigo gastar US$ 50 nos primeiros 30 dias. O crédito aparece na hora.' },
  { q: 'Tem limite de indicações?', a: 'Sem limite! Indique quantas pessoas quiser. Cada indicação = US$ 10 pra você.' },
  { q: 'Meu amigo precisa fazer o quê?', a: 'Criar a conta pelo seu link e gastar US$ 50 com o cartão em 30 dias.' },
]

export default function Screen({ onNext, onElementTap }: FlowScreenProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const resolved = onElementTap?.('Button: Compartilhar convite')
    if (!resolved) onNext()
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <BaseLayout className="!bg-[#FAF7F0] !gap-0">
      {/* ══════ REWARD HERO ══════ */}
      <div className="-mx-[var(--token-spacing-6)] -mt-[var(--token-spacing-6)] relative overflow-hidden">
        {/* Lime gradient hero */}
        <div className="bg-gradient-to-b from-[#c8f91f] to-[#a8d916] px-[24px] pt-[40px] pb-[32px] text-center relative">
          {/* Decorative circles */}
          <div className="absolute top-[-20px] right-[-20px] w-[100px] h-[100px] rounded-full bg-white/15" />
          <div className="absolute bottom-[-10px] left-[-15px] w-[60px] h-[60px] rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="w-[56px] h-[56px] rounded-full bg-white/30 flex items-center justify-center mx-auto mb-[16px]">
              <RiGiftLine size={28} className="text-[var(--token-interactive-foreground)]" />
            </div>
            <div className="text-[48px] font-extrabold text-[var(--token-interactive-foreground)] leading-none tracking-[-2px] mb-[8px]">
              +US$ 10
            </div>
            <div className="text-[14px] font-medium text-[var(--token-interactive-foreground)] max-w-[240px] mx-auto">
              Pra você e pro seu amigo. Cada indicação, mais US$ 10.
            </div>
          </div>
        </div>
      </div>

      {/* ══════ CONTENT ══════ */}
      <div className="flex flex-col gap-[24px] pt-[24px]">

        {/* ── Share Code ── */}
        <div className="bg-white rounded-[16px] p-[16px] border border-[var(--color-border-default)]">
          <Text variant="caption" color="content-secondary" className="mb-[8px] block">
            Seu código de indicação
          </Text>
          <div className="flex items-center gap-[8px] mb-[12px]">
            <div className="flex-1 bg-[var(--token-neutral-100)] rounded-[10px] px-[14px] py-[10px] font-mono text-[16px] font-bold tracking-[2px] text-[var(--color-content-primary)]">
              PICNIC-R4PH
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-[44px] h-[44px] rounded-[10px] bg-[var(--token-neutral-100)] flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              {copied
                ? <RiCheckboxCircleFill size={20} className="text-[var(--token-brand-500)]" />
                : <RiFileCopyLine size={20} className="text-[var(--color-content-secondary)]" />
              }
            </button>
          </div>
          {/* Share buttons */}
          <div className="flex gap-[8px]">
            <button type="button" className="flex-1 flex items-center justify-center gap-[6px] bg-[#25D366] text-white rounded-[10px] py-[10px] text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-transform">
              <RiWhatsappLine size={18} /> WhatsApp
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-[6px] bg-[var(--token-neutral-800)] text-white rounded-[10px] py-[10px] text-[13px] font-semibold cursor-pointer active:scale-[0.98] transition-transform">
              <RiShareLine size={18} /> Compartilhar
            </button>
          </div>
        </div>

        {/* ── Progress Tracker ── */}
        <div className="bg-white rounded-[16px] p-[16px] border border-[var(--color-border-default)]">
          <div className="flex items-center justify-between mb-[8px]">
            <Text variant="body-sm" color="content-secondary">Seus ganhos</Text>
            <Badge variant="lime" size="sm">Meta: US$ 500</Badge>
          </div>
          <div className="flex items-baseline gap-[4px] mb-[10px]">
            <span className="text-[28px] font-bold text-[var(--color-content-primary)] leading-none">US$ 30</span>
            <span className="text-[14px] text-[var(--color-content-secondary)]">de US$ 500</span>
          </div>
          <ProgressBar value={6} max={100} className="mb-[10px]" />
          <div className="flex gap-[16px]">
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-content-tertiary)] uppercase tracking-[0.5px]">Indicações</span>
              <span className="text-[16px] font-semibold text-[var(--color-content-primary)]">3</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-content-tertiary)] uppercase tracking-[0.5px]">Pendente</span>
              <span className="text-[16px] font-semibold text-[#D97706]">US$ 10</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--color-content-tertiary)] uppercase tracking-[0.5px]">Disponível</span>
              <span className="text-[16px] font-semibold text-[var(--token-brand-600)]">US$ 20</span>
            </div>
          </div>
        </div>

        {/* ── 3 Steps ── */}
        <div>
          <Text variant="heading-sm" className="mb-[12px]">Como funciona</Text>
          <div className="flex flex-col gap-[0px]">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-[14px]">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-[32px] h-[32px] rounded-full bg-[var(--token-interactive-default)] flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-bold text-[var(--token-interactive-foreground)]">{step.num}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-[2px] flex-1 bg-[var(--token-neutral-200)] my-[4px]" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-[16px]">
                  <Text variant="body-md" className="!font-semibold">{step.title}</Text>
                  <Text variant="body-sm" color="content-secondary">{step.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Social Proof ── */}
        <div className="flex items-center gap-[10px] bg-white rounded-[12px] p-[14px] border border-[var(--color-border-default)]">
          <div className="flex -space-x-2 shrink-0">
            {['Ana', 'Pedro', 'Carla', 'Lucas'].map((name) => (
              <Avatar key={name} initials={name.slice(0, 2)} size="sm" />
            ))}
          </div>
          <Text variant="body-sm" color="content-secondary">
            <span className="font-semibold text-[var(--color-content-primary)]">12.847 pessoas</span> já indicaram e ganharam
          </Text>
        </div>

        {/* ── FAQ Accordion ── */}
        <div>
          <Text variant="heading-sm" className="mb-[12px]">Perguntas frequentes</Text>
          <div className="flex flex-col gap-[8px]">
            {faqs.map((faq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="bg-white rounded-[12px] p-[14px] border border-[var(--color-border-default)] text-left cursor-pointer w-full"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[var(--color-content-primary)] pr-[8px]">
                    {faq.q}
                  </span>
                  <RiArrowDownSLine
                    size={20}
                    className={`text-[var(--color-content-tertiary)] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </div>
                {openFaq === i && (
                  <p className="text-[13px] text-[var(--color-content-secondary)] mt-[8px] leading-[1.5]">
                    {faq.a}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ STICKY CTA ══════ */}
      <StickyFooter>
        <Stack gap="sm">
          <Button variant="accent" size="lg" onPress={handleShare} fullWidth>
            Compartilhar convite <RiArrowRightLine size={18} className="inline ml-[4px] -mt-[2px]" />
          </Button>
          <Text variant="caption" color="content-tertiary" align="center">
            Seu amigo ganha US$ 10. Você também.
          </Text>
        </Stack>
      </StickyFooter>
    </BaseLayout>
  )
}
