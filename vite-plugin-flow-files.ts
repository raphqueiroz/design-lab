/**
 * Vite dev plugin: creates new screen .tsx files on the fly.
 *
 * POST /__flow-api/create-screen
 * Body: { flowId: string, screenIndex: number, title: string }
 * Response: { filePath: string }
 *
 * The scaffold follows PATTERNS.md (BaseLayout + Header + Text + StickyFooter + Button).
 * Vite's file watcher detects the new file and triggers HMR.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import type { Plugin, Connect } from 'vite'

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

function formatScreenMetaComment(title: string, description: string): string {
  let block = `/**\n * @screen ${title}`
  if (description) {
    // Word-wrap description at ~80 chars with " *   " continuation
    const words = description.split(/\s+/)
    let line = ''
    const lines: string[] = []
    for (const word of words) {
      if (line && (line + ' ' + word).length > 72) {
        lines.push(line)
        line = word
      } else {
        line = line ? line + ' ' + word : word
      }
    }
    if (line) lines.push(line)
    block += `\n * @description ${lines[0]}`
    for (let i = 1; i < lines.length; i++) {
      block += `\n *   ${lines[i]}`
    }
  }
  block += '\n */\n'
  return block
}

const SCREEN_META_REGEX = /^\/\*\*\s*\n(?:\s*\*[^\n]*\n)*?\s*\*\s*@screen\s[^\n]*\n(?:\s*\*[^\n]*\n)*?\s*\*\/\n/

function updateScreenMetaInSource(source: string, title: string, description: string): string {
  const comment = formatScreenMetaComment(title, description)
  if (SCREEN_META_REGEX.test(source)) {
    return source.replace(SCREEN_META_REGEX, comment)
  }
  return comment + source
}

function createScreenScaffold(title?: string, description?: string): string {
  const metaBlock = title ? formatScreenMetaComment(title, description ?? '') : ''
  return `${metaBlock}import type { FlowScreenProps } from '@/pages/simulator/flowRegistry'
import BaseLayout from '@/library/layout/BaseLayout'
import StickyFooter from '@/library/layout/StickyFooter'
import Header from '@/library/navigation/Header'
import Button from '@/library/inputs/Button'
import Text from '@/library/foundations/Text'
import Stack from '@/library/layout/Stack'

export default function Screen({ onNext, onBack, screenTitle, screenDescription }: FlowScreenProps) {
  return (
    <BaseLayout>
      <Header title={screenTitle ?? 'New Screen'} onBack={onBack} />
      <Stack>
        {screenDescription ? (
          <Text variant="body">{screenDescription}</Text>
        ) : (
          <Text variant="body" color="content-tertiary">No description yet. Edit this screen or update the description in the flow canvas sidebar.</Text>
        )}
      </Stack>
      <StickyFooter>
        <Button variant="primary" size="lg" onPress={onNext} fullWidth>
          Continuar
        </Button>
      </StickyFooter>
    </BaseLayout>
  )
}
`
}

export default function flowFilesPlugin(): Plugin {
  let projectRoot = ''

  return {
    name: 'vite-plugin-flow-files',
    apply: 'serve', // dev only

    configResolved(config) {
      projectRoot = config.root
    },

    configureServer(server) {
      server.middlewares.use(('/__flow-api/create-screen' as string), ((
        req: Connect.IncomingMessage,
        res: import('node:http').ServerResponse,
        next: Connect.NextFunction,
      ) => {
        if (req.method !== 'POST') { next(); return }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { flowId, screenIndex, title, description } = JSON.parse(body) as {
              flowId: string
              screenIndex: number
              title: string
              description?: string
            }

            const pascal = toPascalCase(title)
            const fileName = `Screen${screenIndex}_${pascal}.tsx`
            const relativePath = `${flowId}/${fileName}`
            const absolutePath = resolve(projectRoot, 'src', 'flows', flowId, fileName)

            // Create directory if needed
            const dir = dirname(absolutePath)
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true })
            }

            // Don't overwrite existing files
            if (existsSync(absolutePath)) {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ filePath: relativePath, existed: true }))
              return
            }

            writeFileSync(absolutePath, createScreenScaffold(title, description), 'utf-8')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ filePath: relativePath, existed: false }))
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      }) as Connect.NextHandleFunction)

      // DELETE endpoint: remove a screen .tsx file
      server.middlewares.use(('/__flow-api/delete-screen' as string), ((
        req: Connect.IncomingMessage,
        res: import('node:http').ServerResponse,
        next: Connect.NextFunction,
      ) => {
        if (req.method !== 'POST') { next(); return }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { filePath } = JSON.parse(body) as { filePath: string }
            const absolutePath = resolve(projectRoot, 'src', 'flows', filePath)

            if (!existsSync(absolutePath)) {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ deleted: false, reason: 'not found' }))
              return
            }

            unlinkSync(absolutePath)

            // Remove parent directory if empty
            const dir = dirname(absolutePath)
            try {
              const remaining = readdirSync(dir)
              if (remaining.length === 0) rmdirSync(dir)
            } catch { /* ignore */ }

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ deleted: true }))
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      }) as Connect.NextHandleFunction)

      // POST endpoint: write an index.ts for a flow (refuses to overwrite)
      server.middlewares.use(('/__flow-api/write-index' as string), ((
        req: Connect.IncomingMessage,
        res: import('node:http').ServerResponse,
        next: Connect.NextFunction,
      ) => {
        if (req.method !== 'POST') { next(); return }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { flowId, content, force } = JSON.parse(body) as { flowId: string; content: string; force?: boolean }

            const absolutePath = resolve(projectRoot, 'src', 'flows', flowId, 'index.ts')

            // Refuse to overwrite existing index.ts unless force is true
            if (existsSync(absolutePath) && !force) {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ written: false, reason: 'exists' }))
              return
            }

            // Ensure directory exists
            const dir = dirname(absolutePath)
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true })
            }

            writeFileSync(absolutePath, content, 'utf-8')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ written: true }))
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      }) as Connect.NextHandleFunction)

      // POST endpoint: update @screen/@description comment block in a .tsx file
      server.middlewares.use(('/__flow-api/update-screen-meta' as string), ((
        req: Connect.IncomingMessage,
        res: import('node:http').ServerResponse,
        next: Connect.NextFunction,
      ) => {
        if (req.method !== 'POST') { next(); return }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { filePath, title, description } = JSON.parse(body) as {
              filePath: string
              title: string
              description: string
            }

            const absolutePath = resolve(projectRoot, 'src', 'flows', filePath)
            if (!existsSync(absolutePath)) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ updated: false, reason: 'not found' }))
              return
            }

            const source = readFileSync(absolutePath, 'utf-8')
            const updated = updateScreenMetaInSource(source, title, description)
            writeFileSync(absolutePath, updated, 'utf-8')

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ updated: true }))
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      }) as Connect.NextHandleFunction)
    },
  }
}
