# Project Rules

Project-specific commands:
- Build: `npm run build`
- Development server: `npm run dev`
- Preview: `npm run preview`
- Generate PDFs: `npm run generate:pdf`

Project-specific guardrails:
- Run `npm run build` after changes to Astro pages, assets, or resume content.
- PDF generation writes artifacts; ask before broad regeneration unless the task explicitly requests PDFs.
- Do not read `.env`, `.env.*`, `secrets/**`, credentials, or private key files.

Shipping (standing authorization, granted 2026-07-25):
- **Carry work through to deploy without asking.** Finish a task by committing and
  pushing to `main`, which is what triggers the Netlify deploy of yuta.dev. No
  confirmation step.
- Gate the push on green checks, not on a question: `npm run build`, the piece's
  headless physics test, and `node scripts/lab-e2e.mjs` for anything under /lab.
  If a check fails, fix it or report — do not push red.
- After pushing, poll the live URL until the new deploy answers, and say what
  landed. Note `origin/main` often carries regenerated PDFs, so fetch and merge
  before pushing.
- This covers deploying this site. It does not extend to DB migrations,
  `rm -rf`, or anything outside this repo.
