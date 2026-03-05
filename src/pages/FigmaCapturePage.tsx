import { useSearchParams } from 'react-router-dom'
import { LayoutProvider } from '../library/layout/LayoutProvider'

/* Force registrations */
import '../flows/caixinha-dolar'

import { getPage } from './gallery/pageRegistry'

export default function FigmaCapturePage() {
  const [params] = useSearchParams()
  const pageId = params.get('id') ?? ''
  const page = getPage(pageId)

  if (!page) {
    return <div style={{ padding: 40 }}>Page not found: {pageId}</div>
  }

  const Component = page.component

  return (
    <LayoutProvider mode="mobile">
      <div style={{ width: 390, height: 844, margin: '0 auto', overflow: 'hidden', position: 'relative', background: 'var(--token-surface-primary, #fff)' }}>
        <Component onNext={() => {}} onBack={() => {}} />
      </div>
    </LayoutProvider>
  )
}
