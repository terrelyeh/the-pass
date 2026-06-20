---
name: commission
description: 用 The Pass（出菜口）指定的某一位 AI 編輯（Mise／Passe／Fumet），把一個特定來源（網址／一段貼文／題目）寫成單獨一篇。Make sure to use this skill whenever Terrel wants to 指定編輯寫一篇／用 Mise（或 Passe／Fumet）寫這個連結／單篇委稿／幫我用某編輯的口吻寫這則新聞／給一個來源請特定編輯撰寫——即使沒講 skill 名字（例如「用 Fumet 寫這篇 <url>」「這則給 Passe 寫成快訊」「拿這段請 Mise 寫」）也要觸發。共用 /write-issue 的同一套編輯人格檔（soul＋voices＋memory），聲音與記憶一致：orchestrator 抓全文 → spawn 那位編輯 subagent 寫一篇 → 一道輕量 gate → 可選回寫記憶。不要用於：出整期（/write-issue）、跑選題（/selection-report）、改來源（/audit-sources）。
---

# /commission — 指定單一編輯，單篇委稿

à la carte 版的寫稿：不出整期，就**一位編輯、一個來源、一篇稿**。你是 **orchestrator**：抓來源 → 載入指定編輯的人格檔 → spawn 那位編輯 subagent 寫 → 一道 gate 給 Terrel 定奪 → （他說了才）回寫記憶。

**核心設計：共用 /write-issue 的同一套編輯源頭檔，不另立人格。** 同一位編輯不管出整期還是單篇委稿，聲音完全一致；記憶（若回寫）也累積在同一份檔，編輯從兩條管道一起「越寫越像自己」。**編輯＝可重用的人格模組，這個 skill 只是另一個工作流外殼。**

## 何時用 / 不用

- **用**：手上有一個特定網址、一段文字、或一個題目，想**指定某位編輯**寫成一篇。
- **不用**：出整期（→ /write-issue，讀 selected.json、多篇＋總編＋三 gate）；跑選題（→ /selection-report）；改來源（→ /audit-sources）。

## 開工前

- 工作目錄在 `the-pass/`。
- 需要兩個輸入：**① 哪位編輯　② 來源**（URL／貼文／題目＋切角）。缺哪個就先用 **AskUserQuestion** 問 Terrel，別猜。
- 編輯／體裁可由 Terrel 一句話指定並覆寫預設（如「用 Mise 寫成快訊長度」）。

## 編輯與檔案對照（共用源頭，改一次到處生效）

| 編輯 | 人格（我是誰） | 聲音（怎麼寫） | 記憶（寫過/學到） | 預設體裁 |
|---|---|---|---|---|
| **Mise** | `docs/editors/mise-soul.md` | `voices.md`（Mise 段） | `docs/editors/mise-memory.md` | 長文（觀點編譯 D）約 500–900 字、場景式、從具體的人切入 |
| **Passe** | `docs/editors/passe-soul.md` | `voices.md`（Passe 段） | `docs/editors/passe-memory.md` | 快訊、一句話講清、事實夠硬 |
| **Fumet** | `docs/editors/fumet-soul.md` | `voices.md`（Fumet 段） | `docs/editors/fumet-memory.md` | 長文（觀點編譯 D）沉靜、從現象叩問文化假設／或留一個提問 |

共用底線：`anti-slop.md`（**最高原則：不捏造**，引號與數字都要對得回來源）。

> **檔案位置**：`*-soul.md`／`*-memory.md` 在 `docs/editors/`；`voices.md`／`anti-slop.md` 是與 /write-issue **共用的同一份**，目前放在 `.claude/skills/write-issue/refs/`。改一份、兩個 skill 一起生效——這就是「不另立人格」。

## 工作流

### 1 · 確定編輯 + 來源
從 Terrel 的話判定編輯與來源；缺就問。**長文預設走「觀點編譯（D）」**——完整交代來源 ＋ 一條角度貫穿（定義見 `write-issue/refs/voices.md`〈長文標準：觀點編譯〉）。記下體裁（預設依編輯，可覆寫）與切角（他給就照給，沒給編輯自己挑最有力的當 through-line——但 D 是「角度貫穿、不是只挑一條丟其餘」，先找到人）。

> 想要 A（只挑一條深寫、其餘捨棄的原創稿）時，Terrel 會明講「用 A／只寫某一條」；沒講就是 D。

### 2 · 取得來源全文（不可跳過）+ 付費牆政策
- **URL** → Firecrawl 抓全文。寫作只能依抓回的內容；抓不到 → 告知、不硬寫（可請 Terrel 改貼內文）。
- **貼文／內文** → 直接用。
- **只有題目、沒有來源** → 可寫，但**全程標明「未經來源佐證、屬觀點發想」**，且引號／數字一律不可捏造（沒有就不寫具體數字）。
- **付費牆**（內容被截斷、出現 subscribe／continue reading）→ 照 /write-issue 政策：硬新聞牆（關鍵事實在牆後）找公開來源佐證，找不到就不寫；觀點／隨筆牆但免費預覽已含完整立場 → 可寫但**只報那個現象、透明標註「付費牆預覽、僅用免費段」**。絕不憑預覽假裝讀過全文。

### 3 · spawn 指定編輯 subagent 寫一篇
spawn **一個** subagent（用主模型，品質優先），context **只注入那位編輯**的：soul ＋ memory ＋ `voices.md`（該編輯那段 ＋〈長文標準：觀點編譯〉）＋ `anti-slop.md` ＋ 來源全文 ＋（切角／指定角度當 through-line）＋ 模式與體裁要求（**長文＝觀點編譯 D：完整交代來源、別為角度丟重要事實，但用切角貫穿、用編輯聲音；字數依訊息量約 500–900**）。請它回傳結構化：
```
{ title: "...", draft: "...", factsUsed: [{ claim: "用了什麼數字/引述", source: "對應原文哪一句" }] }
```
- 標題照**標題鐵則**（看得出主題 ＋ 勾得起好奇，兩端都不偏——見 voices.md）。
- 為什麼用 subagent：乾淨 context 只裝這位編輯，聲音最純、不被你主對話的脈絡干擾。

### 4 · 🚦 GATE（呈現草稿，停下來問）
把 `title ＋ draft ＋ factsUsed`（哪句話對哪段原文）呈現給 Terrel，用 **AskUserQuestion** 讓他定奪：**採用 / 調哪裡（語氣・切角・長度）/ 重寫**。要改 → 帶著他的話**重 spawn 同一位編輯**，再過一次。事實對不回原文時：拿掉、或他確認、或去查證——**不自己亂修**。

### 5 · 交付
預設**回在對話裡**（單篇委稿多半即用）。Terrel 要存檔再存 Obsidian：
`/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass/委稿/<date> <編輯> <標題>.md`（標題＋內文＋署名＋來源連結）。

### 6 · 回寫記憶（**預設不寫**；Terrel 說了才寫）
單篇委稿常是實驗／一次性／客戶單篇，**預設不動任何 memory**，免得污染編輯的「我寫過的主題」正典（只有 /write-issue 出刊的才算正典）。
- Terrel 說「**收進 <編輯> 記憶**」→ 在該 `*-memory.md` 的「## 我寫過的主題／標題」append 一行：`<date>｜〈標題〉｜一句簡述；切角＝…｜（委稿）`（標 `（委稿）` 以區別出刊稿）；滾動保留近 ~12 行。
- 若這次有**準則級**校正（會改變以後每期怎麼寫）→ 照 /write-issue step 9：整理成第一人稱一條、用 **AskUserQuestion** 問 Terrel 要不要寫進「## 我學到的準則」，點頭才寫，並同步進 `write-issue/refs/voices.md`。

## 眉角 / 邊界

- **不另立人格**：soul／voices／memory／anti-slop 全部沿用 /write-issue 的檔——優化編輯只改那幾個源頭檔，兩個 skill 一起生效。
- **事實 > 一切**；**先找到人，再講技術**（同 anti-slop）。對不回來源就拿掉或標存疑。
- **一篇就好**，不自動延伸成整期；要整期請走 /write-issue。
- 草稿不是定稿——交 Terrel／編輯潤。
- 改聲音 → `write-issue/refs/voices.md`；改底線 → `write-issue/refs/anti-slop.md`（與出整期共用同一份）；改人格 → `docs/editors/*-soul.md`。
