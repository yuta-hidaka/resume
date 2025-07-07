This project is built with [Astro](https://astro.build/) and deployable on Netlify.

## Getting Started

Install dependencies using `bun` and start the dev server:

```bash
bun install
bun run dev
```

Open `http://localhost:4321` in your browser.

## Build

```bash
bun run build
```

The generated static site will be in the `dist` directory and can be deployed to Netlify.
If you are using Netlify, set the `BUN_VERSION` environment variable so Bun is installed during the build.
Astro requires Node.js 18 or higher, so also set `NODE_VERSION=20` (or any supported version) in your Netlify environment variables.
