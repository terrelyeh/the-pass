# 選題來源驗證 Checklist

> 目的：在把一個來源從 `status: "pending"` 升成 `"active"`（真正進 pipeline）前，
> 用同一套客觀標準驗證它「feed 接得進來」且「值得接」。
> 對應程式：[`src/lib/sources.ts`](../src/lib/sources.ts)

---

## 取材策略前提：兩條進料線

| | Stream A | Stream B |
|--|----------|----------|
| 路徑 | **飲食媒體 → 找 AI** | **AI 前沿 → 找飲食** |
| 抓到的故事 | 「某餐廳導入了 AI」 | 「某新 AI 能力將改變餐飲」 |
| 特性 | 已落地、有人味、在地 | 早、技術、全球 |
| 驗收重點 | feed 穩定 + AI 訊號 | feed 穩定 + **食物訊號密度** + 可翻譯性 |

Stream B 是「低產量、高價值的礦」，不是「穩定溪流」——驗收時**不要求每天有食物**，要求的是「偶爾撈得到、且撈到的夠獨家」。

---

## 驗證流程（每個 pending 來源跑一次）

### Step 1 — Feed 可用性

```bash
curl -sL -m 15 -A "ThePass/1.0 (RSS Reader)" \
  -o /tmp/feed -w "HTTP %{http_code} | %{content_type}\n" "<FEED_URL>"
head -c 600 /tmp/feed                       # 看是不是 XML/JSON
grep -oiE "<item|<entry" /tmp/feed | wc -l  # 數篇數
```

通過條件：
- [ ] HTTP `200`
- [ ] 回傳是 `<rss` / `<feed` / `<?xml`（RSS）或合法 JSON（feedType: json）
- [ ] item/entry 數 > 0
- [ ] 常見備援 endpoint 都試過（`/feed`、`/feed/`、`/rss`、`/rss.xml`、`/atom.xml`）

> 已知雷：
> - **HuggingFace** `/papers/rss` 回 401 → 改走 JSON API `https://huggingface.co/api/daily_papers`（feedType: `json`，需自訂 fetcher）。
> - **Restaurant Business** RSS 含未跳脫的 `&` → rss-parser 拋 `Invalid character in entity name`，需寬鬆 parser 或預清洗。

### Step 2 — 食物訊號密度（Stream B 必跑）

```bash
FOODKW='food|restaurant|chef|kitchen|cook|menu|recipe|dining|meal|ingredient|culinary|hospitality|grocery|nutrition|beverage|coffee|baking|farm|agri|gastronom|flavou?r|cuisine|dish|dietary'
# 全文掃（含內文/摘要），不要只看標題——一篇叫 RecipeGen 的論文，食物訊號在內文
grep -oiE "$FOODKW" /tmp/feed | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn
```

判讀：
- [ ] Stream A：合格門檻寬（來源本身就是食物媒體）
- [ ] Stream B：記錄「N 篇中有幾篇真的碰食物」。**0 食物 = 砍**（如 Sakana 實測 0 → pending 觀察）
- [ ] 排除誤判：`farm`→`platform`、`agri`→`paradigm`、`ai`→`available/again` 等 substring 假陽性要人工確認

### Step 2.5 — 取樣時間窗（避免單日偏誤）⚠️

RSS 只回傳「最近 N 篇」，所以一次快照涵蓋的時間長短，取決於來源產量——**密度數字必須搭配時間窗一起看**：

```bash
# 看抓回來的 N 篇實際橫跨幾天（oldest→newest pubDate）
```

- **低產量來源**（如 Momentum，10 篇 = 40 天）→ 一次快照≈一個月，密度可信。
- **高產量來源**（如 AI타임스/Tech in Asia，50 篇 = 1 天）→ 快照只看到一天，**單日密度會嚴重失真，不可據此下結論**。
- **正確做法**：
  - 有日期 API 的（如 HF `?date=`）→ 直接回測過去一個月（每週抽一天）。
  - 只有 RSS 的高產量來源 → 標 `pending` / 「profiling 中」，靠**累積池**每天抓、養 2–4 週後再 profile，別用 day-1 快照決定去留。
- **注意**：食物關鍵字也有假陽性（如 `taste` 比喻、`meal` 誤中），密度數字務必人工抽看標題確認，最終仍以 LLM 語意閘門為準。

### Step 3 — 可翻譯性（Stream B）

抽 1–2 則實際內容，問：能不能翻成 The Pass 的人話（先找到人，再提到技術）？
- [ ] ✅ 例：「Inverse Cooking」→「拍一張阿嬤的菜，AI 還原失傳食譜」
- [ ] ❌ 翻不出人味、只能照抄技術規格 → 不適合，會變 AI slop

### Step 4 — 落地

- [ ] 補上 `sources.ts` 的真實 `feedUrl`、修正 `language`/`category`
- [ ] `status` 改 `"active"`
- [ ] 重跑一次 pipeline 確認該來源有進 `activeSources` 且抓得到
- [ ] feedType: `json` 的來源 → 確認自訂 fetcher 已建

---

## 待驗證來源清單

### 前沿淘金 / 通用 AI（Stream B）

| 來源 | feed 狀態 | 食物密度 | 決議 |
|------|----------|---------|------|
| HuggingFace Papers | JSON API ✅（需自訂 fetcher） | 今日 100 篇 ≈ 1 篇 | 低產高值，建獨立淘金模組 |
| Sakana AI | Atom ✅ | 實測 0 | 砍/觀察 |
| Readwise Wisereads | RSS ✅（147 篇） | 通用 | 編輯靈感用，暫不進系統 |

### 亞洲在地候選（metadata 全為暫定 best-guess，需逐項確認）

- [ ] **Foovo**（JP food-tech）— `https://foovo.jp` — feedUrl?
- [ ] **SSNP 食品産業新聞社**（JP food industry）— `https://www.ssnp.co.jp` — feedUrl?
- [ ] **Techable**（JP tech）— `https://techable.jp` — feedUrl?
- [ ] **Thinkfood**（語言/網址待確認）— url? feedUrl?
- [ ] **AI타임스 / AI Times**（KR AI）— `https://www.aitimes.com` — feedUrl?
- [ ] **Platum**（KR startup）— `https://platum.kr` — feedUrl?
- [ ] **Techsauce**（TH tech）— `https://techsauce.co` — feedUrl?
- [ ] **Momentum Works / The Lowdown**（SEA tech）— `https://thelowdown.momentum.asia` — feedUrl?
- [ ] **e27**（SEA startup）— `https://e27.co` — feedUrl?
- [ ] **Tech in Asia**（pan-Asia tech）— `https://www.techinasia.com` — feedUrl?

> 提醒：The Pass 真正稀缺的是「餐飲**在地獨家**」（Foovo/SSNP/Thinkfood 這類 Stream A 食物媒體），
> 其餘多為 Stream B 通用 tech，邊際價值較窄——驗證時優先確認在地食物來源。
