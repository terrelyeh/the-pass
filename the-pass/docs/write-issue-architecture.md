# /write-issue — AI 編輯室的核心架構

> The Pass 出菜口｜建立 2026-06-19、更新 2026-06-20（接編輯 Memory）。
> 這份文件說明 `/write-issue` 怎麼把「選題會拍板的稿」變成「一期文章草稿」。這是 AI 編輯室最核心的一塊。

## 一句話

選題決定**寫什麼**；`/write-issue` 負責**怎麼寫**。一個總指揮（orchestrator）調度四位 AI 編輯（各是獨立的 subagent），抓原文查證、各用自己的聲音寫、總編查核，中間設三個停點讓人拍板，最後產出草稿。核心精神:**AI 起草、人定稿。**

## 為什麼是「四個獨立 subagent」，不是一個 AI 全寫

如果讓同一個 AI 在同一個腦袋裡寫完三種編輯的稿，聲音會互相滲透（寫完 Mise 馬上寫 Passe，語氣會糊）。所以每位編輯各開一個 **subagent**——獨立的工作分身，腦袋裡**只裝自己的人格 + 自己要寫的原文**，其他什麼都不知道。聲音因此乾淨。總編也是獨立 subagent，沒參與寫作，純挑錯，不會自審偏心。

（這跟 `/selection-report` 用 Haiku 子代理粗篩是同一套「harness」思路:能隔離的隔離、能並行的並行、有依賴的排序。）

| 角色 | 是誰 | 腦袋裡裝什麼 | 產出 |
|---|---|---|---|
| **orchestrator** | 總指揮（你跑 skill 時的主代理） | 全期流程、selected.json、抓回來的全文 | 不自己寫稿;調度、組裝、在 gate 問你、出稿 |
| **Mise** subagent | 長文編輯 | mise 人格 + 兩篇長文的原文 + 切角 | 2 篇「今日觀察」（場景式、400–600 字） |
| **Passe** subagent | 快訊編輯 | passe 人格 + 各快訊原文 | 4 則「本期快訊」（事實先行、2–4 句） |
| **Fumet** subagent | 提問者 | fumet 人格 + **寫好的兩篇長文** | 1 個結尾提問（從長文提煉、不選稿） |
| **總編** subagent | 品管 | 7 項審核清單 + 全部草稿 + 各篇 factsUsed + 原文 | 逐篇 verdict（可發佈／待修） |

## 完整流程（含 3 個互動 gate）

```
選題會拍板（選什麼 + 切角）
        │  selected.json
        ▼
1. orchestrator 抓每篇全文（Firecrawl）── 查證的素材，不抓到不硬寫
        ▼
2. Mise subagent 寫頭條長文
        ▼
   🚦 GATE 1（聲音校準）── 停，問你:聲音對嗎?切角 OK 嗎?  ← 人
        ▼
3. Mise 寫第二篇長文  ‖  Passe 寫四則快訊   （並行）
        ▼
4. Fumet subagent 從兩篇長文提煉提問
        ▼
5. 總編 subagent 跑 7 項審核 + 逐條對事實
        │
        ├─ 🚦 GATE 2（事實對不上隨時停）── 數字/引述對不回原文 → 停，問你:拿掉/查證/你確認  ← 人
        ▼
   🚦 GATE 3（發佈前必停）── 整期草稿 + 審核結果 → 你逐篇定奪:採用/改/退  ← 人
        ▼
6. 出稿 → Obsidian「文章草稿/<date> 出刊草稿.md」（含總編摘要 + 待補清單 + 來源）
        ▼
   你/編輯潤 → 發佈（Ghost / 網頁，未來）
```

每個 subagent 寫完，除了草稿還回傳一份 **factsUsed**:「我用了哪個數字／引述 ← 對應原文哪一句」。總編就靠這個逐條對事實，而不是憑感覺。

## 三個守門原則（為什麼這樣設計）

1. **事實不可扭曲**:引號＝原文真有人說過、數字＝原文。寫之前一定先抓全文。付費牆只有預覽 → 只報「現象」、透明標註、找公開來源佐證，不憑預覽編造。
2. **AI 起草、人定稿**:三個 gate 都停下來問人。AI 不替你做最終決定——跟選題的「AI 初選、人拍板」同一個哲學。
3. **聲音隔離**:四個 subagent 各自獨立，聲音不互相污染、總編不自審。

## 各部分住在哪（要改去哪改）

| 想改什麼 | 改這個檔 |
|---|---|
| 編輯的**人格／為什麼這樣寫** | `docs/editors/{mise,passe,fumet}-soul.md` |
| 編輯的**聲音規則／怎麼寫** | `.claude/skills/write-issue/refs/voices.md` |
| **反 AI slop + 事實底線** | `.claude/skills/write-issue/refs/anti-slop.md` |
| **總編 7 項審核** | `.claude/skills/write-issue/refs/chief-editor-checklist.md` |
| **整個流程／gate** | `.claude/skills/write-issue/SKILL.md` |

## 檔案架構（skill 由什麼組成）

```
.claude/skills/write-issue/          ← skill 本體
├── SKILL.md                         工作流：orchestrator 調度、3 個 gate、step 9 回寫記憶
└── refs/                            跑稿時注入編輯分身的「規則」
    ├── voices.md                    三位的寫作守則（怎麼寫）＋ 標題鐵則
    ├── anti-slop.md                 反 AI 味的底線
    └── chief-editor-checklist.md    總編 7 項審核清單

# skill 會「讀進來」、但不放在 skill 內的外部檔：
docs/editors/
├── {mise,passe,fumet}-soul.md       人格核心（為什麼這樣寫，團隊原作、很少改）
└── {mise,passe,fumet}-memory.md     記憶（學到的準則＋寫過的主題，每期長）

data/sr/<date>/selected.json         輸入：選題拍板的稿＋切角（/selection-report 產）
→ Obsidian 文章草稿/<date>.md         輸出：草稿（待人定稿）
→ public/issue-<date>.html           輸出：內容頁（上 thepass.cc）
```

跑稿時每個分身**只**注入「自己的」那幾份（聲音才不互相污染）：

| 分身 | 注入什麼 |
|---|---|
| **Mise** | mise-soul ＋ mise-memory ＋ voices(Mise) ＋ anti-slop ＋ 兩篇原文＋切角 |
| **Passe** | passe-soul ＋ passe-memory ＋ voices(Passe) ＋ anti-slop ＋ 各篇原文 |
| **Fumet** | fumet-soul ＋ fumet-memory ＋ voices(Fumet) ＋ anti-slop ＋ 寫好的兩篇長文 |
| **總編** | checklist ＋ 全部草稿 ＋ factsUsed ＋ 原文（**不**注入記憶，純挑錯不偏心） |

## 三層：Soul → Memory → Voices（編輯的「大腦」）

每位編輯有三層設定，跑稿時組起來才成為他實際的指令：

```
Soul（我是誰）       ── 價值觀、背景、好惡＝為什麼這樣寫。很少變。 docs/editors/*-soul.md
Memory（學到/寫過）  ── 校正過的準則＋寫過的主題。每期長。       docs/editors/*-memory.md
Voices（怎麼寫）     ── 可執行的寫作規則與招式。偶爾調。        refs/voices.md
   ↓ 三層＋原文，組成 →
subagent 的 prompt   ── 叫那位編輯動筆。
```

### 編輯 Memory：怎麼讓三位越寫越像「自己」（2026-06 接上）

養「虛擬 KOL」的核心——校正過的東西不會說完就忘，會永久變成編輯的能力。記憶放兩種：

- **① 我學到的準則**：總編／Terrel 校正過、會改變以後每期怎麼寫的規則，用第一人稱記成學習筆記。例：首期標題被改後，Mise 記下「標題要看得出主題＋勾得起好奇，兩端都不能偏」。
- **② 我寫過的主題**：每期寫了哪些題目／標題各一行，下期載入 → 不重複角度。滾動保留近 ~12 期。

**飛輪（每期一圈）**：開寫前各編輯載入自己的 Soul＋Memory＋Voices → 寫 → 定稿後回寫（主題自動記、準則 Terrel 確認才記）→ 下期帶著上期的學習寫。

**治理**：事實型（寫過的主題）每期自動記；準則級（像標題鐵則）AI 提議、Terrel 點頭才寫進記憶——同樣「AI 起草、人定稿」。

## 怎麼讓編輯越寫越好（優化的旋鈕）

1. **調 Style Guide（最常用、最快）**:`refs/voices.md` 改寫作規則（例如「Mise 要更口語」「Passe 標題再短」）。
2. **調人格**:`docs/editors/*-soul.md` 改動機與好惡——影響的是「選什麼角度、在乎什麼」，比規則更深層。
3. **加範例**:在 refs 放「好/壞對照」範例，比抽象規則更有效（AI 很會學樣）。
4. **編輯 Memory（已接 2026-06）**:每期寫完把「寫了什麼、讀者反應」記進 `docs/editors/*-memory.md`，下期載入 → 編輯記得自己學過／寫過什麼、不重複、越來越貼品味。見上方〈編輯 Memory〉。
5. **用 skill-creator 迭代**:跑幾期、人回饋、改 refs、再跑——把聲音系統性磨準，而不是憑單次手感。
6. **gate 的回饋就是訓練訊號**:你在 GATE 1/3 改的東西（像把切角 A 改 B），就是該回寫進 refs/soul 的線索。
