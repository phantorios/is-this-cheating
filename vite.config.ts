import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

// base './' makes every asset URL relative, so the built site works from any
// GitHub Pages path (username.github.io/repo-name/) without configuration.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), cspMeta()],
})
