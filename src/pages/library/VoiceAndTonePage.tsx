import { motion } from 'framer-motion'

/* ─── Data ─── */

const voicePillars = [
  {
    title: 'Direto',
    overview: 'Somos claros no que queremos dizer e vamos direto ao ponto — porque estamos numa missão de tornar dinheiro universalmente acessível. Quebramos barreiras derrubando o financês. Transmitimos confiança equipando nossos clientes com informação e ferramentas.',
    shouldBe: ['Claro', 'Objetivo', 'Organizado', 'Curado', 'Confiante', 'Empoderador'],
    shouldNotBe: ['Esparso', 'Frio', 'Entediante', 'Sem vida', 'Vago', 'Monótono'],
    tactics: [
      { title: 'Não enterre a informação', description: 'Comece sempre pelo mais importante. Respeite o tempo e a atenção do usuário.' },
      { title: 'Clareza primeiro, estilo depois', description: 'Focamos na mensagem. Nunca deixamos o estilo ofuscar o conteúdo.' },
      { title: 'Guie com confiança', description: 'Explicamos como as coisas funcionam de forma clara e concisa. O cliente se sente empoderado.' },
      { title: 'Construa familiaridade', description: 'Através de consistência e repetição, criamos uma linguagem que o cliente reconhece.' },
    ],
  },
  {
    title: 'Confiante',
    overview: '5–10% mais barato que Wise. Faz a conta. Não precisamos gritar. Deixamos os números falarem. Somos a alternativa inteligente, não o disruptor raivoso. Comparamos com evidência, não com insulto.',
    shouldBe: ['Seguro', 'Embasado', 'Transparente', 'Responsável', 'Genuíno', 'Empático'],
    shouldNotBe: ['Técnico', 'Alarmista', 'Acadêmico', 'Arrogante', 'Agressivo', 'Corporativo'],
    tactics: [
      { title: 'Diga a verdade toda', description: 'Somos honestos sobre produtos, processos e políticas. É a única forma de construir confiança.' },
      { title: 'Equilibre humildade e confiança', description: 'Deixamos nossos pontos fortes brilharem enquanto reconhecemos limitações. Estamos sempre crescendo.' },
      { title: 'Mostre, não conte', description: '"R$1.439 em uma viagem de US$5.000" > "economize bastante". Números concretos, sempre.' },
      { title: 'Premissas, não promessas', description: 'Sugerimos, não comandamos. Usamos elementos literários: ironia, imagem, contraste.' },
    ],
  },
  {
    title: 'Leve',
    overview: 'Viajar sem susto no extrato. Nosso estilo imaginativo e convidativo nos torna cativantes e naturalmente acessíveis. Nivelamos o campo, tornando as coisas compreensíveis para todos. Não nos escondemos atrás de jargão ou ego.',
    shouldBe: ['Autoconsciente', 'Conversacional', 'Responsivo', 'Confiável', 'Inovador', 'Otimista'],
    shouldNotBe: ['Íntimo demais', 'Tagarela', 'Infantil', 'Distante', 'Sensacionalista', 'Inacessível'],
    tactics: [
      { title: 'Leia a sala', description: 'Considere o contexto antes de escrever — entenda o que o cliente quer, precisa e sente.' },
      { title: 'Traduza o complexo', description: 'Desmistificamos o financês. Mostramos personalidade onde faz sentido.' },
      { title: 'Seja inventivo', description: 'Desafiamos convenções. Trazemos detalhes do dia a dia que nenhum banco pensaria em usar.' },
      { title: 'Humor preciso', description: 'Usamos leveza com cuidado. Nunca forçamos uma piada. Somos espirituosos, não desesperados.' },
    ],
  },
  {
    title: 'Insider',
    overview: 'Descobri um jeito mais inteligente de viajar. Somos como aquele amigo esperto que compartilha um hack financeiro — não um banco falando de cima, não um crypto bro hypando. Informação privilegiada com generosidade.',
    shouldBe: ['Cúmplice', 'Generoso', 'Surpreendente', 'Útil', 'Perspicaz', 'Curioso'],
    shouldNotBe: ['Vendedor', 'Apelativo', 'Genérico', 'Óbvio', 'Conspiratório', 'Bom demais pra ser verdade'],
    tactics: [
      { title: 'Compartilhe, não venda', description: '"Descobri um jeito mais inteligente" > "Compre agora e aproveite!". Sempre insider, nunca vendedor.' },
      { title: 'Imagens mentais', description: 'Passar o cartão torcendo pra não vir caro. Abrir o app e ver exatamente quanto tá pagando.' },
      { title: 'Contraste como persuasão', description: '"Os outros prometem. O Picnic mostra a conta." O que fazem errado → o que fazemos diferente.' },
      { title: 'Assinaturas de marca', description: 'Se aceita Visa, aceita Picnic. Picnic: zero taxa de verdade. Abre o olho pro custo total.' },
    ],
  },
  {
    title: 'Coloquial',
    overview: 'Abre o olho pro custo total, sério. Falamos como o brasileiro fala de verdade — informal, natural, com as contrações e o ritmo do dia a dia. Sem formalidade corporativa, sem gíria pesada.',
    shouldBe: ['Natural', 'Brasileiro', 'Fluido', 'Acessível', 'Atual', 'Inclusivo'],
    shouldNotBe: ['Formal', 'Rebuscado', 'Gíria pesada', 'Estrangeirismo forçado', 'Imperativo', 'Acadêmico'],
    tactics: [
      { title: 'Contrações são bem-vindas', description: '"Tá", "pra", "pro", "tava", "num" — use livremente. É como a gente fala.' },
      { title: 'Você, sempre você', description: 'Nunca "tu", nunca "o senhor". Botões no infinitivo: "Consultar", "Ativar". Texto em terceira pessoa.' },
      { title: 'Max 15 palavras por frase', description: 'Prefira 8–12. Dígitos, não por extenso: "5 minutos" não "cinco minutos".' },
      { title: 'Nível de leitura: 16 anos', description: 'Escreva para alguém inteligente de 16 anos. Concreto > abstrato. Curto > longo.' },
    ],
  },
]

const toneContexts = [
  {
    title: 'Primeira impressão',
    description: 'Queremos capturar interesse e despertar curiosidade. Inspiramos um olhar mais atento através de uma linguagem ousada e inteligente.',
    bars: { direto: 40, leve: 90, confiante: 70 },
    touchpoints: ['Onboarding', 'Landing pages', 'App Store'],
  },
  {
    title: 'Uso do produto',
    description: 'Ajudamos o cliente a completar a tarefa de forma eficiente. Copy de orientação, ações claras e progresso incremental. Somos a mão que guia.',
    bars: { direto: 95, leve: 30, confiante: 60 },
    touchpoints: ['Fluxos in-app', 'Emails transacionais', 'Notificações'],
  },
  {
    title: 'Educação',
    description: 'Damos ao cliente a informação que ele precisa para tomar decisões. Cada interação é um bloco de conhecimento que gera controle, segurança e confiança.',
    bars: { direto: 80, leve: 50, confiante: 90 },
    touchpoints: ['Tooltips', 'Telas explicativas', 'Central de ajuda'],
  },
  {
    title: 'Engajamento',
    description: 'Queremos manter o cliente interessado — tanto como companheiro financeiro quanto como marca surpreendente. Isso pode significar um conteúdo ousado, uma experiência elevada.',
    bars: { direto: 30, leve: 90, confiante: 50 },
    touchpoints: ['Push notifications', 'Emails de produto', 'Social'],
  },
  {
    title: 'Erros & problemas',
    description: 'Pessoas precisam de ajuda para superar obstáculos. Aumentamos a empatia. Equipamos o cliente com informação clara em mensagens de erro e suporte.',
    bars: { direto: 90, leve: 20, confiante: 80 },
    touchpoints: ['Mensagens de erro', 'Suporte', 'Status de sistema'],
  },
  {
    title: 'Conversão',
    description: 'Mostramos a conta. Comparamos com evidência, não com insulto. Somos a alternativa inteligente — o framing nunca é "o mais barato", mas "o mais inteligente".',
    bars: { direto: 70, leve: 40, confiante: 95 },
    touchpoints: ['CTAs', 'Comparativos', 'Calculadoras'],
  },
]

const terminology: [string, string][] = [
  ['USDC', 'dólar digital'],
  ['BRLA', 'real'],
  ['blockchain', 'tecnologia (ou omitir)'],
  ['smart wallet', 'conta / carteira'],
  ['self custody', 'controle total do seu dinheiro'],
  ['stablecoin', 'dólar digital'],
  ['GNO token', 'cashback'],
  ['OG NFT', 'membro OG Club'],
  ['KYC', 'verificação de identidade'],
  ['PIX deposit', 'depósito via Pix'],
]

const forbiddenWords = ['blockchain', 'USDC', 'stablecoin', 'crypto', 'criptomoeda', 'dólar comercial', 'garantido', 'investimento', 'sem risco', 'o melhor', 'o mais barato']
const forbiddenTones = ['Conspiratório', 'Agressivo', 'Bom demais pra ser verdade', 'Corporativo', 'Crypto bro']

/* ─── Shared easing ─── */
const ease = [0.22, 1, 0.36, 1] as const

/* ─── Components ─── */

function AnimatedTitle({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <div className="flex justify-center py-[var(--token-spacing-10)]">
      <h3 className="text-[80px] leading-[1] font-bold tracking-tight" aria-label={text}>
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{ color: '#28D278' }}
            initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: delay + i * 0.04, duration: 0.5, ease }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </h3>
    </div>
  )
}

function ToneBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  return (
    <div className="flex items-center gap-[var(--token-spacing-3)]">
      <span className="w-[80px] text-[length:var(--token-font-size-caption)] text-shell-text-secondary shrink-0">{label}</span>
      <div className="flex-1 h-[8px] bg-shell-hover rounded-[var(--token-radius-full)] overflow-hidden">
        <motion.div
          className="h-full rounded-[var(--token-radius-full)]"
          style={{ backgroundColor: '#28D278' }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease, delay }}
        />
      </div>
    </div>
  )
}

function Chip({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease, delay }}
      className="inline-flex px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] bg-shell-hover rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary"
    >
      {children}
    </motion.span>
  )
}

/* ─── Page ─── */

export default function VoiceAndTonePage() {
  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      {/* ─── Nossa voz ─── */}
      <section className="max-w-[1100px] mx-auto px-[120px] pt-[var(--token-spacing-10)] pb-[var(--token-spacing-6)]">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-[36px] leading-[1.1] font-bold text-shell-text mb-[var(--token-spacing-2)]"
        >
          Nossa voz
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="text-[length:var(--token-font-size-body-md)] text-shell-text-tertiary max-w-[640px]"
        >
          Nossa personalidade; como sempre soamos. Não importa quem escreve, o Picnic soa como Picnic.
        </motion.p>
      </section>

      {/* ─── Voice Pillars ─── */}
      {voicePillars.map((pillar, pillarIdx) => (
        <section key={pillar.title} className="border-b border-shell-border">
          <div className="max-w-[1100px] mx-auto px-[120px]">
            <AnimatedTitle text={pillar.title} delay={0.3 + pillarIdx * 0.15} />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.5 + pillarIdx * 0.15 }}
              className="grid grid-cols-[1fr_1.2fr] gap-[var(--token-spacing-10)] pb-[var(--token-spacing-12)]"
            >
              {/* Left: Overview + Should/Shouldn't */}
              <div>
                <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">Overview</span>
                <p className="text-[length:var(--token-font-size-body-md)] text-shell-text leading-relaxed mt-[var(--token-spacing-2)] mb-[var(--token-spacing-8)]">
                  {pillar.overview}
                </p>
                <div className="grid grid-cols-2 gap-[var(--token-spacing-6)]">
                  <div>
                    <span className="text-[length:var(--token-font-size-caption)] font-medium text-[#28D278] uppercase tracking-wider">Somos</span>
                    <div className="flex flex-col gap-[var(--token-spacing-1)] mt-[var(--token-spacing-2)]">
                      {pillar.shouldBe.map((s) => (
                        <span key={s} className="text-[length:var(--token-font-size-body-sm)] text-shell-text">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">Não somos</span>
                    <div className="flex flex-col gap-[var(--token-spacing-1)] mt-[var(--token-spacing-2)]">
                      {pillar.shouldNotBe.map((s) => (
                        <span key={s} className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Tactics */}
              <div>
                <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">Táticas</span>
                <div className="grid grid-cols-2 gap-[var(--token-spacing-4)] mt-[var(--token-spacing-2)]">
                  {pillar.tactics.map((t) => (
                    <div key={t.title} className="border-t border-shell-border pt-[var(--token-spacing-3)]">
                      <h4 className="text-[length:var(--token-font-size-body-sm)] font-semibold text-shell-text mb-[var(--token-spacing-1)]">
                        {t.title}
                      </h4>
                      <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* ─── Nosso tom ─── */}
      <section className="max-w-[1100px] mx-auto px-[120px] pt-[var(--token-spacing-12)] pb-[var(--token-spacing-6)]">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="text-[36px] leading-[1.1] font-bold text-shell-text mb-[var(--token-spacing-2)]"
        >
          Nosso tom
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
          className="text-[length:var(--token-font-size-body-md)] text-shell-text-tertiary max-w-[640px] mb-[var(--token-spacing-4)]"
        >
          Nossa atitude; como nos adaptamos ao contexto. Antes de escrever, pergunte:
        </motion.p>
        <div className="flex flex-col gap-[var(--token-spacing-1)] text-[length:var(--token-font-size-body-md)] text-shell-text max-w-[640px]">
          {['O que esse texto precisa fazer?', 'Em que cenário estamos?', 'Com quem estamos falando?'].map((q, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.5 + i * 0.08 }}
            >
              {i + 1} — {q}
            </motion.span>
          ))}
        </div>
      </section>

      {/* ─── Tone Context Cards ─── */}
      <section className="max-w-[1100px] mx-auto px-[120px] pb-[var(--token-spacing-12)]">
        <div className="grid grid-cols-3 gap-[var(--token-spacing-4)] mt-[var(--token-spacing-6)]">
          {toneContexts.map((ctx, i) => (
            <motion.div
              key={ctx.title}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.08 }}
              className="bg-shell-surface border border-shell-border rounded-[var(--token-radius-md)] p-[var(--token-spacing-5)] flex flex-col"
            >
              <h4 className="text-[length:var(--token-font-size-body-md)] font-semibold text-shell-text mb-[var(--token-spacing-2)]">
                {ctx.title}
              </h4>
              <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary leading-relaxed mb-[var(--token-spacing-6)] flex-1">
                {ctx.description}
              </p>
              <div className="flex flex-col gap-[var(--token-spacing-2)] mb-[var(--token-spacing-4)]">
                <ToneBar label="Direto" value={ctx.bars.direto} delay={0.6 + i * 0.08} />
                <ToneBar label="Leve" value={ctx.bars.leve} delay={0.7 + i * 0.08} />
                <ToneBar label="Confiante" value={ctx.bars.confiante} delay={0.8 + i * 0.08} />
              </div>
              <div>
                <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">
                  Touchpoints
                </span>
                <div className="flex flex-col gap-[var(--token-spacing-0-5)] mt-[var(--token-spacing-1)]">
                  {ctx.touchpoints.map((tp) => (
                    <span key={tp} className="text-[length:var(--token-font-size-caption)] text-shell-text-secondary">
                      · {tp}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Quick Reference: Terminology + Forbidden ─── */}
      <section className="border-t border-shell-border">
        <div className="max-w-[1100px] mx-auto px-[120px] py-[var(--token-spacing-10)]">
          <div className="grid grid-cols-[1fr_1fr] gap-[var(--token-spacing-10)]">
            {/* Terminology */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
            >
              <h4 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text mb-[var(--token-spacing-4)]">
                Terminologia
              </h4>
              <div className="flex flex-col">
                {terminology.map(([tech, user]) => (
                  <div key={tech} className="flex items-center justify-between py-[var(--token-spacing-2)] border-b border-shell-border">
                    <span className="text-[length:var(--token-font-size-body-sm)] text-shell-text-tertiary line-through">{tech}</span>
                    <span className="text-[length:var(--token-font-size-body-sm)] text-shell-text font-medium">{user}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Forbidden */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.3 }}
            >
              <h4 className="text-[length:var(--token-font-size-heading-sm)] font-semibold text-shell-text mb-[var(--token-spacing-4)]">
                Proibido
              </h4>
              <div className="mb-[var(--token-spacing-4)]">
                <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">Palavras</span>
                <div className="flex flex-wrap gap-[var(--token-spacing-2)] mt-[var(--token-spacing-2)]">
                  {forbiddenWords.map((w, i) => <Chip key={w} delay={0.4 + i * 0.03}>{w}</Chip>)}
                </div>
              </div>
              <div>
                <span className="text-[length:var(--token-font-size-caption)] font-medium text-shell-text-tertiary uppercase tracking-wider">Tons</span>
                <div className="flex flex-wrap gap-[var(--token-spacing-2)] mt-[var(--token-spacing-2)]">
                  {forbiddenTones.map((t, i) => <Chip key={t} delay={0.5 + i * 0.03}>{t}</Chip>)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
