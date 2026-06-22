// === scout：查詢式進料（開放網路發現層）· Phase 1 ===
// 用 firecrawl 搜尋（在地語言＋跨區主題 query，見 scout-queries.ts）撈「RSS 看不到」的
// 在地/驚奇題，產出與 RSS 同形狀的 RawArticle[]，由 sr-prep 併進候選池、走同一套去重/評分。
//
// 邊界（Phase 1）：只「找題」（title + snippet + url），不抓全文——
//   全文留到 /write-issue 寫稿時才抓（與 RSS 現狀一致、省 credits）。
// firecrawl 走本機 CLI（零額外金鑰，吃 firecrawl credits）；裝/登入失敗時回 []，pipeline 退化成純 RSS、不會壞。
// 設計與驗證見 docs/selection-mechanism.md（scout 段）。

import { spawnSync } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { canonicalUrl } from "./dedup";
import type { RawArticle } from "./fetcher";
import { enabledScoutQueries, type ScoutQuery } from "./scout-queries";

/** scout 來源的 sourceId 前綴；下游（sr-prep）靠它辨識 scout 候選。 */
export const SCOUT_SOURCE_PREFIX = "scout-";
export const isScoutArticle = (a: { sourceId?: string }): boolean =>
  !!a.sourceId && a.sourceId.startsWith(SCOUT_SOURCE_PREFIX);

interface FirecrawlResult {
  title?: string;
  url?: string;
  snippet?: string;
  description?: string;
  date?: string;
}

/** firecrawl news 給的相對日期（"2 weeks ago"）→ ISO（粗略）。無法解析回 ""。 */
function relativeToISO(rel?: string): string {
  if (!rel) return "";
  const m = rel.match(/(\d+)\s*(hour|day|week|month|year)s?\s*ago/i);
  if (!m) return "";
  const n = parseInt(m[1], 10);
  const ms: Record<string, number> = {
    hour: 3.6e6, day: 8.64e7, week: 6.048e8, month: 2.592e9, year: 3.1536e10,
  };
  const unit = ms[m[2].toLowerCase()] || 0;
  return new Date(Date.now() - n * unit).toISOString();
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "scout";
  }
}

/** 跑單條 query（firecrawl CLI），回原始結果陣列；失敗回 []。 */
function runQuery(q: ScoutQuery, limit: number): FirecrawlResult[] {
  const dir = mkdtempSync(path.join(tmpdir(), "scout-"));
  const out = path.join(dir, "r.json");
  const args = ["search", q.query, "--sources", "news", "--tbs", "qdr:m", "--limit", String(limit), "-o", out, "--json"];
  if (q.country) args.push("--country", q.country);
  try {
    const res = spawnSync("firecrawl", args, { encoding: "utf8", timeout: 60000 });
    if (res.error || res.status !== 0) {
      console.warn(`  ⚠ scout[${q.key}] firecrawl 失敗（沒裝/沒登入/額度？）：${String(res.error || res.stderr || res.status).slice(0, 140)}`);
      return [];
    }
    const json = JSON.parse(readFileSync(out, "utf8"));
    return (json?.data?.news || json?.data?.web || []) as FirecrawlResult[];
  } catch (e) {
    console.warn(`  ⚠ scout[${q.key}] 解析失敗：${String(e).slice(0, 140)}`);
    return [];
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

export interface ScoutResult {
  articles: RawArticle[];
  perQuery: { key: string; label: string; raw: number; kept: number }[];
}

/**
 * 跑 enabled 的 scout queries → 批內 URL 去重後回 RawArticle[]。
 * 與 RSS 同形狀，可直接併入 sr-prep 的 articles（跨 RSS/seen 的去重交給 selectNewArticles）。
 * sourceTier 設 5（低優先）：與 RSS 近重複時 dedupeBatch 會留 tier 較高（數字小）的 RSS 篇。
 */
export function fetchScout(opts: { queries?: ScoutQuery[]; limit?: number } = {}): ScoutResult {
  const queries = opts.queries ?? enabledScoutQueries();
  const limit = opts.limit ?? 6;
  const now = new Date().toISOString();
  const seenUrl = new Set<string>();
  const articles: RawArticle[] = [];
  const perQuery: ScoutResult["perQuery"] = [];

  for (const q of queries) {
    const raw = runQuery(q, limit);
    let kept = 0;
    for (const r of raw) {
      const link = (r.url || "").trim();
      if (!link) continue;
      const key = canonicalUrl(link);
      if (!key || seenUrl.has(key)) continue; // scout 批內 URL 去重
      seenUrl.add(key);
      articles.push({
        id: link,
        sourceId: `${SCOUT_SOURCE_PREFIX}${q.key}`,
        sourceName: domainOf(link),
        sourceLanguage: q.lang,
        sourceCategory: "scout",
        sourceTier: 5,
        title: r.title || "(untitled)",
        link,
        summary: (r.snippet || r.description || "").slice(0, 500),
        // firecrawl 給相對日期；qdr:m 已保證近一個月，無法解析時以今日為 proxy（仍在新鮮窗內）
        pubDate: relativeToISO(r.date) || now,
        fetchedAt: now,
      });
      kept++;
    }
    perQuery.push({ key: q.key, label: q.label, raw: raw.length, kept });
  }

  return { articles, perQuery };
}
