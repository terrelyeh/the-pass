# CLAUDE.md — The Pass Project Context

> Last updated: 2026-03-24

## Project Overview

**The Pass** 是 YOYOYO 團隊的 side project 提案——一份 AI 驅動的內容產品，專門報導 **AI 如何影響餐飲產業**的方方面面（技術面、人文面、文化面）。名字源自廚房術語「出菜口（Pass）」：從全球大量的 AI × 餐飲資訊中，篩選、檢查、然後送到讀者面前。

**一句話定位：** AI 正在走進廚房、改變餐桌、重新定義我們與食物的關係。The Pass 幫你看懂。

**Slogan:** Intelligence, served.

## 核心決策（已確認）

| 項目 | 決定 |
|------|------|
| 產品名 | The Pass（中文場景講「出菜口」）|
| 定位 | AI × 餐飲的每一個面向 |
| 提案者 | YOYOYO 團隊（內容與名廚做對比參考） |
| 語氣 | 像朋友分享有趣的事 + 留一個好問題 |
| 不做的事 | 不下結論、不給觀點評論 |
| 頻率 | 一週 3 期（一、三、五）|
| 結構 | 2 篇長文 + 3 則快訊，一頁式全展開（兩層結構）|
| 目標讀者 | 核心：餐飲從業者/經營者；外圈：對食物+AI 好奇的人 |
| 信源策略 | 英文科技媒體（主食）+ 韓/日/泰在地語言媒體（香料）|
| 地域 | 全球視野，穿插亞洲在地內容增加獨特性 |
| 餐飲範圍 | 上游到下游全產業鏈（食材、加工、餐廳、外送、法規、設備、人）|

## AI 編輯團隊

- **Mise**（主筆）— 寫今日觀察（長文），場景式開頭，善用「你」
- **Passe**（快訊編輯）— 寫另外幾件事（短訊 120-150 字），精簡俐落
- **Fumet**（文化觀察）— 不定期，結尾留一個無解的問題
- **Chef（總編輯）**— 幕後品管，發佈前 review 全期內容（事實核查、AI 味檢測、節奏檢查）

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
│   ├── project-brief.html        ← 完整 Project Brief（14 章）
│   ├── editorial-guidelines.html ← 編輯指南 + AI 編輯人設 + 系統提示詞
│   ├── methodology.html          ← 內容來源方法論
│   ├── sources.html              ← 信源清單（36 個，含歐洲）
│   ├── illustration-guide.html   ← 插畫風格指南
│   ├── implementation-plan.html  ← 實作計畫（Skill vs Web 後台比較）
│   ├── demo-index.html           ← Demo 目錄頁（3 期卡片）
│   ├── demo-issue-001.html       ← Demo Issue #001（一頁式全展開）
│   ├── demo-issue-001-detail.html ← （舊的 detail page，已不使用）
│   ├── demo-issue-001-*.html     ← （舊的各則 detail，已不使用）
│   └── img/                      ← 插畫圖片
├── illustration-tests/           ← 插畫風格測試（不部署）
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

每篇只標一個主要 tag（卡片和標題處）。

## 尚未決定的事項

- [ ] Newsletter 平台：Ghost Pro vs Beehiiv（傾向 Ghost Pro）
- [ ] 操作介面：Claude Code Skills vs Web Admin 後台（初期建議 Skill）
- [ ] 插畫出菜口框的最終樣式（概念確認，細節待磨）
- [ ] 中文名稱：「出菜口」待正式確認
- [ ] 是否露出名廚 MINGCHU 品牌（目前先不露出）

## 下一步（實作優先順序）

1. 註冊 Ghost Pro / Beehiiv，建立 The Pass 電子報
2. 建 RSS 抓取 pipeline（先接 5 個核心信源）
3. 手動跑 2 週（用原料清單手動選題 + 手動寫）
4. 接 Claude API，讓 AI 編輯開始寫
5. 加入 AI 總編輯 review 機制
6. 串接發佈 API，半自動發佈
7. 加入插圖自動生成
8. Re-purpose Skills（/to-instagram 等）

## 部署

```bash
cd the-pass
npx vercel --prod --yes
```

Git push 到 main 理論上會自動部署，但 Root Directory 設定可能需要確認指向 `the-pass/`。

## Common Pitfalls

- **Vercel subdomain**: 專案名是 `the-pass` 但 auto-generated subdomain 是 `the-pass-nine`。已加 alias `the-pass-project.vercel.app` 作為 production domain。
- **圖片路徑**: 插畫放 `public/img/`，HTML 裡用相對路徑 `img/01-ourhome.png`。
- **舊的 detail pages**: `demo-issue-001-detail.html` 和各則 detail page 已不使用（改為一頁式），但檔案還在，未來可清理。
- **illustration-tests/**: 此資料夾只在本地，不部署。測試通過的圖才複製到 `public/img/`。
- **品牌露出**: 所有頁面已移除「名廚 MINGCHU」和「不接業配」相關文字。若要恢復名廚品牌連結，需全站更新。
