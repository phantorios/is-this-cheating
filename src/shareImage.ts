import { MAX_SCORE, type Answers, type FinalAnswer } from './data'
import { fmt } from './i18n'
import type { Dictionary } from './i18n/types'

// Client-side rendering of the shareable result card (1200x1200 JPG), in the
// spirit of the original site's generated result image. No dependencies: the
// Canvas API draws it with the same design tokens as the site (DESIGN.md).

const PAPER = '#FFF9FC'
const WHITE = '#FFFFFF'
const PINK = '#D9308D'
const PINK_DEEP = '#B0236F'
const PINK_SOFT = '#FCE7F3'
const INK = '#333333'
const INK_SOFT = '#6B5560'

const CHIP_FILL: Record<string, string> = {
  cheating: PINK_DEEP,
  uncomfortable: '#FEF3C7',
  ok: '#D1FAE5',
}
const CHIP_TEXT: Record<string, string> = {
  cheating: '#FFFFFF',
  uncomfortable: '#92400E',
  ok: '#065F46',
}

export interface ShareImageInput {
  answers: Answers
  finalAnswer: FinalAnswer
  score: number
  tier: { name: string; description: string }
  t: Dictionary
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  startPx: number,
  maxWidth: number,
  font: (px: number) => string,
): number {
  let px = startPx
  ctx.font = font(px)
  while (ctx.measureText(text).width > maxWidth && px > 20) {
    px -= 2
    ctx.font = font(px)
  }
  return px
}

async function loadCanvasFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('400 62px "Dela Gothic One"'),
      document.fonts.load('500 26px "Zen Maru Gothic"'),
      document.fonts.load('700 96px "Archivo"'),
    ])
    await document.fonts.ready
  } catch {
    // Font loading API unavailable: canvas falls back to system fonts.
  }
}

export function renderResultCanvas(input: ShareImageInput): HTMLCanvasElement {
  const { answers, finalAnswer, score, tier, t } = input
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1200
  const ctx = canvas.getContext('2d')!
  const cx = 600

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, 1200, 1200)

  // Paper sheet card with pink side tabs (the site's identity motif)
  roundRect(ctx, 60, 60, 1080, 1080, 36)
  ctx.fillStyle = WHITE
  ctx.fill()
  ctx.save()
  roundRect(ctx, 60, 60, 1080, 1080, 36)
  ctx.clip()
  ctx.fillStyle = PINK
  ctx.fillRect(60, 60, 16, 1080)
  ctx.fillRect(1124, 60, 16, 1080)
  ctx.restore()
  roundRect(ctx, 60, 60, 1080, 1080, 36)
  ctx.strokeStyle = PINK_SOFT
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.textAlign = 'center'

  // Heritage line + site title
  ctx.fillStyle = INK_SOFT
  ctx.font = '700 26px "Zen Maru Gothic", sans-serif'
  ctx.fillText(t.ui.originLine, cx, 148)
  ctx.fillStyle = PINK_DEEP
  ctx.font = '400 62px "Dela Gothic One", "Zen Maru Gothic", sans-serif'
  ctx.fillText(t.ui.siteTitle, cx, 224)

  // Result label + tier name (shrink to fit)
  ctx.fillStyle = PINK_DEEP
  ctx.font = '700 22px "Archivo", "Zen Maru Gothic", sans-serif'
  ctx.fillText(t.ui.yourResult, cx, 284)
  ctx.fillStyle = INK
  const tierPx = fitFontSize(
    ctx,
    tier.name,
    50,
    940,
    (px) => `${px}px "Dela Gothic One", "Zen Maru Gothic", sans-serif`,
  )
  ctx.font = `${tierPx}px "Dela Gothic One", "Zen Maru Gothic", sans-serif`
  ctx.fillText(tier.name, cx, 350)

  // Description (up to 3 lines)
  ctx.font = '500 26px "Zen Maru Gothic", sans-serif'
  ctx.fillStyle = INK
  const descLines = wrapText(ctx, tier.description, 880).slice(0, 3)
  descLines.forEach((line, i) => {
    ctx.fillText(line, cx, 402 + i * 38)
  })

  // Score: big number + "/ 80" beside it, centered as one composite
  const scoreStr = String(score)
  const maxStr = `/ ${MAX_SCORE}`
  ctx.font = '700 96px "Archivo", sans-serif'
  const scoreW = ctx.measureText(scoreStr).width
  ctx.font = '700 40px "Archivo", sans-serif'
  const maxW = ctx.measureText(` ${maxStr}`).width
  const totalW = scoreW + maxW
  ctx.fillStyle = INK
  ctx.font = '700 96px "Archivo", sans-serif'
  ctx.fillText(scoreStr, cx - totalW / 2, 545)
  ctx.fillStyle = INK_SOFT
  ctx.font = '700 40px "Archivo", sans-serif'
  ctx.fillText(` ${maxStr}`, cx - totalW / 2 + scoreW, 545)

  // 8x5 answer grid
  const cell = 82
  const gap = 12
  const cols = 8
  const gridW = cols * cell + (cols - 1) * gap
  const startX = cx - gridW / 2
  const startY = 605
  for (let i = 0; i < 40; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = startX + col * (cell + gap)
    const y = startY + row * (cell + gap)
    const a = answers[i + 1]
    ctx.fillStyle = a ? CHIP_FILL[a] : PINK_SOFT
    roundRect(ctx, x, y, cell, cell, 18)
    ctx.fill()
    if (a) {
      ctx.fillStyle = CHIP_TEXT[a]
      ctx.font = '700 30px "Archivo", "Zen Maru Gothic", sans-serif'
      ctx.fillText(String(i + 1), x + cell / 2, y + cell / 2 + 11)
    }
  }

  // Final question answer line (shrink to fit)
  ctx.fillStyle = INK
  const changeText = fmt(t.share.changeLine, {
    answer: finalAnswer === 'yes' ? t.yesNo.yes : t.yesNo.no,
  })
  const changePx = fitFontSize(
    ctx,
    changeText,
    24,
    980,
    (px) => `700 ${px}px "Zen Maru Gothic", sans-serif`,
  )
  ctx.font = `700 ${changePx}px "Zen Maru Gothic", sans-serif`
  ctx.fillText(changeText, cx, 1105)

  // Attribution on the paper strip below the card
  ctx.fillStyle = INK_SOFT
  ctx.font = '500 20px "Zen Maru Gothic", sans-serif'
  ctx.fillText(
    `${t.ui.originLine} · phantorios.github.io/is-this-cheating`,
    cx,
    1172,
  )

  return canvas
}

export async function downloadResultJpg(input: ShareImageInput): Promise<void> {
  await loadCanvasFonts()
  const canvas = renderResultCanvas(input)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
  )
  if (!blob) throw new Error('canvas.toBlob returned null')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `is-this-cheating-result-${new Date().toISOString().slice(0, 10)}.jpg`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
