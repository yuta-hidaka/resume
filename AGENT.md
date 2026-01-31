# Agent Instructions

## コミット・プッシュについて

変更を加えた場合は、**常にコミット・プッシュしてください**。

変更内容を適切なコミットメッセージでコミットし、リモートリポジトリにプッシュすることを忘れないでください。

## Downloadsページの「Preview」と「PDFダウンロード」の同期ルール

- 原則として、DownloadsページのPDFは **画面でPreviewしているHTML/Markdownと同じソース**から生成すること。
- `DocumentSection` の `staticPdfUrl` を設定すると、Previewとは別の静的PDFがダウンロードされ、内容がズレやすい。
  - `staticPdfUrl` を使う場合は「そのPDFがPreviewと同一内容である」ことを保証できる仕組み（生成/更新手順）を必ず用意すること。
  - 仕組みがない/不明な場合は `staticPdfUrl` を使わず、`/api/generate-pdf`（サーバーサイド生成）またはクライアントサイド生成に寄せる。
- 変更後は最低限、以下を確認すること:
  - `bun run build`
  - DownloadsページでPreview表示と「Download PDF」の出力が同一内容になっていること（少なくとも見出し/会社名/日付が一致）
