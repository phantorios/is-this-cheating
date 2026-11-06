import type { AnswerId } from '../data'

export type LangCode = 'en' | 'id' | 'ja' | 'es' | 'pt-br' | 'zh' | 'nl'

/** {placeholder} interpolation; no plurals needed anywhere by design */
export type Template = string

export interface Dictionary {
  code: LangCode
  /** BCP 47 locale used for toLocaleDateString, e.g. "id-ID" */
  dateLocale: string
  ui: {
    /** heritage title line above the H1 (Japanese for all, English on the ja page) */
    originLine: string
    siteTitle: string
    introText: string
    metaLine: Template
    start: string
    continueQuiz: string
    savedNote: string
    answeredCount: Template // "{answered} / {total} answered"
    overview: string
    pageOf: Template // "Page {page} of {pages}"
    next: string
    finalQuestionBtn: string
    back: string
    oneLastThing: string
    backToQuestions: string
    seeResult: string
    questionsLeft: Template // "Questions left: {n}." (plural-free by design)
    openTheOverview: string
    remainingSuffix: string
    pickYesNo: string
    yourResult: string
    score: string
    scoreAria: Template // "Score {n} out of {max}"
    atAGlance: string
    review: string
    downloadPdf: string
    downloadJpg: string
    jpgError: string
    preparingPdf: string
    shareOnX: string
    backToAnswers: string
    restart: string
    pdfError: string
    restartConfirm: string
    overviewHint: string
    closeOverview: string
    langNavLabel: string
    /** "Unofficial Indonesian fan version." */
    unofficialFanLine: string
    /** "Original (Japanese):" label before the original site link */
    originalSiteLabel: string
  }
  answerOptions: { id: AnswerId; label: string }[]
  finalQuestion: string
  yesNo: { yes: string; no: string }
  /** exactly 40 strings, index = question id - 1 */
  questions: string[]
  /** exactly 4, same order as RESULT_TIERS */
  tiers: { name: string; description: string }[]
  share: {
    title: string
    scoreLine: Template // "【{tier}】 Score: {score}/{max}"
    changeLine: Template // "... → {answer}"
  }
  /**
   * Localized PDF labels. Only provided for languages whose script the core
   * PDF fonts can render (Latin). ja/zh omit it and pdf.ts falls back to en.
   */
  pdf?: {
    subtitle: string
    yourResult: string
    score: Template // "Score: {score} / {max}"
    atAGlance: string
    colQuestion: string
    colAnswer: string
    your40: string
    yourAnswer: Template // "Your answer: {answer}"
    footer: string
    completed: Template // "Completed {date}"
    pageOf: Template // "Page {page} of {pages}"
  }
}
