import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
}

function StatusBar() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })

  return (
    <div className="relative h-[54px] bg-surface-primary shrink-0">
      {/* Time — left of Dynamic Island, vertically centered at ~30pt from top */}
      <span
        className="absolute text-[17px] font-semibold text-content-primary leading-none"
        style={{ left: 32, top: 16 }}
      >
        {time}
      </span>

      {/* Right indicators — right of Dynamic Island */}
      <div
        className="absolute flex items-center gap-[5px]"
        style={{ right: 18, top: 18 }}
      >
        {/* Cellular — 4 ascending bars */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="0.7" fill="var(--token-content-primary)" />
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.7" fill="var(--token-content-primary)" />
          <rect x="9" y="2" width="3" height="9" rx="0.7" fill="var(--token-content-primary)" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="var(--token-content-primary)" />
        </svg>

        {/* WiFi — 3 concentric arcs + dot */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 9.2a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6z" fill="var(--token-content-primary)" />
          <path d="M4.8 8.2a3.8 3.8 0 0 1 5.4 0" stroke="var(--token-content-primary)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M2.4 5.7a7.2 7.2 0 0 1 10.2 0" stroke="var(--token-content-primary)" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M0.3 3.2a10.2 10.2 0 0 1 14.4 0" stroke="var(--token-content-primary)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>

        {/* Battery — outline + fill + nub */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.2" stroke="var(--token-content-primary)" strokeOpacity="0.35" />
          <rect x="2" y="2" width="18" height="8" rx="1.3" fill="var(--token-content-primary)" />
          <path d="M23 4v4a2.2 2.2 0 0 0 0-4z" fill="var(--token-content-primary)" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative w-[393px] h-[852px] bg-background text-content-primary rounded-[48px] border-[6px] border-neutral-800 overflow-hidden shadow-lg flex flex-col">
      {/* Dynamic Island */}
      <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-neutral-900 rounded-[20px] z-50" />
      <StatusBar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
