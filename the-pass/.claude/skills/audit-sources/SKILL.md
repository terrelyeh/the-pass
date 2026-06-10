---
name: audit-sources
description: >-
  Audit candidate content sources for The Pass (出菜口) and fold the good ones into the pipeline.
  Use when the user gives a list of candidate sources to evaluate — URLs, publication names, or an
  article that lists food media/blogs/newsletters — or says things like「幫我 audit 這些來源」「評估這幾個
  feed」「同事推薦了一批來源」「這些值得收嗎」「audit these sources」. Runs feed connectivity + activity,
  profiles each source's content orientation and fit for The Pass, scores freshness/exclusivity and
  IG/video potential, then recommends keep/skip with stream/tier/category and (on approval) adds the
  keepers to src/lib/sources.ts, regenerates the source pages, and deploys.
---

# Audit Sources — The Pass 選題來源審核

把一批候選來源評估後，收進 pipeline（`src/lib/sources.ts`）。**機械層**（連通/活性/樣本）由 `scripts/audit-feed.ts` 跑；**內容走向/適配判斷**由你（Claude）讀樣本後做。

## The Pass 取材原則（判斷時的北極星）
- **TA 是台灣讀者**，但**刻意不收台灣來源**——價值在「**台灣沒有的新鮮事**」：替台灣讀者開一扇窗，看世界上有趣的飲食新知/新聞/觀點。
- **食物/餐飲/上下游為主，AI/科技為輔**（食品科技導向才收，純 AI/通用科技不收）。
- 調性：**新鮮感與發現的驚喜**，不是乾的產業新聞。重人味、重觀點、反 AI slop。

## 流程

### 1. 取出候選清單
- 使用者給網址 → 直接用。
- 給「一篇列出媒體的文章」→ 先 WebFetch 那篇，取出每個媒體的名稱 + 官網。
- 給名稱 → 找官網。

### 2. 跑機械層（連通 + 活性 + 樣本）
```bash
npx tsx scripts/audit-feed.ts <url1> <url2> ...
```
輸出每個來源：✅/❌ feed、篇數、最新日期+age（🟢≤30天/🟡≤90/🔴更舊）、簡介、近 12 篇樣本標題。
- ❌ 無 feed（紙本/JS-only/擋 bot）→ 直接判「不進 pipeline」（可註記為編輯靈感參考）。
- 🔴 停更（最新 >90 天）→ 不收。

### 3. 讀樣本，profile 每個 active 候選（這是你動腦的部分）
對每個有可用 feed、且近期活躍的來源，依樣本標題/摘要判斷六個維度：

| # | 維度 | 判什麼 |
|---|------|--------|
| ① | **內容走向** | 類型分布（食譜/產業新聞/人物故事/文化觀點/科技/評論/趨勢/在地）+ 調性（新鮮有趣 ↔ 乾的產業稿）|
| ② | **餵哪位編輯** | Mise（人物/處境）/ Passe（硬事實）/ Fumet（觀點/提問素材）|
| ③ | **科技含量** | 食品科技/AI 角度多不多（輔助線，不是必要）|
| ④ | **新鮮/獨家度** | 台灣讀者/台灣媒體還沒看過的程度——越前沿/越奇/越有觀點越高 |
| ⑤ | **IG/影片潛力** | 有畫面、有故事、有數字（好做 carousel/短影音）↔ 純文字產業稿 |
| ⑥ | **是不是食物/餐飲** | 食物為主才收；純 AI/通用科技不收 |

> 註：「台灣讀者相關度」**不是 audit 維度**，它是選題報告裡的一個切角選項。

### 4. 出每來源一張審核卡 + 建議
格式範例：
> **Foovo** — 🟢 活躍(約10篇/週)
> 內容走向：90% 食品科技前沿（培養肉/精密發酵）+ 10% 報告導讀；偏技術但有發現感
> 餵：Passe 事實為主，偶有 Mise（創辦人專訪）｜科技含量高｜新鮮獨家高｜IG 潛力中
> → **收**：Stream A · ai-food-tech · tier 3 · active

判 stream/tier：
- **Stream A** = 飲食/餐飲媒體（食物優先）；**Stream B** = 食品科技/食物商業/觀點（輔助）。
- **tier**：1 核心每天看 / 2 主力 / 3 補充·在地 / 4 觀點·前沿 / 5 低產·觀察。
- **active vs pending**：明確是食物源 + 活躍 → active；需再觀察 → pending。

### 5. 經使用者確認後，落地
- 把收的來源加進 `src/lib/sources.ts`（單行物件，欄位見既有格式：id/name/url/feedUrl/language/category/tier/stream/feedType/status/description）。
- 驗證：`npx tsc --noEmit` + 確認無重複 id。
- 重生來源頁：`npx tsx scripts/gen-sources-page.ts`（sources.html）。`/sources-status` 是 Next route 自動同步。
- commit（訊息結尾加 Co-Authored-By 行）+ push + 部署：`npx vercel --prod --yes`。
- 更新 memory `project_sourcing_angles` 記錄這次收/不收。

## 不收的常見情況
- 無可用 feed（紙本雜誌、JS-only、擋 bot）。
- 停更（最新 >90 天）。
- 純 AI/通用科技/新創，食物密度趨近 0（如 HF Papers、通用 AI 媒體）。
- 食譜為主——The Pass 不教做菜，食譜站適配弱。
