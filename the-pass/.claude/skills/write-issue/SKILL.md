---
name: write-issue
description: 把 The Pass（出菜口）選題會拍板的稿，寫成整期文章草稿。Make sure to use this skill whenever Terrel wants to 寫這期／把選的稿寫成文章／出刊草稿／開始寫稿／生本期內容／write the issue／draft the articles／寫長文＋快訊＋Fumet——即使沒講 skill 名字（例如「來寫這期」「把這 6 篇寫出來」「生一版草稿」「開始撰寫」）也要觸發。流程：讀本期選的稿 + 切角 → 抓每篇全文查證 → 三位編輯（Mise 長文／Passe 快訊／Fumet 提問）各用自己的聲音寫 → 總編 7 項審核 → 草稿寫進 Obsidian。在 /selection-report 之後用。不要用於：跑選題（那是 /selection-report）、改來源（/audit-sources）。

---

# /write-issue — 把選題寫成整期草稿

選題會拍板後跑。把本期選出的稿，用三位編輯各自的聲音寫成草稿，再經總編 7 項審核。**核心是「不捏造」**：寫之前一定先抓全文，所有引號與數字都對回原文（見 `refs/anti-slop.md` 的最高原則）。

## 開工前確認

- **工作目錄在 `the-pass/`**。
- 本期已跑過 `/selection-report --save`，存在 `data/sr/<date>/selected.json`（本期選的稿 + 切角 + Fumet 種子）。
- 若選題會**改過**（換稿／換切角），以會議決定為準：請 Terrel 告知，或直接編輯 `selected.json` / 貼上「匯出決定」的 Markdown。
- 寫作前**務必先讀**：`refs/voices.md`、`refs/anti-slop.md`，以及每位編輯的 `docs/editors/{mise,passe,fumet}-soul.md`（人格的「為什麼」）。

## 工作流

### 步驟 1 · 讀本期選稿

讀 `data/sr/<date>/selected.json`：`selected[]`（每篇有 role=feature/quick、editor、title、source、link、lang、date、hook、angles）+ `fumet` 種子。確認哪些是 Mise 長文（feature）、哪些是 Passe 快訊（quick）。

### 步驟 2 · 抓全文查證（關鍵，不可跳過）

對**每一篇**選稿的 `link`，用 Firecrawl 抓全文（firecrawl scrape / firecrawl-scrape skill）。寫作只能根據抓回來的內容；抓不到全文的，標記「待補源」、不硬寫。這一步同時是查證：所有要用的引號、數字、人名、職稱都要能在全文裡找到。

### 步驟 3 · 各編輯寫稿（載入各自聲音）

- **長文（Mise）**：每篇用 selected.json 給的切角當進入點，依 `refs/voices.md`（Mise 段）+ `mise-soul.md` 寫 400–600 字、場景開頭、第二人稱、不收束、結尾留真問題。
- **快訊（Passe）**：依 Passe 段寫 2–4 句、第一句即事實、配國旗 emoji 標題 + 2 tag。避免重複 Mise 角度。
- 全程守 `refs/anti-slop.md`（禁開頭／詞彙／結構 + 四原則 + 事實不可扭曲）。

### 步驟 4 · Fumet 提煉

讀寫好的 Mise 長文，依 `refs/voices.md`（Fumet 段）+ `fumet-soul.md` 從一個具體細節提煉一個真開放問題（100–250 字、粗體結尾）。**不是從候選池選稿**。

### 步驟 5 · 總編審核

依 `refs/chief-editor-checklist.md` 對整份草稿跑 7 項。標出問題 → 自己回頭修 → 再過一次，直到每篇「可發佈」。結尾附審核摘要。

### 步驟 6 · 輸出草稿

把整期草稿寫成一份 Markdown：`/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass/文章草稿/<date> 出刊草稿.md`，內含：
- 每篇長文／快訊（標題、內文、署名、來源連結）
- Fumet 提問
- 文末「總編審核摘要」（哪些通過、哪些修過什麼）
- 文末「待補／存疑」清單（抓不到源或數字對不上的）

然後跟 Terrel 回報：寫了幾篇、審核狀態、有沒有待補項。**草稿給人過目，不自動發佈**（發佈是之後接 Ghost 的事）。

## 眉角 / 邊界

- **先找到人，再提技術**：每篇都從具體的人／處境寫起。
- **事實 > 一切**：寧可少寫一句，不多編一句；引號數字對不回原文就拿掉或標存疑。
- **草稿不是定稿**：交給 Terrel／編輯潤。Memory 回寫（把本期寫了什麼記進 `docs/editors/*-memory.md`）是下一步、目前先不做。
- **改聲音規則**：`refs/voices.md`；**改底線**：`refs/anti-slop.md`；**改審核**：`refs/chief-editor-checklist.md`；**改人格**：`docs/editors/*-soul.md`。
- 抓全文用 Firecrawl；若整批來源都抓不到，回報 Terrel 別硬寫。
