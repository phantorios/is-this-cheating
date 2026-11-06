import { jsPDF } from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import {
  ANSWER_OPTIONS,
  ATTRIBUTION,
  FINAL_QUESTION,
  MAX_SCORE,
  ORIGINAL_SITE_URL,
  QUESTIONS,
  computeScore,
  type Answers,
  type AnswerId,
  type FinalAnswer,
  type ResultTier,
} from './data'

// Core PDF fonts are WinAnsi-encoded, so every string drawn here must stay
// ASCII (no arrows, no Japanese). JP text lives on the website, not in the PDF.

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

const OPTION_BY_ID = Object.fromEntries(ANSWER_OPTIONS.map((o) => [o.id, o]))

export interface PdfInput {
  answers: Answers
  finalAnswer: FinalAnswer
  score: number
  tier: ResultTier
  counts: Record<AnswerId, number>
}

function completionDate(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export async function generateResultsPdf(input: PdfInput): Promise<void> {
  // Yield a frame so the button's spinner paints before the synchronous
  // generation work starts.
  await new Promise((resolve) => setTimeout(resolve, 50))

  const { answers, finalAnswer, tier } = input
  const score = input.score || computeScore(answers)
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
  doc.text('Is This Cheating?', left, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('The 40-question judgment sheet: where do you draw the line?', left, 23)
  doc.setFontSize(9)
  doc.text(completionDate(), right, 14, { align: 'right' })

  doc.setFillColor(...PINK_SOFT)
  doc.roundedRect(left, 42, contentWidth, 48, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...PINK_DEEP)
  doc.text('YOUR RESULT', left + 8, 51)
  doc.setFontSize(16)
  doc.setTextColor(...INK)
  doc.text(tier.name, left + 8, 61)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK_SOFT)
  doc.text(`Score: ${score} / ${MAX_SCORE}`, right - 8, 51, { align: 'right' })
  doc.setFontSize(9.5)
  doc.setTextColor(...INK)
  const descriptionLines = doc.splitTextToSize(tier.description, contentWidth - 16)
  doc.text(descriptionLines, left + 8, 68)

  let y = 104
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text('Your answers at a glance', left, y)
  y += 8

  for (const opt of ANSWER_OPTIONS) {
    const count = input.counts[opt.id]
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    doc.text(OPTION_BY_ID[opt.id].label, left, y)
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
  const finalLines = doc.splitTextToSize(FINAL_QUESTION, contentWidth)
  doc.text(finalLines, left, y)
  y += finalLines.length * 5 + 2
  doc.setFontSize(11)
  doc.setTextColor(...PINK_DEEP)
  doc.text(`Your answer: ${finalAnswer === 'yes' ? 'Yes' : 'No'}`, left, y)
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
    head: [['#', 'Question', 'My answer']],
    body: QUESTIONS.map((q) => [String(q.id), q.text, OPTION_BY_ID[answers[q.id]].label]),
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
      doc.text('Your 40 answers', left, 14)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...INK_SOFT)
      doc.text(`Completed ${completionDate()}`, right, 14, { align: 'right' })
    },
  })

  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...INK_SOFT)
    doc.text('Is This Cheating? · Unofficial English fan version', left, 291)
    doc.text(`Page ${i} of ${total}`, right, 291, { align: 'right' })
  }

  doc.save(`is-this-cheating-results-${new Date().toISOString().slice(0, 10)}.pdf`)
}
