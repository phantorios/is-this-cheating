import type { LangCode } from './types'

/**
 * Pure data, no imports from app code: vite.config.ts bundles this file at
 * build time to generate per-language index.html files.
 */

export const SITE_URL = 'https://phantorios.github.io/is-this-cheating/'

export interface LangMeta {
  code: LangCode
  /** URL segment; '' for the English root */
  path: string
  /** native name shown in the language switcher */
  label: string
  htmlLang: string
  ogLocale: string
  title: string
  description: string
  noscriptH1: string
  noscriptP: string
}

export const LANGS: LangMeta[] = [
  {
    code: 'en',
    path: '',
    label: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    title: 'Is This Cheating? The 40-question judgment sheet',
    description:
      'A 40-question judgment sheet about where you draw the line in a relationship. Answer honestly, get your result, and download it as a PDF.',
    noscriptH1: 'Is This Cheating? The 40-question judgment sheet',
    noscriptP:
      'An unofficial English version of the Japanese "これって浮気？判定シート" quiz: 40 everyday situations between your partner and other people. For each one you answer Cheating, Not cheating but uncomfortable, or Completely OK, and get a score out of 80 with one of four result types, from The Easygoing Truster to The Iron-Wall Guardian.',
  },
  {
    code: 'id',
    path: 'id',
    label: 'Bahasa Indonesia',
    htmlLang: 'id',
    ogLocale: 'id_ID',
    title: 'Apakah Ini Selingkuh? Lembar Penilaian 40 Pertanyaan',
    description:
      'Lembar penilaian 40 pertanyaan tentang di mana batas Anda dalam suatu hubungan. Jawab dengan jujur, lihat hasilnya, dan unduh sebagai PDF.',
    noscriptH1: 'Apakah Ini Selingkuh? Lembar Penilaian 40 Pertanyaan',
    noscriptP:
      'Versi Bahasa Indonesia tidak resmi dari kuis Jepang "これって浮気？判定シート": 40 situasi sehari-hari antara pasangan Anda dan orang lain. Untuk setiap situasi Anda menjawab Selingkuh, Bukan selingkuh tapi tidak nyaman, atau Tidak masalah, lalu mendapat skor dari 80 dan salah satu dari empat tipe hasil, dari Si Pemercaya Santai hingga Si Penjaga Tembok Besi.',
  },
  {
    code: 'ja',
    path: 'ja',
    label: '日本語',
    htmlLang: 'ja',
    ogLocale: 'ja_JP',
    title: 'これって浮気？判定シート（英語版・40問）',
    description:
      'パートナーと异性の関わりで、どこまでがアリかを問う40問の判定シート。正直に答えて結果を出し、PDFとして保存できます。健屋花那さんのシートの非公式ファン英語版の一部として、日本語表示にも対応。',
    noscriptH1: 'これって浮気？判定シート',
    noscriptP:
      '健屋花那さん考案の「これって浮気？判定シート」の原文40問を、そのまま日本語で遊べるページです。各問を「浮気」「浮気じゃないけど嫌」「全然OK」で答えると80点満点のスコアと4種類の判定結果が出ます。英語版サイトの日本語表示です。',
  },
  {
    code: 'es',
    path: 'es',
    label: 'Español',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    title: '¿Esto es infidelidad? La hoja de 40 preguntas',
    description:
      'Una hoja de 40 preguntas sobre dónde está tu límite en una relación. Responde con honestidad, obtén tu resultado y descárgalo como PDF.',
    noscriptH1: '¿Esto es infidelidad? La hoja de 40 preguntas',
    noscriptP:
      'Versión no oficial en español del cuestionario japonés "これって浮気？判定シート": 40 situaciones cotidianas entre tu pareja y otras personas. Para cada una respondes Infidelidad, No es infidelidad pero me incomoda, o Totalmente bien, y obtienes una puntuación sobre 80 con uno de cuatro tipos de resultado.',
  },
  {
    code: 'pt-br',
    path: 'pt-br',
    label: 'Português do Brasil',
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    title: 'Isso é traição? A folha de 40 perguntas',
    description:
      'Uma folha de 40 perguntas sobre onde fica o seu limite num relacionamento. Responda com sinceridade, veja o seu resultado e baixe em PDF.',
    noscriptH1: 'Isso é traição? A folha de 40 perguntas',
    noscriptP:
      'Versão não oficial em português do questionário japonês "これって浮気？判定シート": 40 situações do dia a dia entre seu par e outras pessoas. Em cada uma você responde Traição, Não é traição mas me incomoda, ou Totalmente ok, e recebe uma pontuação de 80 com um de quatro tipos de resultado.',
  },
  {
    code: 'zh',
    path: 'zh',
    label: '中文',
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    title: '这算出轨吗？40题判定表',
    description:
      '一份关于恋爱中底线在哪里的40题判定表。诚实作答，查看结果，并可下载为PDF。',
    noscriptH1: '这算出轨吗？40题判定表',
    noscriptP:
      '日本问答「これって浮気？判定シート」的非官方中文版：恋爱伴侣与异性之间的40种日常情境。每题回答“算出轨”“不算出轨但介意”或“完全没问题”，得到满分80分的得分和四种结果类型之一。',
  },
  {
    code: 'nl',
    path: 'nl',
    label: 'Nederlands',
    htmlLang: 'nl',
    ogLocale: 'nl_NL',
    title: 'Is dit vreemdgaan? De test met 40 vragen',
    description:
      'Een afvinklijst met 40 vragen over waar jouw grens in een relatie ligt. Antwoord eerlijk, bekijk je uitkomst en download alles als PDF.',
    noscriptH1: 'Is dit vreemdgaan? De test met 40 vragen',
    noscriptP:
      'Onofficiële Nederlandse versie van de Japanse quiz "これって浮気？判定シート": 40 alledaagse situaties tussen jouw partner en anderen. Per situatie kies je Vreemdgaan, Geen vreemdgaan maar ongemakkelijk, of Helemaal prima, en je krijgt een score op 80 met één van vier uitkomsttypes.',
  },
]

export function langByCode(code: LangCode): LangMeta {
  return LANGS.find((l) => l.code === code) ?? LANGS[0]
}

export function pageUrl(code: LangCode): string {
  const l = langByCode(code)
  return SITE_URL + (l.path ? l.path + '/' : '')
}
