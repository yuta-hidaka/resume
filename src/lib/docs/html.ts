/** Shared helpers for the generated HTML documents. */

export interface RenderedDoc {
  title: string;
  bodyClass: string;
  css: string;
  bodyHtml: string;
}

export function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Standalone HTML document (fed to DocumentSection previews). */
export function toHtmlDocument(doc: RenderedDoc): string {
  return [
    '<!doctype html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="UTF-8" />',
    `<title>${esc(doc.title)}</title>`,
    `<style>${doc.css}</style>`,
    '</head>',
    `<body class="${doc.bodyClass}">`,
    doc.bodyHtml,
    '</body>',
    '</html>',
  ].join('\n');
}
