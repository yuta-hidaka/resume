import type { Config, Context } from '@netlify/functions';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async (req: Request, context: Context) => {
  try {
    // Parse request body
    const body = await req.json();
    const { documentId, locale = 'ja', filename } = body;

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'documentId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the site URL from environment or construct it
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || 'http://localhost:4321';
    const targetUrl = `${siteUrl}/${locale}/downloads?pdf=${documentId}`;

    console.log(`Generating PDF for: ${targetUrl}`);

    // Launch browser
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();

      // Navigate to the page
      await page.goto(targetUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      // Generate PDF with A4 format
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        preferCSSPageSize: true,
      });

      await page.close();
      await browser.close();

      // Return PDF
      return new Response(pdf, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename || documentId + '.pdf'}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const config: Config = {
  path: '/api/generate-pdf',
  method: 'POST',
};
