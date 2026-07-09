// Small pure formatters for the assistant UI, kept out of the .astro inline
// script so they can be unit-tested.

/** Progress line for a model download: "読み込み中 45% · 230/500 MB · 12.3 MB/s".
 *  transformers.js reports progress per-file; the big weight file dominates, so
 *  the sizes/rate read true in practice. Rate/size parts are omitted when unknown. */
export function downloadStatus(
  label: string,
  pct: number,
  loadedBytes?: number,
  totalBytes?: number,
  bytesPerSec?: number,
): string {
  const parts = [`${label} ${Math.round(Math.max(0, Math.min(100, pct)))}%`];
  if (totalBytes && totalBytes > 0) {
    parts.push(`${Math.round((loadedBytes ?? 0) / 1e6)}/${Math.round(totalBytes / 1e6)} MB`);
  }
  if (bytesPerSec && bytesPerSec > 0) {
    const mbps = bytesPerSec / 1e6;
    parts.push(`${mbps < 10 ? mbps.toFixed(1) : Math.round(mbps)} MB/s`);
  }
  return parts.join(' · ');
}
