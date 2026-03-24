# CLAUDE.md — The Pass Project Context

> Last updated: 2026-03-24

## Project Overview

**The Pass** 是一份 AI 驅動的內容產品，用 AI 報導 AI 如何影響你我的飲食生活。名字源自廚房術語「出菜口（Pass）」：從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前。

**品牌核心：** 我們是 AI 編輯，而且我們很大方地說。我們寫的東西有人味，而且從不騙你。The Pass 不只觀察 AI 改變餐飲——它自己就是 AI 改變媒體的活案例。

**Slogan:** Intelligence, served.

## 核心決策（已確認）

| 項目 | 決定 |
|------|------|
| 產品名 | The Pass（中文場景講「出菜口」）|
| 定位 | AI × 餐飲的每一個面向 |
| 提案者 | YOYOYO 團隊（內容與名廚做對比參考） |
| 語氣 | 像朋友分享有趣的事 + 留一個好問題 |
| 不做的事 | 不下結論、不給觀點評論 |
| 頻率 | 一週 2 期（二、五）|
| 結構 | 2 篇長文 + 3 則快訊，一頁式全展開（兩層結構）|
| 目標讀者 | 核心：餐飲從業者/經營者；外圈：對食物+AI 好奇的人 |
| 信源策略 | 英文科技媒體（主食）+ 韓/日/泰在地語言媒體（香料）|
| 地域 | 全球視野，穿插亞洲在地內容增加獨特性 |
| 餐飲範圍 | 上游到下游全產業鏈（食材、加工、餐廳、外送、法規、設備、人）|

## AI 編輯團隊

- **Mise**（主筆）— 寫今日觀察（長文 400-600 字），場景式開頭，善用「你」→ [profile](public/editor-mise.html)
- **Passe**（快訊編輯）— 寫快訊（3-6 則），精簡俐落，第一句就是事實 → [profile](public/editor-passe.html)
- **Fumet**（提問者）— 每期結尾留一個無解的問題（100-250 字）→ [profile](public/editor-fumet.html)
- **總編輯**— 幕後品管，7 項審核清單（事實核查、AI 味檢測、節奏檢查、輕量 SEO），內容有趣永遠優先於 SEO
- 三位編輯各有 risograph 風格頭像和個人 profile 頁，讀者可在 [AI 編輯室](public/editors.html) 認識他們

## 編輯最高原則

1. **事實不可扭曲** — 觀點可以有，事實不能改。引號裡的話原文必須有人說過。
2. **先找到人，再提到技術** — 標題和內容都從人的處境開始。
3. **反 AI 味** — 禁止條列式轟炸、禁止 emoji、禁止「值得注意的是」等 AI 腔。
4. **禁止標題句式** —「[公司] 用 AI [做了某事]，[數字結果]」是 TechCrunch 的風格，不是 The Pass 的。

## Tech Stack

- **Framework:** Next.js 16 (Turbopack) + TypeScript
- **Hosting:** Vercel（Production domain: `the-pass-project.vercel.app`）
- **Repo:** github.com/terrelyeh/the-pass
- **Database:** Supabase（尚未接入，Phase 1 再做）
- **Newsletter:** 考慮中：Ghost Pro ($9/月) vs Beehiiv
- **AI:** Claude API（翻譯、摘要、撰寫、總編輯 review）
- **Image:** AI 圖片生成（Midjourney / nanobanana）

## 目錄結構

```
the-pass/
├── public/
│   ├── project-brief.html        ← Project Brief（9 章 + 附錄，含 Executive Summary）
│   ├── editorial-guidelines.html ← 編輯指南 + AI 編輯人設 + 系統提示詞 + 總編輯
│   ├── methodology.html          ← 內容來源方法論
│   ├── sources.html              ← 信源清單（33 個，含歐洲）
│   ├── illustration-guide.html   ← 插畫風格指南
│   ├── implementation-plan.html  ← 實作計畫
│   ├── editors.html              ← AI 編輯室（三位編輯總覽，讀者端）
│   ├── editor-mise.html          ← Mise 個人 profile
│   ├── editor-passe.html         ← Passe 個人 profile
│   ├── editor-fumet.html         ← Fumet 個人 profile
│   ├── demo-index.html           ← Demo 目錄頁（3 期卡片）
│   ├── demo-issue-001.html       ← Demo Issue #001
│   ├── demo-issue-002.html       ← Demo Issue #002
│   ├── demo-issue-003.html       ← Demo Issue #003
│   ├── demo-ig-post.html         ← IG Carousel Repurpose Demo
│   ├── demo-issue-001-*.html     ← （舊的 detail pages，已不使用）
│   └── img/                      ← 插畫 + 編輯頭像
├── docs/                         ← Markdown 版內部文件（給 AI 參考用）
├── src/app/                      ← Next.js App Router
├── data/                         ← RSS 抓取資料
└── CLAUDE.md                     ← 本檔案
```

## 插畫風格

- **風格：** Editorial line illustration × Risograph 印刷風混合
- **人物：** 有態度、不可愛不寫實，靈感來自桑拿大可（SANGNA TAKE）
- **色彩：** 主要 teal + burnt orange + 米白底，半色調網點質感
- **構圖：** 人是畫面主角，AI 元素可大可小（不固定權力關係）
- **品牌元素：** 每張圖有「出菜口框」（抽象線框）+ 桌鈴 icon（復古風格）
- **規則：** 不放文字（除非設計過）、只有長文配圖（每期 2 張）、詮釋式而非描述式

## 內容標籤系統（Tag）

六個 tag，用 tag 不用 category（一篇可多個）：
🔬 食品科技 · 🏪 餐廳經營 · 🌾 供應鏈 · 👨‍🍳 廚房現場 · 📊 產業動態 · 🍜 飲食文化

每篇標 2 個 tag（卡片和標題處）。

## 已完成的里程碑

- [x] 品牌定位 + Executive Summary（含 meta-narrative：用 AI 報導 AI）
- [x] Project Brief 完整版（9 章 + 附錄，含 sidebar scroll-spy、漢堡選單 RWD）
- [x] 編輯指南 + 4 位 AI 編輯的 System Prompts（含總編輯 + SEO 檢查）
- [x] 3 期 Demo Issues（#001 真實信源 / #002 #003 基於真實趨勢）
- [x] 總編輯審核流程實測（19 項修改）
- [x] AI 編輯頭像（risograph 風格）+ 個人 profile 頁 + AI 編輯室總覽
- [x] 插畫風格確立 + 6 張文章插畫
- [x] IG Carousel Repurpose Demo
- [x] 信源清單（33 個，5 種語言）
- [x] docs/ Markdown 版內部文件（6 份，給 AI 參考用）
- [x] 頻率確定：一週 2 期（週二、五）
- [x] Tag 系統：每篇 2 個 tag
- [x] 網域候選：thepass.news（$17.99/年，可註冊，尚未購買）

## 尚未決定的事項

- [ ] Newsletter 平台：Ghost Pro vs Beehiiv（傾向 Ghost Pro）
- [ ] 網域：thepass.news（已確認可註冊，待購買）
- [ ] 操作介面：Claude Code Skills vs Web Admin 後台（初期建議 Skill）
- [ ] 是否露出名廚 MINGCHU 品牌（目前先不露出）

## 下一步（最優先）

**篩選機制設計** — 這是下一次 session 的主要議題：
1. **演算法邏輯** — 從 33 個信源的原始資訊中，如何自動判斷哪些值得報導
2. **評分標準** — 什麼樣的文章分數高？（人的故事 > 純技術規格、在地獨家 > 全球已知、有張力 > 純資訊）
3. **選題流程** — 從「原料進來」到「選出 5-8 則」的完整 pipeline

其他待做：
- 建 RSS 抓取 pipeline（先接 5 個核心信源）
- 手動跑 2 週（用原料清單手動選題 + 手動寫）
- 接 Claude API，讓 AI 編輯開始寫
- 串接發佈 API，半自動發佈
- Re-purpose 自動化（/to-instagram 等）

## 部署

```bash
cd the-pass
npx vercel --prod --yes
```

Git push 到 main 理論上會自動部署，但 Root Directory 設定可能需要確認指向 `the-pass/`。

## Common Pitfalls

- **Vercel 自動部署失效**: GitHub webhook 有時不觸發，需手動 `npx vercel --prod --yes` 部署。
- **Vercel subdomain**: auto-generated 是 `the-pass-nine`。已加 alias `the-pass-project.vercel.app`。
- **圖片路徑**: 插畫放 `public/img/`，HTML 裡用相對路徑 `img/01-ourhome.png`。
- **舊的 detail pages**: `demo-issue-001-*.html` 已不使用（改為一頁式），未來可清理。
- **品牌露出**: 所有頁面已移除「名廚 MINGCHU」相關文字。
- **Demo Issue #002 #003**: 連結都是 `href="#"`（非真實 URL），banner 已改為「展示用範例」。#001 有真實連結。
- **CSS 重複**: 三期 demo issue 各自 inline 完整 CSS，修改樣式需三份都改。未來應抽成共用 CSS。
- **Project Brief RWD**: 已修復手機版（max-width: 100% + overflow-x: hidden），有漢堡選單。
- **nav 有兩套**: 內部文件用完整 nav（7 個連結），demo issues 用精簡 nav（方法論 + 信源清單 + AI 編輯室）。
- **nanobanana 生圖**: 每次生成都不同，無法精確重現。用戶喜歡的圖要立刻保存，覆寫後無法恢復。
