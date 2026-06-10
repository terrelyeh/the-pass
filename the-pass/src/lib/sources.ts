// === The Pass 選題來源 ===
// 收斂原則（2026-06-10 與 Terrel 定）：**以食物/餐飲/上下游為主，AI/科技為輔助**。
// 跟飲食完全無關的純 AI/科技/新創來源已移除（Ben's Bites、Synced、HF Papers、Sakana、
// Readwise、Techable、AI타임스、Platum、Techsauce、e27、Tech in Asia）。
//
// 兩條進料線：
//   Stream A：飲食/餐飲媒體（食物優先），從食物找 AI/科技角度。
//   Stream B：食品科技 / 食物商業 / 觀點型（輔助），AI/科技但仍以食物為核心。
// status: "active" 進 pipeline；"pending" 已 audit、尚未啟用（見 docs/source-verification-checklist.md）。

export type Stream = "A" | "B";
export type FeedType = "rss" | "json";
export type SourceStatus = "active" | "pending";

export interface Source {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  language: "en" | "ko" | "ja" | "th";
  category: "ai-food-tech" | "food-industry" | "culture-opinion" | "ai-frontier" | "tech-startup";
  tier: 1 | 2 | 3 | 4 | 5;
  stream: Stream; // A = 飲食媒體；B = 食品科技/食物商業（輔助）
  feedType: FeedType;
  status: SourceStatus;
  description: string;
}

export const sources: Source[] = [
  // ============================================================
  // Active — 飲食/餐飲媒體（Stream A）
  // ============================================================
  { id: "the-spoon", name: "The Spoon", url: "https://thespoon.tech", feedUrl: "https://thespoon.tech/feed/", language: "en", category: "ai-food-tech", tier: 2, stream: "A", feedType: "rss", status: "active", description: "Food tech media covering AI, robotics, and automation in food" },
  { id: "agfunder", name: "AgFunder News", url: "https://agfundernews.com", feedUrl: "https://agfundernews.com/feed", language: "en", category: "ai-food-tech", tier: 2, stream: "A", feedType: "rss", status: "active", description: "AgriFood tech investment and innovation news" },
  { id: "techcrunch-food", name: "TechCrunch (Food)", url: "https://techcrunch.com", feedUrl: "https://techcrunch.com/tag/food/feed/", language: "en", category: "ai-food-tech", tier: 2, stream: "A", feedType: "rss", status: "active", description: "Tech news covering food startups and food tech" },
  { id: "foodbank-kr", name: "식품외식경제", url: "https://www.foodbank.co.kr", feedUrl: "http://www.foodbank.co.kr/rss/allArticle.xml", language: "ko", category: "food-industry", tier: 2, stream: "A", feedType: "rss", status: "active", description: "Korean food & restaurant industry news" },
  { id: "restaurant-business", name: "Restaurant Business", url: "https://www.restaurantbusinessonline.com", feedUrl: "https://www.restaurantbusinessonline.com/feed/", language: "en", category: "food-industry", tier: 2, stream: "A", feedType: "rss", status: "active", description: "US restaurant industry news and analysis" },
  { id: "nrn", name: "Nation's Restaurant News", url: "https://www.nrn.com", feedUrl: "https://www.nrn.com/rss.xml", language: "en", category: "food-industry", tier: 2, stream: "A", feedType: "rss", status: "active", description: "Restaurant industry news, trends, and analysis" },
  { id: "eater", name: "Eater", url: "https://www.eater.com", feedUrl: "https://www.eater.com/rss/index.xml", language: "en", category: "culture-opinion", tier: 3, stream: "A", feedType: "rss", status: "active", description: "Food culture, restaurant news, and dining trends" },
  { id: "foovo", name: "Foovo", url: "https://foodtech-japan.com", feedUrl: "https://foodtech-japan.com/feed/", language: "ja", category: "ai-food-tech", tier: 3, stream: "A", feedType: "rss", status: "active", description: "日本食品科技媒體（培養肉/精密發酵/食品機器人）；密度 100%" },
  { id: "ssnp", name: "食品産業新聞社ニュース (SSNP)", url: "https://www.ssnp.co.jp", feedUrl: "https://www.ssnp.co.jp/feed/", language: "ja", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "active", description: "日本食品產業新聞（在地食物源，密度 ~28%）" },
  { id: "thinkfood", name: "식품음료신문 (Thinkfood)", url: "https://www.thinkfood.co.kr", feedUrl: "https://www.thinkfood.co.kr/rss/allArticle.xml", language: "ko", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "active", description: "韓國食品飲料產業報" },
  { id: "the-caterer", name: "The Caterer", url: "https://www.thecaterer.com", feedUrl: "https://www.thecaterer.com/feed/", language: "en", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "active", description: "UK 餐飲/hospitality 產業報（密度 32%）" },
  { id: "qsr-magazine", name: "QSR Magazine", url: "https://www.qsrmagazine.com", feedUrl: "https://www.qsrmagazine.com/feed/", language: "en", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "active", description: "US 快餐（QSR）產業（密度 15%）" },

  // ============================================================
  // Active — 食品科技 / 食物商業 / 觀點（Stream B，輔助 AI/科技）
  // ============================================================
  { id: "momentum-lowdown", name: "Momentum Works (The Lowdown)", url: "https://thelowdown.momentum.asia", feedUrl: "https://thelowdown.momentum.asia/feed/", language: "en", category: "tech-startup", tier: 4, stream: "B", feedType: "rss", status: "active", description: "SEA 外送/食物商業洞察（密度 ~17%）" },
  { id: "technically-food", name: "Technically Food", url: "https://technicallyfood.substack.com", feedUrl: "https://technicallyfood.substack.com/feed", language: "en", category: "ai-frontier", tier: 3, stream: "B", feedType: "rss", status: "active", description: "獨立記者 Larissa Zimberoff 的 food×tech 雙週報；觀點型" },
  { id: "food-tech-insider", name: "Food Tech Insider", url: "https://www.foodtechinsider.net", feedUrl: "https://www.foodtechinsider.net/feed", language: "en", category: "ai-frontier", tier: 4, stream: "B", feedType: "rss", status: "active", description: "AI/替代蛋白/培養肉 週報；食品科技導向" },

  // ============================================================
  // Pending — 飲食/餐飲在地（Stream A，feed 已 audit，待啟用）
  // ============================================================
  { id: "restaurant-dive", name: "Restaurant Dive", url: "https://www.restaurantdive.com", feedUrl: "https://www.restaurantdive.com/feeds/news/", language: "en", category: "food-industry", tier: 2, stream: "A", feedType: "rss", status: "pending", description: "US 餐廳產業科技/AI 導入報導（feed 可用，待 density）" },
  { id: "food-institute", name: "The Food Institute", url: "https://foodinstitute.com", feedUrl: "https://foodinstitute.com/feed/", language: "en", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "US 食品產業分析（feed 可用，待 density）" },
  { id: "food-stadium", name: "フードスタジアム", url: "https://food-stadium.com", feedUrl: "https://food-stadium.com/feed/", language: "ja", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "日本外食產業媒體（feed 可用，待 density）" },
  { id: "foodrink-fdn", name: "フードリンクニュース FDN", url: "https://www.foodrink.co.jp", feedUrl: "https://www.foodrink.co.jp/rss.xml", language: "ja", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "日本外食情報（feed 可用 100篇，待 density）" },
  { id: "kfoodtimes", name: "한국외식신문", url: "https://www.kfoodtimes.com", feedUrl: "https://www.kfoodtimes.com/rss/allArticle.xml", language: "ko", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "韓國外食產業報（feed 可用，待 density）" },
  { id: "inshokuten", name: "飲食店ドットコム foodist", url: "https://www.inshokuten.com", feedUrl: "https://www.inshokuten.com/foodist/feed/", language: "ja", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "日本餐飲經營者媒體（feed 可用）" },
  { id: "gaishoku", name: "外食産業新聞社", url: "https://gaishoku.co.jp", feedUrl: "https://gaishoku.co.jp/feed/", language: "ja", category: "food-industry", tier: 4, stream: "A", feedType: "rss", status: "pending", description: "日本外食產業報（feed 可用）" },
  { id: "nissyoku", name: "日本食糧新聞", url: "https://news.nissyoku.co.jp", feedUrl: "https://news.nissyoku.co.jp/feed/", language: "ja", category: "food-industry", tier: 3, stream: "A", feedType: "rss", status: "pending", description: "日本食品產業報（feed 可用）" },
  { id: "foodtoday", name: "푸드투데이", url: "https://www.foodtoday.or.kr", feedUrl: "https://www.foodtoday.or.kr/data/rss/news.xml", language: "ko", category: "food-industry", tier: 4, stream: "A", feedType: "rss", status: "pending", description: "韓國食品媒體（feed 可用）" },

  // ============================================================
  // Pending — 食品科技 / 觀點（Stream B，輔助）
  // ============================================================
  { id: "digitalfoodlab", name: "DigitalFoodLab", url: "https://digitalfoodlab.com", feedUrl: "https://digitalfoodlab.com/feed/", language: "en", category: "ai-frontier", tier: 4, stream: "B", feedType: "rss", status: "pending", description: "獨立 food-tech 分析師 blog；補『獨立觀點』缺口（feed 可用）" },
  { id: "good-food-institute", name: "Good Food Institute", url: "https://gfi.org", feedUrl: "https://gfi.org/feed/", language: "en", category: "ai-food-tech", tier: 4, stream: "B", feedType: "rss", status: "pending", description: "替代蛋白智庫（feed 可用）" },
  { id: "oy-vey-food", name: "Oy Vey It's A Food Newsletter", url: "https://oyveyitskay.substack.com", feedUrl: "https://oyveyitskay.substack.com/feed", language: "en", category: "culture-opinion", tier: 5, stream: "B", feedType: "rss", status: "pending", description: "kayla kaplan 諷刺素食視角；Phase 2 第四位編輯候選" },
];

// === Helpers ===

/** 只有 status:"active" 的來源，供 pipeline 實際抓取使用 */
export const activeSources: Source[] = sources.filter((s) => s.status === "active");

/** 依取材角度（A/B）取來源；預設只回 active，傳 false 取全部（含 pending） */
export function sourcesByStream(stream: Stream, activeOnly = true): Source[] {
  const pool = activeOnly ? activeSources : sources;
  return pool.filter((s) => s.stream === stream);
}
