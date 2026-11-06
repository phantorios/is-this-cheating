# Delivery Gate report

Anti-slop Delivery Gate for "Is This Cheating?" (is-this-cheating/), run after
implementation and browser verification on 2026-11-06. Mode: during.
Design Read and decision log: DESIGN.md.

## 1. Hard Gate (every answer "no")

- Em dashes in agent-written copy: no (grep of src/ and *.md: none)
- Mobile overflow or sub-44px tap targets: no (scrollWidth > clientWidth = false at 375px; chips and buttons min-h-11 / h-11 = 44px)
- Unsourced statistics: no (the only number-ish claim is "about 5 minutes", an honest task-length estimate; all other numbers are live user data)
- Fake testimonials, avatars, reviews: no (section does not exist)
- Invented logos or assets presented as final: no (favicon is our own heart glyph; no og image invented)
- Nav items without destinations: no (footer links point to real external profiles/repos; app has no nav bar)
- Contrast below WCAG AA: no (primary-deep on white 6.3:1; ink on paper 12.6:1; ink-soft 5.5:1; amber-900/amber-100 and emerald-900/emerald-100 both > 7:1; #D9308D reserved for large text and non-text)
- Controls without behavior: no (every button and link is wired; no "coming soon" placeholders)
- Missing empty/loading/error states: no (PDF button has working + spinner + role=alert retry; restart is the empty state; localStorage failure degrades gracefully)
- Fake FAQ: no (no FAQ section)
- Keyboard inoperable or invisible focus: no (native radio groups: arrow keys tested moving Q1 selection; :focus-visible outline token; has-[:focus-visible] outlines on chips)
- Patch scripts altering source/CSS by string replacement: no
- Shipped themes that do not fully work: no (light-only is the logged brand decision, R-21)
- Unverified delivery: no (full click-through executed: 40 answers, pagination, overview jump, gating, results math 30/1/9 = 61 -> Iron-Wall Guardian, PDF downloaded and text-extracted, restart confirm, mobile + desktop)
- Fabricated compliance/security/performance claims: no (README security notes describe implemented mechanisms only)
- Content fabricated or disguised as final: no (all 40 questions extracted from the original site's source, credited in footer and PDF)
- Missing semantics/affordances: no (cursor-pointer, native inputs, aria-live progress, role=dialog aria-modal, aria-labels on icon buttons and overview chips, hover/disabled states beyond color, prefers-reduced-motion, html lang, title, main/footer landmarks)
- Performance misses: no (no head scripts; type=module deferred; fonts self-hosted 83KB total with display=swap; jsPDF chunk lazy-loaded on demand, initial JS 253KB gzip 80KB)

## 2. Purpose-Gate (technique + written reason)

- Color identity: user-supplied pink palette + paper background, recorded in DESIGN.md; no default blue-purple, no gradients
- Icons: lucide, functional only (nav, states, answer icons); no decorative icon rows
- Typography: Dela Gothic One / Zen Maru Gothic / Archivo chosen to match the original's brand voice, not defaults
- Shadows: elevation only (card shadow-sm, dialog shadow-xl)
- Animation: 150-200ms color transitions matching MOTION 2; reduced-motion collapses all
- No glassmorphism, no badges, no button arrows, no feature-card grids, no background patterns: not used

## 3. Liveliness (every answer "yes")

- Dials declared and honored: ENERGY 2, RHYTHM 2, MOTION 2
- One focal point per screen: the paper quiz sheet card
- Structural whitespace: single centered column, generous card padding
- One deliberate accent: primary pink carries every highlight
- Identity motif repeated: 8px pink side tabs on the paper card on intro, quiz, final question, results; progress pill and rounded chips as secondary motifs
- Design Read declared before building: DESIGN.md

## 4. Craftsmanship and Quality Locks (every answer "no")

- Template structure (hero+cards, 3 steps, bento, pricing, trusted-by): no
- Inconsistent radius scale: no (rounded-full chips/buttons/pill, rounded-card sheets, rounded-xl overview chips)
- Generic CTAs (Get Started / Learn More): no ("Start the quiz", "See my result", "Download Results as PDF", "Share on X", "Back to my answers", "Restart quiz")
- Buzzwords: no (grep: none)
- Logo-swap test failure: no (paper-sheet motif + pink tabs survive any logo swap)
- Fake dark mode: no (light-only, logged)
- Palette beyond 3 core + accent: no (pink family on paper/ink; amber/emerald are semantic answer states only)
- Cloned popular product UI: no (recreation of the user-requested original, credited, with distinct new layout)
- Undocumented major decisions: no (DESIGN.md decision log has one line each)

## Verdict

All four blocks PASS. Evidence: browser click-through on the production build
(pagination, keyboard, persistence, gating, results math, overview jump,
restart confirm), PDF text extraction (3 pages, all 40 rows correct), mobile
375px screenshot with no horizontal overflow, security greps (no
dangerouslySetInnerHTML, no runtime external requests under the shipped CSP).

Two real defects were found during verification and fixed before delivery:
1. "Next" jumped to the final question from every page instead of advancing (App.tsx onNext).
2. Sticky progress header could cover scroll-targeted radios (scroll-margin fix).

One known limitation, accepted: the score pill caption "about 5 minutes" is an
estimate; jsPDF's lazy chunk (~140KB gzip) loads on first PDF download.
