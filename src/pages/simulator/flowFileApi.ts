/**
 * Browser client for the Vite dev plugin that creates/deletes screen .tsx files.
 * Only works in dev mode (the plugin adds middleware endpoints).
 */

interface CreateScreenResult {
  filePath: string
  existed: boolean
}

/**
 * Create a new screen .tsx scaffold on disk.
 * Returns the relative filePath (e.g. 'my-flow/Screen1_MyScreen.tsx').
 * Returns null in production builds (no dev server).
 */
export async function createScreenFile(
  flowId: string,
  screenIndex: number,
  title: string,
): Promise<string | null> {
  if (!import.meta.env.DEV) return null

  try {
    const res = await fetch('/__flow-api/create-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, screenIndex, title }),
    })

    if (!res.ok) return null

    const data = (await res.json()) as CreateScreenResult
    return data.filePath
  } catch {
    console.warn('[flowFileApi] Failed to create screen file')
    return null
  }
}

/**
 * Update the @screen/@description comment block at the top of a screen .tsx file.
 * Fire-and-forget — returns false in production or on error.
 */
export async function updateScreenMeta(
  filePath: string,
  title: string,
  description: string,
): Promise<boolean> {
  if (!import.meta.env.DEV) return false

  try {
    const res = await fetch('/__flow-api/update-screen-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, title, description }),
    })

    if (!res.ok) return false

    const data = (await res.json()) as { updated: boolean }
    return data.updated
  } catch {
    console.warn('[flowFileApi] Failed to update screen meta')
    return false
  }
}

/**
 * Write an index.ts for a flow.
 * Returns { written: true } on success, { written: false, reason } if file exists (and force=false).
 * Returns null in production or on network error.
 */
export async function writeFlowIndex(
  flowId: string,
  content: string,
  force = false,
): Promise<{ written: boolean; reason?: string } | null> {
  if (!import.meta.env.DEV) return null

  try {
    const res = await fetch('/__flow-api/write-index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId, content, force }),
    })

    if (!res.ok) return null

    return (await res.json()) as { written: boolean; reason?: string }
  } catch {
    console.warn('[flowFileApi] Failed to write flow index')
    return null
  }
}

/**
 * Delete a screen .tsx file from disk.
 * filePath is relative, e.g. 'my-flow/Screen1_MyScreen.tsx'.
 */
export async function deleteScreenFile(filePath: string): Promise<boolean> {
  if (!import.meta.env.DEV) return false

  try {
    const res = await fetch('/__flow-api/delete-screen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })

    if (!res.ok) return false

    const data = (await res.json()) as { deleted: boolean }
    return data.deleted
  } catch {
    console.warn('[flowFileApi] Failed to delete screen file')
    return false
  }
}
