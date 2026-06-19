---
name: selection-report
description: 產出 The Pass（出菜口）每期（週二／週五）的「選題報告」。Make sure to use this skill whenever Terrel wants to 跑這期／這週的選題、出選題報告、做選題會議文件、產生候選清單、挑這期要寫什麼、generate the selection report、run the editorial selection——即使沒講出 skill 名字（例如「跑一下這週選題」「出這期的選題報告」「來挑這期的稿」「selection report」「出菜口選題」）也要觸發。在本機 Claude Code 執行、零 API key：抓 RSS → 去重 → 你（Claude）當總編依「食物優先」rubric 評分 → 庫存跨期競爭 → 產 HTML（上 thepass.cc）+ Obsidian Markdown。不要用於：改來源清單（那是 /audit-sources）、寫成稿（那是編輯人設 skill）、或單純問專案狀態。
---

# /selection-report — The Pass 每期選題報告

每期出刊前跑一次，產出「選題報告」供選題會拍板：機器負責抓取／去重／渲染，**你（Claude Code）親自當總編做評分**——這就是「零 API key」的關鍵：評分不呼叫 `@anthropic-ai/sdk`，由你直接讀候選、用下方 rubric 判斷。

## 開工前確認

- **工作目錄在 `the-pass/`**（腳本用相對路徑、tsx 跑 `src/lib`）。不在的話先 `cd`。
- 第一次在新機器跑：先 `npm install`（需要 `rss-parser` 等）。
- 跑腳本一律 `npx tsx`（`node` 無法解 extensionless import）。
- 今天日期會用在檔名與時效判斷；以實際系統日期為準。

## 工作流（四步）

### 步驟 1 · 抓取候選（機械，會即時連 ~29 個 RSS）

```bash
npx tsx scripts/sr-prep.ts
```

產出 `data/sr/<date>/candidates.json`（食物優先粗篩後約 60 篇，給你評分）與 `meta.json`（漏斗統計、掃描來源）。終端會印漏斗數字。

### 步驟 2 · 你當總編評分（核心，這步是你做，不是腳本）

讀 `data/sr/<date>/candidates.json`，**逐篇**依下方〈食物優先 rubric〉評，把結果寫成 `data/sr/<date>/scores.json`。**每一篇都要有一筆**（過閘門的給五面向＋hook；沒過的 `pass:false` 並寫一句 `reason`，讓報告的「已篩除」有交代）。再從你給最高分的兩篇 mise（長文）**提煉**一個 Fumet 結尾提問。

`scores.json` 格式：

```json
{
  "fumet": { "question": "一個好問題（繁中，從本期長文提煉，非選稿）", "from": "提煉自哪兩篇長文" },
  "scores": [
    { "id": "<對齊 candidates.json 的 id>", "pass": true,
      "surprise": 4, "local": 3, "human": 4, "conversation": 4, "substance": 4,
      "editor": "mise", "hook": "為什麼是這篇（繁中 ≤40 字，講故事鉤子不是分數）",
      "reason": "過閘門的簡短理由" },
    { "id": "<...>", "pass": false, "surprise": 0, "local": 0, "human": 0, "conversation": 0, "substance": 0,
      "editor": "passe", "hook": "", "reason": "🚫 / 😴 為什麼砍（一句話）" }
  ]
}
```

- `id` **必須一字不差**對齊 candidates.json 的 `id`（canonical URL），否則 build 接不回去。
- `editor` 只能 `"mise"`（長文）或 `"passe"`（快訊）；**不要** fumet（Fumet 是提煉、不選稿）。
- 五面向皆 0–5 整數。沒過閘門者五面向全 0。

### 步驟 3 · 組報告 + 雙輸出（機械）

```bash
npx tsx scripts/sr-build.ts --save
```

讀 candidates + 你的 scores + meta → 庫存跨期競爭（合格未選的留庫存、下期再戰）→ 選一期（top 2 mise 長文 + top 4 passe 快訊）→ 產出：

- **HTML**：`public/selection-report-<date>.html`（團隊看的互動報告）
- **Obsidian**：`工作/顧問/AI編輯室 - The Pass/選題報告/<date>.md` + 更新同夾的 `庫存.md`
- **持久化** `data/backlog.json`（出刊的移出、未選的留）

> 開發／測試想空跑：拿掉 `--save`，只產 HTML、不碰 vault／庫存。

### 步驟 4 · 驗證 + 發佈

1. 開 `public/selection-report-<date>.html` 確認 render 正常（可用 preview 靜態服務 `the-pass-static`）。
2. 發佈到 thepass.cc 給團隊：

```bash
git add public/selection-report-<date>.html data/backlog.json && git commit -m "feat(selection): <date> 選題報告" && git push
```

   （push 後 Vercel 自動部署；網址 `https://thepass.cc/selection-report-<date>.html`。）
3. 確認 Obsidian 的 `選題報告/<date>.md` 與 `庫存.md` 已更新。
4. 跟 Terrel 回報漏斗數字、選了哪 6 篇、庫存幾則，附上線網址。

---

## 食物優先 rubric（步驟 2 你評分時遵守）

The Pass 用 AI 報導「飲食生活裡的新鮮事」，調性是**新鮮感與發現的驚喜**，不是乾的產業新聞。**方向（團隊 2026-06-11 定）：飲食／餐飲／食物優先，AI／科技為輔與加分。**

### 硬閘門（先判 pass / fail）

要 pass，需同時滿足：

1. **主題落在飲食／餐飲／食物及相關（廣義）**——上游（食材、農業）、中游（加工、製造、物流）、下游（餐廳、外送、零售）、橫切面（法規、設備、人力、行銷、永續），以及**「人」的故事（主廚、餐飲經營者、從業者、生產者）**。AI／科技**不是**入選門檻、是加分；只擋掉「跟飲食完全無關」的（純無人機政策、與吃無連結的純 AI 研究）。
2. **事實可查、不是空泛炒作或純廣告／活動推廣。**
3. **有潛力翻成「先找到人」的人味故事**，不是只有融資金額／技術規格的乾稿。
4. **夠新鮮**：是「本期」的新鮮事。**砍掉明顯舊聞**（pubDate 距今超過約 6 週、又非不受時間影響的觀點／特寫）。candidates.json 有些 feed（如 TechCrunch）會回 2023–2024 的舊文，務必擋掉。
5. **是單一故事**，不是週報／彙整／趨勢摘要（「本週 $131M」「5 Bombshells」「17 deals this week」這種）；不是清單模板（「38 間最佳餐廳」）；不是 RSS 誤抓的非文章（例如標題裡含 AI 草稿過程的字句）。

> 寬鬆但誠實：寧可讓邊界案例通過，也別漏掉有潛力的前沿題。但上面 4、5 兩條（時效、單一故事）要硬一點——它們是 dry-run 時代沒擋好、最容易混進垃圾的破口。

沒過閘門 → `pass:false`、`reason` 用一句話說明（可用 🚫 無關／舊聞／非文章、😴 乾稿／彙整 等標記），五面向全 0。

### 五面向（過閘門者各打 0–5 整數）

加權＝surprise×3 + local×2.5 + human×2.5 + conversation×2 + substance×1（build 會自動算，你只給 0–5）。

- **surprise 驚喜／新鮮（最重要）**：是「台灣沒看過的新鮮飲食事」嗎？驚喜可來自食物本身（新食材／做法／文化），或 AI／科技讓食物有了沒想過的可能（後者是加分亮點）。又一則融資稿＝低分。
- **local 在地獨家**：亞洲在地？英文大媒體還沒報？
- **human 人味**：有沒有具體的人、具體的處境？
- **conversation 可談性**：能勾出一個好問題、讓人想轉發或回信嗎？
- **substance 事實扎實**：有真材實料，不是空泛吹捧？

### 編輯路由

- **mise（長文）**：有具體的人／處境、值得 400–600 字場景式展開。
- **passe（快訊）**：事實夠硬夠新、一句話講得清。
- 可談性高 = 給 Fumet 好素材，但稿仍歸 mise 或 passe；Fumet 不在這裡選。

### hook

一句「為什麼是這篇」（繁中 ≤40 字），是故事鉤子、不是覆述分數。先找到人，再提到技術。

---

## 眉角 / 已知限制

- **粗篩偏 foodtech**：`sr-prep` 用關鍵字粗篩、且讓「有食物訊號者」優先入池，但來源本身偏替代蛋白／食品科技，故候選池常一面倒。你評分時要刻意拉抬**人味／在地餐飲**題的權重，平衡選書；不夠時在 hook／flags 點出「本期偏 foodtech，可再補人味題」。
- **時效是最大破口**：務必用 pubDate 擋舊聞（見硬閘門第 4 條）。
- **Fumet 是提煉不是選稿**：讀完你選的兩篇長文，提一個把它們串起來的好問題。
- **HTML 會公開上線**（thepass.cc 無密碼）：候選池與篩除理由都會被看到，措辭保持專業、對事不對人。
- **庫存跨期競爭**：未選上的合格稿會留 `data/backlog.json`（保鮮期 30 天），下期和新稿一起排序重戰；出刊的會移出。重進不續命。
- **被 gitignore 的不會上線**：`selection-report-demo.html` 是手工 artifact、不 commit；每期 dated 報告要 `git add` 才會上 thepass.cc。
- **改報告外觀**：版型在 `src/lib/report.ts` 的 `renderReport`（HTML）；Markdown 版型在 `scripts/sr-build.ts`。
- **改 Obsidian 路徑**：`scripts/sr-build.ts` 最上面的 `VAULT_BASE`。
