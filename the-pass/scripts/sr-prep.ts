// === /selection-report 第一段（機械層）：抓取 → 去重 → 食物優先粗篩 → 輸出候選 ===
// 由 /selection-report skill 呼叫。Claude Code 接著讀 candidates.json 當總編評分（零 API key）。
//   用法：npx tsx scripts/sr-prep.ts
//   輸出：data/sr/<date>/candidates.json（給 Claude 評分）+ meta.json（漏斗統計、掃描來源）
//
// 為什麼要粗篩：去重後通常約 450 篇，本機 Claude 逐篇細評 450 篇不實際（慢、吃 context）。
// 先用關鍵字「高召回」粗篩到 PREFILTER_TOP，且「有食物訊號者優先入池」（食物優先方向），
// 再交給 Claude 對這個精選池做真實編輯判斷。關鍵字粗篩只負責召回、不做最終取捨。

import { fetchAllSources } from "../src/lib/fetcher";
import { SeenStore, selectNewArticles, canonicalUrl } from "../src/lib/dedup";
import { relevanceDetail } from "../src/lib/relevance";
import { sources } from "../src/lib/sources";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const PREFILTER_TOP = 60; // 交給 Claude 細評的候選上限

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), "data", "sr", date);
  mkdirSync(outDir, { recursive: true });

  console.log("① 抓取 active 來源（RSS）…");
  const { articles, results } = await fetchAllSources();

  const seen = await new SeenStore().load();
  const { fresh, stats } = await selectNewArticles(articles, seen);

  // 食物優先粗篩：先丟零訊號（food=tech=0），再排序——有食物關鍵字者優先，其次比綜合分。
  // 這樣純食物題不會被 AI×食物雙重命中的高分擠出精選池（綜合分對雙重命中灌水）。
  const ranked = fresh
    .map((a) => ({ a, d: relevanceDetail({ title: a.title, summary: a.summary }) }))
    .filter((x) => x.d.score > 0)
    .sort((x, y) => {
      const fx = x.d.food > 0 ? 1 : 0;
      const fy = y.d.food > 0 ? 1 : 0;
      if (fx !== fy) return fy - fx; // 有食物訊號的排前面（食物是門檻）
      return y.d.score - x.d.score; // 同層再比關鍵字綜合分
    });
  const top = ranked.slice(0, PREFILTER_TOP);

  const candidates = top.map(({ a, d }) => ({
    id: canonicalUrl(a.link) || a.id, // 與 backlog/dedup 同一把 canonical key，build 階段才接得回去
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
    prefiltered: candidates.length,
    droppedZeroSignal: fresh.length - ranked.length,
    droppedByCap: Math.max(0, ranked.length - candidates.length),
    relevanceFloor: top.length ? top[top.length - 1].d.score : 0,
    dedup: { alreadySeen: stats.alreadySeen, nearDuplicate: stats.nearDuplicate },
    scannedSources: results.map((r) => ({
      name: r.sourceName,
      count: r.count,
      stream: streamById.get(r.sourceId),
    })),
  };

  writeFileSync(path.join(outDir, "candidates.json"), JSON.stringify(candidates, null, 2));
  writeFileSync(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));

  console.log(`② 去重：抓 ${articles.length} → 新 ${fresh.length}（已 seen ${stats.alreadySeen}、近重複折疊 ${stats.nearDuplicate}）`);
  console.log(
    `③ 食物優先粗篩：${fresh.length} → ${candidates.length}（丟零訊號 ${meta.droppedZeroSignal}、超出上限 ${meta.droppedByCap}；relevance 門檻 ${meta.relevanceFloor}）`
  );
  console.log(`\n✓ data/sr/${date}/candidates.json（${candidates.length} 篇）`);
  console.log(`✓ data/sr/${date}/meta.json`);
  console.log(`\n下一步：Claude 依食物優先 rubric 評分這 ${candidates.length} 篇 → 寫 data/sr/${date}/scores.json`);
}

main().catch((e) => {
  console.error("sr-prep 失敗：", e);
  process.exit(1);
});
