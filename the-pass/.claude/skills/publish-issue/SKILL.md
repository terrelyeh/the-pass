---
name: publish-issue
description: 把「人已定稿」的出刊草稿發佈成 thepass.cc 的 issue 網頁（含長文配圖）。Make sure to use this skill whenever Terrel wants to 發佈這期／把這期上站／出刊／publish the issue／把定稿做成網頁／上線這期內容——即使沒講 skill 名字也要觸發。在 /write-issue 產出草稿、且 Terrel 離線潤定稿之後用。不要用於：寫稿（/write-issue）、選題（/selection-report）。
---

# /publish-issue — 把定稿發佈成 issue 網頁（含配圖）

階段鏈：選題 `/selection-report` → 寫草稿 `/write-issue` → **Terrel 離線潤定稿（Obsidian）** → **`/publish-issue` 發佈**。
這個 skill 在**人定稿後**跑——所以它的輸入是「定稿」，不是 AI 草稿。核心是**渲染 + 配圖 + 上站**，不需重寫內容。

## 開工前確認
- 工作目錄 `the-pass/`。
- 輸入＝定稿 md：`/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass/文章草稿/<date> 出刊草稿.md`。
- **先跟 Terrel 確認「這份是定稿了嗎」**——草稿狀態（frontmatter `狀態: 草稿待潤`）不要發。定稿才發。

## 工作流（含人挑圖 + 發佈前 gate）

### 1 · 讀定稿
讀 md，取出：2 篇長文（標題＋內文＋署名＋來源）、快訊、Fumet。**內文一字不改**（已定稿）；只做發佈。「總編審核摘要／待補」是內部段落，**不上公開頁**。

### 2 · 長文配圖（每篇一張，快訊不配）
The Pass 的視覺：**長文配插畫、快訊不配**（CLAUDE.md 既定）。每篇長文：

1. **配圖點子＝長文的開場場景**（Mise 場景式開頭 → 那個畫面就是封面）。例：大塚那篇＝琵琶湖邊研究所、成堆紙檔案、年輕研究員。
2. **各寫一條提示詞，給兩個模型**（風格不同，分開寫）：
   - **nanobanana（Gemini／nb2）**：詳細自然語言、場景＋感官＋光線＋構圖＋風格（暖色系編輯插畫、扣 The Pass 調性，見 `illustration-guide.html`）；用 `negative_prompt` 排除**廚房拱門構圖**（nanobanana 慣性問題）、文字、浮水印、emoji。`aspect_ratio` 建議 `3:2` 或 `16:9`（封面橫式）。
   - **gpt-image-2**：簡潔描述式（主體＋氛圍＋風格一段話）。
3. **生圖（兩模型我都直接生）**：
   - **nanobanana** → `mcp__nanobanana__generate_image`，存 `public/img/`。
   - **gpt-image-2** → 透過本機 **Codex CLI**（已登入 ChatGPT、內建 gpt-image；2026-06-20 實測可行）：
     `codex exec --full-auto --skip-git-repo-check -C the-pass/public/img -o /tmp/codex-img.txt "用你的 image 生成工具（OpenAI gpt-image）生一張圖：<gpt-image-2 提示詞>。存成 issue-<date>-N-gpt.png 到目前工作目錄（工具若存別處就 cp 過來），最後印出絕對路徑。"`
     codex 先生到 `~/.codex/generated_images/<uuid>/ig_*.png` 再依指示複製到目標；讀 `/tmp/codex-img.txt` 取回路徑。約 30–40k codex token、1–2 分鐘/張 → **用 Bash 工具的 `timeout` 參數（≥300000ms）**，別用 shell `timeout`（macOS 無）。
4. **🚦GATE A（人挑圖）**：把 nanobanana（＋gpt-image-2）候選列給 Terrel，**他挑一張/每篇**。存成 `public/img/issue-<date>-1.<ext>`、`-2.<ext>`。沒喜歡的就重生（nanobanana 每次不同，喜歡要立刻定）。

### 3 · 渲染 issue 頁
產出 `public/issue-<date>.html`：**沿用 issue 模板的 CSS/結構**（首期 `public/issue-2026-06-19.html` 為基準格式；長文上方放選定的封面圖）。內容＝今日觀察（2 長文＋圖＋署名＋來源）、本期快訊、留一個問題、落款。
- ⚠️ **別每期各自 inline 一份 CSS**（demo issue 的舊雷）：issue 頁共用同一套樣式——若還沒抽成 `public/issue.css`，第一次發佈時抽出來、之後 `<link>` 共用。

### 4 · 更新索引 + hub
- 把這期加進 issue 索引（`public/issues.html` 列表頁，或先在 hub 加卡片）。
- 索引每期一列：日期＋兩篇長文標題＋連結。

### 5 · 🚦GATE B（發佈前）
把 issue 頁（本機或截圖）給 Terrel 看一眼 → 確認 → 才上站。

### 6 · 部署 + 驗證
- `git add public/issue-<date>.html public/img/issue-<date>-* public/issues.html`（**圖也要 commit**：自動部署只上 git 內的檔）→ commit → push（自動部署）。
- curl 驗證 live：HTTP 200、長文標題在、圖路徑可開。回報 Terrel issue URL。

## 眉角 / 邊界
- **只發定稿**：草稿狀態不發。內文不改（發佈不是再編輯）。
- **長文配圖、快訊不配**；插畫扣 `illustration-guide.html`、排除拱門構圖、禁文字/emoji 入圖。
- **兩模型分開寫提示詞**（nanobanana 詳細自然語言＋負面詞；gpt-image-2 簡潔描述）。**兩者我都直接生**：nanobanana 走 MCP、gpt-image-2 走 Codex CLI。
- **圖存 `public/img/` 且 commit**，否則自動部署不會上線。
- **CSS 共用**：別重複 inline；用 `issue.css`（沒有就第一次抽出）。
- **內部段落不上頁**：總編審核摘要、待補/存疑只在 Obsidian，不進公開 issue 頁。

## 備註：gpt-image-2 走 Codex CLI（已通）
gpt-image-2 不必自接 OpenAI 金鑰——用本機已登入的 **Codex CLI**（`codex` v0.124+；`codex login status` 應顯示 Logged in using ChatGPT，用 ChatGPT 額度）。codex `exec --full-auto` 內建 image 生成，能存到指定路徑、`-o` 回傳路徑（2026-06-20 實測生圖成功）。維持登入即可；登入/額度掉了只影響 gpt-image-2 那格，nanobanana 不受影響。
