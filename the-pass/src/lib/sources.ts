// === The Pass 選題來源 ===
// 兩種取材角度（取材策略見 memory: project_sourcing_angles）：
//   Stream A（食物 → 找 AI）：飲食媒體優先，篩有沒有提到 AI。已落地、有人味、在地。
//   Stream B（AI → 找飲食）：通用/前沿 AI 來源，篩有沒有碰到食物。早、技術、全球，需重度編輯翻譯。
// status: "active" 進 pipeline；"pending" 待驗證（feed 可用性 + 食物訊號密度，見 docs/source-verification-checklist.md）。

export type Stream = "A" | "B";
export type FeedType = "rss" | "json";
export type SourceStatus = "active" | "pending";

export interface Source {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  language: "en" | "ko" | "ja" | "th";
  category:
    | "ai-food-tech"
    | "food-industry"
    | "culture-opinion"
    | "ai-frontier"
    | "tech-startup";
  tier: 1 | 2 | 3 | 4 | 5;
  stream: Stream; // A = 食物→AI；B = AI→食物
  feedType: FeedType; // rss = rss-parser；json = 自訂 fetcher（如 HF API）
  status: SourceStatus; // active = 進 pipeline；pending = 待驗證
  description: string;
}

export const sources: Source[] = [
  // ============================================================
  // Stream A（食物 → 找 AI）— active
  // ============================================================

  // --- AI & Food Tech (English) ---
  {
    id: "the-spoon",
    name: "The Spoon",
    url: "https://thespoon.tech",
    feedUrl: "https://thespoon.tech/feed/",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Food tech media covering AI, robotics, and automation in food",
  },
  {
    id: "agfunder",
    name: "AgFunder News",
    url: "https://agfundernews.com",
    feedUrl: "https://agfundernews.com/feed",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "AgriFood tech investment and innovation news",
  },
  {
    id: "techcrunch-food",
    name: "TechCrunch (Food)",
    url: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/tag/food/feed/",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Tech news covering food startups and food tech",
  },

  // --- Food Industry (Korean) ---
  {
    id: "foodbank-kr",
    name: "식품외식경제",
    url: "https://www.foodbank.co.kr",
    feedUrl: "http://www.foodbank.co.kr/rss/allArticle.xml",
    language: "ko",
    category: "food-industry",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Korean food & restaurant industry news",
  },

  // --- Food Industry (English) ---
  {
    id: "restaurant-business",
    name: "Restaurant Business",
    url: "https://www.restaurantbusinessonline.com",
    feedUrl: "https://www.restaurantbusinessonline.com/rss.xml",
    language: "en",
    category: "food-industry",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active", // ⚠️ feed 目前解析失敗（XML 含未跳脫的 &），待修或換寬鬆 parser
    description: "US restaurant industry news and analysis",
  },
  {
    id: "nrn",
    name: "Nation's Restaurant News",
    url: "https://www.nrn.com",
    feedUrl: "https://www.nrn.com/rss.xml",
    language: "en",
    category: "food-industry",
    tier: 2,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Restaurant industry news, trends, and analysis",
  },

  // --- Culture & Opinion ---
  {
    id: "eater",
    name: "Eater",
    url: "https://www.eater.com",
    feedUrl: "https://www.eater.com/rss/index.xml",
    language: "en",
    category: "culture-opinion",
    tier: 3,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Food culture, restaurant news, and dining trends",
  },

  // ============================================================
  // Stream B（AI → 找飲食）— active
  // 食物密度低但偶有「比餐飲媒體早看到」的前沿題目。
  // 需經 scoreRelevance 濾出碰到食物的子集，再經編輯重度翻譯成人話。
  // ============================================================
  {
    id: "bens-bites",
    name: "Ben's Bites",
    url: "https://bensbites.com",
    feedUrl: "https://bensbites.com/feed",
    language: "en",
    category: "ai-frontier",
    tier: 4,
    stream: "B",
    feedType: "rss",
    status: "active",
    description:
      "Applied AI tools & agents newsletter; catches food-tech (kitchen robots, voice ordering) early",
  },
  {
    id: "synced",
    name: "Synced",
    url: "https://syncedreview.com",
    feedUrl: "https://syncedreview.com/feed/",
    language: "en",
    category: "ai-frontier",
    tier: 4,
    stream: "B",
    feedType: "rss",
    status: "active",
    description:
      "AI research & industry media with strong Asia coverage; occasional AI×food applications",
  },

  // ============================================================
  // Stream B 前沿淘金 / 候選 — pending
  // ============================================================
  {
    id: "hf-papers",
    name: "HuggingFace Daily Papers",
    url: "https://huggingface.co/papers",
    feedUrl: "https://huggingface.co/api/daily_papers", // 無 RSS（401），改走 JSON API（已驗證可用，支援 ?date=）
    language: "en",
    category: "ai-frontier",
    tier: 5,
    stream: "B",
    feedType: "json", // 需自訂 fetcher，rss-parser 無法消化
    status: "pending", // 低產量高價值：每日掃 ~100 篇撈食物子集（RecipeGen/FoodLMM 等）
    description:
      "Daily top AI papers ranked by votes; rare but earliest food-AI research (recipe gen, food vision, nutrition LMMs)",
  },
  {
    id: "sakana",
    name: "Sakana AI",
    url: "https://sakana.ai",
    feedUrl: "https://sakana.ai/feed", // Atom feed，已驗證可用
    language: "en",
    category: "ai-frontier",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending", // 測試食物密度 = 0，純研究室；保留觀察但暫不啟用
    description: "Japanese AI research lab blog; low frequency, near-zero food relevance",
  },
  {
    id: "readwise-wisereads",
    name: "Weekly Wisereads (Readwise)",
    url: "https://wise.readwise.io",
    feedUrl: "https://wise.readwise.io/feed", // RSS 已驗證可用（147 篇）
    language: "en",
    category: "culture-opinion",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending", // 通用精選長文，編輯靈感用途 > 新聞原料；暫不進系統
    description: "Curated weekly must-reads (AI, industry essays, books); editorial inspiration",
  },

  // ============================================================
  // 亞洲在地候選 — pending
  // ⚠️ 以下 metadata（language / category / feedUrl）為暫定 best-guess，
  //    待 docs/source-verification-checklist.md 逐一驗證後再啟用。
  // ============================================================
  {
    id: "foovo",
    name: "Foovo",
    url: "https://foodtech-japan.com",
    feedUrl: "https://foodtech-japan.com/feed/", // ✅ 驗證可用，密度 100%（培養肉/細胞農業/植物肉）；先前測錯網域 foovo.jp
    language: "ja",
    category: "ai-food-tech",
    tier: 3,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Japanese food-tech media（培養肉/精密發酵/食品機器人）; 補日本在地前沿食物源",
  },
  {
    id: "ssnp",
    name: "食品産業新聞社ニュース (SSNP)",
    url: "https://www.ssnp.co.jp",
    feedUrl: "https://www.ssnp.co.jp/feed/", // ✅ 驗證可用(30篇)，密度測試 ~28% 食物
    language: "ja",
    category: "food-industry",
    tier: 3,
    stream: "A",
    feedType: "rss",
    status: "active",
    description: "Japanese food industry news; 補日本在地食物來源（Stream A 缺口）",
  },
  {
    id: "techable",
    name: "Techable",
    url: "https://techable.jp",
    feedUrl: "https://techable.jp/feed", // ⚠️ 403 bot 防護（feed 存在但換 UA 仍擋，需爬蟲/特殊 header）
    language: "ja",
    category: "tech-startup",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending",
    description: "Japanese startup/tech media; feed 被 403 bot 防護擋住",
  },
  {
    id: "thinkfood",
    name: "Thinkfood",
    url: "",
    feedUrl: "", // ❓ 找不到對應網域，來源身分待你確認
    language: "th",
    category: "ai-food-tech",
    tier: 3,
    stream: "A",
    feedType: "rss",
    status: "pending",
    description: "Food media; 來源網域不明，待確認",
  },
  {
    id: "aitimes-kr",
    name: "AI타임스 (AI Times)",
    url: "https://www.aitimes.com",
    feedUrl: "https://www.aitimes.com/rss/allArticle.xml", // ✅ feed 可用(50篇) 但密度 ~0 食物（淘金型）
    language: "ko",
    category: "ai-frontier",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending",
    description: "Korean AI media; KR AI×食物淘金，目前食物密度極低",
  },
  {
    id: "platum",
    name: "Platum",
    url: "https://platum.kr",
    feedUrl: "https://platum.kr/feed", // ✅ feed 可用 但密度 0；角色與既有 Stream B 重疊
    language: "ko",
    category: "tech-startup",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending",
    description: "Korean startup media; feed 可用但食物密度 0",
  },
  {
    id: "techsauce",
    name: "Techsauce",
    url: "https://techsauce.co",
    feedUrl: "https://techsauce.co/feed", // ✅ feed 可用 但密度 0；唯一 TH 來源但非食物
    language: "th",
    category: "tech-startup",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending",
    description: "Thai tech/startup media; 唯一 TH 來源但食物密度 0",
  },
  {
    id: "momentum-lowdown",
    name: "Momentum Works (The Lowdown)",
    url: "https://thelowdown.momentum.asia",
    feedUrl: "https://thelowdown.momentum.asia/feed/", // ✅ 驗證可用，密度 ~17%（SEA 外送/食物商業）
    language: "en",
    category: "tech-startup",
    tier: 4,
    stream: "B",
    feedType: "rss",
    status: "active",
    description: "SEA tech & food-delivery insights; Stream B 食物產出最佳的亞洲來源",
  },
  {
    id: "e27",
    name: "e27",
    url: "https://e27.co",
    feedUrl: "https://e27.co/feed/", // ⚠️ 403 bot 防護（較硬，UA 換了仍擋）
    language: "en",
    category: "tech-startup",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending",
    description: "SEA startup media; feed 被 403 bot 防護擋住",
  },
  {
    id: "tech-in-asia",
    name: "Tech in Asia",
    url: "https://www.techinasia.com",
    feedUrl: "https://www.techinasia.com/feed", // ✅ 可用(36篇) 但需瀏覽器 UA（預設 UA 被 403）；密度低
    language: "en",
    category: "tech-startup",
    tier: 5,
    stream: "B",
    feedType: "rss",
    status: "pending", // 啟用前需把 fetcher User-Agent 改成瀏覽器字串
    description: "Pan-Asia tech media; 量大但食物密度低，且需瀏覽器 UA",
  },
];

// === Helpers ===

/** 只有 status:"active" 的來源，供 pipeline 實際抓取使用 */
export const activeSources: Source[] = sources.filter((s) => s.status === "active");

/** 依取材角度（A/B）取來源；預設只回 active，傳 false 取全部（含 pending） */
export function sourcesByStream(stream: Stream, activeOnly = true): Source[] {
  const pool = activeOnly ? activeSources : sources;
  return pool.filter((s) => s.stream === stream);
}
