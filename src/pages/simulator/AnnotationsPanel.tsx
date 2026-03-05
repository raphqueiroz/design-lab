import { useNavigate } from 'react-router-dom'
import type { FlowScreen, Flow } from './flowRegistry'

interface AnnotationsPanelProps {
  flow: Flow
  currentScreen: FlowScreen
  screenIndex: number
  onFlowEdited: () => void
}

export default function AnnotationsPanel({
  flow,
  currentScreen,
  screenIndex,
}: AnnotationsPanelProps) {
  const navigate = useNavigate()

  const handleExport = () => {
    const lines = [
      `# ${flow.name} — Flow Handoff`,
      '',
      flow.description ? `> ${flow.description}` : '',
      '',
      `## Spec`,
      flow.specContent ?? '_No spec available_',
      '',
      `## Screens (${flow.screens.length})`,
      ...flow.screens.map(
        (s, i) => `${i + 1}. **${s.title}** — ${s.description}`,
      ),
      '',
      `## Components Used`,
      ...Array.from(
        new Set(flow.screens.flatMap((s) => s.componentsUsed)),
      ).map((c) => `- ${c}`),
      '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flow.id}-handoff.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="w-[300px] h-full shrink-0 overflow-y-auto border-l border-shell-border bg-shell-surface">
      <div className="p-[var(--token-spacing-md)] border-b border-shell-border flex items-center justify-between">
        <h2 className="text-[length:var(--token-font-size-caption)] leading-[var(--token-line-height-caption)] font-semibold text-shell-text-tertiary uppercase tracking-wider">
          Annotations
        </h2>
        <button
          type="button"
          onClick={handleExport}
          className="text-[length:var(--token-font-size-caption)] text-shell-selected-text hover:text-[#6EE7A0] font-medium cursor-pointer"
        >
          Export
        </button>
      </div>

      <div className="p-[var(--token-spacing-md)]">
        {/* Flow name */}
        <div className="mb-[var(--token-spacing-2)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Flow Name
          </p>
          <p className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text">
            {flow.name}
          </p>
        </div>

        {/* Flow description */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Overview
          </p>
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
            {flow.description}
          </p>
        </div>

        {/* Current screen info */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-1)]">
            Screen {screenIndex + 1} of {flow.screens.length}
          </p>
          <p className="text-[length:var(--token-font-size-heading-sm)] font-medium text-shell-text mb-[var(--token-spacing-1)]">
            {currentScreen.title}
          </p>
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary mb-[var(--token-spacing-1)] font-mono">
            {currentScreen.id}
          </p>
          <p className="text-[length:var(--token-font-size-body-sm)] text-shell-text-secondary">
            {currentScreen.description}
          </p>
        </div>

        {/* Components used */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
            Components
          </p>
          <div className="flex flex-wrap gap-[var(--token-spacing-1)]">
            {currentScreen.componentsUsed.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => navigate(`/components?selected=${encodeURIComponent(c)}`)}
                className="px-[var(--token-spacing-2)] py-[1px] bg-shell-hover rounded-[var(--token-radius-full)] text-[length:var(--token-font-size-caption)] text-shell-text-secondary hover:bg-shell-active hover:text-shell-text transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Flow metadata */}
        <div className="mb-[var(--token-spacing-lg)]">
          <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
            Flow Info
          </p>
          <div className="flex flex-col gap-[var(--token-spacing-1)]">
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">Domain</span>
              <span className="text-shell-text">{flow.domain}</span>
            </div>
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">Total screens</span>
              <span className="text-shell-text">{flow.screens.length}</span>
            </div>
            <div className="flex justify-between text-[length:var(--token-font-size-body-sm)]">
              <span className="text-shell-text-secondary">ID</span>
              <span className="text-shell-text font-mono">{flow.id}</span>
            </div>
          </div>
        </div>

        {/* Spec content */}
        {flow.specContent && (
          <div>
            <p className="text-[length:var(--token-font-size-caption)] text-shell-text-tertiary uppercase tracking-wider mb-[var(--token-spacing-2)]">
              Spec
            </p>
            <pre className="text-[length:var(--token-font-size-caption)] text-shell-text-secondary whitespace-pre-wrap bg-shell-input p-[var(--token-spacing-3)] rounded-[var(--token-radius-md)] max-h-[300px] overflow-y-auto">
              {flow.specContent}
            </pre>
          </div>
        )}

      </div>
    </aside>
  )
}
