import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression suite.
 *
 * Snapshots the stable, shipped pages in both locales. The `/ask` pages are
 * skipped and the floating Ask widget is removed from the DOM before capture
 * (see settle) while that feature is still work-in-progress, so unrelated Ask
 * changes don't churn every page's baseline.
 *
 * Baselines are platform-specific (macOS here). Regenerate with:
 *   npm run test:e2e:update
 */

const PAGES = [
  { name: 'home', paths: { ja: '/ja/', en: '/en/' } },
  { name: 'career', paths: { ja: '/ja/career/', en: '/en/career/' } },
  { name: 'about', paths: { ja: '/ja/about/', en: '/en/about/' } },
  { name: 'downloads', paths: { ja: '/ja/downloads/', en: '/en/downloads/' } },
] as const;

const LOCALES = ['ja', 'en'] as const;

async function settle(page: Page): Promise<void> {
  // Web fonts must be ready or the serif display text renders at different
  // widths between runs.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  // Remove the WIP Ask feature (fixed/out-of-flow, so no layout shift) so its
  // churn doesn't invalidate every page's baseline.
  await page.evaluate(() => {
    document
      .querySelectorAll('#ask-root, #ask-launcher, #ask-panel')
      .forEach((el) => el.remove());
  });
}

for (const entry of PAGES) {
  for (const locale of LOCALES) {
    test(`${entry.name} (${locale})`, async ({ page }) => {
      await page.goto(entry.paths[locale]);
      await settle(page);

      await expect(page).toHaveScreenshot(`${entry.name}-${locale}.png`, {
        fullPage: true,
      });
    });
  }
}
