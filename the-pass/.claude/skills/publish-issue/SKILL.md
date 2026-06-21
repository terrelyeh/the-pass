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

### 2 · 長文配圖（每篇一張、16:9，快訊不配）
**⚠️ 配圖前一定先讀 `public/illustration-guide.html` 並嚴格照它生**——品牌視覺鐵則，別自己發明風格（前車之鑑 2026-06-20：自作主張用寫實／電影風生了一輪、幾乎違反指南每一條、全廢重生）。**現役風格的機器版規格＝ `docs/illustration/styles/risograph/style.md`（單一真實來源，含錨點圖與提示詞片段）；換風格＝換現役 profile，流程見 `public/illustration-style-sop.html`。**

**最優先兩件（2026-06-20 學到，比技術鐵則更上位）：**
- **① 概念優先（紐約客封面式）**：先想一個**諷刺的單一 visual idea**——是視覺評論、替讀者問一個問題（指南 §01／§05），**別把新聞場景照畫**。例：「教機器怎麼嚐」→ 老師傅餵 teal 小機器人嚐咖哩；「問 ChatGPT 點酒」→ 客人捧手機如神諭、懂酒的人淡出消散。**先用 AskUserQuestion 給 Terrel 2–3 個 idea 挑**，概念定了再生圖。
- **② 以 demo 圖為風格錨點**：把 `public/img/style-ramen.png`（＋`style-approved`／`style-brainwave`）當 nanobanana 的 `input_image_path_1/2`、或 codex `-i` 附圖——純文字 prompt 釘不住 The Pass 這麼 specific 的風格（嚴格有限印刷色盤＋粗墨線＋halftone），這步才鎖得住「一眼可辨」。色調可跟編輯／主題呼吸，別死守同三色（§10）。

其餘技術鐵則：
- **風格＝Risograph 編輯插畫**：利落自信的黑色墨線、**平面色塊（不要漸層）**、halftone 網點、**cream/beige 背景＋大量留白**。**絕不寫實／攝影／3D／水彩／油畫／可愛／企業 stock／中國風水墨**。
- **每張必含品牌簽名**（寫進 prompt 一起生，不是 CSS 後加）：① **出菜框 The Pass Frame**（抽象手繪矩形外框、同 risograph 質感）；② 角落一個小 **桌鈴 dome service bell**。
- **人是主角、AI 是暗示**：人物佔畫面重心，AI（螢幕／機器）小、在背景角落；**極簡五官**（窄瞇眼、一條線嘴、省略鼻）、**看不出國籍／種族**、當代穿著；表情常帶「…你確定嗎？」的懷疑（The Pass 人物簽名）。
- **色調跟編輯走**：長文＝Mise → 偏暖（burnt orange／amber／ochre），AI 元素點一點 teal 冷色。
- **直接套指南 §07 的 Prompt 模板＋Negative Prompt 模板**，把 `[場景描述]／[情緒]／[主色]` 換成本篇（場景＝Mise 的開場）。

1. **各寫一條提示詞給兩個模型**：nanobanana 用完整模板＋`negative_prompt`＋`aspect_ratio:"16:9"`；gpt-image-2 用濃縮版、但所有鐵則（risograph／墨線／平塗／halftone／cream 留白／出菜框＋桌鈴／人主角／極簡臉／非寫實）都要保留。
2. **生圖（兩模型我都直接生）**：
   - **nanobanana** → `mcp__nanobanana__generate_image`，存 `public/img/`。
   - **gpt-image-2** → 透過本機 **Codex CLI**（已登入 ChatGPT、內建 gpt-image；2026-06-20 實測可行）：
     `codex exec --full-auto --skip-git-repo-check -C the-pass/public/img -o /tmp/codex-img.txt "用你的 image 生成工具（OpenAI gpt-image）生一張圖：<gpt-image-2 提示詞>。存成 issue-<date>-N-gpt.png 到目前工作目錄（工具若存別處就 cp 過來），最後印出絕對路徑。"`
     codex 先生到 `~/.codex/generated_images/<uuid>/ig_*.png` 再依指示複製到目標；讀 `/tmp/codex-img.txt` 取回路徑。約 30–40k codex token、1–2 分鐘/張 → **用 Bash 工具的 `timeout` 參數（≥300000ms）**，別用 shell `timeout`（macOS 無）。
3. **🚦GATE A（人挑圖，用挑選頁）**：生完候選 → 產一頁 **`public/pick-<date>.html`**（兩篇長文 × 各模型候選**並排**、標好 nanobanana／gpt-image）→ **commit＋push 上站** → 把網址給 Terrel 開網頁挑（比聊天傳檔可靠——實測 SendUserFile 使用者看不到）。他回「長文1 用 X、長文2 用 Y」。挑定後：選的存成最終檔名（`issue-<date>-1.png`／`-2.png`）、**移除挑選頁**；落選圖**留作配圖總覽的「候選對照」**（`issue-<date>-N-gpt.png` 等，別刪）；不滿意就重寫提示詞重生。

### 3 · 渲染 issue 頁
產出 `public/issue-<date>.html`：**沿用 issue 模板的 CSS/結構**（首期 `public/issue-2026-06-19.html` 為基準格式；長文上方放選定的封面圖）。內容＝今日觀察（2 長文＋圖＋署名＋來源）、本期快訊、留一個問題、落款。
- ⚠️ **別每期各自 inline 一份 CSS**（demo issue 的舊雷）：issue 頁共用同一套樣式——若還沒抽成 `public/issue.css`，第一次發佈時抽出來、之後 `<link>` 共用。

### 4 · 更新索引（配圖總覽 + hub）
- **把這期加進 `public/covers.html`**（配圖總覽，左側日期目錄）：新增一個 `<section class="period" id="c-<date>">`，每篇長文顯示**採用版＋候選版對照**（採用 nanobanana／候選 gpt-image）＋標題＋概念；＋ 左側一條 `<a data-target="c-<date>">`。把舊的 `active` 移到新期。
- hub 已有「配圖總覽 / 首期內容」卡片；新期視需要更新 hub 的最新 issue 卡片。

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
