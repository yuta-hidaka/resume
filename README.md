# yuta.dev — Yuta Hidaka's résumé site

Personal résumé / portfolio site for **日髙 悠太 (Yuta Hidaka)**, live at
**[yuta.dev](https://yuta.dev)**. Bilingual (日本語 / English), statically built,
and home to an **in-browser LLM "Ask AI" page** that answers questions about Yuta
entirely on the visitor's device — with a fact-check layer that never shows an
unverifiable claim.

## Stack

- **[Astro](https://astro.build) 7** (static output) · **Tailwind CSS 4**
- **i18n**: `/ja/*` and `/en/*` routes
- **[bun](https://bun.sh)** (`bun@1.3.14`, text `bun.lock`) — install/test with bun
- **Node ≥ 22** for the build (`astro build` + PDF generation run under Node)
- **Hosting**: Netlify, continuous deploy from `main`

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Dev server (`localhost:4321`) |
| `npm run build` | Production build → `./dist/` |
| `npm run preview` | Preview the production build |
| `npm run generate:pdf` | Regenerate the résumé PDFs (puppeteer → `public/pdf/`) |
| `bun test src` | Run the test suite (Ask AI + résumé data validation) |

> **Do not add `vitest`.** It hoists a second `vite@5` that shadows Astro 7's
> `vite@8` and breaks `npm run build` (`createIdResolver is not a function`).
> The `/ask` tests use `bun test` (Jest-compatible `bun:test`). Recover a broken
> lockfile with `bun install`.

## Project structure

```text
src/
├── pages/            # ja/ + en/ routes (home, career, about, downloads, ask)
├── components/       # Astro components — incl. AskPage.astro (the /ask UI)
├── data/             # profile/ — canonical résumé data (single source of truth)
├── lib/ask/          # the in-browser LLM "Ask AI" engine (see below)
└── i18n/             # locale helpers
docs/                 # résumé source docs (md/html) rendered to the PDFs
public/pdf/           # generated résumé PDFs (built by CI)
```

## The "Ask AI" feature (`/ja/ask`, `/en/ask`)

A small LLM runs **entirely in the visitor's browser** (no server, no API key) and
answers questions about Yuta, grounded in his résumé. Code lives in `src/lib/ask/`.

**Answer modes (picker in the composer):**

| Option | What it is |
| :-- | :-- |
| **Qwen2.5 0.5B** (default) | Alibaba, ~0.5 GB — light, multilingual, fast |
| **Qwen3 0.6B** (experimental) | Alibaba, ~0.57 GB — newer reasoning model, run with thinking off |
| **TinySwallow 1.5B** | Sakana AI, ~1.2 GB — strong Japanese, heavier |
| **LLM利用なし / No LLM** | Instant answer straight from the résumé, no download |

**How it works:**

1. **Runtime** — a Web Worker dynamically imports `@huggingface/transformers@3.8.1`
   from jsDelivr and runs the model on **WebGPU** (`q4f16`), falling back to **WASM**
   (`q8`). `?backend=wasm` forces CPU. Off the main thread, so the UI never freezes.
2. **Caching** — weights are stored in the browser **Cache Storage**; the page requests
   `navigator.storage.persist()` and remembers (30-day TTL) that a model was fetched, so
   a return visit isn't re-warned or re-downloaded. A cached model is warm-loaded on intent
   (input focus / model pick) so the first answer is fast.
3. **Grounding (RAG)** — `retrieve.ts` selects the most relevant résumé facts for the
   question (confidence-aware: weak/subjective questions get a bio+skills overview instead
   of noise) and folds them into the prompt.
4. **"Never lie" verifier** — `verify.ts` is the single gate every generated answer passes
   through. It's multilingual and asymmetric: it allows natural prose but flags any claim
   it can't trace to the résumé (fabricated schools, employers, titles, numbers, brand
   names in any script), plus degenerate/repetition-loop output. If anything is unconfirmed,
   the answer is **dropped and replaced with real résumé facts** — so a visitor only ever
   sees a verified answer or the résumé itself, never a hallucination or garbage.
5. **Resilience** — a generation watchdog times out a stalled model and falls back to facts;
   raw tokens are buffered (never streamed as garbage); one sampling retry is attempted before
   falling back.

**Tests:** `bun test src/lib/ask` (~379 cases, incl. an 18-language red-team suite proving
facts-only output). The verifier's guarantee — `verifyAnswer(guardedAnswer(...).text)` is
always ok — is covered there.

## Updating résumé content

Résumé/CV content is duplicated across several files (site data + downloadable docs). See
**[AGENT.md](AGENT.md)** for the exact list of files to keep in sync and the post-update
checklist. Changing résumé content triggers the **Generate PDFs** GitHub Action, which
re-renders `public/pdf/*.pdf`; `/ask`-only changes are excluded from that workflow.

## Deployment

Push to `main` → Netlify builds and deploys (Node pinned to 24). The **Generate PDFs**
workflow regenerates and commits the résumé PDFs when résumé content changes.
