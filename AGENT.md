# Agent Instructions

## コミット・プッシュについて

変更を加えた場合は、**常にコミット・プッシュしてください**。

変更内容を適切なコミットメッセージでコミットし、リモートリポジトリにプッシュすることを忘れないでください。

## レジュメ・職務経歴書の更新時に必ず変更するファイル一覧

職歴やスキルなどのレジュメ内容を更新する場合、**以下の6ファイルすべて**に同じ変更を反映すること。漏れがあるとサイト表示とダウンロードPDFの内容がずれる。

### サイト表示データ（Astro/TSファイル）
1. `src/data/about.ja.ts` — 日本語サイト表示データ（experience, skills, education 等）
2. `src/data/about.en.ts` — 英語サイト表示データ（上記の英訳）

### ダウンロード用ドキュメント
3. `docs/resume/resume-ja.md` — 日本語レジュメ（テキスト版、Markdownプレビュー＆PDF）
4. `docs/resume/resume-en.md` — 英語レジュメ（テキスト版、Markdownプレビュー＆PDF）
5. `docs/職務経歴書/_.html` — 日本語職務経歴書（HTML版、プレビュー＆PDF）
6. `docs/resume/en-cv.html` — 英語CV（HTML版、プレビュー＆PDF）

### 更新後のチェックリスト

1. **6ファイルすべてに変更が反映されているか確認する**
2. `bun run build` でビルドが通ることを確認する
3. コミット・プッシュする
4. **yuta.dev の全ページをブラウザで確認する**（日本語・英語の各ページ）:
   - `/ja/` — 日本語トップ
   - `/ja/career` — 日本語キャリア
   - `/ja/about` — 日本語アバウト
   - `/ja/downloads` — 日本語ダウンロード（プレビュー表示を確認）
   - `/en/` — 英語トップ
   - `/en/career` — 英語キャリア
   - `/en/about` — 英語アバウト
   - `/en/downloads` — 英語ダウンロード（プレビュー表示を確認）

## Downloadsページの「Preview」と「PDFダウンロード」の同期ルール

- 原則として、DownloadsページのPDFは **画面でPreviewしているHTML/Markdownと同じソース**から生成すること。
- `DocumentSection` の `staticPdfUrl` を設定すると、Previewとは別の静的PDFがダウンロードされ、内容がズレやすい。
  - `staticPdfUrl` を使う場合は「そのPDFがPreviewと同一内容である」ことを保証できる仕組み（生成/更新手順）を必ず用意すること。
  - このリポジトリでは GitHub Actions で `public/pdf/*.pdf` を自動生成し、`staticPdfUrl` はそれを参照する（Previewと同一ソースから印刷PDFを生成）。
- 変更後は最低限、以下を確認すること:
  - `bun run build`
  - DownloadsページでPreview表示と「Download PDF」の出力が同一内容になっていること（少なくとも見出し/会社名/日付が一致）
