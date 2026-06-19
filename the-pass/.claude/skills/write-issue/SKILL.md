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
| **Mise** | 兩篇長文（一起寫，能差異化） | mise-soul + voices(Mise) + anti-slop + 兩篇全文 + 切角 |
| **Passe** | 全部快訊（一起寫，不重疊/不撞 Mise 角度） | passe-soul + voices(Passe) + anti-slop + 各篇全文 + Mise 題目 |
| **Fumet** | 一個提問 | fumet-soul + voices(Fumet) + anti-slop + **寫好的兩篇長文** |
| **總編** | 審整期 | chief-editor-checklist + 全部草稿 + 各篇 factsUsed + 原文 |

編輯/總編用**主模型**（品質優先，別降級）。

## 開工前確認

- 工作目錄在 `the-pass/`；本期已跑過 `/selection-report --save`，有 `data/sr/<date>/selected.json`。
- 若選題會改過（換稿/換切角），以會議決定為準（Terrel 告知或編 selected.json）。
- orchestrator 先讀好要注入 subagent 的素材：`refs/voices.md`、`refs/anti-slop.md`、`docs/editors/{mise,passe,fumet}-soul.md`、`refs/chief-editor-checklist.md`。**把相關內容直接放進 subagent 的 prompt**（subagent 不需自己找檔）。

## 工作流（含 3 個互動 gate）

### 1 · 讀 selected.json
取本期 `selected[]`（feature=Mise 長文、quick=Passe 快訊，各帶 angles）+ `fumet` 種子。

### 2 · 抓全文（Firecrawl，不可跳過）
對每篇 `link` 抓全文（firecrawl）。寫作只能依抓回來的內容；抓不到的標「待補源」、不硬寫。

### 3 · 頭條長文 + 🚦GATE 1（聲音校準）
先 spawn **Mise subagent 只寫頭條那篇**（feature 第一篇，用它的切角）。拿回草稿後 **停下來，用 AskUserQuestion 問 Terrel**：
- 「聲音對嗎？太硬/太軟/太 AI？」「切角這樣進入 OK 嗎？」「哪裡要調？」

依回饋（必要時帶著 Terrel 的話重 spawn Mise）調到對，**才往下**。第一次跑這關最重要——別一次寫 6 篇才發現語氣不對。

### 4 · 其餘長文 + 快訊（並行）
聲音定了後：spawn **Mise subagent 寫第二篇長文**、spawn **Passe subagent 寫全部快訊**（並行）。每個 subagent 回傳結構化：
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

## 互動 gate 用法

gate 一律用 **AskUserQuestion**（你問、Terrel 答、再往下）——這是刻意的「AI 起草、人定稿」，跟選題的「AI 初選、人拍板」一致。問題要具體、可選，別丟一大塊叫他「看看」。

## 眉角 / 邊界

- **先找到人，再提技術**；**事實 > 一切**（對不回原文就拿掉或標存疑）。
- **草稿不是定稿**，交 Terrel／編輯潤。
- **Memory 回寫**（把本期寫了什麼記進 `docs/editors/*-memory.md`、下期載入）是下一步、目前先不做——但 subagent 架構已預留：哪天接上，就在各編輯 subagent 的 prompt 多注入它的 memory。
- 改聲音→`refs/voices.md`；改底線→`refs/anti-slop.md`；改審核→`refs/chief-editor-checklist.md`；改人格→`docs/editors/*-soul.md`。
- 抓全文用 Firecrawl；整批抓不到就回報、別硬寫。
