"use client";

import { useState } from "react";

interface Article {
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
  relevanceScore: number;
}

interface FeedResult {
  sourceId: string;
  sourceName: string;
  count: number;
  error?: string;
}

interface FeedData {
  fetchedAt: string;
  totalArticles: number;
  recentArticles: number;
  sourceResults: FeedResult[];
  articles: Article[];
}

const langFlags: Record<string, string> = {
  en: "🇬🇧",
  ko: "🇰🇷",
  ja: "🇯🇵",
  th: "🇹🇭",
};

const categoryLabels: Record<string, string> = {
  "ai-food-tech": "AI & FoodTech",
  "food-industry": "Food Industry",
  "culture-opinion": "Culture",
};

export default function FeedPage() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);

  async function fetchFeeds() {
    setLoading(true);
    try {
      const res = await fetch("/api/fetch-feeds");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const filtered = data?.articles.filter((a) => {
    if (filter !== "all" && a.sourceCategory !== filter) return false;
    if (a.relevanceScore < minScore) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="border-b border-[#E8E6E1] bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#2C3345]">
              The Pass — Raw Feed
            </h1>
            <p className="text-xs text-[#8B90A0] mt-0.5">
              每日原料清單 — 手動策展用
            </p>
          </div>
          <button
            onClick={fetchFeeds}
            disabled={loading}
            className="px-5 py-2 bg-[#2C3345] text-white text-sm font-medium rounded-full hover:bg-[#B8860B] transition-colors disabled:opacity-50"
          >
            {loading ? "抓取中..." : "抓取所有信源"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* No data yet */}
        {!data && !loading && (
          <div className="text-center py-20">
            <p className="text-[#8B90A0] text-lg mb-2">
              按下「抓取所有信源」開始收集今天的原料
            </p>
            <p className="text-[#8B90A0] text-sm">
              會從 The Spoon、식품외식경제、AgFunder 等信源抓取最新內容
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-[#B8860B] text-lg animate-pulse">
              正在抓取所有信源...
            </p>
          </div>
        )}

        {/* Results */}
        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-[#E8E6E1] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#2C3345] tabular-nums">
                  {data.totalArticles}
                </div>
                <div className="text-xs text-[#8B90A0] mt-1">總抓取量</div>
              </div>
              <div className="bg-white border border-[#E8E6E1] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#2C3345] tabular-nums">
                  {data.recentArticles}
                </div>
                <div className="text-xs text-[#8B90A0] mt-1">72 小時內</div>
              </div>
              <div className="bg-white border border-[#E8E6E1] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#B8860B] tabular-nums">
                  {data.articles.filter((a) => a.relevanceScore >= 10).length}
                </div>
                <div className="text-xs text-[#8B90A0] mt-1">
                  AI × 餐飲 高相關
                </div>
              </div>
            </div>

            {/* Source Results */}
            <div className="bg-white border border-[#E8E6E1] rounded-lg p-4 mb-6">
              <h3 className="text-xs font-medium text-[#8B90A0] uppercase tracking-wider mb-3">
                信源抓取結果
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.sourceResults.map((sr) => (
                  <span
                    key={sr.sourceId}
                    className={`text-xs px-3 py-1 rounded-full ${
                      sr.error
                        ? "bg-red-50 text-red-600"
                        : sr.count > 0
                        ? "bg-[#F5F3EF] text-[#2C3345]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {sr.sourceName}: {sr.error ? "失敗" : `${sr.count} 篇`}
                  </span>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex gap-2">
                {[
                  { key: "all", label: "全部" },
                  { key: "ai-food-tech", label: "AI & FoodTech" },
                  { key: "food-industry", label: "Food Industry" },
                  { key: "culture-opinion", label: "Culture" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      filter === f.key
                        ? "bg-[#2C3345] text-white"
                        : "bg-white border border-[#E8E6E1] text-[#5A6178] hover:border-[#B8860B]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8B90A0]">相關度 ≥</span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="text-xs border border-[#E8E6E1] rounded px-2 py-1 bg-white text-[#2C3345]"
                >
                  <option value={0}>全部</option>
                  <option value={5}>5+ (含 AI)</option>
                  <option value={10}>10+ (AI × 餐飲)</option>
                </select>
              </div>
            </div>

            {/* Articles */}
            <div className="space-y-3">
              {filtered?.map((article) => (
                <a
                  key={article.id}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-[#E8E6E1] rounded-lg p-4 hover:border-[#B8860B] transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {/* Score */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${
                        article.relevanceScore >= 10
                          ? "bg-[#B8860B] text-white"
                          : article.relevanceScore >= 5
                          ? "bg-[#F5F3EF] text-[#B8860B]"
                          : "bg-gray-50 text-[#8B90A0]"
                      }`}
                    >
                      {article.relevanceScore}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm">
                          {langFlags[article.sourceLanguage] || "🌐"}
                        </span>
                        <span className="text-xs text-[#8B90A0]">
                          {article.sourceName}
                        </span>
                        <span className="text-xs text-[#8B90A0]">·</span>
                        <span className="text-xs text-[#8B90A0]">
                          {article.pubDate
                            ? new Date(article.pubDate).toLocaleDateString(
                                "zh-TW",
                                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                              )
                            : ""}
                        </span>
                        <span
                          className={`text-[0.625rem] px-1.5 py-0.5 rounded ${
                            article.sourceCategory === "ai-food-tech"
                              ? "bg-[#2C3345] text-white"
                              : article.sourceCategory === "food-industry"
                              ? "bg-[#F5F3EF] text-[#5A6178]"
                              : "bg-gray-50 text-[#8B90A0]"
                          }`}
                        >
                          {categoryLabels[article.sourceCategory] ||
                            article.sourceCategory}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-semibold text-[#2C3345] group-hover:text-[#B8860B] transition-colors leading-relaxed">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      {article.summary && (
                        <p className="text-xs text-[#5A6178] mt-1 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {filtered && (
              <p className="text-center text-xs text-[#8B90A0] mt-6">
                顯示 {filtered.length} / {data.recentArticles} 篇
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
