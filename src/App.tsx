import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import NavRail from './components/NavRail'
import LibraryPage from './pages/LibraryPage'
import SimulatorPage from './pages/SimulatorPage'
import FlowMapPage from './pages/FlowMapPage'
import PageGalleryPage from './pages/PageGalleryPage'
import PreviewPage from './pages/PreviewPage'

function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-shell-bg">
      <NavRail />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/preview/:flowId" element={<PreviewPage />} />
        <Route path="/components/*" element={<ShellLayout><LibraryPage /></ShellLayout>} />
        <Route path="/flows/*" element={<ShellLayout><SimulatorPage /></ShellLayout>} />
        <Route path="/map/*" element={<ShellLayout><FlowMapPage /></ShellLayout>} />
        <Route path="/pages/*" element={<ShellLayout><PageGalleryPage /></ShellLayout>} />
        {/* Legacy redirects */}
        <Route path="/library/*" element={<Navigate to="/components" replace />} />
        <Route path="/simulator/*" element={<Navigate to="/flows" replace />} />
        <Route path="*" element={<Navigate to="/flows" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
