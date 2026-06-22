---
name: selection-report
description: 產出 The Pass（出菜口）每期（週二／週五）的「選題報告」。Make sure to use this skill whenever Terrel wants to 跑這期／這週的選題、出選題報告、做選題會議文件、產生候選清單、挑這期要寫什麼、generate the selection report、run the editorial selection——即使沒講出 skill 名字（例如「跑一下這週選題」「出這期的選題報告」「來挑這期的稿」「selection report」「出菜口選題」）也要觸發。在本機 Claude Code 執行、零 API key：抓 RSS → 去重 → Haiku 子代理粗篩 → 你（Claude）當總編依「食物優先」rubric 評分 → 庫存跨期競爭 → 產 HTML（上 thepass.cc）+ Obsidian Markdown。不要用於：改來源清單（那是 /audit-sources）、寫成稿（那是編輯人設 skill）、或單純問專案狀態。
---

# /selection-report — The Pass 每期選題報告

每期出刊前跑一次，產出「選題報告」供選題會拍板。**零 API key**：抓取／去重／渲染由腳本做；**粗篩由 Haiku 子代理做、細評由你（Claude Code）當總編做**——兩者都走你 Claude Code 既有登入，不呼叫 `@anthropic-ai/sdk`、不需另外的金鑰（只吃訂閱用量，Haiku 很省）。

## 開工前確認

- **工作目錄在 `the-pass/`**。不在就先 `cd`。
- 第一次在新機器跑：先 `npm install`。
- 跑腳本一律 `npx tsx`。
- 以實際系統日期為準（用於檔名與時效判斷）。

## 工作流（五步）

### 步驟 1 · 抓取候選池（機械）

```bash
npx tsx scripts/sr-prep.ts            # 純 RSS（零金鑰、可離線）
npx tsx scripts/sr-prep.ts --scout    # ＋查詢式進料（scout：在地語言/跨區主題，需 firecrawl）
```

抓 ~29 個 active RSS → 去重 → 丟掉與飲食/科技完全無訊號的 → 輸出 `data/sr/<date>/pool.json`（所有「有訊號」的候選，食物優先排序，通常數百篇）與 `meta.json`（漏斗統計、掃描來源）。**這關只做機械去噪，不做取捨。**

**`--scout`（選用）＝ 查詢式進料（Phase 1）**：用 firecrawl 跑常駐 query（`src/lib/scout-queries.ts`，在地語言＋跨區主題）撈「RSS 看不到」的在地/驚奇題，產出與 RSS 同形狀的候選、併進同一個 pool（標 `origin:"scout"`、走同一套去重與評分）。配方/邊界見該檔註解；省 firecrawl credits 就別帶旗標、或把部分 query `enabled:false`。pool 裡 scout 項一樣交給步驟 2/3 篩——只「找題」不抓全文，全文留到 /write-issue。

### 步驟 2 · Haiku 子代理粗篩（pool → candidates）

讀 `data/sr/<date>/pool.json`。把它分成**每批約 40 篇**，每批 **spawn 一個 Haiku 子代理**（Agent tool，`model: haiku`、`subagent_type: general-purpose`），請它讀指定批次、依〈Haiku 粗篩準則〉回傳「要保留的 `id` 清單」（JSON）。合併所有子代理的保留結果 → 寫 `data/sr/<date>/candidates.json`（**欄位與 pool 相同**，目標收斂到 **~50–70 篇**）。

為什麼這樣做：Haiku 讀得懂語意（抓得到沒關鍵字的食物題、判得出時效／週報／slop），比關鍵字準；用子代理分批又比你親自讀數百篇省 context；而且走你既有登入、零 API key。**這關要收斂到 ~60 篇——丟掉明顯邊緣／過舊／彙整／清單，把「清楚值得細評」的留給步驟 3。**（實測：準則若只說「有疑慮就留」，Haiku 會留太多——務必同時給「每批約留 12–15 篇」的量化目標。）

### 步驟 3 · 你當總編評分（candidates → scores，核心）

讀 `data/sr/<date>/candidates.json`，**逐篇**依〈食物優先 rubric〉評，寫成 `data/sr/<date>/scores.json`。**每篇都要一筆**（過閘門者給五面向＋hook＋**切角**；沒過者 `pass:false`＋一句 `reason`）。再從你給最高分的兩篇 mise 提煉一個 Fumet 結尾提問。格式見最後〈scores.json 格式〉。

### 步驟 4 · 組報告 + 雙輸出（機械）

```bash
npx tsx scripts/sr-build.ts --save
npx tsx scripts/gen-backlog-page.ts   # 重生團隊看的庫存頁 public/backlog.html
```

庫存跨期競爭 → 選一期（top 2 mise 長文 + top 4 passe 快訊）→ 產出 **HTML**（`public/selection-report-<date>.html`）+ **Obsidian**（`工作/顧問/AI編輯室 - The Pass/選題報告/<date> 選題報告.md` + 更新同夾 `庫存.md`）+ 持久化 `data/backlog.json`。`--save` 後跑 `gen-backlog-page.ts` 把庫存重生成團隊頁 `public/backlog.html`（hub 有「選題庫存」卡片）。開發測試想空跑就拿掉 `--save`。

### 步驟 5 · 驗證 + 發佈

1. 開 HTML 確認 render（可用 preview 靜態服務 `the-pass-static`）。
2. 發佈 thepass.cc：`git add public/selection-report-<date>.html && git commit -m "feat(selection): <date> 選題報告" && git push`（push 後 Vercel 自動部署）。
3. 確認 Obsidian 的 `選題報告/<date> 選題報告.md` 與 `庫存.md` 已更新。
4. 跟 Terrel 回報漏斗數字、選了哪 6 篇、庫存幾則，附上線網址。

---

## 食物優先 rubric（步驟 3 你評分時遵守）

The Pass 用 AI 報導「飲食生活裡的新鮮事」，調性是**新鮮感與發現的驚喜**。**方向：飲食／餐飲／食物優先，AI／科技為輔與加分。**

### 硬閘門（先判 pass / fail）

1. **主題落在飲食／餐飲／食物及相關（廣義）**——上游（食材、農業）、中游（加工、製造、物流）、下游（餐廳、外送、零售）、橫切面（法規、設備、人力、行銷、永續），以及**「人」的故事（主廚、經營者、從業者、生產者）**。錨點是「飲食生活」：與吃／食物有連結的生活風格算，純粹無關的不算。AI／科技**不是門檻、是加分**。
2. 事實可查、不是空泛炒作或純廣告／活動推廣。
3. 有潛力翻成「先找到人」的人味故事，不是只有融資金額／技術規格的乾稿。
4. **夠新鮮**：本期的新鮮事。砍掉明顯舊聞（pubDate 距今超過約 6 週、又非不受時間影響的觀點）。
5. **是單一故事**：不是週報／彙整／趨勢摘要、不是清單模板（「38 間最佳餐廳」）、不是 RSS 誤抓的非文章。

寬鬆但誠實；但第 4、5 條要硬。沒過 → `pass:false`、`reason` 一句話（可用 🚫／😴 標記），五面向全 0。

### 五面向（過閘門者各 0–5 整數）

加權＝surprise×3 + local×2.5 + human×2.5 + conversation×2 + substance×1（build 自動算）。

- **surprise 驚喜／新鮮（最重要）**：台灣沒看過的新鮮飲食事？驚喜可來自食物本身，或 AI／科技讓食物有沒想過的可能。又一則融資稿＝低分。
- **local 在地獨家**：亞洲在地？英文大媒體還沒報？
- **human 人味**：有具體的人、具體的處境？
- **conversation 可談性**：勾得出一個好問題、讓人想轉發或回信？
- **substance 事實扎實**：真材實料，不是空泛吹捧？

### 編輯路由

- **mise（長文）**：有具體的人／處境、值得 400–600 字場景式展開。
- **passe（快訊）**：事實夠硬夠新、一句話講得清。
- 不指派 fumet（Fumet 是提煉、不選稿）。

### hook + 切角（angles）

- **hook**：一句「為什麼是這篇」（繁中 ≤40 字，故事鉤子不是分數）。先找到人，再提到技術。
- **切角（angles）**：每篇過閘門的稿，寫 **2–3 個切角**——同一則新聞的不同寫法／進入角度（從誰的處境寫起、從哪個衝突、從哪個對照）。**第一個（A）是你建議的預設。** 長文給 ~3 個、快訊給 ~2 個。報告會把 A 設預設、B/C 供選題會點選即換。優先想「從哪個人／處境寫起」。

---

## Haiku 粗篩準則（步驟 2，子代理用這份）

這關只做「高召回的快篩」，不做最終取捨——**寧可多留，別錯殺**。給每個 Haiku 子代理的指示重點：

> 你在幫 The Pass（用 AI 報導「飲食生活裡的新鮮事」）做初步篩選。讀給你的這批候選，回傳「值得保留進一步細評」的 `id` 清單（JSON 陣列）。
> **保留**：和飲食／餐飲／食物及相關（廣義，含上下游、餐廳、從業者/主廚的人物故事）有關、看起來夠新鮮、是單一故事。
> **丟掉**：與吃完全無關；明顯舊聞（標題/摘要看得出是一兩年前）；週報／彙整／趨勢摘要（如「本週 $131M」「5 Bombshells」「17 deals this week」）；清單模板（「38 間最佳餐廳」）；RSS 誤抓的非文章（標題像草稿過程）。
> 取捨原則：保留「清楚值得細評」的（明確在飲食／餐飲範圍、夠新鮮、單一故事）；丟掉明顯邊緣的產業／促銷填充、過舊、彙整、清單。對「真有潛力但描述保守」的題仍保留，但別整批都留。**每批（約 40 篇）約留 12–15 篇，整體收斂到 ~50–70 篇。**

---

## scores.json 格式

```json
{
  "fumet": { "question": "從本期兩篇長文提煉的好問題（繁中）", "from": "提煉自哪兩篇" },
  "scores": [
    { "id": "<對齊 candidates.json 的 id（canonical URL）>", "pass": true,
      "surprise": 4, "local": 3, "human": 4, "conversation": 4, "substance": 4,
      "editor": "mise", "hook": "為什麼是這篇（≤40 字）",
      "angles": ["切角 A（你建議的預設）", "切角 B", "切角 C"],
      "reason": "過閘門理由" },
    { "id": "<...>", "pass": false, "surprise": 0, "local": 0, "human": 0, "conversation": 0, "substance": 0,
      "editor": "passe", "hook": "", "angles": [], "reason": "🚫／😴 為什麼砍" }
  ]
}
```

- `id` 必須一字不差對齊 candidates.json。
- `editor` 只能 `"mise"` 或 `"passe"`。
- `angles`：過閘門者 2–3 個、A 為預設；沒過者空陣列。

---

## 眉角 / 已知限制

- **Haiku 粗篩走子代理、零 key**：在 skill 內由主代理 spawn Haiku 子代理；不是腳本呼叫 API，所以不需 `ANTHROPIC_API_KEY`（只吃訂閱用量）。若改成腳本內全自動（如未來排程），那才需要 key。
- **粗篩偏高召回**：Haiku 寧可多留，真正取捨在你步驟 3 的細評。你仍要刻意平衡——來源偏替代蛋白／食品科技，記得拉抬人味／在地餐飲題。
- **時效是最大破口**：細評時務必用 pubDate 擋舊聞。
- **付費牆來源**：若認得出某候選是付費牆（某些 Substack／大報），可選，但在 hook 或 reason 標記「付費牆」——提醒 /write-issue 階段只能報現象、需公開來源佐證（見 write-issue 付費牆政策）。
- **Fumet 是提煉不是選稿**：讀完你選的兩篇長文，提一個串起來的好問題。
- **HTML 會公開上線**（thepass.cc 無密碼）：措辭專業、對事不對人。
- **庫存跨期競爭 + seen 去重**：未選上的合格稿留 `data/backlog.json`（保鮮 30 天）下期重戰、出刊的移出、重進不續命。出刊（`--save`）也會把本期候選池寫進 `data/seen.json`，下期 `sr-prep` 自動去重 → **不重複撈、不重複發**。seen 只在出刊那刻定版，所以重跑 `sr-prep` 仍可重現。
- **改報告外觀**：HTML 在 `src/lib/report.ts` 的 `renderReport`；Markdown 在 `scripts/sr-build.ts`。
- **改 Obsidian 路徑**：`scripts/sr-build.ts` 最上面的 `VAULT_BASE`。
