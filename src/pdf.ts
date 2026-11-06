import { jsPDF } from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import {
  ANSWER_OPTIONS,
  ATTRIBUTION,
  MAX_SCORE,
  ORIGINAL_SITE_URL,
  QUESTIONS,
  type Answers,
  type AnswerId,
  type FinalAnswer,
} from './data'
import { en } from './i18n/en'
import { fmt } from './i18n'
import type { Dictionary } from './i18n/types'

// Core PDF fonts are WinAnsi-encoded, so every string drawn here must stay
// Latin-representable. Languages whose dictionary has no `pdf` section
// (currently ja and zh, CJK scripts) fall back to the English labels; their
// date is rendered with the en-US locale for the same reason.

const PINK: [number, number, number] = [217, 48, 141]
const PINK_DEEP: [number, number, number] = [176, 35, 111]
const PINK_SOFT: [number, number, number] = [252, 231, 243]
const INK: [number, number, number] = [51, 51, 51]
const INK_SOFT: [number, number, number] = [107, 85, 96]
const TRACK: [number, number, number] = [240, 236, 238]
const GRID_LINE: [number, number, number] = [232, 224, 228]

const ANSWER_CELL: Record<AnswerId, { bg: [number, number, number]; fg: [number, number, number] }> = {
  cheating: { bg: [252, 231, 243], fg: [140, 20, 85] },
  uncomfortable: { bg: [254, 243, 199], fg: [146, 64, 14] },
  ok: { bg: [209, 250, 229], fg: [6, 95, 70] },
}

const BAR_FILL: Record<AnswerId, [number, number, number]> = {
  cheating: PINK_DEEP,
  uncomfortable: [245, 158, 11],
  ok: [16, 185, 129],
}

export interface PdfInput {
  answers: Answers
  finalAnswer: FinalAnswer
  score: number
  tier: { name: string; description: string }
  counts: Record<AnswerId, number>
  t: Dictionary
}

export async function generateResultsPdf(input: PdfInput): Promise<void> {
  // Yield a frame so the button's spinner paints before the synchronous
  // generation work starts.
  await new Promise((resolve) => setTimeout(resolve, 50))

  const doc = buildResultsPdf(input)
  doc.save(`is-this-cheating-results-${new Date().toISOString().slice(0, 10)}.pdf`)
}

/** Renders the complete PDF and returns the document (unit/Node-testable). */
export function buildResultsPdf(input: PdfInput): jsPDF {
  const { answers, finalAnswer, score, tier, counts, t } = input
  // CJK dictionaries omit `pdf`: fall back to English labels and date locale.
  const p = t.pdf ?? en.pdf!
  const dateLocale = t.pdf ? t.dateLocale : 'en-US'
  const dateStr = new Date().toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const left = 18
  const right = pageWidth - left
  const contentWidth = right - left

  // -- Page 1: result summary ------------------------------------------------

  doc.setFillColor(...PINK)
  doc.rect(0, 0, pageWidth, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(t.ui.siteTitle, left, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(p.subtitle, left, 23)
  doc.setFontSize(9)
  doc.text(fmt(p.completed, { date: dateStr }), right, 14, { align: 'right' })

  doc.setFillColor(...PINK_SOFT)
  doc.roundedRect(left, 42, contentWidth, 48, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PINK_DEEP)
  doc.text(p.yourResult, left + 8, 51)
  doc.setFontSize(16)
  doc.setTextColor(...INK)
  doc.text(tier.name, left + 8, 61)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK_SOFT)
  doc.text(fmt(p.score, { score, max: MAX_SCORE }), right - 8, 51, { align: 'right' })
  doc.setFontSize(9.5)
  doc.setTextColor(...INK)
  const descriptionLines = doc.splitTextToSize(tier.description, contentWidth - 16)
  doc.text(descriptionLines, left + 8, 68)

  let y = 104
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(p.atAGlance, left, y)
  y += 8

  for (const opt of ANSWER_OPTIONS) {
    const count = counts[opt.id]
    const label = t.answerOptions.find((o) => o.id === opt.id)!.label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    doc.text(label, left, y)
    doc.text(`${count} / ${QUESTIONS.length}`, right, y, { align: 'right' })
    doc.setFillColor(...TRACK)
    doc.roundedRect(left, y + 1.5, contentWidth, 4, 2, 2, 'F')
    const barWidth = (count / QUESTIONS.length) * contentWidth
    if (barWidth > 0.5) {
      doc.setFillColor(...BAR_FILL[opt.id])
      doc.roundedRect(left, y + 1.5, barWidth, 4, 2, 2, 'F')
    }
    y += 12
  }

  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  const finalLines = doc.splitTextToSize(t.finalQuestion, contentWidth)
  doc.text(finalLines, left, y)
  y += finalLines.length * 5 + 2
  doc.setFontSize(11)
  doc.setTextColor(...PINK_DEEP)
  doc.text(
    fmt(p.yourAnswer, { answer: finalAnswer === 'yes' ? t.yesNo.yes : t.yesNo.no }),
    left,
    y,
  )
  y += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...INK_SOFT)
  doc.text(doc.splitTextToSize(ATTRIBUTION, contentWidth), left, y)
  y += 10
  doc.text(`Original (Japanese): ${ORIGINAL_SITE_URL}`, left, y)

  // -- Page 2+: all 40 questions ----------------------------------------------

  doc.addPage()
  autoTable(doc, {
    startY: 30,
    head: [['#', p.colQuestion, p.colAnswer]],
    body: QUESTIONS.map((q) => [
      String(q.id),
      t.questions[q.id - 1],
      t.answerOptions.find((o) => o.id === answers[q.id])!.label,
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      cellPadding: 2.5,
      textColor: INK,
      lineColor: GRID_LINE,
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: PINK_DEEP,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: PINK_DEEP },
      1: { cellWidth: 122 },
      2: { cellWidth: 42, fontStyle: 'bold' },
    },
    rowPageBreak: 'avoid',
    margin: { left, right, top: 30, bottom: 20 },
    didParseCell: (data: CellHookData) => {
      if (data.section === 'body' && data.column.index === 2) {
        const q = QUESTIONS[data.row.index]
        const cell = ANSWER_CELL[answers[q.id]]
        data.cell.styles.fillColor = cell.bg
        data.cell.styles.textColor = cell.fg
      }
    },
    didDrawPage: () => {
      doc.setFillColor(...PINK)
      doc.rect(0, 0, pageWidth, 4, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...PINK_DEEP)
      doc.text(p.your40, left, 14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...INK_SOFT)
      doc.text(fmt(p.completed, { date: dateStr }), right, 14, { align: 'right' })
    },
  })

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK_SOFT)
    doc.text(p.footer, left, 291)
    doc.text(fmt(p.pageOf, { page: i, pages: total }), right, 291, { align: 'right' })
  }

  return doc
}
