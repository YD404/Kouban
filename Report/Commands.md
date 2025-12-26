# Kouban 実行コマンド集

## 開発

```bash
# 依存関係のインストール（初回 or package.json更新後）
npm install

# 開発サーバー起動（ホットリロード付き）
npm run dev
# → http://localhost:5173/ でアクセス
# → 停止は Ctrl + C
```

## ビルド・デプロイ

```bash
# 本番用ビルド（dist/に出力）
npm run build

# ビルド結果をローカルでプレビュー
npm run preview
```

## コード品質

```bash
# ESLintでコードチェック
npm run lint
```
