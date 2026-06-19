// === 端到端選題 pipeline orchestrator ===
// 把 src/lib 的模組串成一次完整跑：
//   fetchAllSources（抓 active RSS）
//     → SeenStore + selectNewArticles（canonical URL 去重 + 批內近重複折疊）
//     → scorePipeline（Opus 全程評估；無金鑰自動 dry-run 關鍵字代理）
//     → BacklogStore.prune + buildCompetitorPool（庫存倖存者 + 本期新評分一起競爭）
//     → 選一期（top mise→長文、top passe→快訊）
//     → renderReport → 寫 public/selection-report-<date>.html
//
// 用法：
//   npx tsx scripts/run-pipeline.ts          # 跑一遍、寫報告，但不動 seen/backlog 狀態（可重複跑）
//   npx tsx scripts/run-pipeline.ts --save    # 同時持久化 seen.json / backlog.json（正式一期才用）
//   npx tsx scripts/run-pipeline.ts --dry      # 即使有金鑰也強制 dry-run
//
// 注意：scorePipeline 只回「過閘門的」+ 砍掉的「數量」，不回砍掉的清單；
// 故「已篩除」明細在此用 fresh − scored 差集自算（理由標 dry-run 代理），不改動任何模組。

import { fetchAllSources, type RawArticle } from "../src/lib/fetcher";
import { SeenStore, selectNewArticles, canonicalUrl } from "../src/lib/dedup";
import { scorePipeline, type Dimensions } from "../src/lib/scorer";
import { BacklogStore, buildCompetitorPool, type Competitor } from "../src/lib/backlog";
import {
  renderReport,
  type SelectionReport,
  type ReportPiece,
  type CandidateRow,
  type ReportReject,
  type ScannedSource,
} from "../src/lib/report";
import { sources } from "../src/lib/sources";
import { writeFileSync } from "fs";

// 一期建議的規模（編輯結構：2 長文 + 3–6 快訊）。報告只是「自動初選」，最終由選題會拍板。
const SELECT_FEATURES = 2;
const SELECT_QUICKS = 4;
const MAX_TABLE_ROWS = 25; // 庫存/已篩除表格列數上限，過多時截斷並於 flags 標註

const ZERO_DIMS: Dimensions = { surprise: 0, local: 0, human: 0, conversation: 0, substance: 0 };

const fmtDate = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(+d) ? iso.slice(0, 10) : d.toISOString().slice(5, 10); // MM-DD
};

async function main() {
  const persist = process.argv.includes("--save");
  const forceDry = process.argv.includes("--dry");
  const now = new Date().toISOString();
  const date = now.slice(0, 10);

  // ── 1. 抓取 ──────────────────────────────────────────
  console.log("① 抓取 active 來源（RSS）…");
  const { articles, results } = await fetchAllSources();

  // ── 2. 去重（seen store + 批內近重複折疊）─────────────
  const seen = await new SeenStore().load();
  const { fresh, stats: dedup } = await selectNewArticles(articles, seen);
  console.log(`② 去重：抓 ${articles.length} → 新 ${fresh.length}（已 seen ${dedup.alreadySeen}、近重複折疊 ${dedup.nearDuplicate}）`);

  // ── 3. 評分（Opus 全程；無金鑰 dry-run）───────────────
  const { scored, meta } = await scorePipeline(fresh, forceDry ? { dryRun: true } : {});
  console.log(`③ 評分（${meta.mode}）：候選 ${meta.candidates} → 過閘門 ${meta.scored}、砍 ${meta.screenedOut}`);

  // ── 4. 庫存跨期競爭 ──────────────────────────────────
  const backlog = new BacklogStore();
  const pruned = backlog.prune(now);
  const pool = buildCompetitorPool(scored, backlog.all());

  // 本期這批的 dimensions / 原文（庫存來的沒有 dimensions，首次跑庫存為空）
  const dimsByUrl = new Map<string, Dimensions>();
  const artByUrl = new Map<string, RawArticle>();
  for (const s of scored) {
    const u = canonicalUrl(s.article.link);
    dimsByUrl.set(u, s.dimensions);
    artByUrl.set(u, s.article);
  }

  // ── 5. 選一期（top mise→長文、top passe→快訊）─────────
  const features = pool.filter((c) => c.editor === "mise").slice(0, SELECT_FEATURES);
  const quicks = pool.filter((c) => c.editor === "passe").slice(0, SELECT_QUICKS);
  const selectedComp = [...features, ...quicks];
  const selectedUrls = new Set(selectedComp.map((c) => c.url));

  const pieceOf = (c: Competitor, role: "feature" | "quick"): ReportPiece => {
    const a = artByUrl.get(c.url);
    return {
      title: c.title,
      source: c.source,
      link: c.link,
      lang: a?.sourceLanguage,
      date: fmtDate(a?.pubDate),
      dimensions: dimsByUrl.get(c.url) ?? ZERO_DIMS,
      weighted: c.weighted,
      editor: c.editor,
      role,
      hook: c.hook,
      // dry-run 不產切角；真實 LLM / 編輯階段才有 angles
    };
  };
  const selected: ReportPiece[] = [
    ...features.map((c) => pieceOf(c, "feature")),
    ...quicks.map((c) => pieceOf(c, "quick")),
  ];

  // ── 6. 報告各區塊 ────────────────────────────────────
  const candidatePool: CandidateRow[] = pool.map((c) => ({
    title: c.title,
    source: c.source,
    link: c.link,
    weighted: c.weighted,
    editor: c.editor,
    oneLine: c.hook || "—",
  }));

  const notSelected = pool.filter((c) => !selectedUrls.has(c.url));
  const backlogRows: ReportReject[] = notSelected.slice(0, MAX_TABLE_ROWS).map((c) => ({
    title: c.title,
    source: c.source,
    link: c.link,
    reason: c.origin === "backlog" ? `庫存第 ${c.rounds} 輪、仍未選上` : "合格未入選本期 → 進庫存下期競爭",
  }));

  // 已篩除明細：fresh 裡沒進 scored 的 = 硬閘門砍掉的（scorer 不回清單，這裡差集自算）
  const scoredUrls = new Set(scored.map((s) => canonicalUrl(s.article.link)));
  const screenedArts = fresh.filter((a) => !scoredUrls.has(canonicalUrl(a.link)));
  const screenedOut: ReportReject[] = screenedArts.slice(0, MAX_TABLE_ROWS).map((a) => ({
    title: a.title,
    source: a.sourceName,
    link: a.link,
    reason: "dry-run：關鍵字代理未達 AI×食物雙重命中（非真實編輯判斷）",
  }));

  const streamById = new Map(sources.map((s) => [s.id, s.stream]));
  const scannedSources: ScannedSource[] = results.map((r) => ({
    name: r.sourceName,
    count: r.count,
    stream: streamById.get(r.sourceId),
  }));

  const failed = results.filter((r) => r.count === 0).map((r) => r.sourceName);
  const flags: string[] = [];
  if (meta.mode === "dry-run") {
    flags.push(
      "⚠️ 這是 dry-run：評分用關鍵字代理（scoreRelevance），硬閘門沿用舊的『AI×食物雙重命中』邏輯，不是團隊定的『食物優先』方向。選出的內容、分數、hook 只驗證流程，不代表真實編輯判斷——接上 ANTHROPIC_API_KEY 才是 Opus 真評分。"
    );
  }
  flags.push(
    `漏斗：抓取 ${articles.length} → 去重後 ${fresh.length}（已 seen ${dedup.alreadySeen}、近重複折疊 ${dedup.nearDuplicate}）→ 過閘門候選 ${scored.length} → 硬閘門砍 ${meta.screenedOut}。`
  );
  if (notSelected.length > MAX_TABLE_ROWS) flags.push(`進庫存 ${notSelected.length} 篇，表格只列前 ${MAX_TABLE_ROWS}。`);
  if (screenedArts.length > MAX_TABLE_ROWS) flags.push(`已篩除 ${screenedArts.length} 篇，表格只列前 ${MAX_TABLE_ROWS}。`);
  flags.push(failed.length ? `本期 0 篇的來源（feed 可能失效/暫時性）：${failed.join("、")}。` : "本期所有來源都抓到文章。");
  flags.push(pruned.length ? `庫存過期淘汰 ${pruned.length} 篇。` : "庫存無過期淘汰（首次跑或都還新鮮）。");

  // ── 7. 渲染 + 寫出 ───────────────────────────────────
  const report: SelectionReport = {
    issueLabel: `${date} · ${meta.mode} 自動初選`,
    generatedAt: date,
    stats: { fetched: articles.length, deduped: fresh.length, candidates: scored.length, selected: selected.length },
    selected,
    backlog: backlogRows,
    screenedOut,
    flags,
    scannedSources,
    candidatePool,
  };
  const fileName = `selection-report-${date}.html`;
  writeFileSync(new URL(`../public/${fileName}`, import.meta.url), renderReport(report));

  // ── 8.（選用）持久化 seen / backlog ─────────────────
  if (persist) {
    await seen.save();
    backlog.remove(selectedComp.map((c) => c.link));
    backlog.upsert(notSelected, now);
    backlog.save();
  }

  // ── 終端摘要 ─────────────────────────────────────────
  console.log(`\n=== 選題 pipeline 完成（${meta.mode}）===`);
  console.log(`抓取 ${articles.length} → 去重後 ${fresh.length} → 候選 ${scored.length} → 建議入選 ${selected.length}`);
  console.log(`  長文(mise) ${features.length}、快訊(passe) ${quicks.length}、進庫存 ${notSelected.length}、硬閘門砍 ${meta.screenedOut}`);
  if (failed.length) console.log(`  ⚠️ 0 篇來源：${failed.join("、")}`);
  console.log(`✓ 報告：public/${fileName}`);
  console.log(persist ? "✓ 已持久化 seen.json / backlog.json" : "（未持久化；加 --save 才寫 seen/backlog 狀態）");
}

main().catch((e) => {
  console.error("pipeline 失敗：", e);
  process.exit(1);
});
