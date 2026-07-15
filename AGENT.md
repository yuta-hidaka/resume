# Agent Instructions

## コミット・プッシュについて

変更を加えた場合は、**常にコミット・プッシュしてください**。

変更内容を適切なコミットメッセージでコミットし、リモートリポジトリにプッシュすることを忘れないでください。

## レジュメ内容の更新方法（単一データソース）

レジュメ内容の正規データは **`src/data/profile/profile.ts` ただ1つ**。
サイト表示（ja/en）と /ask のグラウンディングはここから自動導出される
（`derive.ts` → `getData()`）。事実（日付・数値・タグ）は言語共通で1回だけ
持ち、文章のみ `{ja, en}` で持つ。`validate.ts` が時系列・在籍期間の整合性を
import時に検証するので、矛盾したデータはビルドとテストが落ちる。

### まだ手動同期が必要なファイル（テンプレート化されるまでの暫定）

以下のダウンロード用ドキュメントはまだ `profile.ts` から生成されていない。
内容を変えたら**これらにも同じ変更を反映**すること:

1. `docs/resume/resume-ja.md` — 日本語レジュメ（テキスト版、Markdownプレビュー＆PDF）
2. `docs/resume/resume-en.md` — 英語レジュメ（テキスト版、Markdownプレビュー＆PDF）
3. `docs/職務経歴書/_.html` — 日本語職務経歴書（HTML版、プレビュー＆PDF）
4. `docs/resume/en-cv.html` — 英語CV（HTML版、プレビュー＆PDF）
5. `docs/履歴書/_.html` — 日本語履歴書（HTML版、プレビュー＆PDF）

### 更新後のチェックリスト

1. `src/data/profile/profile.ts` を更新し、上記の未生成ドキュメントにも反映されているか確認する
2. `bun test src` と `bun run build` が通ることを確認する（データ整合性もここで検証される）
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

## 「AIに質問 / Ask AI」機能（`/ja/ask`・`/en/ask`）

ブラウザ内で動く小型LLMが、履歴書を根拠に質問へ答える機能。コードは `src/lib/ask/` と
`src/components/AskPage.astro`。全体像は [README.md](README.md) の "Ask AI" 節を参照。

### 触るときの注意（壊さないためのガードレール）

- **`vitest` を絶対に追加しない。** `vite@5` が hoist され Astro 7 の `vite@8` を shadow して
  `bun run build` が壊れる（`createIdResolver is not a function`）。テストは **`bun test`**。
  壊れた lockfile は `bun install` で復旧。
- 変更したら必ず **`bun test src/lib/ask`** と **`bun run build`** を通す。
- **`verify.ts` の「絶対に嘘をつかない」保証を弱めない。** 生成回答は必ず `guardedAnswer()` を
  通し、履歴書で裏づけできない主張・反復ゴミは事実へフォールバックする。多言語 red-team テストが
  この保証を固定しているので、`verify.ts` を変えたら全テスト緑を必ず確認。
- モデルは `config.ts` の `MODELS` で管理（既定 = Qwen2.5-0.5B）。既定を未検証モデルに変えない。
- **WebGPU はプレビュー用サンドボックスでクラッシュする**ため、実際の生成は実機ブラウザでしか
  検証できない。retrieval（LLM利用なし）モードと `bun test` はサンドボックスで検証可能。

### CI との関係

`.github/workflows/generate-pdfs.yml` は履歴書ページのみPDF化する。`src/lib/ask/**` と
`AskPage.astro` は `paths-ignore` 済みなので、**/ask だけの変更では PDF ワークフローは走らない**
（＝ Netlify デプロイは走る）。履歴書コンテンツ（上記6ファイル等）を変えたときだけ PDF が再生成される。
