import { NextResponse } from "next/server";
import { fetchAllSources, filterRecent, scoreRelevance } from "@/lib/fetcher";
import { SeenStore, selectNewArticles } from "@/lib/dedup";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const { articles, results } = await fetchAllSources();

  // 去重 + 記憶層：丟掉看過的(URL)、折疊同則新聞不同來源，只留「新文章」（見 lib/dedup.ts）
  const store = await new SeenStore().load();
  const { fresh, stats: dedupStats } = await selectNewArticles(articles, store);
  await store.save();

  // 只對「新文章」評分（AI/科技 × 食物相關性）
  const scored = fresh.map((article) => ({
    ...article,
    relevanceScore: scoreRelevance(article),
  }));

  // 依相關性分數排序（高→低），同分再依日期
  scored.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const recent = filterRecent(scored, 72);

  // 存檔（含去重統計，供觀察 pipeline）
  const now = new Date().toISOString();
  const dataDir = path.join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  const filename = `feed-${now.slice(0, 10)}.json`;
  await writeFile(
    path.join(dataDir, filename),
    JSON.stringify({ fetchedAt: now, dedup: dedupStats, results, articles: recent }, null, 2)
  );

  return NextResponse.json({
    fetchedAt: now,
    totalFetched: articles.length,
    dedup: dedupStats, // { fetched, alreadySeen, nearDuplicate, fresh, collapsed[] }
    recentArticles: recent.length,
    sourceResults: results,
    articles: recent,
  });
}
