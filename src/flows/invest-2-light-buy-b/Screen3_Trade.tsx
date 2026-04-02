/**
 * Screen3_Trade — Custom keypad trade screen (buy/sell).
 * Pure custom Tailwind + inline styles + Framer Motion. NO library components.
 */
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playKey, playTap } from '../invest-2-light/shared/sounds'
import { useScreenData } from '@/lib/ScreenDataContext'
import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import {
  BG, BG_CARD, BORDER, TEXT_PRIMARY, TEXT_TERTIARY, TEXT_MUTED,
  RED, SAFE_TOP, SAFE_BOTTOM,
  fadeUp, glass,
} from '../invest-2-light/shared/theme'
import {
  getAsset, isVolatile, formatBRL,
} from '../invest-2-light/shared/data'
import type { AssetTicker } from '../invest-2-light/shared/data'
import { getAssetPalette } from '../invest-2-light/shared/assetPalette'

// ── Helpers ──

function digitsToAmount(digits: string): number {
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

function formatDisplay(digits: string): string {
  const amount = digitsToAmount(digits)
  if (amount <= 0) return '0,00'
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function estimateQuantity(amountBRL: number, pricePerUnit: number): string {
  if (pricePerUnit <= 0 || amountBRL <= 0) return '0'
  const qty = amountBRL / pricePerUnit
  if (qty < 0.0001) return qty.toFixed(8)
  if (qty < 1) return qty.toFixed(6)
  if (qty < 100) return qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return qty.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Keypad key ──

function KeypadKey({ label, onPress, wide }: {
  label: string
  onPress: () => void
  wide?: boolean
}) {
  const isDelete = label === 'del'
  return (
    <motion.button
      whileTap={{ scale: 0.92, backgroundColor: 'rgba(0,0,0,0.06)' }}
      onClick={onPress}
      className="flex items-center justify-center border-none cursor-pointer"
      style={{
        height: 64,
        borderRadius: 16,
        background: BG_CARD,
        fontSize: 24,
        fontWeight: 500,
        color: TEXT_PRIMARY,
        gridColumn: wide ? 'span 1' : undefined,
      }}
    >
      {isDelete ? (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path
            d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M18 9l-6 6M12 9l6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        label
      )}
    </motion.button>
  )
}

// ── Quick-fill pill ──

function QuickPill({ label, active, onPress }: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onPress}
      className="flex-1 flex items-center justify-center rounded-full border-none cursor-pointer py-2 relative"
      style={{
        ...glass,
        border: active ? `1px solid ${TEXT_TERTIARY}` : `1px solid ${BORDER}`,
        fontSize: 13,
        fontWeight: 600,
        color: active ? TEXT_PRIMARY : TEXT_TERTIARY,
      }}
    >
      {active && (
        <motion.div
          layoutId="quickFill"
          className="absolute inset-0 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: `1px solid ${TEXT_TERTIARY}`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative">{label}</span>
    </motion.button>
  )
}

// ── Main screen ──

const BALANCE = 1245000 // R$ 12.450,00 in cents
const MAX_DIGITS = 10

export default function Screen3_Trade({ onNext, onBack, onElementTap }: FlowScreenProps) {
  const { assetTicker = 'BTC', mode = 'buy' } = useScreenData<{
    assetTicker?: AssetTicker
    mode?: 'buy' | 'sell'
  }>()

  const asset = getAsset(assetTicker)
  const palette = getAssetPalette(assetTicker)
  const volatile = isVolatile(asset)
  const isBuy = mode === 'buy'

  const [digits, setDigits] = useState('')
  const [activeQuick, setActiveQuick] = useState<number | null>(null)

  const amount = digitsToAmount(digits)
  const isValid = amount >= 10

  // Handlers
  const appendDigit = useCallback((d: string) => {
    setDigits(prev => {
      if (prev.length >= MAX_DIGITS) return prev
      return prev + d
    })
    setActiveQuick(null)
  }, [])

  const deleteLast = useCallback(() => {
    setDigits(prev => prev.slice(0, -1))
    setActiveQuick(null)
  }, [])

  const applyPercent = useCallback((pct: number) => {
    const value = Math.floor((BALANCE * pct) / 100)
    setDigits(value.toString())
    setActiveQuick(pct)
  }, [])

  // Estimated quantity
  const pricePerUnit = volatile ? (asset.price ?? 1) : 1
  const estQty = volatile
    ? `\u2248 ${estimateQuantity(amount, pricePerUnit)} ${assetTicker}`
    : null

  return (
    <div className="relative flex flex-col h-full" style={{ background: BG }}>

      {/* Top bar */}
      <motion.div
        className="flex items-center px-4"
        style={{ paddingTop: `calc(${SAFE_TOP} + 8px)`, paddingBottom: 8 }}
        {...fadeUp(0)}
      >
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onBack}
          className="flex items-center justify-center border-none cursor-pointer bg-transparent"
          style={{ width: 40, height: 40 }}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
        <span className="flex-1 text-center" style={{
          color: TEXT_PRIMARY,
          fontSize: 16,
          fontWeight: 700,
        }}>
          {isBuy ? 'Comprar' : 'Vender'} {asset.name}
        </span>
        <div style={{ width: 40 }} />
      </motion.div>

      {/* Amount display area */}
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        {/* Amount */}
        <div className="flex items-baseline justify-center gap-1">
          <span style={{
            color: TEXT_TERTIARY,
            fontSize: 28,
            fontWeight: 600,
          }}>
            R$
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={formatDisplay(digits)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.12 }}
              style={{
                color: TEXT_PRIMARY,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {formatDisplay(digits)}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Estimated quantity */}
        <AnimatePresence>
          {estQty && (
            <motion.span
              key={estQty}
              className="mt-2"
              style={{ color: TEXT_TERTIARY, fontSize: 13 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {estQty}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Balance */}
        <motion.span
          className="mt-1"
          style={{ color: TEXT_MUTED, fontSize: 12 }}
          {...fadeUp(0.08)}
        >
          Saldo: {formatBRL(BALANCE / 100)}
        </motion.span>
      </div>

      {/* Info bar — slides in when amount >= 10 */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 36 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center justify-center px-4 overflow-hidden"
          >
            <span
              className="inline-flex items-center rounded-full px-3 py-1"
              style={{
                ...glass,
                fontSize: 12,
                fontWeight: 500,
                color: TEXT_TERTIARY,
              }}
            >
              Taxa: Gratis
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-fill pills */}
      <motion.div className="flex items-center gap-2 px-4 mt-3 mb-3" {...fadeUp(0.1)}>
        {[25, 50, 75, 100].map(pct => (
          <QuickPill
            key={pct}
            label={`${pct}%`}
            active={activeQuick === pct}
            onPress={() => applyPercent(pct)}
          />
        ))}
      </motion.div>

      {/* Custom keypad */}
      <motion.div
        className="grid grid-cols-3 gap-2 px-4 mb-3"
        {...fadeUp(0.15)}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
          <KeypadKey
            key={key}
            label={key}
            onPress={() => {
              playKey()
              if (key === 'del') deleteLast()
              else if (key === '.') { /* decimal not used — BRL is cents-based */ }
              else appendDigit(key)
            }}
          />
        ))}
      </motion.div>

      {/* CTA button */}
      <motion.div
        className="px-4"
        style={{ paddingBottom: `calc(${SAFE_BOTTOM} + 4px)` }}
        {...fadeUp(0.2)}
      >
        <motion.button
          whileTap={isValid ? { scale: 0.97 } : undefined}
          animate={{ scale: isValid ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => {
            if (!isValid) return
            playTap()
            const handled = onElementTap?.('Button: Continuar')
            if (!handled) onNext()
          }}
          className="w-full flex items-center justify-center rounded-xl border-none cursor-pointer"
          style={{
            height: 52,
            background: isValid
              ? (isBuy ? palette.bg : RED)
              : 'rgba(0,0,0,0.05)',
            fontSize: 16,
            fontWeight: 700,
            color: isValid ? '#fff' : TEXT_MUTED,
            opacity: isValid ? 1 : 0.5,
            transition: 'background 0.2s, opacity 0.2s',
          }}
        >
          Continuar
        </motion.button>
      </motion.div>
    </div>
  )
}
