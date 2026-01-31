import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'pdf');

const DOCS = [
  { locale: 'en', id: 'en-cv', out: 'yuta-hidaka-cv-en.pdf' },
  { locale: 'en', id: 'en-resume', out: 'yuta-hidaka-resume-en.pdf' },
  { locale: 'ja', id: 'jp-cv', out: 'yuta-hidaka-cv-ja.pdf' },
  { locale: 'ja', id: 'jp-resume', out: 'yuta-hidaka-resume-ja.pdf' },
  { locale: 'ja', id: 'jp-resume-md', out: 'yuta-hidaka-resume-ja-text.pdf' },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function findAvailablePort(start, end) {
  for (let port = start; port <= end; port++) {
    // eslint-disable-next-line no-await-in-loop
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(false));
      server.listen({ host: '127.0.0.1', port }, () => {
        server.close(() => resolve(true));
      });
    });
    if (available) return port;
  }
  throw new Error(`No available port found in range ${start}-${end}`);
}

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  // Node 22 has fetch globally.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return;
    } catch {
      // ignore
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error(`Timed out waiting for server: ${url}`);
    }
    await sleep(500);
  }
}

function startPreviewServer(port) {
  // Use bun if available (project uses bun), but fall back to npm.
  const useBun = fs.existsSync(path.join(ROOT, 'bun.lockb'));
  const cmd = useBun ? 'bun' : 'npm';
  const args = useBun
    ? ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)]
    : ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)];

  const child = spawn(cmd, args, {
    cwd: ROOT,
    // Keep output minimal (CI logs can get noisy). If debugging is needed,
    // run the preview server manually via `bun run preview`.
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
    detached: true,
  });

  return child;
}

async function stopPreviewServer(child) {
  if (!child || child.killed) return;

  const waitExit = new Promise((resolve) => {
    child.once('exit', () => resolve());
  });

  try {
    // Kill the whole process group (bun -> astro preview).
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }

  const timeout = sleep(5_000);
  await Promise.race([waitExit, timeout]);

  if (!child.killed) {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
    }
  }
}

async function resolveExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;

  // Best effort for local macOS runs (optional).
  if (process.platform === 'darwin') {
    const macPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    for (const p of macPaths) {
      if (fs.existsSync(p)) return p;
    }
  }

  // Works well in CI (Linux).
  return chromium.executablePath();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const port = await findAvailablePort(4321, 4399);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startPreviewServer(port);

  try {
    server.stdout?.on('data', () => {});
    server.stderr?.on('data', () => {});
    await waitForServer(`${baseUrl}/ja/`);
    console.log(`Preview server ready: ${baseUrl}`);

    const executablePath = await resolveExecutablePath();
    console.log(`Using Chrome executable: ${executablePath}`);
    const isLocalChrome =
      process.platform === 'darwin' ||
      executablePath.includes('Google Chrome.app') ||
      executablePath.includes('Chromium.app');

    const browser = await puppeteer.launch({
      // Sparticuz Chromium flags are tailored for serverless; they can crash a local desktop Chrome.
      args: isLocalChrome
        ? ['--no-sandbox', '--disable-setuid-sandbox']
        : [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: isLocalChrome ? 'new' : true,
    });

    try {
      for (const doc of DOCS) {
        const url = `${baseUrl}/${doc.locale}/pdf/${doc.id}/`;
        const outPath = path.join(OUT_DIR, doc.out);

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
        await page.evaluateHandle('document.fonts.ready');

        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
          preferCSSPageSize: true,
        });

        fs.writeFileSync(outPath, pdf);
        await page.close();
        console.log(`Generated: ${path.relative(ROOT, outPath)} from ${url}`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    await stopPreviewServer(server);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
