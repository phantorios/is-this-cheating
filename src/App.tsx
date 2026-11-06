import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FaceNeutral,
  FaceSlightlySmiling,
  HeartCrack,
  LoaderCircle,
  RotateCcw,
  X,
} from 'lucide-react'
import {
  MAX_SCORE,
  ORIGINAL_SITE_URL,
  QUESTIONS,
  QUESTIONS_PER_PAGE,
  RESULT_TIERS,
  computeScore,
  countAnswers,
  getTier,
  type AnswerId,
  type Answers,
  type FinalAnswer,
} from './data'
import { LANGS, currentLang, fmt, getDict, relLink, type Dictionary } from './i18n'
import type { LangCode } from './i18n/types'

type Screen = 'intro' | 'quiz' | 'final' | 'results'

const STORAGE_KEY = 'is-this-cheating:answers:v1'
const PAGE_COUNT = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE)

interface SavedState {
  answers: Answers
  finalAnswer: FinalAnswer | null
}

// localStorage holds ONLY the button choices for this quiz: never names,
// emails, or anything identifying. Maintainer note: every *.github.io project
// site of one account shares a single origin, which is exactly why nothing
// sensitive may ever be stored under this key.
function loadSaved(): SavedState {
  const empty: SavedState = { answers: {}, finalAnswer: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return empty
    const { answers, finalAnswer } = parsed as Record<string, unknown>
    if (typeof answers !== 'object' || answers === null) return empty
    const clean: Answers = {}
    for (const [key, value] of Object.entries(answers)) {
      const id = Number(key)
      const valid = value === 'cheating' || value === 'uncomfortable' || value === 'ok'
      if (Number.isInteger(id) && id >= 1 && id <= QUESTIONS.length && valid) {
        clean[id] = value as AnswerId
      }
    }
    const fa: FinalAnswer | null =
      finalAnswer === 'yes' || finalAnswer === 'no' ? finalAnswer : null
    return { answers: clean, finalAnswer: fa }
  } catch {
    return empty
  }
}

function siteUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}

function optionLabel(t: Dictionary, id: AnswerId): string {
  return t.answerOptions.find((o) => o.id === id)!.label
}

// ---------------------------------------------------------------------------
// Shared styling (tokens live in index.css / DESIGN.md)
// ---------------------------------------------------------------------------

const btnPrimary =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-deep px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50'
const btnSecondary =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-stone-200 bg-white px-5 text-sm font-bold text-ink transition-colors hover:border-primary-deep hover:text-primary-deep'

const chipBase =
  'flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-center text-sm font-bold transition-colors sm:px-4'

function chipClasses(selected: boolean, id: AnswerId): string {
  if (!selected) {
    return `${chipBase} border-stone-200 bg-white text-ink hover:border-primary hover:text-primary-deep`
  }
  switch (id) {
    case 'cheating':
      return `${chipBase} border-primary-deep bg-primary-deep text-white`
    case 'uncomfortable':
      return `${chipBase} border-amber-500 bg-amber-100 text-amber-900`
    case 'ok':
      return `${chipBase} border-emerald-600 bg-emerald-100 text-emerald-900`
  }
}

const OVERVIEW_CHIP_SELECTED: Record<AnswerId, string> = {
  cheating: 'border-primary-deep bg-primary-deep text-white',
  uncomfortable: 'border-amber-500 bg-amber-100 text-amber-900',
  ok: 'border-emerald-600 bg-emerald-100 text-emerald-900',
}

const ANSWER_TAG: Record<AnswerId, string> = {
  cheating: 'border-primary/30 bg-primary-soft text-primary-deep',
  uncomfortable: 'border-amber-300 bg-amber-100 text-amber-900',
  ok: 'border-emerald-300 bg-emerald-100 text-emerald-900',
}

const DISTRIBUTION_BAR: Record<AnswerId, string> = {
  cheating: 'bg-primary-deep',
  uncomfortable: 'bg-amber-400',
  ok: 'bg-emerald-400',
}

const DISTRIBUTION_ICON: Record<AnswerId, ComponentType<{ className?: string }>> = {
  cheating: HeartCrack,
  uncomfortable: FaceNeutral,
  ok: FaceSlightlySmiling,
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/** The identity motif: a paper sheet card with 8px pink side tabs. */
function PaperSheet({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-card border border-primary-soft bg-white shadow-sm ${className}`}
    >
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-primary" />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-2 bg-primary" />
      <div className="px-5 py-6 sm:px-9 sm:py-8">{children}</div>
    </div>
  )
}

function AnswerChips({
  t,
  groupName,
  labelledBy,
  value,
  onChange,
}: {
  t: Dictionary
  groupName: string
  labelledBy: string
  value: AnswerId | null
  onChange: (id: AnswerId) => void
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2 sm:grid-cols-3">
      {t.answerOptions.map((opt) => {
        const selected = value === opt.id
        return (
          <label
            key={opt.id}
            className={`${chipClasses(selected, opt.id)} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-deep`}
          >
            <input
              type="radio"
              name={groupName}
              checked={selected}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {opt.label}
          </label>
        )
      })}
    </div>
  )
}

function QuestionRow({
  t,
  q,
  number,
  value,
  onChange,
}: {
  t: Dictionary
  q: { id: number }
  number: number
  value: AnswerId | undefined
  onChange: (a: AnswerId) => void
}) {
  const headingId = `question-${q.id}`
  return (
    <div role="group" aria-labelledby={headingId}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-numeric text-sm font-bold text-primary-deep"
        >
          {number}
        </span>
        <h3 id={headingId} className="text-base font-medium leading-snug">
          {t.questions[q.id - 1]}
        </h3>
      </div>
      <div className="mt-3 sm:pl-10">
        <AnswerChips
          t={t}
          groupName={`q-${q.id}`}
          labelledBy={headingId}
          value={value ?? null}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

function ProgressHeader({
  t,
  answeredCount,
  onOpenOverview,
}: {
  t: Dictionary
  answeredCount: number
  onOpenOverview: () => void
}) {
  const pct = Math.round((answeredCount / QUESTIONS.length) * 100)
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-paper/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="font-numeric text-sm font-bold text-ink">
          {fmt(t.ui.answeredCount, { answered: answeredCount, total: QUESTIONS.length })}
        </p>
        <button
          onClick={onOpenOverview}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border-2 border-primary-soft bg-white px-3 text-xs font-bold text-primary-deep transition-colors hover:border-primary"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          {t.ui.overview}
        </button>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft"
        role="progressbar"
        aria-valuenow={answeredCount}
        aria-valuemin={0}
        aria-valuemax={QUESTIONS.length}
        aria-label={t.ui.overview}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function OverviewModal({
  t,
  answers,
  onJump,
  onClose,
}: {
  t: Dictionary
  answers: Answers
  onJump: (page: number) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstUnanswered = QUESTIONS.find((q) => answers[q.id] === undefined)?.id

  useEffect(() => {
    dialogRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.ui.overview}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-card bg-white p-5 shadow-xl outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-primary-deep">{t.ui.overview}</h2>
          <button
            onClick={onClose}
            aria-label={t.ui.closeOverview}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-deep"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{t.ui.overviewHint}</p>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8">
          {QUESTIONS.map((q) => {
            const a = answers[q.id]
            const isFirstUnanswered = q.id === firstUnanswered
            return (
              <button
                key={q.id}
                onClick={() => onJump(Math.floor((q.id - 1) / QUESTIONS_PER_PAGE))}
                aria-label={`${q.id}${a ? `: ${optionLabel(t, a)}` : ''}`}
                className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-2 font-numeric text-sm font-bold transition-colors ${
                  a
                    ? OVERVIEW_CHIP_SELECTED[a]
                    : 'border-dashed border-stone-300 bg-white text-stone-400 hover:border-primary-deep hover:text-primary-deep'
                } ${isFirstUnanswered ? 'ring-2 ring-primary-deep ring-offset-2' : ''}`}
              >
                {q.id}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          {t.answerOptions.map((opt, i) => (
            <span key={opt.id} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-full ${
                  ['bg-primary-deep', 'bg-amber-400', 'bg-emerald-400'][i]
                }`}
              />
              {opt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

function Intro({ t, onStart, hasSaved }: { t: Dictionary; onStart: () => void; hasSaved: boolean }) {
  return (
    <main className="flex flex-1 flex-col justify-center gap-6 pt-6 sm:pt-10">
      <PaperSheet className="text-center">
        <p className="text-sm font-bold text-ink-soft">{t.ui.originLine}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-primary-deep sm:text-5xl">
          {t.ui.siteTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed">{t.ui.introText}</p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col items-stretch gap-2" aria-hidden="true">
          {t.answerOptions.map((opt) => (
            <span key={opt.id} className={chipClasses(true, opt.id)}>
              {opt.label}
            </span>
          ))}
        </div>
        <button
          onClick={onStart}
          className={`${btnPrimary} mt-8 min-h-12 w-full px-8 text-base sm:w-auto`}
        >
          {hasSaved ? t.ui.continueQuiz : t.ui.start}
        </button>
        {hasSaved && <p className="mt-2 text-xs text-ink-soft">{t.ui.savedNote}</p>}
        <p className="mt-6 font-numeric text-xs text-ink-soft">{t.ui.metaLine}</p>
      </PaperSheet>
    </main>
  )
}

function QuizPage({
  t,
  page,
  answers,
  onAnswer,
  onOpenOverview,
  onNext,
  onBack,
}: {
  t: Dictionary
  page: number
  answers: Answers
  onAnswer: (qid: number, a: AnswerId) => void
  onOpenOverview: () => void
  onNext: () => void
  onBack: () => void
}) {
  const slice = QUESTIONS.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE)
  return (
    <main className="flex flex-1 flex-col gap-4">
      <ProgressHeader t={t} answeredCount={Object.keys(answers).length} onOpenOverview={onOpenOverview} />
      <PaperSheet>
        <ol className="divide-y divide-stone-100">
          {slice.map((q, i) => (
            <li key={q.id} className="py-6 first:pt-1 last:pb-1">
              <QuestionRow
                t={t}
                q={q}
                number={page * QUESTIONS_PER_PAGE + i + 1}
                value={answers[q.id]}
                onChange={(a) => onAnswer(q.id, a)}
              />
            </li>
          ))}
        </ol>
      </PaperSheet>
      <div className="flex items-center justify-between gap-3">
        {page > 0 ? (
          <button onClick={onBack} className={btnSecondary}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t.ui.back}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
        <p className="font-numeric text-sm font-bold text-ink-soft" aria-live="polite">
          {fmt(t.ui.pageOf, { page: page + 1, pages: PAGE_COUNT })}
        </p>
        <button onClick={onNext} className={btnPrimary}>
          {page < PAGE_COUNT - 1 ? t.ui.next : t.ui.finalQuestionBtn}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </main>
  )
}

function FinalStep({
  t,
  finalAnswer,
  onFinalAnswer,
  complete,
  remaining,
  onSeeResults,
  onBack,
  onOpenOverview,
}: {
  t: Dictionary
  finalAnswer: FinalAnswer | null
  onFinalAnswer: (a: FinalAnswer) => void
  complete: boolean
  remaining: number
  onSeeResults: () => void
  onBack: () => void
  onOpenOverview: () => void
}) {
  const headingId = 'final-question'
  return (
    <main className="flex flex-1 flex-col gap-4 pt-6">
      <PaperSheet className="text-center">
        <p className="text-sm font-bold text-ink-soft">{t.ui.oneLastThing}</p>
        <h2 id={headingId} className="mt-2 font-display text-2xl leading-snug sm:text-3xl">
          {t.finalQuestion}
        </h2>
        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          {(
            [
              { id: 'yes', label: t.yesNo.yes },
              { id: 'no', label: t.yesNo.no },
            ] as { id: FinalAnswer; label: string }[]
          ).map((opt) => {
            const selected = finalAnswer === opt.id
            return (
              <label
                key={opt.id}
                className={`${chipClasses(selected, 'cheating')} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-deep`}
              >
                <input
                  type="radio"
                  name="final-question"
                  checked={selected}
                  onChange={() => onFinalAnswer(opt.id)}
                  className="sr-only"
                />
                {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                {opt.label}
              </label>
            )
          })}
        </div>
      </PaperSheet>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className={btnSecondary}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {t.ui.backToQuestions}
        </button>
        <button onClick={onSeeResults} disabled={!complete} className={btnPrimary}>
          {t.ui.seeResult}
        </button>
      </div>
      {!complete && (
        <p aria-live="polite" className="text-center text-sm text-ink-soft">
          {remaining > 0 ? (
            <>
              {fmt(t.ui.questionsLeft, { n: remaining })}{' '}
              <button
                onClick={onOpenOverview}
                className="cursor-pointer font-bold text-primary-deep underline decoration-primary/40 underline-offset-2 hover:text-primary"
              >
                {t.ui.openTheOverview}
              </button>
              {t.ui.remainingSuffix}
            </>
          ) : (
            t.ui.pickYesNo
          )}
        </p>
      )}
    </main>
  )
}

function DistributionRow({
  t,
  id,
  count,
  total,
}: {
  t: Dictionary
  id: AnswerId
  count: number
  total: number
}) {
  const Icon = DISTRIBUTION_ICON[id]
  const pct = total === 0 ? 0 : (count / total) * 100
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-bold">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {optionLabel(t, id)}
        </span>
        <span className="font-numeric font-bold">
          {count} / {total}
        </span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${DISTRIBUTION_BAR[id]} transition-all duration-200`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Results({
  t,
  answers,
  finalAnswer,
  onRestart,
  onBackToQuiz,
}: {
  t: Dictionary
  answers: Answers
  finalAnswer: FinalAnswer
  onRestart: () => void
  onBackToQuiz: () => void
}) {
  const counts = useMemo(() => countAnswers(answers), [answers])
  const score = useMemo(() => computeScore(answers), [answers])
  const tierIndex = RESULT_TIERS.indexOf(getTier(score))
  const tier = t.tiers[tierIndex]
  const [pdfState, setPdfState] = useState<'idle' | 'working' | 'error'>('idle')

  const shareUrl = useMemo(() => {
    const text = [
      t.share.title,
      fmt(t.share.scoreLine, { tier: tier.name, score, max: MAX_SCORE }),
      fmt(t.share.changeLine, { answer: finalAnswer === 'yes' ? t.yesNo.yes : t.yesNo.no }),
      'Original sheet by Sukoya Kana (@sukosuko_sukoya)',
      '#IsThisCheating',
      siteUrl(),
    ].join('\n')
    return `https://x.com/intent/tweet?${new URLSearchParams({ text }).toString()}`
  }, [t, tier, score, finalAnswer])

  async function handleDownloadPdf() {
    if (pdfState === 'working') return
    setPdfState('working')
    try {
      // Lazy-loaded: jsPDF (and its html2canvas/dompurify baggage) only
      // downloads when the user actually asks for a PDF.
      const { generateResultsPdf } = await import('./pdf')
      await generateResultsPdf({ answers, finalAnswer, score, tier, counts, t })
      setPdfState('idle')
    } catch (err) {
      console.error('PDF generation failed', err)
      setPdfState('error')
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 pt-6">
      <PaperSheet className="text-center">
        <p className="text-sm font-bold text-ink-soft">{t.ui.yourResult}</p>
        {t.code !== 'ja' && (
          <p className="mt-2 text-sm text-ink-soft">{RESULT_TIERS[tierIndex].jp}</p>
        )}
        <h2 className="mt-2 font-display text-3xl leading-tight text-primary-deep sm:text-4xl">
          {tier.name}
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed">{tier.description}</p>
        <p className="mt-5 font-numeric text-sm text-ink-soft">{t.ui.score}</p>
        <p
          className="font-numeric text-4xl font-bold"
          aria-label={fmt(t.ui.scoreAria, { n: score, max: MAX_SCORE })}
        >
          {score} <span className="text-xl font-bold text-ink-soft">/ {MAX_SCORE}</span>
        </p>
      </PaperSheet>

      <PaperSheet>
        <h3 className="font-display text-lg">{t.ui.atAGlance}</h3>
        <div className="mt-4 flex flex-col gap-4">
          {t.answerOptions.map((opt) => (
            <DistributionRow
              key={opt.id}
              t={t}
              id={opt.id}
              count={counts[opt.id]}
              total={QUESTIONS.length}
            />
          ))}
        </div>
      </PaperSheet>

      <PaperSheet>
        <h3 className="font-display text-lg">{t.ui.review}</h3>
        <ol className="mt-2 divide-y divide-stone-100">
          {QUESTIONS.map((q) => {
            const a = answers[q.id]
            return (
              <li key={q.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft font-numeric text-xs font-bold text-primary-deep"
                  >
                    {q.id}
                  </span>
                  <p className="text-sm leading-snug">{t.questions[q.id - 1]}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${ANSWER_TAG[a]}`}
                >
                  {optionLabel(t, a)}
                </span>
              </li>
            )
          })}
          <li className="flex items-start justify-between gap-3 py-3">
            <p className="text-sm font-bold leading-snug">{t.finalQuestion}</p>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${ANSWER_TAG.cheating}`}
            >
              {finalAnswer === 'yes' ? t.yesNo.yes : t.yesNo.no}
            </span>
          </li>
        </ol>
      </PaperSheet>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button onClick={handleDownloadPdf} disabled={pdfState === 'working'} className={btnPrimary}>
          {pdfState === 'working' ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          {pdfState === 'working' ? t.ui.preparingPdf : t.ui.downloadPdf}
        </button>
        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          {t.ui.shareOnX}
        </a>
        <button onClick={onBackToQuiz} className={btnSecondary}>
          {t.ui.backToAnswers}
        </button>
        <button onClick={onRestart} className={btnSecondary}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t.ui.restart}
        </button>
      </div>
      {pdfState === 'error' && (
        <p role="alert" className="text-sm font-bold text-primary-deep">
          {t.ui.pdfError}
        </p>
      )}
    </main>
  )
}

function LangSwitcher({ current, t }: { current: LangCode; t: Dictionary }) {
  return (
    <nav
      aria-label={t.ui.langNavLabel}
      className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs"
    >
      {LANGS.map((l, i) => (
        <span key={l.code} className="flex items-center gap-3">
          {i > 0 && (
            <span aria-hidden="true" className="text-stone-300">
              ·
            </span>
          )}
          {l.code === current ? (
            <span aria-current="true" className="font-bold text-primary-deep">
              {l.label}
            </span>
          ) : (
            <a
              href={relLink(current, l.code)}
              hrefLang={l.code}
              lang={l.code}
              className="underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary-deep"
            >
              {l.label}
            </a>
          )}
        </span>
      ))}
    </nav>
  )
}

function Attribution({ t, current }: { t: Dictionary; current: LangCode }) {
  const link =
    'underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary-deep'
  return (
    <footer className="mt-10 border-t border-primary-soft pt-4 text-center text-xs leading-relaxed text-ink-soft">
      <LangSwitcher current={current} t={t} />
      <p className="mt-4">
        Original judgment sheet by{' '}
        <a href="https://x.com/sukosuko_sukoya" target="_blank" rel="noopener noreferrer" className={link}>
          Sukoya Kana (@sukosuko_sukoya)
        </a>
        , sheet design by{' '}
        <a href="https://x.com/air_trpg" target="_blank" rel="noopener noreferrer" className={link}>
          Aria (@air_trpg)
        </a>
        , web version by{' '}
        <a href="https://github.com/ikura1/uwaki-hantei" target="_blank" rel="noopener noreferrer" className={link}>
          ikura1
        </a>
        .
      </p>
      <p className="mt-1">
        {t.ui.unofficialFanLine} {t.ui.originalSiteLabel}{' '}
        <a href={ORIGINAL_SITE_URL} target="_blank" rel="noopener noreferrer" className={link}>
          ikura1.github.io/uwaki-hantei
        </a>
      </p>
    </footer>
  )
}

// ---------------------------------------------------------------------------

export default function App() {
  const [lang] = useState<LangCode>(currentLang)
  const t = getDict(lang)
  const initial = useMemo(loadSaved, [])
  const [screen, setScreen] = useState<Screen>('intro')
  const [page, setPage] = useState(0)
  const [answers, setAnswers] = useState<Answers>(initial.answers)
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswer | null>(initial.finalAnswer)
  const [overviewOpen, setOverviewOpen] = useState(false)

  const answeredCount = Object.keys(answers).length
  const remaining = QUESTIONS.length - answeredCount
  const complete = answeredCount === QUESTIONS.length && finalAnswer !== null

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, finalAnswer } satisfies SavedState))
    } catch {
      // Storage unavailable (private mode): the quiz still works, answers
      // just do not survive a refresh.
    }
  }, [answers, finalAnswer])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [screen, page])

  function firstUnansweredPage(): number {
    for (let p = 0; p < PAGE_COUNT; p++) {
      const slice = QUESTIONS.slice(p * QUESTIONS_PER_PAGE, (p + 1) * QUESTIONS_PER_PAGE)
      if (slice.some((q) => answers[q.id] === undefined)) return p
    }
    return PAGE_COUNT - 1
  }

  function startQuiz() {
    setPage(firstUnansweredPage())
    setScreen('quiz')
  }

  function answer(qid: number, a: AnswerId) {
    setAnswers((prev) => ({ ...prev, [qid]: a }))
  }

  function restart() {
    if (!window.confirm(t.ui.restartConfirm)) return
    setAnswers({})
    setFinalAnswer(null)
    setPage(0)
    setScreen('intro')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-8 sm:px-6">
      {screen === 'intro' && <Intro t={t} onStart={startQuiz} hasSaved={answeredCount > 0} />}
      {screen === 'quiz' && (
        <QuizPage
          t={t}
          page={page}
          answers={answers}
          onAnswer={answer}
          onOpenOverview={() => setOverviewOpen(true)}
          onNext={() => {
            if (page < PAGE_COUNT - 1) setPage((p) => p + 1)
            else setScreen('final')
          }}
          onBack={() => setPage((p) => Math.max(0, p - 1))}
        />
      )}
      {screen === 'final' && (
        <FinalStep
          t={t}
          finalAnswer={finalAnswer}
          onFinalAnswer={setFinalAnswer}
          complete={complete}
          remaining={remaining}
          onSeeResults={() => setScreen('results')}
          onBack={() => {
            setPage(PAGE_COUNT - 1)
            setScreen('quiz')
          }}
          onOpenOverview={() => setOverviewOpen(true)}
        />
      )}
      {screen === 'results' && finalAnswer !== null && (
        <Results
          t={t}
          answers={answers}
          finalAnswer={finalAnswer}
          onRestart={restart}
          onBackToQuiz={() => {
            setPage(firstUnansweredPage())
            setScreen('quiz')
          }}
        />
      )}
      <Attribution t={t} current={lang} />
      {overviewOpen && (
        <OverviewModal
          t={t}
          answers={answers}
          onJump={(p) => {
            setPage(p)
            setScreen('quiz')
            setOverviewOpen(false)
          }}
          onClose={() => setOverviewOpen(false)}
        />
      )}
    </div>
  )
}
