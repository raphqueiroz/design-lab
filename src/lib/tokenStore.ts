/**
 * Token persistence — Supabase with localStorage fallback.
 */

import { supabase, isSupabaseConnected } from './supabase'

const STORAGE_KEY = 'picnic-design-lab:token-overrides'

type TokenMap = Record<string, string>

function readLocal(): TokenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeLocal(data: TokenMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getLocalTokenOverrides(): TokenMap {
  return readLocal()
}

export async function setTokenOverride(cssVar: string, value: string): Promise<void> {
  const all = readLocal()
  all[cssVar] = value
  writeLocal(all)

  if (isSupabaseConnected()) {
    await supabase!.from('token_overrides').upsert(
      { css_var: cssVar, value, updated_at: new Date().toISOString() },
      { onConflict: 'css_var' },
    )
  }
}

export async function resetTokenOverride(cssVar: string): Promise<void> {
  const all = readLocal()
  delete all[cssVar]
  writeLocal(all)

  if (isSupabaseConnected()) {
    await supabase!.from('token_overrides').delete().eq('css_var', cssVar)
  }
}

export async function resetTokenCategory(cssVars: string[]): Promise<void> {
  const all = readLocal()
  for (const v of cssVars) delete all[v]
  writeLocal(all)

  if (isSupabaseConnected()) {
    await supabase!.from('token_overrides').delete().in('css_var', cssVars)
  }
}

export async function resetAllTokenOverrides(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY)

  if (isSupabaseConnected()) {
    await supabase!.from('token_overrides').delete().neq('css_var', '')
  }
}

export async function hydrateTokensFromSupabase(): Promise<boolean> {
  if (!isSupabaseConnected()) return false

  try {
    const { data, error } = await supabase!.from('token_overrides').select('*')
    if (error || !data) return false

    const map: TokenMap = {}
    for (const row of data) {
      map[row.css_var as string] = row.value as string
    }
    writeLocal(map)

    // Apply to CSS
    for (const [cssVar, value] of Object.entries(map)) {
      document.documentElement.style.setProperty(`--token-${cssVar}`, value)
    }
    return true
  } catch {
    return false
  }
}

export function subscribeToTokenChanges(onUpdate: () => void): (() => void) | null {
  if (!isSupabaseConnected()) return null

  const channel = supabase!
    .channel('token-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'token_overrides' }, () => {
      hydrateTokensFromSupabase().then(() => onUpdate())
    })
    .subscribe()

  return () => {
    supabase!.removeChannel(channel)
  }
}
