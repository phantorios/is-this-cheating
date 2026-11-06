import type { LangCode } from './types'
import { LANGS, type LangMeta } from './seo'
import { en } from './en'
import { id } from './id'
import { ja } from './ja'
import { es } from './es'
import { ptBr } from './pt-br'
import { zh } from './zh'
import { nl } from './nl'
import type { Dictionary } from './types'

export { LANGS }
export type { LangMeta }
export type { Dictionary } from './types'

const DICTS: Record<LangCode, Dictionary> = {
  en,
  id,
  ja,
  es,
  'pt-br': ptBr,
  zh,
  nl,
}

export function isLangCode(value: string | null | undefined): value is LangCode {
  return !!value && LANGS.some((l) => l.code === value)
}

/** Language of the current page, set on <html data-lang> by the build plugin. */
export function currentLang(): LangCode {
  const attr = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-lang') : null
  return isLangCode(attr) ? attr : 'en'
}

export function getDict(code: LangCode): Dictionary {
  return DICTS[code]
}

/** {placeholder} interpolation */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in vars ? String(vars[key]) : m,
  )
}

/** Relative href between language pages, e.g. root→id: "id/", ja→es: "../es/" */
export function relLink(from: LangCode, to: LangCode): string {
  if (from === to) return './'
  if (from === 'en') return to === 'en' ? './' : `${to}/`
  return to === 'en' ? '../' : `../${to}/`
}
