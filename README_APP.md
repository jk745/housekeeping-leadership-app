# APP Local Setup

這個 APP 是給你用手機直接打開網址就能記錄的表單版工具，重點不是做大型管理系統，而是把「先記錄、再整理、再寫進 Notion」這條上任節奏固定下來。

## 1. 本機啟動

1. 安裝依賴：`npm install`
2. 複製環境變數：`cp .env.example .env`
3. 填入必要變數：
   `OPENAI_API_KEY`
   `NOTION_API_KEY`
   `NOTION_MANAGER_REPORT_PAGE_ID`
   `NOTION_WEEKLY_REVIEW_PAGE_ID`
4. 啟動前端：`npm run dev`
5. 若要連 Netlify Functions 一起跑：`npx netlify dev`

## 2. 目前 Notion 寫入邏輯

- `讀書筆記` 會寫入《如何領導》讀書筆記資料庫
- `現場觀察` 會寫入房務現場觀察紀錄
- `團隊互動` 會寫入團隊信任建立紀錄
- `改善想法` 會寫入改善議題追蹤表
- `主管回報` 會附加到主管每週回報頁
- `每週回顧` 會優先寫入每週回顧頁；若未設定，會 fallback 到主管每週回報頁

## 3. 手機使用方式

1. 用手機打開部署後的網址
2. 選一種你現在要記的素材類型
3. 先用快速整理記下現場內容
4. 到 Review 頁確認整理結果有沒有貼近你的現場判斷
5. 確認後按 `確認寫入 Notion`
6. 成功頁可直接點開 Notion 檢查這一筆內容

如果你常用這個 APP，可以把它加到手機主畫面，縮短記錄路徑。

## 4. 部署到 Netlify（手機網址）

這是讓你手機能直接打開的關鍵步驟。

### 前置條件

- 有 GitHub 帳號（免費）
- 有 Netlify 帳號（免費，用 GitHub 登入）

### 步驟一：把專案推到 GitHub

```bash
# 在專案根目錄執行
git init
git add .
git commit -m "init: 房務部轉任領導系統"
```

然後到 [github.com/new](https://github.com/new) 建立一個新 repository（名稱例如 `housekeeping-leadership-app`），按照 GitHub 指示把本機推上去：

```bash
git remote add origin https://github.com/你的帳號/housekeeping-leadership-app.git
git branch -M main
git push -u origin main
```

### 步驟二：在 Netlify 連結 GitHub

1. 前往 [app.netlify.com](https://app.netlify.com)
2. 點 **Add new site → Import an existing project**
3. 選 **GitHub**，授權後選剛才建立的 repository
4. Build settings 會自動從 `netlify.toml` 讀取，不需手動填寫

### 步驟三：設定環境變數

在 Netlify 的 **Site configuration → Environment variables** 頁面，新增以下五個變數：

| 變數名稱 | 說明 |
|---|---|
| `OPENAI_API_KEY` | OpenAI API 金鑰，從 [platform.openai.com/api-keys](https://platform.openai.com/api-keys) 取得 |
| `NOTION_API_KEY` | Notion Integration Token，從 [notion.so/my-integrations](https://www.notion.so/my-integrations) 取得 |
| `NOTION_MANAGER_REPORT_PAGE_ID` | 主管每週回報 Notion 頁面的 ID（URL 最後一段，32 碼） |
| `NOTION_WEEKLY_REVIEW_PAGE_ID` | 每週回顧 Notion 頁面的 ID（選填，未設定會 fallback 到上方頁面） |

> **如何找 Notion Page ID：** 打開那個頁面，複製網址，例如 `https://www.notion.so/我的頁面-abc123def456`，最後那串英數字就是 ID。

### 步驟四：Deploy

設完環境變數後，Netlify 會自動觸發第一次 deploy。幾分鐘後你會拿到一個網址，例如：

```
https://your-app-name.netlify.app
```

把這個網址加到手機主畫面，之後直接點開就能記錄。

### 更新 APP

之後只要 `git push`，Netlify 就會自動重新 deploy，不需要手動操作。

---

## 5. 目前部署設定（netlify.toml）

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- **command**：先跑 TypeScript 型別檢查再打包前端
- **publish**：Vite 輸出目錄
- **functions**：Netlify Functions 所在位置
- **redirects**：SPA 路由，讓手機重新整理不會 404

---

## 6. 使用提醒

這個 APP 的用途，是幫你把房務上任素材留得穩、留得快，不是逼自己每次都寫完整報告。

請持續記得：

> 先理解，再帶領；先信任，再要求；先穩定，再改善。

尤其在房務現場情境下，像退房清潔、查房、備品補充、房況回報、急房、延退與客務銜接，先把觀察記下來，比急著下結論更重要。
