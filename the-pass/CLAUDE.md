# CLAUDE.md — The Pass 出菜口 Project Context

> Last updated: 2026-06-10

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
| 域名 | **thepass.cc**（已購買，已連結 Vercel，DNS 自動設定）|
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

### 對外頁面（External Nav：3 個連結）
| 連結 | 頁面 |
|------|------|
| 關於 The Pass | about.html |
| 方法論 | methodology.html |
| AI 編輯室 | editors.html |

Logo 點擊 → demo-index.html

對外頁面包含：about, methodology, editors, editor-mise/passe/fumet, demo-index, demo-issue-001/002/003, demo-ig-post

## Tech Stack

- **Framework:** Next.js 16 (Turbopack) + TypeScript
- **Hosting:** Vercel（Production: `thepass.cc` + `the-pass-nine.vercel.app`）
- **Repo:** github.com/terrelyeh/the-pass
- **選題 pipeline:** `src/lib/*`（fetcher / dedup / relevance / scorer / report / sources），純 TS
- **LLM:** `@anthropic-ai/sdk`（scorer：**Opus 全程評估** `claude-opus-4-8`，硬閘門 + 五面向同一次呼叫）。**需 `ANTHROPIC_API_KEY` 才走 live，否則 dry-run（關鍵字代理）**
- **Dev 工具:** `tsx`（跑/測 src/lib + scripts；`node` strip-types 無法處理 extensionless import）
- **Database:** Supabase（尚未接入；seen store 暫用 `data/seen.json`）
- **Newsletter:** Ghost Pro ($9/月，尚未接)
- **Image:** AI 圖片生成（nanobanana）

## 目錄結構

```
the-pass/
├── public/                       ← 靜態頁（部署即上線）
│   ├── hub.html                  ← 🆕 選題系統入口（連各頁）
│   ├── sources.html              ← 🆕 選題來源（由 sources.ts 自動生成，勿手改）
│   ├── audit-sources.html        ← 🆕 /audit-sources skill 說明頁
│   ├── selection-mechanism.html  ← 🆕 篩選機制設計
│   ├── selection-report-demo.html← 🆕 選題報告（每期會議文件；gen 自 scripts/demo-report.ts；gitignore）
│   ├── project-brief / editorial-guidelines / about / methodology / illustration-guide / implementation-plan / editors / editor-*.html
│   └── demo-index / demo-issue-001~003 / demo-ig-post.html、img/
├── src/
│   ├── lib/                      ← 選題 pipeline（見下方架構）
│   │   ├── sources.ts            ← ⭐ 來源「單一真實來源」（+ activeSources / sourcesByStream helper）
│   │   └── fetcher · dedup · relevance · scorer · backlog · report .ts
│   └── app/                      ← Next App Router；api/fetch-feeds、/sources-status（Next route，讀 sources.ts）
├── scripts/                      ← tsx 腳本：audit-feed / gen-sources-page / demo-report
├── .claude/skills/audit-sources/ ← 🆕 /audit-sources skill
├── docs/                         ← MD 內部文件（selection-mechanism、source-verification-checklist、persona…）
├── data/                         ← runtime（seen.json、backlog.json、feed-*.json；gitignore）
└── CLAUDE.md                     ← 本檔案
```

## 選題 Pipeline（架構）

資料流（每期出刊前跑）：

```
抓取 activeSources(RSS) → 去重(dedup: URL + 標題Jaccard 0.6)
  → Opus 評估(scorer: 整池每篇都看，硬閘門 + 五面向 + 編輯路由 + hook，同一次呼叫；dry-run / live)
  → 庫存合併(backlog: 上期倖存者 + 本期新評分一起排序) → 選一期
  → 選題報告(report.ts → HTML) → 總編/團隊拍板 → 出刊的移出庫存、沒選上的留庫存
```

- **單一真實來源 = `src/lib/sources.ts`**（現 30 來源：active 29 / pending 1）。改它後跑 `npx tsx scripts/gen-sources-page.ts` 重生 `public/sources.html`；`/sources-status`（Next route）自動同步。
- **兩條進料線**：Stream A 飲食媒體 / Stream B 食品科技·觀點（輔助）。**刻意不收台灣源**（TA 是台灣讀者，價值＝台灣沒有的新鮮事）。食物優先、AI/科技為輔。
- **評分**：`scorer.ts` 有金鑰走 Opus（五面向 0–5 加權 + mise/passe 路由 + hook），無金鑰 dry-run（關鍵字代理）。**Fumet 提問不選稿**，從選出的長文「提煉」。
- **庫存 backlog**：`backlog.ts`（`BacklogStore` + `buildCompetitorPool`）持久化「合格沒選上」的，JSON `data/backlog.json`，保鮮期預設 14 天。每期 `prune(過期淘汰)` → 合併庫存+新評分排序 → 選一期 → `remove(出刊)` / `upsert(沒選上)` → `save`。重進不續命（保留原 enteredAt）。`scripts/test-backlog.ts` 驗證跨期迴圈（11 checks）。**注意：v1 是單一 14 天 flat window**，頁面 §9 講的「分型保鮮期」（融資稿短、常青長）是未來精修。
- **報告**：`report.ts` 渲染品牌化 HTML（漏斗統計、建議出刊、完整候選池、庫存、已篩除、本週掃描來源）；切角可點選（A 預設）+ 退庫存即時互動（純前端、不存檔）。
- 設計全文：`docs/selection-mechanism.md`；來源審核標準：`docs/source-verification-checklist.md`。

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
- [x] 拆分 methodology.html 為 about.html（品牌故事）+ methodology.html（方法論）
- [x] Nav 分內部/外部兩套 + Logo 連結邏輯（外部 3 連結：關於 The Pass、方法論、AI 編輯室）
- [x] 移除所有 target=_blank（站內連結不開新視窗）
- [x] 「品味」用詞全站替換為「觀點/偏好/分享」
- [x] 商業計畫討論 + 虛擬 KOL 三階段規劃
- [x] 域名 thepass.cc 購買 + Vercel 連結
- [x] Soul.md 初版完成（Mise / Passe / Fumet）+ 寫作影響整合
- [x] AI 編輯人格架構文件完成（Soul + Memory + 技術實作方案）
- [x] 四位作者風格拆解（Sunny、劉揚銘、Mokki、Agnes）並整合進 Soul
- [x] 手機版漢堡選單修復（全部頁面 840px 斷點）
- [x] Demo Issue #003 加入動態影片（靜態圖 → AI 動態化）
- [x] 插畫指南新增：動態插畫規格（Sec.09）+ 視覺變化策略（Sec.10）
- [x] 快訊 spot illustration 測試 → 決定不採用（閱讀斷裂感）
- [x] **選題 pipeline 實作**：抓取→去重→粗篩→LLM 評分→選題報告（src/lib/*，已測）
- [x] **來源系統收斂**：食物優先、移除純 AI 源 → 30 來源（active 29），sources.ts 單一真實來源、頁面自動生成
- [x] **選題報告**（內部編輯會議文件）+ 第一次真實 curate（29 來源、16 候選池、可互動切角）
- [x] **統一入口 hub** + 來源狀態(即時) + **/audit-sources skill** + 說明頁

## 下一步（最優先）

### 1. ⛳ 編輯方向拍板（擋住下游，使用者內部會議中）
決定：**維持硬性「AI×食物」交集** vs **轉「食物優先、AI 為其中一個角度」**。候選池實測已偏食物優先。**方向定了才動硬閘門的「判準」**（AI×食物嚴格度）——模型架構已改 Opus 全程評估，但閘門條件先不動。

### 2. `/selection-report` skill（一週兩次核心）
方向定版後，把「抓取→去重→Opus 評估→產報告→部署」做成 skill（那時 rubric 才正確）。機械層已是程式（src/lib + scripts/demo-report.ts），skill 主要封裝編輯判斷。

### 3. 接真實 LLM
使用者自行在 `the-pass/.env.local` 加 `ANTHROPIC_API_KEY`（AI 不能代填）→ scorer 自動走 live。

### 4. 基礎建設
**庫存 backlog store 已實作**（`backlog.ts`，JSON）。仍待：**編輯 Memory 回寫**（Soul 已有 `docs/editors/*-soul.md`，但動態 Memory 未實作）；報告「決定」的後端儲存（目前互動不存檔）；seen + backlog 兩個 JSON store 升級 Supabase（介面已抽象，可直接換）；Ghost Pro。三者卡同一件事：**還沒有正式儲存層**，目前只有本機 JSON。

### 5. 待修 / 待 audit
`nissyoku`（日本食糧新聞）feed 失效（只回 2020 舊聞，pending）；同事再給的來源用 `/audit-sources` 跑；`foodbank-kr` feed 偶發 DNS 失敗待查。

### 6. AI 編輯人設 skills（roadmap）
`/mise`、`/passe`、`/fumet`、`/chief-editor` + memory 更新流程（soul.md 已備）。

## 部署

```bash
cd the-pass
npx vercel --prod --yes
```

⚠️ GitHub 自動部署目前失效，每次都需手動部署。需到 Vercel Settings → Git 重新連結 webhook。

## Common Pitfalls

- **sources.ts 是單一真實來源**: 改來源只動 `src/lib/sources.ts` → `npx tsx scripts/gen-sources-page.ts` 重生 sources.html → 部署。**勿手改 `public/sources.html`**（會被覆蓋）。
- **scorer 需 API key**: 無 `ANTHROPIC_API_KEY` 時 scorer 走 dry-run（關鍵字代理，非真評分）。AI 不能代填金鑰，需使用者自己加到 `.env.local`。
- **測 src/lib 用 `npx tsx`**: `node` strip-types 無法解 extensionless import（`./relevance`）也不支援 parameter property；務必用 tsx。
- **dedup threshold 0.6**: 標題 Jaccard 太低會誤折疊清單模板（「各城市最佳餐廳」）；語意去重待 LLM 階段補強。
- **Fumet 不選稿**: 結尾提問從選出的長文「提煉」，不從候選池打分選一篇（editorial-guidelines 規定）。
- **selection-report-demo.html / data/*.json 已 gitignore**: 是 gen 出的 artifact，不 commit；部署時 vercel 從本機 public/ 上傳。
- **Vercel 自動部署失效**: GitHub webhook 斷了（可能因改名），需手動 `npx vercel --prod --yes`
- **Vercel subdomain**: auto-generated 是 `the-pass-nine`，但已有自訂域名 `thepass.cc`
- **動態插畫流程**: 靜態插圖 → 加標題 → Google Flow (Veo) 生成動態，音效OK但禁止配音
- **快訊不配圖**: 測試過 spot illustration，閱讀斷裂感太強，決定不採用
- **插畫拱門問題**: nanobanana 容易重複生成廚房拱門構圖，prompt 需明確排除
- **nav 有兩套**: 內部 6 連結 / 外部 3 連結（關於 The Pass、方法論、AI 編輯室），Logo 連結也不同（見上方表格）
- **「信源清單」已改名「選題來源」**: 全站已更新
- **about.html + methodology.html**: 原 methodology.html 已拆分為品牌故事頁（about.html）與方法論頁（methodology.html）
- **Demo Issue #002 #003**: 連結都是 `href="#"`，banner 已改為「展示用範例」
- **CSS 重複**: 三期 demo issue 各自 inline CSS，修改樣式需三份都改
- **nanobanana 生圖**: 每次生成都不同，喜歡的圖要立刻保存
- **避免「品味」用詞**: 全站已替換，用「觀點」「偏好」「分享」
- **站內連結不開新視窗**: 已移除所有 target=_blank
