---
name: commission
description: 用 The Pass（出菜口）指定的一位 AI 編輯（Mise／Passe／Fumet／Amuse）寫單獨一篇——可以是「一個來源」、也可以給「題目＋多篇素材」讓他綜整成一篇觀點綜編、或給一個「粗方向」讓他自己研究後再寫。Make sure to use this skill whenever Terrel wants to 指定編輯寫一篇／用 Mise（或 Passe／Fumet／Amuse）寫這個連結／把這幾篇素材綜整成一篇／給某編輯幾個連結寫一篇綜述／給一個方向讓編輯研究後寫／單篇委稿／用 Amuse 吐槽這篇——即使沒講 skill 名字（例如「用 Fumet 寫這篇 <url>」「給 Mise 這 4 篇綜整成一篇談 X 的長文」「拿這幾個連結請 Passe 寫成一則」「給 Fumet 一個方向讓他查完再寫」「用 Amuse 吐槽這篇 <url>」）也要觸發。共用 /write-issue 的同一套編輯人格檔（soul＋voices＋memory），聲音與記憶一致；harness：orchestrator 取得/研究素材 → 互動 gate（選題／大綱／定稿）→ 指定編輯 subagent 寫（觀點綜編 D）→ 總編事實核查 → 附參考連結。不要用於：出整期（/write-issue）、跑選題（/selection-report）、改來源（/audit-sources）。
---

# /commission — 指定一位編輯，寫一篇

à la carte 版的寫稿：不出整期，就**一位編輯、一篇稿**。你是 **orchestrator**：取得（或讓編輯研究）素材 → 在幾個停點問 Terrel → spawn 那位編輯 subagent 寫 → 總編事實核查 → 交付。

**核心設計：共用 /write-issue 的同一套編輯源頭檔，不另立人格。** 同一位編輯不管出整期還是單篇委稿，聲音完全一致；記憶（若回寫）累積在同一份檔。**編輯＝可重用人格模組，這個 skill 只是另一個工作流外殼。**

## 一個 skill、三種輸入（自適應）

依「素材哪來」與「想要多少把關」自動選路徑——但**事實核查與定稿 gate 永遠都有**。

| 模式 | 輸入 | 走法 |
|---|---|---|
| **A · 單源** | 一個連結／貼文／題目 | 預設**輕**：取得 → 寫 → 總編核 → 定稿 gate。（想要選題/大綱 gate？Terrel 說「走完整流程」就開）|
| **B · 多源綜述** | 題目 ＋ **2 篇以上**素材 | **完整 gated**：摘要 → 🚦選題 → 大綱 → 🚦大綱 → 寫(D) → 總編核 → 🚦定稿 |
| **C · 研究後寫** | 只有**粗方向**、沒素材 | 編輯先**自己研究**（firecrawl/scout）→ 🚦研究回報 → 接 B 的選題後流程 |

**怎麼判路徑**：數素材數（0＝C、1＝A、2+＝B）＋ 看語意（「綜整這幾篇」＝B、「給你方向自己查」＝C）。不確定就用 **AskUserQuestion** 問，別猜。Terrel 一句話可覆寫（如「單源但走完整流程」「這方向你自己研究」）。

## 何時用 / 不用
- **用**：手上有來源（一個或多個）、或只有一個方向，想**指定某位編輯**寫成一篇。
- **不用**：出整期（→ /write-issue）；跑選題（→ /selection-report）；改來源（→ /audit-sources）。

## 編輯與檔案對照（共用源頭，改一次到處生效）

| 編輯 | 人格 | 聲音 | 記憶 | 預設體裁 |
|---|---|---|---|---|
| **Mise** | `docs/editors/mise-soul.md` | `voices.md`（Mise 段） | `docs/editors/mise-memory.md` | 長文（觀點綜編 D）約 500–900 字、場景式、從具體的人切入 |
| **Passe** | `docs/editors/passe-soul.md` | `voices.md`（Passe 段） | `docs/editors/passe-memory.md` | 快訊、一句話講清、事實夠硬 |
| **Fumet** | `docs/editors/fumet-soul.md` | `voices.md`（Fumet 段） | `docs/editors/fumet-memory.md` | 長文（觀點綜編 D）沉靜、從現象叩問文化假設／留一個提問 |
| **Amuse** | `docs/editors/amuse-soul.md` | `voices.md`（Amuse 段） | `docs/editors/amuse-memory.md` | 特別企劃·吐槽（**預設走 A、不走 D**）約 300–600 字、先自嘲後諷刺 |

> **檔案位置**：`*-soul.md`／`*-memory.md` 在 `docs/editors/`；`voices.md`／`anti-slop.md`／`chief-editor-checklist.md` 是與 /write-issue **共用的同一份**，在 `.claude/skills/write-issue/refs/`。改一份、兩個 skill 一起生效。

## 共用鐵則（三種模式都遵守）

- **觀點綜編（D）為長文預設**：完整交代來源 ＋ 一條編輯角度貫穿（≠只挑一條丟其餘＝A；≠中性摘要＝C；定義見 `write-issue/refs/voices.md`〈長文標準〉）。**A（原創、拿素材當跳板）只在 Terrel 明講「用 A」或編輯是 Amuse 時走。**
- **事實 > 一切，不捏造**：引號＝來源真有人說過、數字＝來源。寫稿一律附 `factsUsed`（每個主張 ← 對應哪一篇素材的哪一句）。對不回來源 → 拿掉或標存疑，**不自己亂修**。
- **先找到人，再講技術**：脊椎錨在一個具體的人／處境；綜述拿來補脈絡，別把多篇平均成一篇無臉稿。
- **付費牆政策**（沿用 /write-issue）：硬新聞牆找公開源否則退；觀點牆但免費預覽自成一體 → 只報現象＋透明標註；絕不憑預覽假裝讀過全文。
- **標題鐵則**：看得出主題 ＋ 勾得起好奇，兩端都不偏（見 voices.md）。
- **附參考連結**：成稿文末列出用到的來源連結——透明交代「讀了什麼」，是 multi-source／研究後寫的信任錨。

## 工作流

### 0 · 開工：定編輯、判路徑
從 Terrel 的話定出**編輯**與**路徑（A/B/C）**；缺編輯或缺輸入就用 **AskUserQuestion** 問。記下體裁（預設依編輯、可覆寫）與是否指定角度。

### 1 · 取得素材
- **A/B（你給素材）**：URL → Firecrawl 抓全文（抓不到就說、不硬寫，可請 Terrel 改貼內文）；貼文／內文 → 照收。
- **C（編輯自己研究）**：orchestrator 用 **firecrawl 搜尋**（或 scout 的在地語言/跨區主題查、或 deep-research）就 Terrel 給的方向**bounded** 蒐集（建議 **3–6 篇**、控 credits）→ 抓回候選來源的標題＋摘要＋連結（必要時抓全文）。**研究一個主題別硬套 scout 的 `--tbs qdr:m`（那是『每期新鮮度』用的）**——一個趨勢的關鍵來源常比一個月舊，用更寬／不限時間窗（先寬找、再用品味挑、汰掉純舊聞）；窗太窄會回 0 篇。
- 多素材時：讀完**所有**素材 → 產一份「**素材摘要 ＋ fact-map**」（每篇講什麼、關鍵事實/引述、哪裡互相打架）。這份是後面綜述與事實核查的底。**確認每篇都抓到文末**——長文／外文（西、韓、日）scrape 常被截斷、漏掉後半段的來源或人物；fact-map 這步就是抓「半截來源」的關卡（抓不全就重抓或換 reader 模式）。

### 1.5 · 🚦 GATE 研究回報（**只在 C**）
把「我找到這幾篇（標題＋連結＋一句摘要）＋ 我建議的 1–2 個切入方向」用 **AskUserQuestion** 給 Terrel：**這些源 OK 嗎？要不要加/換？往哪個方向？** 他把關後才往下——因為素材是編輯自己挑的，動筆前先讓他看一眼，擋掉爛源/淺角度/漏掉的關鍵素材。

### 2 · 🚦 GATE 選題（B、C 預設開；A 預設略，Terrel 要才開）
spawn 那位**編輯 subagent**（注入其 soul＋memory＋voices 段＋anti-slop＋素材摘要），請他用自己的人設讀完素材 → 提 **3 個「不同角度」**的題目（不是三個改寫；各附「**從哪個人/處境切入**」＋一句為什麼）。把 3 個角度 ＋「我讀到的素材摘要」用 **AskUserQuestion** 給 Terrel：**選一個 / 自己給題 / 調**。

### 3 · 大綱 ＋ 🚦 GATE 大綱（B、C 預設開；A 預設略）
編輯 subagent 依選定角度出**大綱**：開頭從誰切入、段落骨架、**每段用哪幾篇來源**、標題候選，**明寫「脊椎錨在哪個人」**。用 **AskUserQuestion** 給 Terrel：approve／調角度／換錨的人／搬段落。（在大綱就鎖「先找到人」，別等寫完才發現是無臉綜述。）

### 4 · 寫稿（編輯 subagent）
spawn **一個**編輯 subagent（主模型、品質優先），乾淨 context 只注入那位編輯的：soul ＋ memory ＋ `voices.md`（該編輯段 ＋〈長文標準〉）＋ `anti-slop.md` ＋ **素材全文/摘要** ＋ 選定角度與大綱 ＋ 體裁要求。**長文＝觀點綜編 D：完整交代來源、別為角度丟重要事實，用切角貫穿、用編輯聲音、字數依訊息量約 500–900（密的觀點題可略超，別為湊字硬砍）。** 回傳結構化：
```
{ title, draft, factsUsed: [{ claim, source }], sources: ["用到的連結", ...] }
```
為什麼用 subagent：乾淨 context 只裝這位編輯，聲音最純、不被主對話脈絡干擾。

### 5 · 總編事實核查（**永遠跑**）
spawn **總編 subagent**（注入 `chief-editor-checklist.md` ＋ 草稿 ＋ factsUsed ＋ 素材），逐項核：**每個主張溯得回某篇素材？引述/數字歸屬對？沒縫出任何單一來源都不支持的 Frankenstein 主張？anti-slop？先找到人？** 回傳問題清單（哪句有疑、為什麼）。多源綜述 Frankenstein 風險最高，這關是守「從不騙你」的命脈——所以單源也跑（成本低、保險）。

### 6 · 🚦 GATE 定稿
把 `title ＋ draft ＋ 總編核查結果（含未過項）＋ 文末參考連結` 用 **AskUserQuestion** 給 Terrel：**採用 / 調哪裡（語氣・角度・長度）/ 重寫**。要改 → 帶著他的話重 spawn（改寫重跑 step 4–5）。事實對不回來源時：拿掉、他確認、或去查證——**不自己亂修**。

### 7 · 交付
預設**回在對話裡**（單篇委稿多半即用），文末附參考連結。Terrel 要存檔 → Obsidian：
`/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass/委稿/<date> <編輯> <標題>.md`（標題＋內文＋署名＋參考連結）。

### 8 · 回寫記憶（**預設不寫**；Terrel 說了才寫）
單篇委稿常是實驗/一次性，**預設不動 memory**，免得污染編輯「我寫過的主題」正典（只有 /write-issue 出刊的算正典）。
- Terrel 說「**收進 <編輯> 記憶**」→ 在該 `*-memory.md`「## 我寫過的主題／標題」append 一行：`<date>｜〈標題〉｜一句簡述；角度＝…｜（委稿）`；滾動保留近 ~12 行。
- 有**準則級**校正 → 照 /write-issue step 9：第一人稱一條、用 **AskUserQuestion** 問要不要寫進「## 我學到的準則」，點頭才寫，並同步進 `voices.md`。

## 眉角 / 邊界
- **不另立人格**：soul／voices／memory／anti-slop／chief-editor-checklist 全沿用 /write-issue——優化編輯只改那幾個源頭檔，兩個 skill 一起生效。
- **C 的研究要 bounded**：給 firecrawl 的 query 控量（3–6 篇）、別無限撈；研究只為「找到夠寫一篇的料」，不是出選題報告（那是 /selection-report）。
- **gate 密度可調**：A 預設輕（總編＋定稿），B/C 預設完整（＋選題＋大綱）；Terrel 隨時可加/減（「這篇略過選題 gate」「單源也走完整」）。
- **一篇就好**，不自動延伸成整期；要整期請走 /write-issue。
- 草稿不是定稿——交 Terrel／編輯潤。
