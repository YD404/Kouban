# GitHub Pages へのデプロイ方法

このアプリケーションを GitHub Pages で公開するための手順です。

## 1. 準備

`vite.config.ts` に以下の設定が含まれていることを確認してください（設定済みです）。

```typescript
export default defineConfig({
  plugins: [react()],
  base: './', // 相対パス設定
})
```

## 2. GitHub リポジトリの作成

1.  GitHub にログインし、新しいリポジトリを作成します（例: `kouban-generator`）。
2.  ローカルのプロジェクトを GitHub にプッシュします。

```bash
# まだ git 初期化していない場合
git init
git add .
git commit -m "Initial commit"

# リモートリポジトリを追加してプッシュ
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git branch -M main
git push -u origin main
```

## 3. GitHub Pages の設定

### 方法 A: GitHub Actions を使用する（推奨）

1.  GitHub リポジトリのページで **Settings** タブを開きます。
2.  左側のメニューから **Pages** を選択します。
3.  **Build and deployment** セクションの **Source** で **GitHub Actions** を選択します。
4.  **Static HTML** の Configure ボタン、または **Node.js** などのテンプレートが表示されるかもしれませんが、基本的には以下のワークフローファイルを作成してプッシュするのが確実です。

プロジェクトのルートに `.github/workflows/deploy.yml` を作成し、以下の内容を保存してプッシュしてください。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v1
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v1
```

### 方法 B: 手動ビルドして `/docs` フォルダなどを使う（簡易版）

GitHub Actions を使わない場合、ビルドしたファイルを特定のブランチやフォルダに配置する方法もありますが、Vite + React の場合は上記のアクションを使用するのが最も標準的です。

もし `gh-pages` ブランチを使用したい場合は、`gh-pages` パッケージを使用する方法もあります。

1.  `npm install gh-pages --save-dev`
2.  `package.json` に以下を追加:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist"
    }
    ```
3.  `npm run deploy` を実行すると、`dist` フォルダの内容が `gh-pages` ブランチにプッシュされ、公開されます。
4.  GitHub Settings -> Pages で Source を **Deploy from a branch** にし、Branch を `gh-pages` / `/ (root)` に設定します。

## 4. 公開確認

設定が完了し、デプロイ（Action または push）が成功すると、Settings -> Pages ページの上部に公開URLが表示されます。
例: `https://あなたのユーザー名.github.io/リポジトリ名/`

アクセスしてアプリケーションが動作することを確認してください。
