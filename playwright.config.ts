import { defineConfig } from '@playwright/test';

// Dedicated port for the preview server Playwright drives, so it does not
// collide with `astro dev` (launch.json uses 4399) or the PDF pipeline (4323).
const PORT = 4329;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  // Visual-regression defaults. A small ratio absorbs sub-pixel anti-aliasing
  // noise without letting real layout/color regressions slip through.
  expect: {
    toHaveScreenshot: {
      // Absolute pixel budget (not a ratio): on tall full-page shots a ratio
      // lets sizable regressions slip through. `threshold` absorbs per-pixel
      // anti-aliasing noise; `maxDiffPixels` bounds how many pixels may differ.
      threshold: 0.2,
      maxDiffPixels: 200,
      animations: 'disabled',
      caret: 'hide',
    },
  },

  use: {
    baseURL,
    browserName: 'chromium',
    // Sandboxed/CI environments ship a pinned Chromium instead of letting
    // Playwright download one — point at it via env when provided.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
    // Fixed rendering environment so screenshots are deterministic run-to-run.
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },

  // Build the site and serve the production output (dist) — the same artifact
  // that ships — then run the suite against it.
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
