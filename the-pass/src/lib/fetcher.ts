import Parser from "rss-parser";
import { activeSources, type Source } from "./sources";

export interface RawArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceLanguage: string;
  sourceCategory: string;
  sourceTier: number;
  title: string;
  link: string;
  summary: string;
  pubDate: string;
  fetchedAt: string;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "ThePass/1.0 (RSS Reader)",
  },
});

async function fetchSource(source: Source): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    const now = new Date().toISOString();

    return (feed.items || []).slice(0, 20).map((item, index) => ({
      // 用文章 URL 當穩定唯一鍵（去重靠它）；無 link 時退回 source+日期。
      // 絕不可含 Date.now()——否則同一篇每次抓 id 都不同，去重失效。
      id: item.link || `${source.id}-${item.isoDate || index}`,
      sourceId: source.id,
      sourceName: source.name,
      sourceLanguage: source.language,
      sourceCategory: source.category,
      sourceTier: source.tier,
      title: item.title || "(untitled)",
      link: item.link || "",
      summary: (item.contentSnippet || item.content || "").slice(0, 500),
      pubDate: item.isoDate || item.pubDate || "",
      fetchedAt: now,
    }));
  } catch (error) {
    console.error(`Failed to fetch ${source.name}: ${error}`);
    return [];
  }
}

export async function fetchAllSources(): Promise<{
  articles: RawArticle[];
  results: { sourceId: string; sourceName: string; count: number; error?: string }[];
}> {
  const results: { sourceId: string; sourceName: string; count: number; error?: string }[] = [];
  const allArticles: RawArticle[] = [];

  // 只抓 status:"active"（pending 來源 feed 多為空/待驗證，見 sources.ts）。
  // 目前 active 全是 feedType:"rss"；JSON 來源（如 HF Papers）需另建 fetcher。
  const fetches = activeSources.map(async (source) => {
    try {
      const articles = await fetchSource(source);
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        count: articles.length,
      });
      allArticles.push(...articles);
    } catch (error) {
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        count: 0,
        error: String(error),
      });
    }
  });

  await Promise.all(fetches);

  // Sort by publication date (newest first)
  allArticles.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime() || 0;
    const dateB = new Date(b.pubDate).getTime() || 0;
    return dateB - dateA;
  });

  return { articles: allArticles, results };
}

// Filter articles from the last N hours
export function filterRecent(articles: RawArticle[], hours: number = 48): RawArticle[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return articles.filter((a) => {
    const pubTime = new Date(a.pubDate).getTime();
    return pubTime > cutoff;
  });
}

// Simple keyword relevance scoring for AI × Food
export function scoreRelevance(article: RawArticle): number {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  // 「第一關粗篩」刻意放寬到 AI + 鄰近科技（含食品生技），高召回為主——
  // 「夠不夠 AI / 有沒有料」的品牌判斷交給後段 LLM 語意閘門（決策見 selection-mechanism.md）。
  // 注意：不要放裸 "ai"（includes 會誤中 tail/available/again），"AI" 縮寫用詞邊界 \bai\b。
  const techKeywords = [
    // AI / 自動化 / 機器人
    "artificial intelligence", "machine learning", "deep learning", "robot",
    "automat", "autonomous", "drone", "algorithm", "neural", "gpt", "llm",
    "computer vision", "generative", "predictive",
    // 食品科技 / 生技 / 農業科技
    "cultured meat", "cultivated meat", "cell-based", "cellular agricultur",
    "precision fermentation", "bioreactor", "biotech", "alt protein",
    "alternative protein", "plant-based", "synthetic biolog", "crispr",
    "gene-edit", "vertical farm", "foodtech", "food tech", "agritech", "agtech", "sensor",
    // 韓
    "인공지능", "로봇", "자동화", "생성형", "스마트", "배양육", "세포배양",
    "대체육", "발효", "푸드테크", "바이오", "알고리즘",
    // 日
    "人工知能", "ロボット", "自動化", "培養肉", "細胞性", "細胞農業",
    "精密発酵", "発酵", "植物肉", "植物性", "代替肉", "フードテック",
    "バイオ", "アルゴリズム", "生成",
  ];

  const foodKeywords = [
    "food", "restaurant", "chef", "kitchen", "cook", "menu", "recipe",
    "dining", "meal", "ingredient", "culinary", "hospitality", "delivery",
    "식품", "외식", "레스토랑", "주방", "요리", "셰프", "배달",
    "食品", "レストラン", "料理", "厨房",
  ];

  let aiScore = 0;
  let foodScore = 0;

  // "AI" 縮寫用詞邊界比對，避免誤中 tail / available / again 等含 "ai" 的字
  if (/\bai\b/.test(text) || text.includes("a.i.")) aiScore++;

  for (const kw of techKeywords) {
    if (text.includes(kw)) aiScore++;
  }
  for (const kw of foodKeywords) {
    if (text.includes(kw)) foodScore++;
  }

  // Both AI and food keywords = highest relevance
  if (aiScore > 0 && foodScore > 0) return 10 + aiScore + foodScore;
  // Only AI keywords
  if (aiScore > 0) return 5 + aiScore;
  // Only food keywords
  if (foodScore > 0) return 2 + foodScore;
  return 0;
}
