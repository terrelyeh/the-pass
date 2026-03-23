import Parser from "rss-parser";
import { sources, type Source } from "./sources";

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
      id: `${source.id}-${item.isoDate || index}-${Date.now()}`,
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

  const fetches = sources.map(async (source) => {
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

  const aiKeywords = [
    "ai", "artificial intelligence", "machine learning", "robot", "automat",
    "algorithm", "neural", "gpt", "llm", "computer vision", "generative",
    "인공지능", "ai ", "로봇", "자동화", "생성형", "스마트",
    "ロボット", "自動化", "ai", "人工知能",
  ];

  const foodKeywords = [
    "food", "restaurant", "chef", "kitchen", "cook", "menu", "recipe",
    "dining", "meal", "ingredient", "culinary", "hospitality", "delivery",
    "식품", "외식", "레스토랑", "주방", "요리", "셰프", "배달",
    "食品", "レストラン", "料理", "厨房",
  ];

  let aiScore = 0;
  let foodScore = 0;

  for (const kw of aiKeywords) {
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
