# CLAUDE.md — The Pass 出菜口 Project Context

> Last updated: 2026-06-23

## Project Overview

**The Pass 出菜口** 是一份 AI 驅動的內容產品，用 AI 報導 AI 如何影響你我的飲食生活。名字源自廚房術語「出菜口（Pass）」：從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前。

**品牌核心：** 我們是 AI 編輯，而且我們很大方地說。我們寫的東西有人味，而且從不騙你。The Pass 不只觀察 AI 改變餐飲——它自己就是 AI 改變媒體的活案例。

**品牌名：** The Pass 出菜口（國際品牌 + 中文在地名）
**Slogan:** Intelligence, served.

## 核心決策（已確認）

| 項目 | 決定 |
|------|------|
| 產品名 | The Pass 出菜口 |
| 定位 | 飲食／餐飲／食物優先，AI／科技為輔與加分（2026-06-11 團隊定）；用「分享有趣的事」的角度 |
| 編輯方向 | **食物優先（廣義）**：飲食／餐飲／食物**及相關**（上下游＋橫切面，非只食物本身）為門檻，AI／科技是加分不是門檻 |
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

**四位** AI 編輯（＋總編）不只是寫作工具，是**有完整人設的虛擬角色**，長期目標養虛擬 KOL。署名：**編輯／Mise · 彙整 · Passe · 問／Fumet · 招待／Amuse**。

- **Mise**（主筆）— 長文 **約 500–900 字（觀點編譯 D）**，場景式開頭 → [profile](public/editor-mise.html)
- **Passe**（快訊編輯）— 快訊 3-6 則，第一句就是事實 → [profile](public/editor-passe.html)
- **Fumet**（提問者）— 每期結尾提問 100-250 字；**也寫文化面長文**（/write-issue 依題材自動路由：文化面→Fumet、技術/產業面→Mise）→ [profile](public/editor-fumet.html)
- **Amuse**（特別企劃 · 🆕 2026-06-21）— 諷刺自嘲吐槽編輯（伍迪艾倫式：收＋笑裡的憂鬱＋知性慧黠）；**不定期、不進每期常規路由**，由 `/commission` 叫出場；**預設走 A 模式不走 D**
- **總編輯** — 幕後品管，7 項審核清單（事實核查、AI 味檢測、節奏檢查、輕量 SEO）

**長文標準 ＝ 觀點編譯（D）**（2026-06-21 定）：完整交代來源 ＋ 編輯觀點貫穿（≠挑一條 A、≠翻譯/摘要 B/C）；字數依訊息量伸縮 ~500–900。定義在 `.claude/skills/write-issue/refs/voices.md`〈長文標準〉。

### AI 編輯人格架構（Soul + Memory）

每位編輯有兩層設定，詳見 [`docs/ai-editor-persona-architecture.md`](docs/ai-editor-persona-architecture.md)：
- **Soul**（核心人格）— 價值觀、背景故事、好惡，很少改變
- **Memory**（記憶）— 寫過什麼、讀者互動、累積觀察，每期更新。**已建**（2026-06-20）：`docs/editors/*-memory.md`，/write-issue 開寫載入、定稿回寫

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
- **選題 pipeline:** `src/lib/*`（fetcher / dedup / relevance / scorer / report / sources / **scout** + scout-queries），純 TS
- **LLM:** `@anthropic-ai/sdk`（scorer：**Opus 全程評估** `claude-opus-4-8`，硬閘門 + 五面向同一次呼叫）。**需 `ANTHROPIC_API_KEY` 才走 live，否則 dry-run（關鍵字代理）**
- **Dev 工具:** `tsx`（跑/測 src/lib + scripts；`node` strip-types 無法處理 extensionless import）
- **Database:** Supabase（尚未接入；seen store 暫用 `data/seen.json`）
- **Newsletter:** Ghost Pro ($9/月，尚未接)
- **Image:** 長文配圖 nanobanana（`mcp__nanobanana__generate_image`）＋ gpt-image（本機 **Codex CLI**）；快訊不配圖。**插圖風格＝可替換 profile**（`docs/illustration/styles/<name>/`，現役 `risograph`）；跨專案 **`/style-extract`**（user-level skill）抽風格＋生圖驗證、存共用庫 `~/style-lab/`

## 目錄結構

```
the-pass/
├── public/                       ← 靜態頁（部署即上線）
│   ├── hub.html                  ← 系統入口（全系統總入口；4 區：來源機制／選題／編輯室／出刊）
│   ├── sources.html              ← 選題來源＋狀態 單一文件（sources.ts 自動生成，勿手改）
│   ├── audit-sources.html        ← 🆕 /audit-sources skill 說明頁
│   ├── selection-mechanism.html  ← 篩選機制設計
│   ├── research-stage.html       ← 研究階段提案（內容源 vs 主題源；待團隊討論）
│   ├── selection-report.html      ← 最新一期入口（讀 selection-reports.json 跳轉）；selection-report-<date>.html 每期 commit 上線
│   ├── backlog.html              ← 選題庫存頁（gen 自 data/backlog.json；團隊看，--save 後重生）
│   ├── write-issue-architecture.html ← AI 編輯室架構頁（給團隊，含 SVG 圖）
│   ├── commission.html           ← 🆕 /commission 介紹頁（情境／用法／兩個成果範例）
│   ├── editor-source.html        ← 編輯源頭頁（gen 自 9 個 md：3 soul+3 memory+voices/anti-slop/checklist；團隊看寫作源頭，勿手改）
│   ├── skills.html               ← 三技能一頁說明（選題/寫稿/發佈；team）
│   ├── new-editor-guide.html     ← 🆕 團隊 SOP：如何新增一位 AI 編輯（四步＋範本）
│   ├── illustration-style-sop.html ← 團隊 SOP：換插圖風格（兩步：/style-extract 產 profile → 導入）
│   ├── style-extract.html         ← /style-extract 運作邏輯說明（harness：input→分析→驗證→output，含 SVG 流程圖）
│   ├── covers.html               ← 配圖總覽（每期長文配圖：採用＋候選對照，左側日期切換；publish 時更新）
│   ├── issue-<date>.html         ← 每期出刊內容頁（封面圖＋長文＋快訊＋提問），共用 issue.css
│   ├── feedback.js               ← 區塊回饋（複製範本到剪貼簿、零後端；架構頁/編輯源頭頁載入）
│   ├── project-brief / editorial-guidelines / about / methodology / illustration-guide / implementation-plan / editors / editor-*.html
│   └── demo-index / demo-issue-001~003 / demo-ig-post.html、img/
├── src/
│   ├── lib/                      ← 選題 pipeline（見下方架構）
│   │   ├── sources.ts            ← ⭐ 來源「單一真實來源」（+ activeSources / sourcesByStream helper）
│   │   ├── scout.ts + scout-queries.ts ← 🆕 查詢式進料（firecrawl 開放搜尋；scout-queries=query 模板 SSOT）
│   │   └── fetcher · dedup · relevance · scorer · backlog · report .ts
│   └── app/                      ← Next App Router；api/fetch-feeds（/sources-status route 已退役，併入 sources.html）
├── scripts/                      ← tsx：sr-prep（加 --scout 開查詢式進料）/ sr-build（/selection-report 機械層）· test-scout · audit-feed / gen-sources-page / gen-editor-source-page / gen-backlog-page / demo-report / run-pipeline
├── .claude/skills/                ← selection-report · write-issue（含 refs/voices·anti-slop·chief-checklist）· publish-issue · audit-sources · **commission**（指定單一編輯單篇委稿，共用 write-issue 編輯檔）
├── docs/                         ← MD（selection-mechanism、write-issue-architecture、editors/{*-soul,*-memory,_TEMPLATE-*}、illustration/styles/risograph/style.md、source-verification-checklist…）
├── data/                         ← runtime（seen.json、backlog.json、sr/<date>/{pool,candidates,scores,selected}.json；gitignore）
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

- **單一真實來源 = `src/lib/sources.ts`**（現 31 來源：active 29 / pending 2）。改它後跑 `npx tsx scripts/gen-sources-page.ts` 重生 `public/sources.html`——**它＝「選題來源＋狀態」的單一文件**（tier 分組 + Active/Pending 徽章；`/sources-status` route 已退役併入，2026-06-11 團隊要求）。
- **兩條進料線**：Stream A 飲食媒體 / Stream B 食品科技·觀點（輔助）。**刻意不收台灣源**（TA 是台灣讀者，價值＝台灣沒有的新鮮事）。食物優先、AI/科技為輔。
- **查詢式進料 scout（Phase 1，2026-06-23 起設為 `/selection-report` 每期預設）**：第三個進料口。`scout.ts` 用 firecrawl 跑常駐 query（`scout-queries.ts` SSOT：在地語言＋跨區主題）撈「RSS 看不到」的在地/驚奇題 → 與 RSS 同形狀 RawArticle → 併進 pool 走**同一套去重/評分**（標 `origin:"scout"`、sourceTier 5）。**只找題不抓全文**（全文留 /write-issue）；**繞過零訊號門檻**（在地語言標題英文關鍵字判 0、不能砍）。**預設帶 `--scout`**；省 credits／離線時拿掉回純 RSS（舊行為、零金鑰）。配方/邊界見兩檔註解。
- **評分（兩種模式）**：① **`/selection-report` skill（主要、零 API key）**：Haiku 子代理粗篩 + 本機 Claude Code 當總編評分（走 Claude Code 既有登入，不需金鑰）。② **`scorer.ts`（腳本／未來自動化）**：有金鑰走 Opus 全程、無金鑰 dry-run（關鍵字代理）。兩者共用五面向加權（`weightedOf`，已匯出）。**Fumet 提問不選稿**，從選出的長文「提煉」。
- **庫存 backlog**：`backlog.ts`（`BacklogStore` + `buildCompetitorPool`）持久化「合格沒選上」的，JSON `data/backlog.json`，保鮮期預設 30 天（`DEFAULT_FRESHNESS_DAYS`）。每期 `prune(過期淘汰)` → 合併庫存+新評分排序 → 選一期 → `remove(出刊)` / `upsert(沒選上)` → `save`。重進不續命（保留原 enteredAt）。`scripts/test-backlog.ts` 驗證跨期迴圈（11 checks，測試用固定 14 天窗、不依賴預設值）。**注意：v1 是單一 flat window**，頁面 §9 講的「分型保鮮期」（融資稿短、常青長）是未來精修。
- **報告**：`report.ts` 渲染品牌化 HTML（漏斗統計、建議出刊、完整候選池、庫存、已篩除、本週掃描來源）；切角可點選（A 預設）+ 退庫存即時互動（純前端、不存檔）。
- 設計全文：`docs/selection-mechanism.md`；來源審核標準：`docs/source-verification-checklist.md`。

## 已完成（功能全貌見 [README.md](README.md) 與 git log）

- **選題系統（已上線）**：抓取 → 去重 → 評估 → **庫存跨期競爭** → 選題報告 → hub / 來源狀態 / `/audit-sources`。來源收斂成 30（active 29），`sources.ts` 單一真實來源、頁面自動生成。
- **`/selection-report` skill（選題，已建 2026-06-19）**：**零 API key 在本機 Claude Code 跑**。`sr-prep`（抓取→去重→去噪候選池）→ **Haiku 子代理粗篩** → **Claude Code 當總編依食物優先 rubric 評分**（五面向+路由+hook+2–3 切角）→ 庫存競爭 → `sr-build` 雙輸出（HTML 上 thepass.cc + Obsidian）。報告含切角、左側日期面板、⬇匯出決定鈕；出刊（`--save`）持久化 `seen.json`（跨期去重，不重複撈/發）。
- **scout 查詢式進料（Phase 1，🆕 2026-06-23）**：開放網路發現層接進選題 pipeline（`sr-prep --scout`，見「選題 Pipeline」段）。eval 實跑：候選 22（scout 14＋rss 8）→過閘門 17→建議出刊 6 **全是 scout 撈到的在地/驚奇題**（尚比亞/印度紅螞蟻/泰韓墨在地）。配方＝firecrawl `--sources news`＋在地語言＋跨區主題、不掛 AI/tech。誠實但書：當輪 RSS 被 seen 壓到吃虧，別過度解讀「scout 永遠贏」。
- **`/write-issue` skill（寫作，已建 2026-06-19，harness 版）**：選題拍板後把選的稿寫成整期草稿。**orchestrator + 4 編輯 subagent（Mise／Passe／Fumet／總編，聲音隔離）+ 3 互動 gate（人拍板）**；抓全文查證、守事實不可扭曲、付費牆只報現象。**長文編輯自動路由**（文化面→Fumet、技術/產業面→Mise，§1.5）。架構全文見 [`docs/write-issue-architecture.md`](docs/write-issue-architecture.md)（也上 thepass.cc/write-issue-architecture.html）。
- **`/publish-issue` skill（發佈，已建並實跑 2026-06-20）**：定稿 → issue 網頁＋長文配圖 → 部署。配圖＝**概念優先**（紐約客式諷刺 idea）→ **以 demo 圖為風格錨點** → nanobanana＋Codex 雙模型生候選 → 人挑圖。首期 2026-06-19 已上線含概念配圖；`covers.html` 留採用＋候選對照。本週另加：編輯源頭頁（`editor-source.html`，gen）、Skills 說明頁、區塊回饋（`feedback.js`）。
- **`/commission` skill（單篇委稿，🆕 2026-06-21；擴成自適應 2026-06-23）**：指定一位編輯寫**單獨一篇**、不出整期；**共用 /write-issue 編輯人格檔**（改一次到處生效）。**三輸入自適應**：A 單源 / B 題目＋多素材→觀點綜編 D / **C 粗方向→編輯自己 firecrawl 研究後寫**；gate 密度可調（選題/大綱/定稿）、**總編事實核查永遠跑**、文末附參考連結、記憶 opt-in。長文預設 D、Amuse 例外走 A。介紹頁 `commission.html`（情境/用法/兩範例）；eval（B＋C 新 vs 舊）驗過。
- **第四位編輯 Amuse ＋ 新增編輯 SOP（🆕 2026-06-21）**：Amuse 上線（`docs/editors/amuse-soul/memory.md`、editors.html 特別企劃卡、伍迪艾倫式語氣校準）；團隊 SOP `new-editor-guide.html`（四步＋`docs/editors/_TEMPLATE-*.md` 範本）——「你定位、AI 接線」。
- **插圖風格 profile 機制 ＋ `/style-extract`（🆕 2026-06-21）**：插圖風格＝可替換資料（`style.md`＋錨點圖＋validation），出圖 skill 不變；現役 `docs/illustration/styles/risograph/style.md`；換風格 SOP `illustration-style-sop.html`。跨專案 user-level skill **`/style-extract`** 抽風格＋驗證 subagent 打分、存 `~/style-lab/profiles/`（範例 bold-pop、mono-ink；另有 sepia-sketch 暫停未定版）。測試圖走「難度漸層」：簡單物件→場景→一段文章概念（真實使用壓力測試）。**驗證＝5 軸**（palette·line·texture·**construction**·**register**；register 對著錨點並排評，舊版漏掉這條最會飄的「美學立場」軸；composition 條件式、mood 不評分）。**優化分屬性下藥**：結構性（姿勢/表情）用提示詞釘得動；執行氣質（醜/拙/平塗 vs 影線）描述沒用、要 **best-of-N＋把評分當選圖器**；頑固質感靠後處理。錨點甜蜜點 3 張（庫存 3–5、單次餵 ≤3）。注意「保真≠好看」：評分量保真、出街用品味挑（2026-06-22 升級）。
- **顧問交付**：`/delivery-report` skill（config-driven，引擎在 `~/.claude/skills/delivery-report/render.mjs`，資料在 `~/consulting/clients/<client>/config.json`）→ 輸出 `public/delivery.html` + Markdown 週報。
- **品牌 / 編輯 / 網站基礎**：品牌定位 + Project Brief、4 位 AI 編輯人設 + Soul（`docs/editors/*-soul.md`）、3 期 Demo Issues、插畫指南、域名 thepass.cc + Vercel。

## 下一步（最優先）

出刊三技能（選題→寫稿→發佈）＋ `/commission` ＋ Amuse ＋ 新增編輯 SOP ＋ 插圖 profile 機制 ＋ `/style-extract` 都已建、首期 2026-06-19 已上線（全貌見「已完成」與 README）。**真正待辦：**

1. **跑下一期完整流程**（選題→寫稿→你定稿→發佈），端到端驗收。
2. **真實運作幾週、迭代**（編輯聲音、memory 準則、配圖概念）。
3. **Ghost Pro 出刊管道**（之後）。

**待精修 / 待修：**
- `/selection-report` 的 Haiku 粗篩偏寬鬆（已加量化目標 12–15/批，仍可再調）。
- `nissyoku`（日本食糧新聞）feed 失效（只回 2020 舊聞，pending）；`foodbank-kr` 偶發 DNS 失敗待查；同事新來源用 `/audit-sources` 跑。
- 報告「決定」的後端（目前退庫存／切角互動純前端、不存檔）。

**scout 後續 / 研究階段**：scout（Phase 1，已上線）＝`research-stage` 提案「主題源（只給題目）」的引擎雛形。**Phase 2（未做）**：① 主題語意分群（把「越南 4× 同稿」收成一題多源；標題 Jaccard 解不了，要 LLM/embedding pass）② 綜述／觀點綜編寫作模式（題目＋來源束→一篇、錨一個人，接 /write-issue，輸入合約要改）。scout 待調：firecrawl 每跑重抓同月窗口、付 credits 再被 seen dedup（可 `qdr:w` 收窄／query 輪播攤平）；日文 query 偏 PR/百貨（已加 `-site:prtimes.jp`、靠下游閘門濾）。原提案其他：YouTube 官方 RSS（`…/feeds/videos.xml?channel_id=`）進 `sources.ts`；IG 無官方 API → 手動雷達（Obsidian `創作者雷達.md`）。

**金鑰（選用）**：`/selection-report` 不需金鑰（本機 Claude Code＋Haiku 評分）；只有腳本全自動跑 `scorer.ts` Opus 才需 `.env.local` 的 `ANTHROPIC_API_KEY`（AI 不能代填）。**儲存三層**（機器 JSON／人看 Obsidian vault／團隊 Web），雙輸出 HTML+Markdown；Supabase 暫不導入。

## 部署

**主要方式：git push 自動部署（2026-06-14 修復）。** push 到 `main` → Vercel 自動建置 + 上線 `thepass.cc`，**不需再手動部署**。

```bash
# 改完 code → 提交推送即自動部署
git add . && git commit -m "..." && git push
```

備援（手動，仍可用，會從本機上傳）：

```bash
cd the-pass
npx vercel --prod --yes
```

> **2026-06-14 修復紀錄：** 「自動部署失效」其實有兩層原因 ——
> (1) GitHub↔Vercel 連線斷（已用 `vercel git connect` 接回）；
> (2) **真正主因**：Vercel 專案 **Root Directory 未設**。git repo 根目錄是 `Foodie-news/`、Next.js app 在 `the-pass/` 子目錄，自動建置從根目錄跑會找不到 app 而失敗（手動部署因先 `cd the-pass` 才沒踩到此雷）。已將 Vercel **Root Directory 設為 `the-pass`**。
>
> ⚠️ **自動部署只部署 git 內的檔案**：被 gitignore 的 artifact（如 `public/selection-report-*.html`）**不會**上線。以前手動部署會連本機 gitignored 檔一起上傳，現在不會 —— 要上線的檔案務必 commit（`public/sources.html` 已 commit、不受影響）。

## Common Pitfalls

- **sources.ts 是單一真實來源**: 改來源只動 `src/lib/sources.ts` → `npx tsx scripts/gen-sources-page.ts` 重生 sources.html → 部署。**勿手改 `public/sources.html`**（會被覆蓋）。
- **editor-source.html 是生成頁（團隊看寫作源頭）**: 由 `scripts/gen-editor-source-page.ts` 從 9 個 md（`docs/editors/*-soul.md`+`*-memory.md`、`refs/voices.md`+`anti-slop.md`+`chief-editor-checklist.md`）渲染、內建零依賴 md→html。改那些 md 後跑 `npx tsx scripts/gen-editor-source-page.ts` 重生、commit 部署。**勿手改 `public/editor-source.html`**（會被覆蓋）。團隊優化寫作風格的入口（hub 有卡片）。
- **gpt-image-2 生圖走 Codex CLI**（/publish-issue 用）: `codex exec --full-auto --skip-git-repo-check -C <寫入目錄> -o <msgfile> "...生圖存成 <檔名>...印出絕對路徑"`。codex 已登入 ChatGPT、內建 gpt-image，生到 `~/.codex/generated_images/<uuid>/ig_*.png` 再依指示 cp 到目標。**Bash 工具 timeout 設 ≥300000ms**（每張 1–2 分、~30–40k codex token；macOS 無 shell `timeout` 指令）。nanobanana 仍走 `mcp__nanobanana__generate_image`。
- **回饋功能 = `public/feedback.js`**: 架構頁/編輯源頭頁靠 `<body data-fb-blocks="選擇器">` 自動注入每區塊「💬 回饋」鈕；點了**複製回饋範本到剪貼簿＋跳提示**（零後端、跨環境可靠；mailto 依賴本機郵件程式、web 用戶常沒反應，已棄用）。
- **/publish-issue 配圖三鐵則**: ① **概念優先**——先想一個紐約客式諷刺 visual idea（替讀者問問題），不是場景重現；② **以 demo 圖為風格錨點**——餵 `public/img/style-*.png` 當 nanobanana `input_image`／codex `-i`（純文字 prompt 釘不住 The Pass 風格）；③ 嚴守 `illustration-guide.html`（risograph、出菜框＋桌鈴、人主角）。落選圖留作 `covers.html` 候選對照（別刪）；issue 頁共用 `public/issue.css`（別每期 inline）。**現役風格機器版規格＝ `docs/illustration/styles/risograph/style.md`（單一真實來源，含錨點＋提示詞片段）；換風格＝換現役 profile（見 `illustration-style-sop.html`／`/style-extract`）。**
- **scorer 需 API key**: 無 `ANTHROPIC_API_KEY` 時 scorer 走 dry-run（關鍵字代理，非真評分）。AI 不能代填金鑰，需使用者自己加到 `.env.local`。
- **scout = 非零金鑰、吃 firecrawl credits**: `--scout` 是 `/selection-report` 每期預設（走 firecrawl CLI、已登入）；**省 credits／離線時拿掉 `--scout` 回純零金鑰 RSS**。firecrawl 失敗時 scout 回 `[]` → 自動退化純 RSS、不會壞。
- **scout 繞過零訊號門檻**: `relevance.ts` 食物關鍵字只懂英/韓/日，泰/越/西/北歐標題會判 0；sr-prep 對 `isScoutArticle` 強制保留並給食物訊號保底——**別把 scout 也套零訊號門檻砍掉**（會殺光在地語言 gem）。
- **scout 跨期重撈靠 seen 擋**: firecrawl 每跑回同月窗口（`--tbs qdr:m`）同樣 URL，跟 RSS 一樣靠 `seen.json` 去重；**seen 只在 `sr-build --save` 定版**（eval 不存→可重現重撈、也不污染）。過閘門未選的 scout 進 backlog 競爭（同 RSS），不會重複進。
- **測 src/lib 用 `npx tsx`**: `node` strip-types 無法解 extensionless import（`./relevance`）也不支援 parameter property；務必用 tsx。
- **dedup threshold 0.6**: 標題 Jaccard 太低會誤折疊清單模板（「各城市最佳餐廳」）；語意去重待 LLM 階段補強。
- **Fumet 不選稿**: 結尾提問從選出的長文「提煉」，不從候選池打分選一篇（editorial-guidelines 規定）。
- **/write-issue 用 subagent 隔離聲音**: 三編輯 + 總編各 spawn 一個 subagent（per-編輯），別在同一 context 全寫（聲音會糊）；總編獨立審、不自審。改聲音→`refs/voices.md`、底線→`refs/anti-slop.md`、審核→`refs/chief-editor-checklist.md`、人格→`docs/editors/*-soul.md`（人格是團隊原作、refs 已對原文核對過，勿亂改）。
- **編輯署名（2026-06-21 改）**: 長文「編輯／<編輯>」、快訊「彙整 · Passe」、提問「問／Fumet」、特別企劃「招待／Amuse」。舊「選題 · Mise/Fumet」是正典誤植、已修（在 `voices.md`）。
- **長文＝觀點編譯 D**: 完整交代來源＋角度貫穿（≠A 挑一條、≠B/C 翻譯摘要）；/write-issue 長文與 /commission 都注入 `voices.md`〈長文標準〉。**Amuse 是唯一預設走 A 的編輯**。四模式英文：A=original/write-around、B=full translation/transediting、C=summary、D=analysis/commentary（`new-editor-guide.html` 有對照表＋說明）。
- **anti-slop 別自己算年數**: 原文寫「2007 年」就別寫「十八年前」（推算、可能算錯）；要嘛給年份、要嘛「多年前」。
- **/commission ＝ 共用編輯檔**: 與 /write-issue 讀同一套 soul/voices/memory/anti-slop/chief-editor-checklist（改一次兩邊生效）；單篇委稿、記憶預設不寫（opt-in）。
- **run_loop 觸發優化器對「專案級 skill」無效**: skill-creator 的 `run_loop`（description 觸發優化）在 headless `claude -p` 觸發不到 the-pass 的專案 skill（它把候選裝成 `~/.claude/commands/*.md` slash 指令、不靠 description 自動觸發）→ recall 全 0、分數無效；跑完還會留 `commission-skill-*.md` 暫存指令要手動清。**專案 skill 的 description 用人工判斷調，別跑 run_loop。**
- **/style-extract 驗證圖不落專案**: 測試圖一律生進 `~/style-lab/profiles/<name>/validation/`、檢視走 SendUserFile；**絕不寫進任何專案 public/ 或部署網站**（本 session 為部署給用戶看曾暫放 The Pass public，捷徑非常態）。
- **付費牆政策**: write-issue 抓全文偵測付費牆——硬新聞牆找公開源否則退；觀點牆但預覽自成一體→報現象+透明標註+佐證；絕不憑預覽假裝讀過全文。
- **/write-issue 輸入 = selected.json**: `sr-build` 每跑都寫 `data/sr/<date>/selected.json`（選的稿+切角+Fumet 種子）給寫作 skill 讀。
- **報告入口 selection-report.html**: 固定網址、讀 `selection-reports.json` 跳最新一期；每期 dated 報告要 commit 才上線（gitignore 現只忽略 `-demo`）。
- **selection-report-demo.html / data/*.json 已 gitignore**: 是 gen 出的 artifact，不 commit。⚠️ **自動部署改 git 來源後（2026-06-14），gitignored 檔不會上線**（如 `selection-report-*.html`）；要上線的檔需 commit（`sources.html` 已 commit、不受影響）。手動 `vercel --prod` 才會連本機 gitignored 檔一起上傳。- **Vercel subdomain**: auto-generated 是 `the-pass-nine`，但已有自訂域名 `thepass.cc`
- **動態插畫流程**: 靜態插圖 → 加標題 → Google Flow (Veo) 生成動態，音效OK但禁止配音
- **快訊不配圖**: 測試過 spot illustration，閱讀斷裂感太強，決定不採用
- **插畫拱門問題**: nanobanana 容易重複生成廚房拱門構圖，prompt 需明確排除
- **nav 有兩套**: 內部 6 連結 / 外部 3 連結（關於 The Pass、方法論、AI 編輯室），Logo 連結也不同（見上方表格）
- **nanobanana 生圖**: 每次生成都不同，喜歡的圖要立刻保存
- **避免「品味」用詞**: 全站已替換，用「觀點」「偏好」「分享」
