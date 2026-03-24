# CLAUDE.md — The Pass 出菜口 Project Context

> Last updated: 2026-03-24

## Project Overview

**The Pass 出菜口** 是一份 AI 驅動的內容產品，用 AI 報導 AI 如何影響你我的飲食生活。名字源自廚房術語「出菜口（Pass）」：從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前。

**品牌核心：** 我們是 AI 編輯，而且我們很大方地說。我們寫的東西有人味，而且從不騙你。The Pass 不只觀察 AI 改變餐飲——它自己就是 AI 改變媒體的活案例。

**品牌名：** The Pass 出菜口（國際品牌 + 中文在地名）
**Slogan:** Intelligence, served.

## 核心決策（已確認）

| 項目 | 決定 |
|------|------|
| 產品名 | The Pass 出菜口 |
| 定位 | AI × 餐飲的每一個面向，用「分享有趣的事」的角度 |
| 語氣 | 像朋友分享有趣的事 + 留一個好問題 |
| 不做的事 | 不下結論、不更動信源事實、不給觀點評論 |
| 頻率 | 一週 2 期（週二、週五）|
| 結構 | 2 篇長文 + 3-6 則快訊 + Fumet 提問，一頁式全展開 |
| 目標讀者 | 核心：餐飲從業者/經營者；外圈：對食物+AI 好奇的人 |
| 信源策略 | 英文科技媒體（主食）+ 韓/日/泰在地語言媒體（香料）|
| 地域 | 全球視野，穿插亞洲在地內容增加獨特性 |
| Newsletter 平台 | Ghost Pro ($9/月) |
| 域名 | thepass.news（待購買，建議在 Vercel 購買）|
| 多國擴展 | 同一域名，子路徑或子域名分語言（tw/kr/jp）|

## AI 編輯團隊

三位 AI 編輯不只是寫作工具，是**有完整人設的虛擬角色**，長期目標是養成虛擬 KOL。

- **Mise**（主筆）— 長文 400-600 字，場景式開頭 → [profile](public/editor-mise.html)
- **Passe**（快訊編輯）— 快訊 3-6 則，第一句就是事實 → [profile](public/editor-passe.html)
- **Fumet**（提問者）— 每期結尾提問 100-250 字 → [profile](public/editor-fumet.html)
- **總編輯** — 幕後品管，7 項審核清單（事實核查、AI 味檢測、節奏檢查、輕量 SEO）

### AI 編輯人格架構（Soul + Memory）

每位編輯有兩層設定，詳見 [`docs/ai-editor-persona-architecture.md`](docs/ai-editor-persona-architecture.md)：
- **Soul**（核心人格）— 價值觀、背景故事、好惡，很少改變
- **Memory**（記憶）— 寫過什麼、讀者互動、累積觀察，每期更新

這讓編輯的選題和風格會隨時間自然演化，不需手動調整規則。

### 虛擬 KOL 三階段計畫

1. **Phase 1（現在）** — 用寫作風格展現個性，Fumet 問題開放讀者回信
2. **Phase 2（3-6 個月）** — 加入個人空間（Mise 私藏、Passe 的數字、讀者回信精選）
3. **Phase 3（6-12 個月）** — 社群帳號、讀者互動、商業合作（標明合作，AI 透明度是優勢）

## 編輯最高原則

1. **事實不可扭曲** — 不更動任何信源事實，只從我們的觀點去說明它
2. **先找到人，再提到技術** — 標題和內容都從人的處境開始
3. **反 AI 味** — 禁止條列式轟炸、禁止 emoji、禁止「值得注意的是」等 AI 腔
4. **禁止標題句式** —「[公司] 用 AI [做了某事]，[數字結果]」
5. **避免「品味」用詞** — 用「觀點」「偏好」「分享」，不居高臨下

## 頁面分類與 Navigation

### 內部文件（Internal Nav：6 個連結）
| 連結 | 頁面 |
|------|------|
| 提案簡報 | project-brief.html |
| 編輯指南 | editorial-guidelines.html |
| 選題來源 | sources.html |
| 插畫指南 | illustration-guide.html |
| 實作計畫 | implementation-plan.html |
| Demo | demo-index.html |

Logo 點擊 → project-brief.html

### 對外頁面（External Nav：2 個連結）
| 連結 | 頁面 |
|------|------|
| 關於 The Pass | methodology.html |
| AI 編輯室 | editors.html |

Logo 點擊 → demo-index.html

對外頁面包含：methodology, editors, editor-mise/passe/fumet, demo-index, demo-issue-001/002/003

## Tech Stack

- **Framework:** Next.js 16 (Turbopack) + TypeScript
- **Hosting:** Vercel（Production: `the-pass-nine.vercel.app`）
- **Repo:** github.com/terrelyeh/the-pass
- **Database:** Supabase（尚未接入）
- **Newsletter:** Ghost Pro ($9/月)
- **AI:** Claude API（翻譯、摘要、撰寫、總編輯 review）
- **Image:** AI 圖片生成（nanobanana）

## 目錄結構

```
the-pass/
├── public/
│   ├── project-brief.html        ← Project Brief（9 章 + 附錄）
│   ├── editorial-guidelines.html ← 編輯指南 + System Prompts + 總編輯
│   ├── methodology.html          ← 關於 The Pass（對外品牌頁）
│   ├── sources.html              ← 選題來源（33 個信源）
│   ├── illustration-guide.html   ← 插畫風格指南
│   ├── implementation-plan.html  ← 實作計畫
│   ├── editors.html              ← AI 編輯室（三位編輯總覽）
│   ├── editor-mise/passe/fumet.html ← 各編輯 profile
│   ├── demo-index.html           ← Demo 目錄頁
│   ├── demo-issue-001/002/003.html ← Demo Issues
│   ├── demo-ig-post.html         ← IG Carousel Repurpose Demo
│   └── img/                      ← 插畫 + 編輯頭像
├── docs/                         ← Markdown 版內部文件（給 AI 參考用）
│   ├── ai-editor-persona-architecture.md ← AI 編輯人格架構（Soul + Memory）
│   └── *.md                      ← 其他內部文件的 MD 版
├── src/app/                      ← Next.js App Router
└── CLAUDE.md                     ← 本檔案
```

## 已完成的里程碑

- [x] 品牌定位 + Executive Summary（含 meta-narrative：用 AI 報導 AI）
- [x] 品牌名確定：The Pass 出菜口
- [x] Project Brief 完整版（9 章 + 附錄）
- [x] 編輯指南 + 4 位 AI 編輯的 System Prompts
- [x] 3 期 Demo Issues + 總編輯審核流程實測
- [x] AI 編輯頭像 + profile 頁 + AI 編輯室
- [x] 插畫風格確立 + 文章插畫
- [x] IG Carousel Repurpose Demo
- [x] 選題來源清單（33 個，5 種語言）
- [x] docs/ Markdown 版內部文件
- [x] 方法論 → 「關於 The Pass」品牌宣言頁
- [x] Nav 分內部/外部兩套 + Logo 連結邏輯
- [x] 移除所有 target=_blank（站內連結不開新視窗）
- [x] 「品味」用詞全站替換為「觀點/偏好/分享」
- [x] 商業計畫討論 + 虛擬 KOL 三階段規劃

## 下一步（最優先）

### 1. AI 編輯人格架構
- 寫三位編輯的 soul.md 初版
- 設計 memory 記錄格式
- 詳見 `docs/ai-editor-persona-architecture.md`

### 2. 篩選機制設計
- 演算法邏輯：從 33 個信源中如何自動判斷哪些值得報導
- 評分標準：人的故事 > 純技術規格、在地獨家 > 全球已知
- 選題流程：從「原料進來」到「選出 5-8 則」的完整 pipeline
- 三位編輯各自的選題偏好（Mise 找人、Passe 找事實、Fumet 找問題）

### 3. 基礎建設
- 購買域名 thepass.news（Vercel 購買）
- 設定 Ghost Pro
- 建 RSS 抓取 pipeline（先接 5 個核心信源）
- 手動跑 2 週試水溫

### 4. 推廣策略
- 冷啟動：LinkedIn 文章（meta 故事）+ 餐飲社群
- 成長期：IG Reels + 電子報互推 + 活動演講
- 變現期：免費/付費版 + 產業報告 + 企業訂閱

## 部署

```bash
cd the-pass
npx vercel --prod --yes
```

⚠️ GitHub 自動部署目前失效，每次都需手動部署。需到 Vercel Settings → Git 重新連結 webhook。

## Common Pitfalls

- **Vercel 自動部署失效**: GitHub webhook 斷了（可能因改名），需手動 `npx vercel --prod --yes`
- **Vercel subdomain**: auto-generated 是 `the-pass-nine`，無法改
- **nav 有兩套**: 內部 6 連結 / 外部 2 連結，Logo 連結也不同（見上方表格）
- **「信源清單」已改名「選題來源」**: 全站已更新
- **「方法論」已改名「關於 The Pass」**: 全站已更新，檔名仍是 methodology.html
- **Demo Issue #002 #003**: 連結都是 `href="#"`，banner 已改為「展示用範例」
- **CSS 重複**: 三期 demo issue 各自 inline CSS，修改樣式需三份都改
- **nanobanana 生圖**: 每次生成都不同，喜歡的圖要立刻保存
- **避免「品味」用詞**: 全站已替換，用「觀點」「偏好」「分享」
- **站內連結不開新視窗**: 已移除所有 target=_blank
