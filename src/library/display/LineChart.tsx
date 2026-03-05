import { useEffect, useRef, useCallback } from 'react'
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

export default function LineChart({
  data,
  height = 200,
  variant = 'line',
  showPriceScale = false,
  showTimeScale = false,
  onCrosshairMove,
  className,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const onCrosshairMoveRef = useRef(onCrosshairMove)
  onCrosshairMoveRef.current = onCrosshairMove

  const handleCrosshair = useCallback((param: MouseEventParams) => {
    if (!onCrosshairMoveRef.current) return

    if (!param.time || !param.seriesData?.size) {
      onCrosshairMoveRef.current(null)
      return
    }

    const entry = param.seriesData.values().next().value as { value?: number } | undefined
    if (entry?.value != null) {
      const ts = param.time as number
      const date = new Date(ts * 1000)
      onCrosshairMoveRef.current({
        time: date.toISOString().split('T')[0],
        value: entry.value,
      })
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const positive = resolveToken('--color-content-number-positive', '#10B981')
    const negative = resolveToken('--color-content-number-negative', '#F87171')
    const lineColor = resolveToken('--color-feedback-success', '#10B981')
    const crosshairColor = resolveToken('--color-content-tertiary', '#9CA3AF')

    const hasCrosshair = !!onCrosshairMoveRef.current

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: { backgroundColor: 'transparent', textColor: 'rgba(0,0,0,0.4)' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: showPriceScale, borderVisible: false },
      timeScale: { visible: showTimeScale, borderVisible: false },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: {
          visible: hasCrosshair,
          color: crosshairColor,
          width: 1,
          style: 0, // solid
          labelVisible: false,
        },
        horzLine: { visible: false },
      },
    })
    chartRef.current = chart

    if (hasCrosshair) {
      chart.subscribeCrosshairMove(handleCrosshair)
    }

    const timestamps = data.map((d) => ({
      time: (new Date(d.time).getTime() / 1000) as UTCTimestamp,
      value: d.value,
    }))

    if (variant === 'baseline') {
      const series = chart.addBaselineSeries({
        baseValue: { type: 'price', price: data[0].value },
        topLineColor: positive,
        topFillColor1: hexToRgba(positive, 0.28),
        topFillColor2: hexToRgba(positive, 0.05),
        bottomLineColor: negative,
        bottomFillColor1: hexToRgba(negative, 0.05),
        bottomFillColor2: hexToRgba(negative, 0.28),
        lastValueVisible: false,
        priceLineVisible: false,
      })
      series.setData(timestamps)
    } else if (variant === 'area') {
      const series = chart.addAreaSeries({
        lineColor: lineColor,
        topColor: hexToRgba(lineColor, 0.28),
        bottomColor: hexToRgba(lineColor, 0.02),
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
      })
      series.setData(timestamps)
    } else {
      // 'line' — no fill, just the line
      const series = chart.addLineSeries({
        color: lineColor,
        lineWidth: 2,
        lastValueVisible: false,
        priceLineVisible: false,
        crosshairMarkerVisible: hasCrosshair,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: '#FFFFFF',
        crosshairMarkerBorderWidth: 2,
      })
      series.setData(timestamps)
    }

    chart.timeScale().fitContent()

    const handleResize = debounce(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }, 100)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height, variant, showPriceScale, showTimeScale, handleCrosshair])

  return <div ref={containerRef} className={className} />
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
