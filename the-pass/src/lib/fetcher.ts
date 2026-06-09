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

// 關鍵字相關性評分已抽到 lib/relevance.ts（純函式、零依賴）。此處 re-export 保持相容。
export { scoreRelevance } from "./relevance";
