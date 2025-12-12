# Resume site

This is a multilingual resume built with Next.js 13 (App Router) and Tailwind CSS. Development follows the standard Next.js workflow.

## Getting Started

Install dependencies and start the development server with [Bun](https://bun.sh):

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Deployment (Netlify)

This project is configured for Netlify using [`@netlify/next`](https://github.com/netlify/next-runtime) and Bun:

- Build command: `bun run build` (with `BUN_VERSION` pinned via `netlify.toml`)
- Publish directory: `.next`
- Plugin: `@netlify/next` configured via `netlify.toml` (uses the `[[plugins]]` block)
- Local emulation: `netlify dev` (proxies the Next.js dev server on port 8888)

Set any required environment variables in the Netlify dashboard. If you change the Next.js base path or image domains, mirror those settings in `netlify.toml` or site environment variables.
