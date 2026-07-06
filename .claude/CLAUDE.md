# Project Rules

Project-specific commands:
- Build: `npm run build`
- Development server: `npm run dev`
- Preview: `npm run preview`
- Generate PDFs: `npm run generate:pdf`

Project-specific guardrails:
- Run `npm run build` after changes to Astro pages, assets, or resume content.
- PDF generation writes artifacts; ask before broad regeneration unless the task explicitly requests PDFs.
- Do not deploy, push, or run production-affecting scripts unless the user explicitly asks in the current task.
- Do not read `.env`, `.env.*`, `secrets/**`, credentials, or private key files.
