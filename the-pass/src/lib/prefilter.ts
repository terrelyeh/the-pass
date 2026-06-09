// === 第一段：規則粗篩（依產量自適應）===
// 設計見 docs/selection-mechanism.md §5。第一段只負責「便宜地砍雜訊」，高召回為主：
//   低產量來源（≤ threshold 新篇）→ 跳過關鍵字，全部交給 LLM（最高召回）
//   高產量來源（> threshold）   → 先用 techKeywords 關鍵字粗砍，再交 LLM（控成本）
// 「夠不夠 AI / 有沒有料」的品牌判斷交給後段 LLM 語意閘門，不在這層硬擋。

import { scoreRelevance } from "./relevance";
import type { RawArticle } from "./fetcher";

export interface PrefilterOptions {
  /** 一個來源這次新增幾篇以下算「低產量」→ 全給 LLM。預設 25 */
  volumeThreshold?: number;
  /** 高產量來源關鍵字粗砍的最低分（scoreRelevance）。預設 5 = 至少碰到 AI/科技或食物 */
  minKeywordScore?: number;
}

export interface SourcePrefilterStat {
  sourceName: string;
  fresh: number;
  mode: "all" | "keyword-cut";
  kept: number;
}

export interface PrefilterResult {
  candidates: RawArticle[];
  stats: {
    totalFresh: number;
    totalCandidates: number;
    bySource: SourcePrefilterStat[];
  };
}

/**
 * 對「去重後的新文章」做依產量自適應的第一段粗篩，回傳要送進 LLM 的候選。
 */
export function prefilterByVolume(
  fresh: RawArticle[],
  opts: PrefilterOptions = {}
): PrefilterResult {
  const volumeThreshold = opts.volumeThreshold ?? 25;
  const minKeywordScore = opts.minKeywordScore ?? 5;

  // 依來源分組
  const bySource = new Map<string, RawArticle[]>();
  for (const a of fresh) {
    const arr = bySource.get(a.sourceId);
    if (arr) arr.push(a);
    else bySource.set(a.sourceId, [a]);
  }

  const candidates: RawArticle[] = [];
  const statRows: SourcePrefilterStat[] = [];

  for (const arts of bySource.values()) {
    const name = arts[0]?.sourceName ?? "(unknown)";
    if (arts.length <= volumeThreshold) {
      // 低產量：全給 LLM
      candidates.push(...arts);
      statRows.push({ sourceName: name, fresh: arts.length, mode: "all", kept: arts.length });
    } else {
      // 高產量：關鍵字粗砍
      const kept = arts.filter((a) => scoreRelevance(a) >= minKeywordScore);
      candidates.push(...kept);
      statRows.push({ sourceName: name, fresh: arts.length, mode: "keyword-cut", kept: kept.length });
    }
  }

  // 候選依關鍵字分數排序（高→低），讓後段 LLM 先看可能性高的
  candidates.sort((a, b) => scoreRelevance(b) - scoreRelevance(a));

  return {
    candidates,
    stats: {
      totalFresh: fresh.length,
      totalCandidates: candidates.length,
      bySource: statRows.sort((a, b) => b.fresh - a.fresh),
    },
  };
}
