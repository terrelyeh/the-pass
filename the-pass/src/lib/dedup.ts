// === 去重 + seen store（pipeline 的「記憶」層）===
// 設計見 docs/selection-mechanism.md §4。兩層去重：
//   ① 完全相同（同一篇）→ 用 canonical URL 當穩定鍵
//   ② 同則新聞、不同來源 → 標題語意相似度（Jaccard）
// seen store 先用 JSON 檔（data/seen.json），之後可換 Supabase。

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { RawArticle } from "./fetcher";

// ─────────────────────────────────────────────
// ① 完全相同：canonical URL
// ─────────────────────────────────────────────

/** 正規化 URL：去 hash、去追蹤參數、去尾斜線、轉小寫 host，作為穩定去重鍵 */
export function canonicalUrl(raw: string): string {
  const s = (raw || "").trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    u.pathname = u.pathname.replace(/\/+$/, ""); // 去 path 尾斜線（即使後面接 query）
    // 去掉常見追蹤參數
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref$|ref_|source$|cmpid|sr_share)/i.test(k)) {
        u.searchParams.delete(k);
      }
    }
    return u.toString().replace(/\/$/, "");
  } catch {
    return s.replace(/\/$/, "").toLowerCase();
  }
}

// ─────────────────────────────────────────────
// ② 同則新聞、不同來源：標題語意相似度
// ─────────────────────────────────────────────

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "with", "is",
  "are", "as", "at", "by", "how", "why", "what", "its", "it", "this", "that",
  "new", "from", "into", "amid", "after", "over", "be", "will", "can",
]);

/** 標題 → 去停用詞、去標點、保留 CJK 的 token 集合 */
export function titleTokens(title: string): Set<string> {
  const norm = (title || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  // 對 CJK（無空格）再補：每 2 字一個 bigram，提升中日韓標題的相似度偵測
  const cjk = (title || "").match(/[぀-ヿ一-鿿가-힯]/gu) || [];
  const bigrams: string[] = [];
  for (let i = 0; i < cjk.length - 1; i++) bigrams.push(cjk[i] + cjk[i + 1]);
  return new Set([...norm, ...bigrams]);
}

/** Jaccard 相似度（交集 / 聯集），0~1 */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface DedupeStats {
  input: number;
  unique: number;
  collapsed: { kept: string; dropped: string; from: string; score: number }[];
}

/**
 * 批內近重複折疊：同則新聞不同來源 → 只留「來源 tier 較高（數字較小）」的那篇。
 * threshold 預設 0.6（標題 token Jaccard）。
 *
 * 為什麼是 0.6 而非更低：清單型模板標題（如「各城市 38 間最佳餐廳」）會共用大量
 * 樣板字、在 0.5 左右誤折疊不同文章。誤折疊=丟掉獨立內容，比「漏掉改寫過的重複」更糟
 * （漏掉的重複後段 LLM/編輯仍會抓到）。故偏向少折疊。標題 Jaccard 只是粗篩，
 * 語意級去重之後可在 LLM 階段補強。
 */
export function dedupeBatch<T extends { title: string; sourceName: string; sourceTier: number }>(
  articles: T[],
  threshold = 0.6
): { unique: T[]; dropped: T[]; stats: DedupeStats } {
  const kept: { art: T; tokens: Set<string> }[] = [];
  const dropped: T[] = []; // 被折疊掉的近重複（仍需標 seen，避免下次重現）
  const collapsed: DedupeStats["collapsed"] = [];

  for (const art of articles) {
    const toks = titleTokens(art.title);
    let hit: { art: T; tokens: Set<string> } | null = null;
    let hitScore = 0;
    for (const k of kept) {
      const s = jaccard(toks, k.tokens);
      if (s >= threshold && s > hitScore) { hit = k; hitScore = s; }
    }
    if (hit) {
      // 留 tier 較高（數字小）的；平手留先到的
      if (art.sourceTier < hit.art.sourceTier) {
        collapsed.push({ kept: art.title, dropped: hit.art.title, from: hit.art.sourceName, score: +hitScore.toFixed(2) });
        dropped.push(hit.art);
        hit.art = art; hit.tokens = toks;
      } else {
        collapsed.push({ kept: hit.art.title, dropped: art.title, from: art.sourceName, score: +hitScore.toFixed(2) });
        dropped.push(art);
      }
    } else {
      kept.push({ art, tokens: toks });
    }
  }
  return { unique: kept.map((k) => k.art), dropped, stats: { input: articles.length, unique: kept.length, collapsed } };
}

// ─────────────────────────────────────────────
// seen store（JSON 檔持久化）
// ─────────────────────────────────────────────

export type SeenStatus = "seen" | "scored" | "published" | "expired";
export interface SeenRecord { firstSeen: string; status: SeenStatus; title?: string }

export class SeenStore {
  private map = new Map<string, SeenRecord>();
  private file: string;
  constructor(file: string = path.join(process.cwd(), "data", "seen.json")) {
    this.file = file;
  }

  async load(): Promise<this> {
    try {
      const raw = await readFile(this.file, "utf8");
      this.map = new Map(Object.entries(JSON.parse(raw) as Record<string, SeenRecord>));
    } catch {
      this.map = new Map();
    }
    return this;
  }

  async save(): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(Object.fromEntries(this.map), null, 2));
  }

  has(key: string): boolean { return this.map.has(key); }
  size(): number { return this.map.size; }

  add(key: string, now: string, title?: string, status: SeenStatus = "seen"): void {
    if (key && !this.map.has(key)) this.map.set(key, { firstSeen: now, status, title });
  }

  setStatus(key: string, status: SeenStatus): void {
    const r = this.map.get(key);
    if (r) r.status = status;
  }
}

// ─────────────────────────────────────────────
// 整合：抓回來 → 去重 → 只回「新文章」並標記 seen
// ─────────────────────────────────────────────

export interface SelectNewResult {
  fresh: RawArticle[];
  stats: { fetched: number; alreadySeen: number; nearDuplicate: number; fresh: number; collapsed: DedupeStats["collapsed"] };
}

/**
 * 把抓回來的文章過記憶層：
 *   1) canonical URL 已在 seen store → 丟（完全相同/舊主題）
 *   2) 批內近重複折疊（同則新聞不同來源）
 *   3) 剩下的「新文章」標記 seen 後回傳
 */
export async function selectNewArticles(
  articles: RawArticle[],
  store: SeenStore
): Promise<SelectNewResult> {
  const now = new Date().toISOString();

  // 1) 完全相同：丟掉 seen store 已有的
  const notSeen = articles.filter((a) => {
    const key = canonicalUrl(a.link);
    return key && !store.has(key);
  });
  const alreadySeen = articles.length - notSeen.length;

  // 2) 批內近重複折疊
  const { unique, dropped, stats } = dedupeBatch(notSeen);

  // 3) 標記 seen——unique 與「被折疊掉的近重複」都要標，否則近重複下次會重現
  for (const a of unique) store.add(canonicalUrl(a.link), now, a.title);
  for (const a of dropped) store.add(canonicalUrl(a.link), now, a.title);

  return {
    fresh: unique,
    stats: {
      fetched: articles.length,
      alreadySeen,
      nearDuplicate: stats.collapsed.length,
      fresh: unique.length,
      collapsed: stats.collapsed,
    },
  };
}
