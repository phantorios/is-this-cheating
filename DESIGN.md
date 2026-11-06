# DESIGN.md

Design direction for "Is This Cheating?", the unofficial English version of the
浮気判定シート (cheating judgment sheet) quiz. Written before implementation per
anti-slop R-37: the filter removes slop, it does not invent direction. This file
is the direction.

## Design Read (declared once, honored everywhere)

Single-purpose fan quiz page for a social-media audience (young adults who saw
the X post). Visual language: Japanese stationery, a paper judgment sheet you
fill in with a pen. Dials: **ENERGY 2 (Balanced), RHYTHM 2 (Balanced), MOTION 2
(Balanced)**. One focal point per screen: the quiz sheet card itself.

## Identity motif

The original site renders the quiz as a paper sheet with 8px pink borders on
the left and right edges. That paper card with pink side tabs is the motif
repeated on every screen (intro card, quiz sheet, final question, result
certificate, PDF header). Secondary motifs: rounded answer chips, the progress
pill. Nothing else competes for identity.

## Palette (R-29: 3 core colors + semantic states)

| Token | Value | Use |
|---|---|---|
| primary | `#D9308D` | brand accents, headings, decorative bars, focus of attention |
| primary-deep | `#B0236F` | buttons, selected "Cheating" fill, small pink text (6.3:1 on white, AA) |
| primary-soft | `#FCE7F3` | chips, bar tracks, tints |
| paper | `#FFF9FC` | page background (warm white, the paper) |
| ink | `#333333` | body text |
| ink-soft | `#6B5560` | secondary text (AA on paper) |

Amber (`amber-100`/`amber-900`) and emerald (`emerald-100`/`emerald-900`) appear
ONLY as semantic answer states ("uncomfortable" and "completely OK"), following
the traffic-light convention users already know. They are states, not decoration.

`#D9308D` on white is 4.47:1: valid for large/bold text and non-text elements,
so it is never used for small text or thin strokes. Small pink text and white
button labels use `#B0236F` (6.3:1).

## Typography (R-06: chosen for character)

Same lineage as the original Japanese site, all Latin-capable, self-hosted
(woff2, zero third-party requests):

- Dela Gothic One 400: display headings. The chunky marker-pen voice of the original.
- Zen Maru Gothic 400/500/700: body. Rounded, warm, stationery-like.
- Archivo (variable): numerals, scores, page counts. Neutral counterpoint.

## Motion (MOTION 2)

Color/background transitions at 150 to 200ms and nothing else. No parallax, no
scroll effects, no entrance choreography. `prefers-reduced-motion` collapses
all of it to zero.

## Decision log (R-31: one line each)

- No dark mode: the paper-stationery look is the brand; light-only is deliberate (R-21).
- 5 questions per page instead of 1 per screen: owner's call, fewer taps to finish 40.
- Final yes/no question gets its own step after page 8, mirroring the original's flow.
- No canvas result image (the original generates one): PDF export covers the
  keepable artifact and text share covers the social loop; two share formats is scope creep.
- jsPDF from npm, never a CDN script tag: pinned supply chain, works offline (security plan).
- Fonts self-hosted instead of Google Fonts CDN: zero third-party requests, nothing
  about visitors leaks (security plan).
- No dark-pattern hurry, no fake "X people took this" counters: honesty over hype (R-17/R-18).
- Icons (lucide) only for navigation and states, never decorative rows (R-04).
- One accent (primary pink) carries the whole identity; amber/emerald are states (R-29).
