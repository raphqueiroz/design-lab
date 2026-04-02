import { useState, useMemo } from 'react'
import { getComponent } from '../../library/registry'
import ComponentPreview from './ComponentPreview'
import ComponentContextScene from './ComponentContextScene'
import PhoneFrame from '../simulator/PhoneFrame'

const bottomComponents = new Set(['Button', 'TabBar', 'StickyFooter', 'BottomSheet', 'Toast'])

function CodeTag({ children }: { children: string }) {
  return (
    <code className="inline-block px-[6px] py-[1px] mx-[1px] border border-[#333] rounded-[4px] text-[12px] font-mono" style={{ color: '#CE93D8' }}>
      {children}
    </code>
  )
}

function TypeCell({ type }: { type: string }) {
  // Split union types like "'primary' | 'secondary'" into individual tags
  if (type.includes(' | ')) {
    const parts = type.split(' | ')
    return (
      <span className="flex flex-wrap gap-[4px]">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-[4px]">
            <CodeTag>{part.replace(/['"]/g, '')}</CodeTag>
            {i < parts.length - 1 && <span className="text-shell-text-tertiary">|</span>}
          </span>
        ))}
      </span>
    )
  }
  return <CodeTag>{type.replace(/['"]/g, '')}</CodeTag>
}

function DefaultCell({ value }: { value?: string }) {
  if (!value || value === '—') return <span className="text-shell-text-secondary">—</span>
  return <CodeTag>{value.replace(/['"]/g, '')}</CodeTag>
}

function highlightJsx(code: string) {
  // Tokenize JSX-like code with color classes
  const tokens: { text: string; color: string }[] = []
  // Match patterns in order: strings, component names, prop names, brackets, spread, rest
  const regex = /("[^"]*"|'[^']*')|(<\/?)|(\/>|>)|([\w-]+)(?==)|([A-Z][\w]*)|(\{\.{3}\})|([{}()=])|(\s+)|(.)/g
  let match
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push({ text: match[1], color: '#A5D6A7' })       // strings — green
    else if (match[2]) tokens.push({ text: match[2], color: '#7986CB' })   // < or </ — blue
    else if (match[3]) tokens.push({ text: match[3], color: '#7986CB' })   // /> or > — blue
    else if (match[4]) tokens.push({ text: match[4], color: '#CE93D8' })   // prop names — purple
    else if (match[5]) tokens.push({ text: match[5], color: '#FFCC80' })   // component name — orange
    else if (match[6]) tokens.push({ text: match[6], color: '#E0E0E0' })   // spread — gray
    else if (match[7]) tokens.push({ text: match[7], color: '#E0E0E0' })   // punctuation — gray
    else if (match[8]) tokens.push({ text: match[8], color: '' })          // whitespace
    else if (match[9]) tokens.push({ text: match[9], color: '#E0E0E0' })   // rest
  }
  return tokens
}

function displayName(name: string): string {
  if (name.includes(' ')) return name
  return name.replace(/([a-z])([A-Z])/g, '$1 $2')
}

const demoGradients = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',  // deep blue
  'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #2d4a3e 70%, #0d1b2a 100%)',  // dark teal
  'linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 40%, #1a1a2e 70%, #1a1a1a 100%)',  // dark purple
  'linear-gradient(135deg, #1b2420 0%, #0f3460 40%, #1a1a2e 70%, #1b2420 100%)',  // ocean
  'linear-gradient(135deg, #1a1a1a 0%, #3b1f2b 40%, #1a1a2e 70%, #1a1a1a 100%)',  // dark rose
  'linear-gradient(135deg, #1a2a1a 0%, #2d4a2e 40%, #1a3a2a 70%, #1a2a1a 100%)',  // forest
  'linear-gradient(135deg, #2a1a0a 0%, #3d2b1a 40%, #2a1a1a 70%, #2a1a0a 100%)',  // warm brown
  'linear-gradient(135deg, #1a1a2e 0%, #2e1a3e 40%, #3e1a2e 70%, #1a1a2e 100%)',  // magenta
]

function getDemoGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
  return demoGradients[Math.abs(hash) % demoGradients.length]
}

interface ComponentDetailProps {
  componentName: string
}

export default function ComponentDetail({ componentName }: ComponentDetailProps) {
  const meta = getComponent(componentName)
  const [phoneView, setPhoneView] = useState(true)

  const codeSnippet = useMemo(() => {
    if (!meta) return ''
    const requiredProps = meta.props.filter((p) => p.required)
    const propsStr = requiredProps.map((p) => `${p.name}={...}`).join(' ')
    const usage = `<${meta.name}${propsStr ? ` ${propsStr}` : ''} />`
    return `import ${meta.name} from '@/library/.../${meta.name}'\n\n${usage}`
  }, [meta])

  if (!meta) {
    return (
      <div className="flex-1 flex items-center justify-center text-shell-text-tertiary">
        Select a component from the sidebar
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-shell-bg">
      <div className="py-[32px] px-[120px]">
        {/* ─── Hero: Title + Phone Mockup ─── */}
        <div className="grid grid-cols-[1fr_1fr] gap-[var(--token-spacing-2)] mb-[var(--token-spacing-8)]" style={{ height: '500px' }}>
          {/* Left: Title block */}
          <div className="flex flex-col justify-center rounded-[var(--token-radius-lg)] p-[var(--token-spacing-16)]" style={{ backgroundColor: '#141414' }}>
            <h1 className="text-[64px] leading-[1.05] font-bold text-shell-text mb-[var(--token-spacing-4)]">
              {displayName(meta.name)}
            </h1>
            <p className="text-[length:var(--token-font-size-body-lg)] leading-relaxed mb-[var(--token-spacing-6)]" style={{ color: '#C8C8C8' }}>
              {meta.description}
            </p>
            <div className="flex items-center gap-[var(--token-spacing-2)] flex-wrap">
              <span className="px-[var(--token-spacing-3)] py-[2px] bg-shell-surface border border-shell-border rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] font-mono text-shell-text-secondary">
                {meta.category}
              </span>
              {meta.variants && meta.variants.map((v) => (
                <span key={v} className="px-[var(--token-spacing-3)] py-[2px] bg-shell-surface border border-shell-border rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] font-mono text-shell-text-secondary">
                  {v}
                </span>
              ))}
              {meta.sizes && meta.sizes.map((s) => (
                <span key={s} className="px-[var(--token-spacing-3)] py-[2px] bg-shell-surface border border-shell-border rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] font-mono text-shell-text-secondary">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup — bleeds top or bottom */}
          {(() => {
            const showBottom = bottomComponents.has(meta.name)
            // PhoneFrame sm = 375×812 at 0.75 internal scale = 281×609 rendered px
            const phoneScale = 1.1
            return (
              <div
                className="rounded-[var(--token-radius-lg)] overflow-hidden relative h-full isolate"
                style={{
                  background: getDemoGradient(meta.name),
                }}
              >
                {/* Grain overlay — behind phone */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.35] mix-blend-soft-light pointer-events-none z-0" aria-hidden>
                  <filter id="demo-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#demo-noise)" />
                </svg>
                <div
                  className="absolute inset-x-0 flex justify-center pointer-events-none z-10"
                  style={{
                    bottom: showBottom ? '0' : 'auto',
                    top: showBottom ? 'auto' : '0',
                  }}
                >
                  <div
                    className="pointer-events-none select-none demo-phone-flat"
                    style={{
                      transform: `scale(${phoneScale})`,
                      transformOrigin: showBottom ? 'bottom center' : 'top center',
                      marginTop: showBottom ? undefined : '40px',
                      marginBottom: showBottom ? '40px' : undefined,
                      color: '#D1D5DB',
                      '--color-content-primary': '#D1D5DB',
                    } as React.CSSProperties}
                  >
                    <PhoneFrame size="sm">
                      <ComponentContextScene meta={meta} />
                    </PhoneFrame>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* ─── Preview ─── */}
        <div className="mb-[var(--token-spacing-12)]">
          <h2 className="text-[length:var(--token-font-size-heading-lg)] font-semibold text-shell-text mb-[var(--token-spacing-4)]">
            Preview
          </h2>
          <div
            className="rounded-[var(--token-radius-lg)] p-[var(--token-spacing-10)] relative overflow-hidden min-h-[360px] flex items-center justify-center"
            style={{
              backgroundColor: '#FFFFFF',
              backgroundImage: 'radial-gradient(circle, #D1D5DB 0.5px, transparent 0.5px)',
              backgroundSize: '12px 12px',
            }}
          >
            {/* View toggle — top right */}
            <div className="absolute top-[var(--token-spacing-3)] right-[var(--token-spacing-3)] z-20">
              <div className="relative flex p-[2px] bg-neutral-200 rounded-[6px]">
                {['Mobile', 'Expanded'].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPhoneView(i === 0)}
                    className={`
                      relative z-10 px-[var(--token-spacing-3)] py-[var(--token-spacing-1)]
                      text-[length:var(--token-font-size-caption)] font-medium
                      rounded-[5px] cursor-pointer transition-colors
                      ${(i === 0 ? phoneView : !phoneView) ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className={`text-content-primary w-full ${phoneView ? 'max-w-[393px]' : ''}`}>
              <ComponentPreview meta={meta} />
            </div>
          </div>
        </div>

        {/* ─── Usage and Properties ─── */}
        <div>
          <h2 className="text-[length:var(--token-font-size-heading-lg)] font-semibold text-shell-text mb-[var(--token-spacing-4)]">
            Usage and Properties
          </h2>

          {/* Code snippet */}
          <div className="relative bg-[#141414] rounded-[var(--token-radius-md)] p-[var(--token-spacing-6)] mb-[var(--token-spacing-4)]">
            <pre className="text-[13px] leading-[1.7] font-mono whitespace-pre-wrap break-all m-0">
              {highlightJsx(codeSnippet).map((t, i) => (
                t.color
                  ? <span key={i} style={{ color: t.color }}>{t.text}</span>
                  : t.text
              ))}
            </pre>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(codeSnippet)}
              className="absolute top-[var(--token-spacing-3)] right-[var(--token-spacing-3)] px-[var(--token-spacing-3)] py-[var(--token-spacing-1)] text-[length:var(--token-font-size-caption)] text-[#666] hover:text-[#AAA] bg-[#2A2A2A] rounded-[var(--token-radius-sm)] cursor-pointer transition-colors"
            >
              Copy
            </button>
          </div>

          {/* Props table */}
          <div className="overflow-x-auto bg-[#141414] rounded-[var(--token-radius-md)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="px-[var(--token-spacing-5)] py-[var(--token-spacing-3)] font-medium text-shell-text-tertiary">Property</th>
                  <th className="px-[var(--token-spacing-5)] py-[var(--token-spacing-3)] font-medium text-shell-text-tertiary">Description</th>
                  <th className="px-[var(--token-spacing-5)] py-[var(--token-spacing-3)] font-medium text-shell-text-tertiary">Type</th>
                  <th className="px-[var(--token-spacing-5)] py-[var(--token-spacing-3)] font-medium text-shell-text-tertiary">Default</th>
                </tr>
              </thead>
              <tbody>
                {meta.props.map((p) => (
                  <tr key={p.name} className="border-t border-[#2A2A2A]">
                    <td className="px-[var(--token-spacing-5)] py-[var(--token-spacing-4)] font-mono font-medium text-shell-text align-top whitespace-nowrap">
                      {p.name}
                      {p.required && <span className="text-[#CE93D8] ml-[2px]">*</span>}
                    </td>
                    <td className="px-[var(--token-spacing-5)] py-[var(--token-spacing-4)] font-mono text-shell-text-secondary align-top max-w-[620px]">
                      {p.description}
                    </td>
                    <td className="px-[var(--token-spacing-5)] py-[var(--token-spacing-4)] align-top">
                      <TypeCell type={p.type} />
                    </td>
                    <td className="px-[var(--token-spacing-5)] py-[var(--token-spacing-4)] align-top">
                      <DefaultCell value={p.defaultValue} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
