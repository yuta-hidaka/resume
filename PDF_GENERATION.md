# PDF生成機能の改善について

## 概要

このドキュメントは、スマートフォンを含むすべてのデバイスで正確なA4サイズのPDFを生成できるようにするための改善内容を説明します。

## 実装内容

### 1. サーバーサイドPDF生成 (Netlify Functions + Puppeteer)

**ファイル**: `netlify/functions/generate-pdf.mts`

- Puppeteer Coreと@sparticuz/chromiumを使用
- A4サイズ(210mm × 297mm)で正確にPDFを生成
- すべてのデバイスで同じ品質のPDFを出力

**メリット**:
- モバイルブラウザのレンダリングの不一致を解消
- フォントとレイアウトの一貫性を保証
- 高品質なPDF出力

### 2. PDF専用スタイル

**ファイル**: `src/components/DocumentSection.astro`

**追加した`@media print`スタイル**:
- A4サイズ専用レイアウト(210mm × 297mm、padding: 15mm)
- ページ区切りルール(`page-break-after`, `page-break-inside`)
- テキスト切れ防止(`word-wrap`, `orphans`, `widows`)
- 適切なフォントサイズ調整

### 3. ダウンロードロジックの改善

**ファイル**: `src/components/DocumentDownloadScripts.astro`

**機能**:
1. **プライマリ**: サーバーサイドPDF生成API呼び出し
2. **フォールバック**: クライアントサイドhtml2pdf.js (改善版、scale: 3)
3. **エラーハンドリング**: 失敗時のユーザーフィードバック

### 4. PDF生成モード対応

**ファイル**: 
- `src/pages/ja/downloads.astro`
- `src/pages/en/downloads.astro`

**機能**:
- URLパラメータ`?pdf={docId}`でPDF生成専用モードに切り替え
- UI要素(ボタン、ヘッダーなど)を非表示
- Puppeteerが読み込む際のクリーンなHTML出力

### 5. 依存関係の追加

**ファイル**: `package.json`, `netlify.toml`

```json
{
  "@sparticuz/chromium": "^130.0.0",
  "puppeteer-core": "^23.11.1"
}
```

Netlify Functions設定:
- `node_bundler = "esbuild"`
- 外部モジュールの指定

## 使用方法

### 開発環境

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun dev

# ビルド
bun build
```

### PDF生成API

**エンドポイント**: `POST /api/generate-pdf`

**リクエストボディ**:
```json
{
  "documentId": "jp-resume-md",
  "locale": "ja",
  "filename": "yuta-hidaka-resume-ja-text.pdf"
}
```

**レスポンス**: PDF binary (application/pdf)

### サポートされているドキュメントID

**日本語**:
- `jp-resume-md` - 履歴書(Markdown)
- `jp-cv` - 職務経歴書(HTML)
- `jp-resume` - 履歴書(HTML)

**English**:
- `en-resume` - Resume(Markdown)
- `en-cv` - CV(HTML)

## テスト

### ローカルテスト

1. 開発サーバーを起動: `bun dev`
2. ブラウザで `/ja/downloads` または `/en/downloads` にアクセス
3. 各ドキュメントの「Download PDF」ボタンをクリック

### デバイステスト

- ✅ デスクトップ Chrome/Safari/Firefox
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ iPad Safari

### 確認項目

- [ ] PDFがA4サイズで正確に出力される
- [ ] テキストが切れていない
- [ ] レイアウトが崩れていない
- [ ] ページ区切りが適切
- [ ] 画像が正しく表示される
- [ ] フォントが正しくレンダリングされる

## トラブルシューティング

### Netlify Functionsでのエラー

**問題**: タイムアウトエラー
**解決策**: 
- Netlify Functions の実行時間制限を確認
- 複雑なドキュメントはビルド時に事前生成を検討

**問題**: Chromium起動エラー
**解決策**:
- `@sparticuz/chromium`のバージョンを確認
- Netlify環境変数の設定を確認

### クライアントサイド生成の問題

**問題**: モバイルでPDF生成が遅い
**解決策**: 
- サーバーサイド生成を優先的に使用
- html2pdf.jsはフォールバックのみ

## 今後の改善案

1. **ビルド時PDF生成**: Netlify Build時に静的PDFを事前生成
2. **キャッシュ戦略**: 生成済みPDFをCDNにキャッシュ
3. **プレビュー機能**: PDF生成前のプレビュー表示
4. **カスタマイズ**: ユーザーがフォントサイズやマージンを調整可能に

## 参考資料

- [Puppeteer Documentation](https://pptr.dev/)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [CSS Paged Media](https://www.w3.org/TR/css-page-3/)
