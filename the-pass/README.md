# The Pass 出菜口

一份 AI 驅動的內容產品：**用 AI 報導「AI 如何改變你我的飲食生活」**。
從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前——名字源自廚房術語「出菜口（Pass）」。

- **Slogan:** Intelligence, served.
- **TA:** 台灣讀者（但刻意只收國外來源——價值在「台灣沒有的新鮮事」）
- **線上:** [thepass.cc](https://thepass.cc)　完整定位見 [project-brief](https://thepass.cc/project-brief.html)

## 選題系統

每期出刊前，pipeline 自動把世界各地的飲食新知選成一份「選題報告」，給編輯室開會拍板：

```
抓取（active 來源 RSS）→ 去重 → 依產量自適應粗篩 → LLM 五面向評分 → 排序選一期 → 選題報告
```

入口頁集中所有工具：[**thepass.cc/hub.html**](https://thepass.cc/hub.html)

| 頁面 | 說明 |
|------|------|
| 選題機制設計 | 從原料到一期的完整流程 |
| 選題來源 / 來源狀態 | 即時來源清單（active/pending），由程式自動生成 |
| 選題報告 | 每期的編輯會議文件：建議出刊、完整候選池、庫存、已篩除、本週掃描來源（切角可互動挑選） |
| 來源審核 `/audit-sources` | 評估候選來源並收進 pipeline 的 skill 說明 |

## 編輯團隊

三位有完整人設的 AI 編輯 + 幕後總編輯：
- **Mise** — 長文（場景式、找人）
- **Passe** — 快訊（第一句就是事實）
- **Fumet** — 結尾提問（從當期長文提煉一個值得深思的問題）

## 開發

```bash
npm install
npm run dev            # http://localhost:3000

# 選題 pipeline 與腳本（用 tsx）
npx tsx scripts/audit-feed.ts <url...>      # 來源 feed 探測
npx tsx scripts/gen-sources-page.ts         # 從 sources.ts 重生 public/sources.html
npx tsx scripts/demo-report.ts              # 產出選題報告 HTML
```

- **Stack:** Next.js 16 (TypeScript) · `@anthropic-ai/sdk`（評分）· Vercel
- 真實 LLM 評分需在 `.env.local` 設 `ANTHROPIC_API_KEY`（否則走 dry-run）。
- 來源是單一真實來源 `src/lib/sources.ts`——改它後重生頁面即可，勿手改 `public/sources.html`。

## 部署

```bash
npx vercel --prod --yes
```

> 開發者技術備忘錄見 [CLAUDE.md](CLAUDE.md)。
