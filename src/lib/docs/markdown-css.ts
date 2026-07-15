// Print/PDF stylesheet for the Markdown text-resume pages.
// @page carries the A4 margins so every page of the flowing document
// keeps them (a container padding would only pad the first/last page).
import { FONTS_CSS } from './fonts-css';

export const MARKDOWN_DOC_CSS = `
${FONTS_CSS}
@page {
  size: A4;
  margin: 14mm 15mm;
}

.md-doc {
  /* Self-hosted Noto subsets (400/700 only — synthetic weights/italics force
     Type 3 embedding in the PDF, which some viewers render blank). */
  font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', Meiryo, sans-serif;
  color: #111827;
  background: #ffffff;
  font-size: 10pt;
  line-height: 1.6;
  width: 210mm;
  margin: 0 auto;
  padding: 14mm 15mm;
  box-sizing: border-box;
}

.md-doc h1 {
  font-size: 17pt;
  margin: 0 0 10pt;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 4pt;
}

.md-doc h2,
.md-doc h3 {
  font-size: 12.5pt;
  margin: 12pt 0 6pt;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 2pt;
  break-after: avoid;
  page-break-after: avoid;
}

.md-doc h4 {
  font-size: 11pt;
  margin: 10pt 0 4pt;
  break-after: avoid;
  page-break-after: avoid;
}

.md-doc p {
  margin: 4pt 0;
}

.md-doc ul {
  margin: 3pt 0 6pt;
  padding-left: 16pt;
}

.md-doc li {
  margin: 1.5pt 0;
  break-inside: avoid;
  page-break-inside: avoid;
}

.md-doc hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 8pt 0;
}

.md-doc a {
  color: #1d4ed8;
  text-decoration: none;
  word-break: break-all;
}

.md-doc em {
  color: #6b7280;
  font-style: normal;
}

@media print {
  .md-doc {
    width: auto;
    padding: 0;
    margin: 0;
  }
}
`;
