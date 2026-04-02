import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { createChart, type UTCTimestamp, type MouseEventParams } from 'lightweight-charts'
import { registerComponent } from '../registry'

export interface LineChartDataPoint {
  time: string
  value: number
}

export interface LineChartCrosshairData {
  time: string
  value: number
}

interface LineChartProps {
  data: LineChartDataPoint[]
  height?: number
  variant?: 'line' | 'baseline' | 'area'
  showPriceScale?: boolean
  showTimeScale?: boolean
  /** Called when the user touches/hovers the chart. Null when released. */
  onCrosshairMove?: (point: LineChartCrosshairData | null) => void
  /** Show a marker dot on the last data point */
  lastPointMarker?: boolean
  /** Line thickness in pixels (default 2) */
  lineWidth?: 1 | 2 | 3 | 4
  /** Smooth corners via cubic spline interpolation (default false) */
  smooth?: boolean
  /** Override the line color (CSS color string) */
  color?: string
  /** Override the area fill color (area variant only) */
  fillColor?: string
  /** Dark background mode — adjusts crosshair/marker colors for dark surfaces */
  dark?: boolean
  /** Area fill pattern: 'gradient' (default) or 'dots' for dot-grid fill */
  fillPattern?: 'gradient' | 'dots'
  /** Format a tooltip label from the crosshair value. Return null to hide. */
  tooltipFormatter?: (value: number) => string | null
  /** Disable all chart pointer interactions (crosshair, hover). Use when overlaying custom interactive elements. */
  noInteraction?: boolean
  className?: string
}

function debounce(func: () => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(func, wait)
  }
}

function resolveToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Monotone cubic spline interpolation — upsamples data points to produce
 * smooth curves while preserving the original values at each knot.
 */
function smoothData(
  points: { time: number; value: number }[],
  factor = 4,
): { time: number; value: number }[] {
  const n = points.length
  if (n < 3) return points

  // Compute slopes
  const dx: number[] = []
  const dy: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].time - points[i].time)
    dy.push(points[i + 1].value - points[i].value)
    m.push(dy[i] / dx[i])
  }

  // Fritsch–Carlson monotone tangents
  const tangents: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents.push(0)
    } else {
      tangents.push((m[i - 1] + m[i]) / 2)
    }
  }
  tangents.push(m[n - 2])

  // Interpolate
  const result: { time: number; value: number }[] = []
  for (let i = 0; i < n - 1; i++) {
    const x0 = points[i].time
    const x1 = points[i + 1].time
    const y0 = points[i].value
    const y1 = points[i + 1].value
    const h = x1 - x0
    const t0 = tangents[i]
    const t1 = tangents[i + 1]

    for (let j = 0; j < factor; j++) {
      const t = j / factor
      const h00 = 2 * t * t * t - 3 * t * t + 1
      const h10 = t * t * t - 2 * t * t + t
      const h01 = -2 * t * t * t + 3 * t * t
      const h11 = t * t * t - t * t
      const time = x0 + (h * j) / factor
      const value = h00 * y0 + h10 * h * t0 + h01 * y1 + h11 * h * t1
      result.push({ time: Math.round(time), value: Math.round(value * 100) / 100 })
    }
  }
  // Add last point
  result.push({ time: points[n - 1].time, value: points[n - 1].value })
  return result
}

function drawDotPattern(
  canvas: HTMLCanvasElement,
  chart: ReturnType<typeof createChart>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series: any,
  timestamps: { time: UTCTimestamp; value: number }[],
  lineColor: string,
  dark: boolean,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  // Build pixel-space line points from chart coordinate APIs
  const points: { x: number; y: number }[] = []
  const timeScale = chart.timeScale()
  for (let i = 0; i < timestamps.length; i++) {
    const x = timeScale.timeToCoordinate(timestamps[i].time)
    const y = series.priceToCoordinate(timestamps[i].value)
    if (x !== null && y !== null) {
      points.push({ x, y })
    }
  }

  if (points.length < 2) return

  const spacing = 8
  const dotRadius = 1.5
  ctx.fillStyle = hexToRgba(lineColor, dark ? 0.35 : 0.28)

  const minX = points[0].x
  const maxX = points[points.length - 1].x

  for (let x = minX; x <= maxX; x += spacing) {
    // Interpolate line Y at this x
    let idx = 0
    while (idx < points.length - 1 && points[idx + 1].x < x) {
      idx++
    }
    let lineY: number
    if (idx < points.length - 1) {
      const p0 = points[idx]
      const p1 = points[idx + 1]
      const t = p1.x === p0.x ? 0 : (x - p0.x) / (p1.x - p0.x)
      lineY = p0.y + t * (p1.y - p0.y)
    } else {
      lineY = points[points.length - 1].y
    }

    // Draw dots from below the line to the canvas bottom
    for (let y = lineY + spacing; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export default function LineChart({
  data,
  height = 200,
  variant = 'line',
  showPriceScale = false,
  showTimeScale = false,
  onCrosshairMove,
  lastPointMarker = false,
  lineWidth = 2,
  smooth = false,
  color: colorOverride,
  fillColor,
  dark = false,
  fillPattern,
  tooltipFormatter,
  noInteraction = false,
  className,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const onCrosshairMoveRef = useRef(onCrosshairMove)
  const tooltipFormatterRef = useRef(tooltipFormatter)
  onCrosshairMoveRef.current = onCrosshairMove
  tooltipFormatterRef.current = tooltipFormatter

  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; positive: boolean } | null>(null)

  const firstValueRef = useRef<number>(data[0]?.value ?? 0)
  firstValueRef.current = data[0]?.value ?? 0

  const handleCrosshair = useCallback((param: MouseEventParams) => {
    // Tooltip tracking
    if (tooltipFormatterRef.current) {
      if (!param.time || !param.seriesPrices?.size || !param.point) {
        setTooltip(null)
      } else {
        const raw = param.seriesPrices.values().next().value
        const val = typeof raw === 'number' ? raw : (raw as { value?: number })?.value
        if (val != null) {
          const text = tooltipFormatterRef.current(val)
          if (text) {
            setTooltip({ x: param.point.x, y: param.point.y, text, positive: val >= firstValueRef.current })
          } else {
            setTooltip(null)
          }
        }
      }
    }

    // External callback
    if (!onCrosshairMoveRef.current) return

    if (!param.time || !param.seriesPrices?.size) {
      onCrosshairMoveRef.current(null)
      return
    }

    const raw = param.seriesPrices.values().next().value
    const val = typeof raw === 'number' ? raw : (raw as { value?: number })?.value
    if (val != null) {
      const ts = param.time as number
      const date = new Date(ts * 1000)
      onCrosshairMoveRef.current({
        time: date.toISOString().split('T')[0],
        value: val,
      })
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const positive = resolveToken('--color-content-number-positive', '#10B981')
    const negative = resolveToken('--color-content-number-negative', '#F87171')
    // Resolve CSS variables — lightweight-charts can only parse hex/rgb, not var()
    const rawColor = colorOverride ?? resolveToken('--color-feedback-success', '#10B981')
    const lineColor = rawColor.startsWith('var(')
      ? resolveToken(rawColor.slice(4, -1), '#000000')
      : rawColor
    const crosshairColor = resolveToken('--color-content-tertiary', '#9CA3AF')

    const hasCrosshair = !!onCrosshairMoveRef.current || !!tooltipFormatterRef.current

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { backgroundColor: 'transparent', textColor: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: {
        visible: showPriceScale,
        borderVisible: false,
        scaleMargins: { top: 0.05, bottom: fillColor ? 0 : 0.05 },
      },
      timeScale: {
        visible: showTimeScale,
        borderVisible: false,
        barSpacing: 12,
        rightOffset: lastPointMarker ? 2 : 0,
        fixLeftEdge: true,
        fixRightEdge: !lastPointMarker,
      },
      leftPriceScale: { visible: false },
      handleScroll: false,
      handleScale: false,
      crosshair: noInteraction
        ? { vertLine: { visible: false }, horzLine: { visible: false }, mode: 0 }
        : {
            vertLine: {
              visible: true,
              color: dark ? 'rgba(255,255,255,0.15)' : crosshairColor,
              width: 1,
              style: 0, // solid
              labelVisible: false,
            },
            horzLine: { visible: false },
            mode: 0, // normal — shows on hover/touch
          },
    })
    chartRef.current = chart

    if (hasCrosshair) {
      chart.subscribeCrosshairMove(handleCrosshair)
    }

    const raw = data.map((d) => ({
      time: Math.floor(new Date(d.time).getTime() / 1000),
      value: d.value,
    }))
    const interpolated = smooth ? smoothData(raw) : raw
    const timestamps = interpolated.map((d) => ({
      time: d.time as UTCTimestamp,
      value: d.value,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let series: any

    if (variant === 'baseline') {
      series = chart.addBaselineSeries({
        baseValue: { type: 'price', price: data[0].value },
        topLineColor: positive,
        topFillColor1: hexToRgba(positive, 0.28),
        topFillColor2: hexToRgba(positive, 0.05),
        bottomLineColor: negative,
        bottomFillColor1: hexToRgba(negative, 0.05),
        bottomFillColor2: hexToRgba(negative, 0.28),
        lineWidth,

        lastValueVisible: false,
        priceLineVisible: false,
      })
      series.setData(timestamps)
    } else if (variant === 'area') {
      series = chart.addAreaSeries({
        lineColor: lineColor,
        topColor: fillPattern === 'dots' ? 'transparent' : (fillColor ?? hexToRgba(lineColor, 0.28)),
        bottomColor: fillPattern === 'dots' ? 'transparent' : (fillColor ?? hexToRgba(lineColor, 0.02)),
        lineWidth,
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
        crosshairMarkerBackgroundColor: dark ? lineColor : '#000000',
        crosshairMarkerBorderColor: dark ? '#0a0a0f' : '#FFFFFF',
        // crosshairMarkerBorderWidth: 2, // Not available in this version of lightweight-charts
      })
      series.setData(timestamps)
    } else {
      // 'line' — no fill, just the line
      series = chart.addLineSeries({
        color: lineColor,
        lineWidth,

        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: hasCrosshair,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: '#FFFFFF',
      })
      series.setData(timestamps)
    }

    // Show a dot on the last data point
    if (lastPointMarker && timestamps.length > 0) {
      const last = timestamps[timestamps.length - 1]
      const markerColor = variant === 'baseline'
        ? (last.value >= data[0].value ? positive : negative)
        : lineColor
      series.setMarkers([{
        time: last.time,
        position: 'inBar' as const,
        shape: 'circle' as const,
        color: markerColor,
        size: 1.5,
      }])
    }

    chart.timeScale().fitContent()

    // Dot pattern overlay
    const redrawDots = () => {
      if (fillPattern === 'dots' && overlayCanvasRef.current) {
        drawDotPattern(overlayCanvasRef.current, chart, series, timestamps, lineColor, dark)
      }
    }
    if (fillPattern === 'dots') {
      requestAnimationFrame(redrawDots)
    }

    const handleResize = debounce(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
        requestAnimationFrame(redrawDots)
      }
    }, 100)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height, variant, showPriceScale, showTimeScale, smooth, dark, fillPattern, noInteraction, handleCrosshair])

  return (
    <div className={`relative overflow-visible ${className ?? ''}`} onMouseLeave={() => setTooltip(null)}>
      <div ref={containerRef} style={noInteraction ? { pointerEvents: 'none' } : undefined} />
      {fillPattern === 'dots' && (
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
      )}
      {tooltip && createPortal(
        <div
          className="fixed pointer-events-none z-[10000] flex flex-col items-center"
          style={{
            left: (containerRef.current?.getBoundingClientRect().left ?? 0) + tooltip.x,
            top: (containerRef.current?.getBoundingClientRect().top ?? 0) + tooltip.y - 44,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="px-3 py-1.5 rounded-lg bg-black text-xs font-semibold whitespace-nowrap shadow-md" style={{ color: tooltip.positive ? '#10B981' : '#F87171' }}>
            {tooltip.text}
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-black" />
        </div>,
        document.body,
      )}
    </div>
  )
}

registerComponent({
  name: 'LineChart',
  category: 'presentation',
  description:
    'Time-series line/area chart for price history, portfolio value, and yield curves. Uses lightweight-charts.',
  component: LineChart,
  variants: ['line', 'baseline', 'area'],
  props: [
    {
      name: 'data',
      type: '{ time: string; value: number }[]',
      required: true,
      description: 'Array of time-value data points. time should be an ISO date string.',
    },
    {
      name: 'height',
      type: 'number',
      required: false,
      defaultValue: '200',
      description: 'Chart height in pixels.',
    },
    {
      name: 'variant',
      type: "'line' | 'baseline' | 'area'",
      required: false,
      defaultValue: 'line',
      description:
        'line = no fill (default). baseline = dual-color (green/red). area = single-color fill.',
    },
    {
      name: 'showPriceScale',
      type: 'boolean',
      required: false,
      defaultValue: 'false',
      description: 'Show the right price axis.',
    },
    {
      name: 'showTimeScale',
      type: 'boolean',
      required: false,
      defaultValue: 'false',
      description: 'Show the bottom time axis.',
    },
    {
      name: 'onCrosshairMove',
      type: '(point: { time: string; value: number } | null) => void',
      required: false,
      description: 'Called on touch/hover with the data point, or null when released.',
    },
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS class for the container div.',
    },
  ],
})
