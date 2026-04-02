/**
 * Flag SVG imports from circle-flags.
 * Central source for all flag images using local circle-flags SVGs.
 */
import flagUS from 'circle-flags/flags/us.svg'
import flagBR from 'circle-flags/flags/br.svg'
import flagEU from 'circle-flags/flags/european_union.svg'

const FLAGS: Record<string, string> = {
  us: flagUS,
  br: flagBR,
  eu: flagEU,
}

/** Get local flag SVG path by country code (e.g. 'us', 'br', 'eu'). */
export function getFlag(code: string): string {
  return FLAGS[code] ?? ''
}

/** Pre-built constants for the most common flags. */
export const USD_FLAG = flagUS
export const BRL_FLAG = flagBR
export const EUR_FLAG = flagEU
