// === /selection-report 第一段（機械層）：抓取 → 去重 → 去噪 → 輸出候選池 ===
// 由 /selection-report skill 呼叫。輸出整個「有訊號」候選池，交給步驟 2 的 Haiku 子代理粗篩。
//   用法：npx tsx scripts/sr-prep.ts
//   輸出：data/sr/<date>/pool.json（所有有食物/科技訊號的去重候選，food-first 排序）+ meta.json
//
// 這關只做機械去噪（去重 + 丟掉與飲食/科技完全無訊號的），刻意「不做取捨」——
// 取捨交給更聰明的 Haiku 子代理（步驟 2，讀得懂語意、判得出時效/週報/slop），再由總編細評（步驟 3）。
// 關鍵字只負責「丟掉完全無關的雜訊」，不再用關鍵字分數硬砍前 N 篇（那會錯殺沒關鍵字的食物題）。

import { fetchAllSources } from "../src/lib/fetcher";
import { SeenStore, selectNewArticles, canonicalUrl } from "../src/lib/dedup";
import { relevanceDetail } from "../src/lib/relevance";
import { sources } from "../src/lib/sources";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "data", "sr", date);
  mkdirSync(outDir, { recursive: true });

  console.log("① 抓取 active 來源（RSS）…");
  const { articles, results } = await fetchAllSources();

  const seen = await new SeenStore().load();
  const { fresh, stats } = await selectNewArticles(articles, seen);

  // 去噪 + 食物優先排序：丟零訊號（food=tech=0），有食物訊號者排前面（食物是門檻）。
  // 不砍上限——整池交給 Haiku 子代理粗篩。
  const pool = fresh
    .map((a) => ({ a, d: relevanceDetail({ title: a.title, summary: a.summary }) }))
    .filter((x) => x.d.score > 0)
    .sort((x, y) => {
      const fx = x.d.food > 0 ? 1 : 0;
      const fy = y.d.food > 0 ? 1 : 0;
      if (fx !== fy) return fy - fx;
      return y.d.score - x.d.score;
    })
    .map(({ a, d }) => ({
      id: canonicalUrl(a.link) || a.id, // 與 backlog/dedup 同一把 canonical key
      title: a.title,
      source: a.sourceName,
      sourceId: a.sourceId,
      lang: a.sourceLanguage,
      date: a.pubDate ? a.pubDate.slice(0, 10) : "",
      link: a.link,
      summary: (a.summary || "").slice(0, 600),
      relevance: d.score,
      foodSignal: d.food,
      techSignal: d.tech,
    }));

  const streamById = new Map(sources.map((s) => [s.id, s.stream]));
  const meta = {
    date,
    fetched: articles.length,
    deduped: fresh.length,
    poolSize: pool.length,
    droppedZeroSignal: fresh.length - pool.length,
    dedup: { alreadySeen: stats.alreadySeen, nearDuplicate: stats.nearDuplicate },
    scannedSources: results.map((r) => ({
      name: r.sourceName,
      count: r.count,
      stream: streamById.get(r.sourceId),
    })),
  };

  writeFileSync(path.join(outDir, "pool.json"), JSON.stringify(pool, null, 2));
  writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

  console.log(`② 去重：抓 ${articles.length} → 新 ${fresh.length}（已 seen ${stats.alreadySeen}、近重複折疊 ${stats.nearDuplicate}）`);
  console.log(`③ 去噪：${fresh.length} → 候選池 ${pool.length}（丟零訊號 ${meta.droppedZeroSignal}）`);
  console.log(`\n✓ data/sr/${date}/pool.json（${pool.length} 篇）`);
  console.log(`✓ data/sr/${date}/meta.json`);
  console.log(`\n下一步：spawn Haiku 子代理分批粗篩 pool.json → 寫 candidates.json（~50–70 篇）→ 你再細評`);
}

main().catch((e) => {
  console.error("sr-prep 失敗：", e);
  process.exit(1);
});
