// Dev utility (not part of the app bundle): renders the localized PDF for
// every Latin-script language with sample data and writes them to .pdf-check/
// for byte-level inspection. Run via rolldown:
//   npx rolldown scripts/pdf-preview.ts --platform node -o .pdf-check/run.mjs && node .pdf-check/run.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildResultsPdf } from '../src/pdf'
import { getDict } from '../src/i18n'

const answers = Object.fromEntries(
  Array.from({ length: 40 }, (_, i) => [
    i + 1,
    i < 30 ? 'cheating' : i < 39 ? 'ok' : 'uncomfortable',
  ]),
) as Record<number, 'cheating' | 'uncomfortable' | 'ok'>
const counts = { cheating: 30, uncomfortable: 1, ok: 9 }

mkdirSync('.pdf-check', { recursive: true })
for (const code of ['en', 'id', 'es', 'pt-br', 'nl'] as const) {
  const t = getDict(code)
  const doc = buildResultsPdf({
    answers,
    finalAnswer: 'no',
    score: 61,
    tier: t.tiers[3],
    counts,
    t,
  })
  const bytes = doc.output('arraybuffer') as ArrayBuffer
  writeFileSync(join('.pdf-check', `${code}.pdf`), Buffer.from(bytes))
  console.log(`wrote ${code}.pdf (${bytes.byteLength} bytes)`)
}
