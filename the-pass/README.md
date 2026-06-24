# The Pass 出菜口

一份 AI 驅動的內容產品：**用 AI 報導「AI 如何改變你我的飲食生活」**。
從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前——名字源自廚房術語「出菜口（Pass）」。

- **Slogan:** Intelligence, served.
- **TA:** 台灣讀者（但刻意只收國外來源——價值在「台灣沒有的新鮮事」）
- **線上:** [thepass.cc](https://thepass.cc)　完整定位見 [project-brief](https://thepass.cc/project-brief.html)

## 怎麼出一期：三個 skill 接力

整條出刊由三個 skill 完成，中間夾「人定稿」：**選題 → 寫稿 → 你定稿 → 發佈**

- **選題** `/selection-report` — 抓全球來源、AI 評分，產出選題報告讓編輯室拍板。
- **寫稿** `/write-issue` — 四個 AI 編輯分身（Mise／Passe／Fumet／總編）把選的稿寫成整期草稿，AI 起草、人定稿。
- **發佈** `/publish-issue` — 把定稿做成 issue 網頁＋長文配圖（紐約客式概念插畫），上線。配圖風格是**可抽取／可替換**的：用 `/style-extract` 抽一套驗證過的風格 profile，換風格 ＝ 換 profile（見 [換插圖風格 SOP](https://thepass.cc/illustration-style-sop.html)）。

三個 skill 都零金鑰、在本機跑。一頁說明：[**thepass.cc/skills.html**](https://thepass.cc/skills.html)

## 選題系統

每期出刊前，pipeline 自動把世界各地的飲食新知選成一份「選題報告」，給編輯室開會拍板：

```
抓取（active 來源 RSS）→ 去重 → Opus 全程評估（硬閘門 + 五面向）
  → 庫存合併競爭（上期沒選上的一起排序）→ 選一期 → 選題報告
```

去重後每篇都由 Opus 做一次完整評估（不靠關鍵字粗篩）；合格沒選上的進**庫存**，帶保鮮期、下期跟新文章重新競爭——永遠選「當下最好的」。

**查詢式進料（scout，實驗中）**：除了固定的 RSS 來源，pipeline 也能用 AI 搜尋引擎、依「在地語言 × 跨區主題」常駐查詢，撈出 RSS 名單看不到的在地與驚奇題，併進同一條篩選線——把「選題天花板」從固定來源清單往外推。

入口頁集中所有工具：[**thepass.cc/hub.html**](https://thepass.cc/hub.html)

| 頁面 | 說明 |
|------|------|
| 選題機制設計 | 從原料到一期的完整流程 |
| 選題來源 / 來源狀態 | 即時來源清單（active/pending），由程式自動生成 |
| 選題報告 | 每期的編輯會議文件：建議出刊、完整候選池、庫存、已篩除、本週掃描來源（切角可互動挑選） |
| 來源審核 `/audit-sources` | 評估候選來源並收進 pipeline 的 skill 說明 |
| Skills 說明 | 三個 skill（選題／寫稿／發佈）一頁介紹 |
| 編輯源頭 | 四位編輯的人設與寫作風格（團隊優化入口） |
| 配圖總覽 | 每期長文配圖（採用＋候選對照），左側切換歷期 |

## 編輯團隊

**十位**有完整人設的 AI 編輯——**四位原創**（虛構）＋**六位真人分身**（克隆自真實名廚資深編輯）＋幕後總編輯。完整介紹見 [AI 編輯團隊](https://thepass.cc/editor-team.html)。

**原創四位**（開放·讀共用招庫、博採眾長）：
- **Mise** — 長文（場景式、找人；技術／產業面）
- **Passe** — 快訊（第一句就是事實）
- **Fumet** — 結尾提問；也寫文化面長文（/write-issue 依題材自動分派誰寫長文）
- **Amuse** — 諷刺自嘲的特別企劃編輯（不定期吐槽餐飲科技的炒作），用 `/commission` 單篇叫他寫

**真人分身六位**（封閉·只讀自己人格檔、越像原作者越好）：**Musubi**（日韓飲食文化發現）、**Jang**（產業經營拆解）、**Bao**（倫敦離散餐廳現場特寫）、**Kaya**（東南亞深訪口述史）、**Nano**（fine-dining 概念解剖）、**Lou**（飲食文化考據·源流鑑賞·判斷留白）——各克隆自一位真實作者，用 `/voice-extract` 抽其筆調建成。

每位編輯都有分層人格檔（Soul 人格／Voices 守則／Anchors 筆調範本／Moves 招／Memory 記憶），每期把學到的、寫過的記起來——越寫越像自己。團隊可在 [編輯源頭頁](https://thepass.cc/editor-source.html) 看寫作風格、從那提優化；想新增一位**真人分身**見 [筆調抽取](https://thepass.cc/voice-extract.html)、新增一位**原創編輯**見 [新增 AI 編輯 SOP](https://thepass.cc/new-editor-guide.html)。長文一律「觀點編譯」：完整交代來源 ＋ 編輯觀點貫穿。

**想單獨請一位編輯寫一篇**（給一個來源、給多篇素材綜整、或只給一個方向讓他自己研究）→ `/commission`，介紹、用法與兩個成果範例見 [委稿一位編輯](https://thepass.cc/commission.html)。

## 開發

```bash
npm install
npm run dev            # http://localhost:3000

# 選題 pipeline 與腳本（用 tsx）
npx tsx scripts/audit-feed.ts <url...>      # 來源 feed 探測
npx tsx scripts/gen-sources-page.ts         # 從 sources.ts 重生 public/sources.html
npx tsx scripts/demo-report.ts              # 產出選題報告 HTML
npx tsx scripts/test-backlog.ts             # 庫存跨期競爭測試
```

- **Stack:** Next.js 16 (TypeScript) · `@anthropic-ai/sdk`（Opus 評分）· Vercel
- 真實 LLM 評分需在 `.env.local` 設 `ANTHROPIC_API_KEY`（否則走 dry-run）。
- 來源是單一真實來源 `src/lib/sources.ts`——改它後重生頁面即可，勿手改 `public/sources.html`。

## 部署

push 到 `main` 即自動部署（Vercel，Root Directory 設為 `the-pass`）。手動備援：

```bash
npx vercel --prod --yes
```

> 開發者技術備忘錄見 [CLAUDE.md](CLAUDE.md)。
