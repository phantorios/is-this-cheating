import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, SITE_URL, pageUrl } from './src/i18n/seo'

// Content-Security-Policy injected into index.html at BUILD TIME ONLY.
// In dev, Vite's HMR client and the React plugin preamble are inline scripts
// that a strict CSP would block, so dev serves without the tag.
// frame-ancestors is deliberately absent: it is ignored inside <meta> CSP.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function cspMeta(): Plugin {
  return {
    name: 'inject-csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('</head>', `    <meta http-equiv="Content-Security-Policy" content="${CSP}">\n  </head>`)
    },
  }
}

const esc = (s: string) => s.replaceAll('"', '&quot;')

/**
 * Writes one index.html per language (dist/<lang>/index.html) from the built
 * English page: translated <html lang>/title/meta/canonical/noscript, hreflang
 * alternates on every page, and asset URLs rewritten ./assets -> ../assets so
 * sub-path pages load the same hashed bundle. Pure tag surgery, no scripts:
 * the CSP stays valid.
 */
function multiLangHtml(): Plugin {
  return {
    name: 'generate-language-pages',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist')
      let template = readFileSync(join(dist, 'index.html'), 'utf8')

      // Preload the self-hosted woff2 files: all five are used on first paint,
      // and preloading removes the CSS-then-font round trip.
      const fonts = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.woff2'))
      const preloads = fonts
        .map((f) => `    <link rel="preload" href="./assets/${f}" as="font" type="font/woff2" crossorigin />`)
        .join('\n')

      const alternates = LANGS.map(
        (l) =>
          `    <link rel="alternate" hreflang="${l.code}" href="${pageUrl(l.code)}" />`,
      ).join('\n')
      const xDefault = `    <link rel="alternate" hreflang="x-default" href="${SITE_URL}" />`

      const enPage = template.replace(
        '</head>',
        `${preloads}\n${alternates}\n${xDefault}\n  </head>`,
      )
      writeFileSync(join(dist, 'index.html'), enPage)

      for (const lang of LANGS) {
        if (lang.code === 'en') continue
        const url = pageUrl(lang.code)
        let html = enPage
          .replace(
            '<html lang="en" data-lang="en">',
            `<html lang="${lang.htmlLang}" data-lang="${lang.code}">`,
          )
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(lang.title)}</title>`)
          .replace(
            /<meta\s+name="description" content="[^"]*" \/>/,
            `<meta name="description" content="${esc(lang.description)}" />`,
          )
          .replace(
            /<link rel="canonical" href="[^"]*" \/>/,
            `<link rel="canonical" href="${url}" />`,
          )
          .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
          .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(lang.title)}" />`)
          .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(lang.description)}" />`)
          .replace(/<meta property="og:locale" content="[^"]*" \/>/, `<meta property="og:locale" content="${lang.ogLocale}" />`)
          .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(lang.title)}" />`)
          .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(lang.description)}" />`)
          .replace(
            /<noscript>[\s\S]*?<\/noscript>/,
            `<noscript><main style="max-width: 640px; margin: 3rem auto; padding: 0 1.5rem; font-family: sans-serif; color: #333333;"><h1>${esc(lang.noscriptH1)}</h1><p>${esc(lang.noscriptP)}</p></main></noscript>`,
          )
          .replaceAll('"./assets/', '"../assets/')

        const dir = join(dist, lang.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }
    },
  }
}

// base './' makes every asset URL relative, so the built site works from any
// GitHub Pages path (username.github.io/repo-name/) without configuration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), cspMeta(), multiLangHtml()],
})
