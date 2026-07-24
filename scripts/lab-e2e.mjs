// Ad-hoc e2e sweep of every /lab page: loads it in a REAL headless browser (so
// the requestAnimationFrame draw loops actually run), exercises the chips and
// sliders, and reports any pageerror / console.error. Run: node scripts/lab-e2e.mjs
import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://localhost:4321';
const PIECES = [
  '', 'hydrogen', 'fourier', 'entropy', 'ising', 'polarizer', 'molecules',
  'millikan', 'tunnel', 'kinetics', 'well', 'chirality', 'polymer', 'fusion', 'fission', 'doubleslit',
  'diffraction',
];
const LANGS = ['ja', 'en'];
const urls = [];
for (const lang of LANGS) for (const p of PIECES) urls.push(`/${lang}/lab${p ? '/' + p : ''}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const results = [];
for (const url of urls) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.message || e).toString().split('\n')[0]));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text().split('\n')[0]);
  });
  // Also trap window.onerror + unhandled promise rejections from inside rAF.
  await page.addInitScript(() => {
    window.addEventListener('error', (e) => console.error('winerror: ' + (e.message || e.error)));
    window.addEventListener('unhandledrejection', (e) => console.error('unhandled: ' + (e.reason && e.reason.message)));
  });

  const sweepSliders = async (fracs) => {
    const sliders = await page.$$('input[type=range]');
    for (const s of sliders) {
      for (const frac of fracs) {
        try {
          await s.evaluate((el, f) => {
            const min = +el.min || 0, max = +el.max || 100;
            el.value = String(min + (max - min) * f);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }, frac);
          await sleep(150);
        } catch {}
      }
    }
  };
  const clickChips = async () => {
    const chips = await page.$$('.lab-chip, button');
    for (const c of chips) {
      try { await c.click({ timeout: 800 }); await sleep(200); } catch {}
    }
  };

  try {
    await page.goto(BASE + url, { waitUntil: 'load', timeout: 20000 });
    await sleep(1500); // let rAF draw loops run
    await clickChips();
    await sweepSliders([0, 0.5, 1]);
    // Push to extremes and SOAK — chain reactions run away, fusions pile up,
    // packets separate, adiabatic compression heats: this is where time-/value-
    // dependent NaNs and out-of-bounds tend to surface.
    await sweepSliders([1, 0]);
    await clickChips(); // fire again, reset, re-fire, toggle modes
    await sweepSliders([1]);
    await sleep(4000);
    await clickChips();
    await sleep(2000);
  } catch (e) {
    errors.push('navigation: ' + (e.message || e).toString().split('\n')[0]);
  }
  await page.close();
  results.push({ url, errors });
  const tag = errors.length ? `✗ ${errors.length}` : '✓';
  console.log(`${tag}  ${url}`);
  for (const e of [...new Set(errors)]) console.log(`      ${e}`);
}
await browser.close();

const broken = results.filter((r) => r.errors.length);
console.log(`\n=== ${results.length} pages, ${broken.length} with errors ===`);
process.exit(broken.length ? 1 : 0);
