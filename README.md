# Is This Cheating?

Unofficial English version of the Japanese "これって浮気？判定シート" (Is this
cheating? judgment sheet) quiz: 40 everyday situations, three answers each
(Cheating / Not cheating, but uncomfortable / Completely OK), a score out of 80,
and one of four result types. Results are downloadable as a PDF generated
entirely in the browser.

Original judgment sheet by Sukoya Kana
([@sukosuko_sukoya](https://x.com/sukosuko_sukoya)), sheet design by Aria
([@air_trpg](https://x.com/air_trpg)), original web version by
[ikura1](https://github.com/ikura1/uwaki-hantei)
([site](https://ikura1.github.io/uwaki-hantei/)). This repository is an
unofficial fan translation with credit; all quiz content belongs to them.

## Run locally

```bash
npm install
npm run dev        # dev server
npm run build      # type-checks and builds into dist/
npm run preview    # serves the production build locally
```

## Deploy to GitHub Pages (recommended way)

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: "GitHub
   Actions"**.
3. Done. The included workflow (`.github/workflows/deploy.yml`) builds and
   publishes on every push. The site lands at
   `https://<your-name>.github.io/<repo-name>/`.

The build uses relative asset paths (`base: './'`), so it works from any repo
name or subpath with no configuration.

### Alternative: publish a committed build

If you prefer not to use Actions: run `npm run build`, then push the `dist/`
folder (for example to a `gh-pages` branch) and point Pages at it. Same result.

## Security notes

- Fully static: no backend, no accounts, no cookies, no analytics. Quiz answers
  are stored only in your browser's localStorage and never sent anywhere.
- PDF generation (jsPDF) happens locally; the file never leaves the browser.
- Fonts are self-hosted: the built site makes zero third-party requests.
- A Content-Security-Policy meta tag (injected at build time) restricts scripts
  to same-origin only.
- The deploy workflow pins every GitHub Action to a commit SHA and runs with
  minimal permissions.

## Tech

React 19 + TypeScript + Vite + Tailwind CSS v4, lucide-react icons, jsPDF +
jspdf-autotable for the PDF. Design direction in [DESIGN.md](DESIGN.md).
