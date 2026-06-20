---
name: write-issue
description: 把 The Pass（出菜口）選題會拍板的稿，寫成整期文章草稿。Make sure to use this skill whenever Terrel wants to 寫這期／把選的稿寫成文章／出刊草稿／開始寫稿／生本期內容／write the issue／draft the articles／寫長文＋快訊＋Fumet——即使沒講 skill 名字（例如「來寫這期」「把這 6 篇寫出來」「生一版草稿」「開始撰寫」）也要觸發。harness 設計：orchestrator 調度 4 個編輯 subagent（Mise／Passe／Fumet／總編），抓全文查證後各用自己的聲音寫，3 個互動 gate 停下來問 Terrel。在 /selection-report 之後用。不要用於：跑選題（/selection-report）、改來源（/audit-sources）。

---

# /write-issue — 把選題寫成整期草稿（harness 版）

你是 **orchestrator**（主代理）：**自己不寫稿**，負責抓全文、調度 4 個編輯 subagent、組裝、在 gate 停下來問 Terrel、最後出稿。核心是**不捏造**——寫之前先抓全文，所有引號與數字都對得回原文（見 `refs/anti-slop.md` 最高原則）。

## 為什麼用 subagent（別自己一個 context 全寫）

四位編輯各 spawn 一個 subagent，context 只裝自己的人格 + 該寫的原文 → **聲音不互相滲透**、總編獨立審不偏心。這跟 /selection-report 的 Haiku 子代理同一套 harness 思路。

| Subagent | 寫什麼 | context 裝什麼 |
|---|---|---|
| **Mise** | 路由給他的長文（技術／產業面） | mise-soul + **mise-memory** + voices(Mise) + anti-slop + 該篇全文 + 切角 |
| **Passe** | 全部快訊（一起寫，不重疊/不撞長文角度） | passe-soul + **passe-memory** + voices(Passe) + anti-slop + 各篇全文 + 長文題目 |
| **Fumet** | 路由給他的長文（文化面）＋ 留一個提問 | fumet-soul + **fumet-memory** + voices(Fumet) + anti-slop + 該篇全文＋切角 + **寫好的長文** |
| **總編** | 審整期 | chief-editor-checklist + 全部草稿 + 各篇 factsUsed + 原文 |

編輯/總編用**主模型**（品質優先，別降級）。

## 開工前確認

- 工作目錄在 `the-pass/`；本期已跑過 `/selection-report --save`，有 `data/sr/<date>/selected.json`。
- 若選題會改過（換稿/換切角），以會議決定為準（Terrel 告知或編 selected.json）。
- orchestrator 先讀好要注入 subagent 的素材：`refs/voices.md`、`refs/anti-slop.md`、`docs/editors/{mise,passe,fumet}-soul.md`、`docs/editors/{mise,passe,fumet}-memory.md`、`refs/chief-editor-checklist.md`。**把相關內容直接放進 subagent 的 prompt**（subagent 不需自己找檔）；每位編輯只注入「自己的」soul + memory + voices 那段（**長文編輯 Mise／Fumet 另注入 voices.md〈長文標準：觀點編譯〉**）。

## 工作流（含 3 個互動 gate）

### 1 · 讀 selected.json
取本期 `selected[]`（feature=長文、quick=Passe 快訊，各帶 angles）+ `fumet` 種子。

### 1.5 · 長文編輯路由（自動判定誰寫）
對每篇長文（feature），依**題材性質**自動分派：
- 偏**技術／產業／數據**（食品科技、產業動態、新創）→ **Mise**（場景式、從具體的人切入）。
- 偏**文化／社會／哲學／人的處境**（飲食文化、社會觀察、價值思辨）→ **Fumet**（沉靜、從現象叩問背後的文化假設）。
不確定時：有具體的人／場景動作 → Mise；偏觀念／文化叩問 → Fumet。可參考 selected.json 的編輯路由。**不需每期兩位都出現**（可能兩篇都 Mise）。記下分派，下面 spawn 對應編輯；Fumet 的「留一個提問」仍照常獨立收尾（step 5）。**長文一律走「觀點編譯（D）」**——完整交代選到的那則來源 ＋ 用切角當 through-line 貫穿、別為角度丟重要事實（定義見 `refs/voices.md`〈長文標準：觀點編譯〉；字數依訊息量約 500–900）。

### 2 · 抓全文（Firecrawl，不可跳過）+ 付費牆政策
對每篇 `link` 抓全文（firecrawl）。寫作只能依抓回來的內容；抓不到的標「待補源」、不硬寫。

**偵測付費牆**（內容明顯被截斷、出現 subscribe／continue reading／付費訂閱 等）→ 依類型分流：
- **硬新聞牆**（關鍵事實/數據只在牆後）→ 找公開來源佐證；找不到 → **不寫、退庫存**（你沒有那些事實，不能猜）。
- **觀點/隨筆牆，但免費預覽已含完整立場 + 自成一體的現象/場景**（如 Jennifer Makan 那篇）→ 可寫，但：(a) **報那個「現象」，不是總結全文**；(b) **透明標註**「付費牆預覽、僅用免費段」；(c) 盡量再找一篇公開來源佐證該現象。
- **絕不**憑預覽假裝讀過全文。

### 3 · 頭條長文 + 🚦GATE 1（聲音校準）
先 spawn **頭條那篇路由到的編輯 subagent（Mise 或 Fumet）只寫頭條那篇**（feature 第一篇，用它的切角）。拿回草稿後 **停下來，用 AskUserQuestion 問 Terrel**：
- 「聲音對嗎？太硬/太軟/太 AI？」「切角這樣進入 OK 嗎？」「哪裡要調？」

依回饋（必要時帶著 Terrel 的話重 spawn Mise）調到對，**才往下**。第一次跑這關最重要——別一次寫 6 篇才發現語氣不對。

### 4 · 其餘長文 + 快訊（並行）
聲音定了後：spawn **第二篇長文路由到的編輯（Mise 或 Fumet）寫第二篇**、spawn **Passe subagent 寫全部快訊**（並行）。每個 subagent 回傳結構化：
```
{ draft: "...", factsUsed: [{ claim: "用了什麼數字/引述", source: "對應原文哪一句" }] }
```

### 5 · Fumet 提煉
spawn **Fumet subagent**，餵它寫好的兩篇長文 → 從一個具體細節提煉一個真開放問題（100–250 字、粗體結尾）。不從候選池選。

### 6 · 總編查核（獨立 subagent）
spawn **總編 subagent**：給它全部草稿 + 各篇 factsUsed + 原文，依 `refs/chief-editor-checklist.md` 跑 7 項、**逐條對事實**，每篇回 `✅ 可發佈` 或 `⚠️ 待修：<哪><違反哪條><方向>`。
- **🚦GATE 2（事實對不上隨時停）**：總編標出任何「數字/引述對不回原文」→ 立刻用 AskUserQuestion 問 Terrel：**拿掉 / 我去查證（web）/ 你來確認**。**不自己亂修**。
- 其他 7 項問題（AI 味、重複、節奏…）→ orchestrator 帶著總編意見重 spawn 對應編輯修，再過一次。

### 7 · 🚦GATE 3（發佈前必停）
把整期草稿 + 總編審核摘要呈現給 Terrel，用 AskUserQuestion 讓他**逐篇定奪**：採用 / 要改哪 / 退。依回饋做最後修。

### 8 · 出稿
寫進 `/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass/文章草稿/<date> 出刊草稿.md`：各篇（標題+內文+署名+來源連結）、Fumet、總編審核摘要、待補/存疑清單。回報 Terrel。**草稿給人定稿，不自動發佈。**

### 9 · 回寫 Memory（定稿後，讓三位編輯跨期演化）
這期定稿後更新 `docs/editors/{mise,passe,fumet}-memory.md`，下期自動載入：
- **事實型（自動寫）**：把本期各編輯的「主題／標題」各 append 一行進它 memory 的「我寫過的主題」區；超過 ~12 期的最舊幾行刪掉（滾動，別讓檔變肥）。
- **準則型（AI 提議 → Terrel 確認才寫）**：若本期有總編／Terrel 的準則級校正（會「改變以後每期怎麼寫」的，像標題鐵則），整理成一條**第一人稱**學習筆記，用 **AskUserQuestion** 問 Terrel 要不要寫進該編輯的「我學到的準則」區——點頭才寫，沒有就跳過。
- 準則型一旦確認：順手同步進 `refs/voices.md`（規則正典）。**別記成模糊感想**——每條準則要可執行、附一句反例或檢驗法。

## 互動 gate 用法

gate 一律用 **AskUserQuestion**（你問、Terrel 答、再往下）——這是刻意的「AI 起草、人定稿」，跟選題的「AI 初選、人拍板」一致。問題要具體、可選，別丟一大塊叫他「看看」。

## 眉角 / 邊界

- **先找到人，再提技術**；**事實 > 一切**（對不回原文就拿掉或標存疑）。
- **草稿不是定稿**，交 Terrel／編輯潤。
- **Memory 已接**（2026-06-20）：開寫前各編輯 subagent 注入自己的 `*-memory.md`（soul＝我是誰、memory＝我學到/寫過什麼、voices＝怎麼寫）；定稿後依 step 9 回寫（事實型自動、準則型 Terrel 確認）。第一條種子＝Mise 標題鐵則。
- 改聲音→`refs/voices.md`；改底線→`refs/anti-slop.md`；改審核→`refs/chief-editor-checklist.md`；改人格→`docs/editors/*-soul.md`。
- 抓全文用 Firecrawl；整批抓不到就回報、別硬寫。
