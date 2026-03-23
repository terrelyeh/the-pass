import { NextResponse } from "next/server";
import { fetchAllSources, filterRecent, scoreRelevance } from "@/lib/fetcher";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const { articles, results } = await fetchAllSources();

  // Score each article for AI × Food relevance
  const scored = articles.map((article) => ({
    ...article,
    relevanceScore: scoreRelevance(article),
  }));

  // Sort by relevance score (highest first), then by date
  scored.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const recent = filterRecent(scored, 72);

  // Save to local JSON file for persistence
  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  const filename = `feed-${new Date().toISOString().slice(0, 10)}.json`;
  await writeFile(
    path.join(dataDir, filename),
    JSON.stringify({ fetchedAt: new Date().toISOString(), results, articles: recent }, null, 2)
  );

  return NextResponse.json({
    fetchedAt: new Date().toISOString(),
    totalArticles: articles.length,
    recentArticles: recent.length,
    sourceResults: results,
    articles: recent,
  });
}
