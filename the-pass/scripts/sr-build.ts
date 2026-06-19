// === /selection-report 第三段（機械層）：吃 Claude 評分 → 庫存競爭 → 選一期 → 雙輸出 ===
// 由 /selection-report skill 在「Claude 評分寫出 scores.json」之後呼叫。
//   用法：
//     npx tsx scripts/sr-build.ts            # 只產 HTML（本機預覽/測試用，不動 vault/庫存）
//     npx tsx scripts/sr-build.ts --save      # 同時寫 Obsidian Markdown + 持久化 backlog.json
//     npx tsx scripts/sr-build.ts 2026-06-19  # 指定日期（預設今天）
//
// 讀 data/sr/<date>/ 下：candidates.json（sr-prep 產）、scores.json（Claude 評分產）、meta.json。
// scores.json 形狀：{ "fumet": {question, from}?, "scores": [{id, pass, surprise, local, human,
//   conversation, substance, editor("mise"|"passe"), hook, reason}, ...] }，id 對齊 candidates.json。

import { canonicalUrl, SeenStore } from "../src/lib/dedup";
import { weightedOf, type Dimensions, type Editor, type ScoredArticle } from "../src/lib/scorer";
import { BacklogStore, buildCompetitorPool, type Competitor, type BacklogEntry } from "../src/lib/backlog";
import {
  renderReport,
  type SelectionReport,
  type ReportPiece,
  type CandidateRow,
  type ReportReject,
  type ScannedSource,
  type FumetQuestion,
} from "../src/lib/report";
import type { RawArticle } from "../src/lib/fetcher";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import path from "path";

const SELECT_FEATURES = 2; // 長文（Mise）
const SELECT_QUICKS = 4; // 快訊（Passe）
const MAX_TABLE_ROWS = 30; // 庫存/已篩除 表格列數上限
// Obsidian vault 內的 The Pass 資料夾（掃描 obsidian.json 得到的 vault + 工作/The Pass）。要改路徑改這裡。
const VAULT_BASE = "/Users/terrelyeh/Documents/Obsidian Vault/工作/顧問/AI編輯室 - The Pass";

const ZERO_DIMS: Dimensions = { surprise: 0, local: 0, human: 0, conversation: 0, substance: 0 };

interface Candidate {
  id: string;
  title: string;
  source: string;
  sourceId: string;
  lang: string;
  date: string;
  link: string;
  summary: string;
  relevance: number;
  foodSignal: number;
  techSignal: number;
}
interface Score {
  id: string;
  pass: boolean;
  surprise: number;
  local: number;
  human: number;
  conversation: number;
  substance: number;
  editor: Editor;
  hook: string;
  angles?: string[]; // 切角：同一則的不同寫法（A 為預設）；長文 ~3、快訊 ~2
  reason: string;
}
interface ScoresFile {
  fumet?: FumetQuestion;
  scores: Score[];
}
interface Meta {
  date: string;
  fetched: number;
  deduped: number;
  poolSize?: number;
  scannedSources: ScannedSource[];
}

// ── markdown helpers（Obsidian 輸出）──────────────────────
const cell = (s: string) => String(s).replace(/\|/g, "／").replace(/\n/g, " ").trim();
const dimLine = (d: Dimensions) =>
  `驚喜 ${d.surprise}／在地 ${d.local}／人味 ${d.human}／可談 ${d.conversation}／扎實 ${d.substance}`;

function mdPiece(p: ReportPiece, i: number): string {
  const lines = [
    `${i}. **${p.title}** — ${p.source}${p.lang ? ` · ${p.lang}` : ""}${p.date ? ` · ${p.date}` : ""}  [原文](${p.link})`,
    `   - ${p.weighted} 分｜${dimLine(p.dimensions)}`,
    `   - 💡 ${p.hook}`,
  ];
  if (p.angles?.length) {
    lines.push(`   - 🎬 切角（A 為預設）：`);
    p.angles.forEach((a, k) => lines.push(`     - ${["A", "B", "C", "D"][k] ?? String(k + 1)}) ${a}`));
  }
  return lines.join("\n");
}
function mdRejectTable(items: ReportReject[]): string {
  if (!items.length) return "（無）\n";
  return [
    "| 標題 | 來源 | 理由 |",
    "|---|---|---|",
    ...items.map((x) => `| [${cell(x.title)}](${x.link ?? ""}) | ${cell(x.source)} | ${cell(x.reason)} |`),
  ].join("\n");
}

function mdReport(r: SelectionReport, features: ReportPiece[], quicks: ReportPiece[]): string {
  const lines: string[] = [];
  lines.push(`# 選題報告 ${r.issueLabel}`, "");
  lines.push(
    `> 由 \`/selection-report\` 本機自動初選（Claude Code 評分，零 API key），供選題會拍板。`,
    `> 漏斗：抓取 ${r.stats.fetched} → 去重後 ${r.stats.deduped} → 候選 ${r.stats.candidates} → 建議入選 ${r.stats.selected}。`,
    ""
  );
  lines.push("## 建議出刊", "");
  if (features.length) {
    lines.push("### 長文（Mise）", "");
    features.forEach((p, i) => lines.push(mdPiece(p, i + 1), ""));
  }
  if (quicks.length) {
    lines.push("### 快訊（Passe）", "");
    quicks.forEach((p, i) => lines.push(mdPiece(p, features.length + i + 1), ""));
  }
  if (r.fumet) {
    lines.push("## 結尾提問（Fumet）", "", r.fumet.question, "", `*（提煉自：${r.fumet.from}）*`, "");
  }
  if (r.candidatePool?.length) {
    lines.push("## 候選名單（完整候選池）", "", "| 分 | 編輯 | 標題 | 來源 |", "|---|---|---|---|");
    r.candidatePool.forEach((c) =>
      lines.push(`| ${c.weighted} | ${c.editor} | [${cell(c.title)}](${c.link}) | ${cell(c.source)} |`)
    );
    lines.push("");
  }
  lines.push("## 進庫存（合格未選）", "", mdRejectTable(r.backlog), "");
  lines.push("## 已篩除", "", mdRejectTable(r.screenedOut), "");
  if (r.flags.length) {
    lines.push("## 編輯室提醒", "", ...r.flags.map((f) => `- ${f}`), "");
  }
  return lines.join("\n");
}

function mdBacklogFile(entries: BacklogEntry[], date: string): string {
  const sorted = [...entries].sort((a, b) => b.weighted - a.weighted);
  const lines = [
    "# The Pass 庫存",
    "",
    `> 合格但未選上的稿，下期重新競爭。重進不續命（保留原進庫存日）。最後更新 ${date}。共 ${sorted.length} 則。`,
    "",
    "| 分 | 編輯 | 標題 | 來源 | 進庫存 | 到期 | 輪次 |",
    "|---|---|---|---|---|---|---|",
    ...sorted.map(
      (e) =>
        `| ${e.weighted} | ${e.editor} | [${cell(e.title)}](${e.link}) | ${cell(e.source)} | ${e.enteredAt.slice(0, 10)} | ${e.expiresAt.slice(0, 10)} | ${e.rounds} |`
    ),
  ];
  return lines.join("\n");
}

async function main() {
  const persist = process.argv.includes("--save");
  const dateArg = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const date = dateArg || new Date().toISOString().slice(0, 10);
  const dir = path.join(process.cwd(), "data", "sr", date);

  const read = <T>(name: string): T => {
    try {
      return JSON.parse(readFileSync(path.join(dir, name), "utf8")) as T;
    } catch {
      console.error(`✗ 讀不到 ${path.join("data/sr", date, name)} — 先跑 sr-prep，並讓 Claude 寫出 scores.json`);
      process.exit(1);
    }
  };

  const candidates = read<Candidate[]>("candidates.json");
  const meta = read<Meta>("meta.json");
  const scoresFile = read<ScoresFile>("scores.json");
  const scoreById = new Map(scoresFile.scores.map((s) => [s.id, s]));

  // 重建 ScoredArticle（過閘門者），未過/未評分者進「已篩除」
  const toRaw = (c: Candidate): RawArticle => ({
    id: c.id,
    sourceId: c.sourceId,
    sourceName: c.source,
    sourceLanguage: c.lang,
    sourceCategory: "",
    sourceTier: 0,
    title: c.title,
    link: c.link,
    summary: c.summary,
    pubDate: c.date,
    fetchedAt: "",
  });
  const scored: ScoredArticle[] = [];
  const screened: { c: Candidate; reason: string }[] = [];
  const anglesByUrl = new Map<string, string[]>();
  for (const c of candidates) {
    const s = scoreById.get(c.id);
    if (!s || !s.pass) {
      screened.push({ c, reason: s?.reason || "未評分（不在 scores.json）" });
      continue;
    }
    const dims: Dimensions = {
      surprise: s.surprise,
      local: s.local,
      human: s.human,
      conversation: s.conversation,
      substance: s.substance,
    };
    scored.push({ article: toRaw(c), dimensions: dims, weighted: weightedOf(dims), editor: s.editor, hook: s.hook, screenReason: s.reason });
    anglesByUrl.set(canonicalUrl(c.link), s.angles ?? []);
  }

  // 庫存跨期競爭
  const now = new Date().toISOString();
  const backlog = new BacklogStore();
  const pruned = backlog.prune(now);
  const pool = buildCompetitorPool(scored, backlog.all());

  const dimsByUrl = new Map(scored.map((s) => [canonicalUrl(s.article.link), s.dimensions]));
  const candByUrl = new Map(candidates.map((c) => [canonicalUrl(c.link), c]));

  // 選一期：top mise → 長文、top passe → 快訊
  const features = pool.filter((c) => c.editor === "mise").slice(0, SELECT_FEATURES);
  const quicks = pool.filter((c) => c.editor === "passe").slice(0, SELECT_QUICKS);
  const selectedComp = [...features, ...quicks];
  const selectedUrls = new Set(selectedComp.map((c) => c.url));

  const pieceOf = (c: Competitor, role: "feature" | "quick"): ReportPiece => {
    const cand = candByUrl.get(c.url);
    return {
      title: c.title,
      source: c.source,
      link: c.link,
      lang: cand?.lang,
      date: cand?.date ? cand.date.slice(5) : undefined, // MM-DD
      dimensions: dimsByUrl.get(c.url) ?? ZERO_DIMS,
      weighted: c.weighted,
      editor: c.editor,
      role,
      hook: c.hook,
      angles: anglesByUrl.get(c.url),
    };
  };
  const selectedPieces: ReportPiece[] = [
    ...features.map((c) => pieceOf(c, "feature")),
    ...quicks.map((c) => pieceOf(c, "quick")),
  ];

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
  const screenedOut: ReportReject[] = screened.slice(0, MAX_TABLE_ROWS).map((x) => ({
    title: x.c.title,
    source: x.c.source,
    link: x.c.link,
    reason: x.reason,
  }));

  const failed = meta.scannedSources.filter((s) => s.count === 0).map((s) => s.name);
  const flags = [
    `漏斗：抓取 ${meta.fetched} → 去重後 ${meta.deduped} → Haiku 粗篩 ${candidates.length} → 過閘門 ${scored.length}（砍 ${screened.length}）。`,
    `評分模式：Haiku 子代理粗篩 + 本機 Claude Code 細評（零 API key）。`,
    notSelected.length > MAX_TABLE_ROWS ? `進庫存 ${notSelected.length} 篇，表格只列前 ${MAX_TABLE_ROWS}。` : null,
    screened.length > MAX_TABLE_ROWS ? `已篩除 ${screened.length} 篇，表格只列前 ${MAX_TABLE_ROWS}。` : null,
    failed.length ? `本期 0 篇來源：${failed.join("、")}。` : "本期所有來源都抓到文章。",
    pruned.length ? `庫存過期淘汰 ${pruned.length} 篇。` : null,
  ].filter(Boolean) as string[];

  const report: SelectionReport = {
    issueLabel: date,
    generatedAt: date,
    stats: { fetched: meta.fetched, deduped: meta.deduped, candidates: scored.length, selected: selectedComp.length },
    selected: selectedPieces,
    fumet: scoresFile.fumet,
    backlog: backlogRows,
    screenedOut,
    flags,
    scannedSources: meta.scannedSources,
    candidatePool,
  };

  // 主輸出：HTML（永遠寫，給預覽/上線）
  const htmlName = `selection-report-${date}.html`;
  const pubDir = path.join(process.cwd(), "public");
  writeFileSync(path.join(pubDir, htmlName), renderReport(report));

  // 維護選題報告索引（報告左側日期面板 + selection-report.html 入口都讀它，所以永遠最新）
  const issues = readdirSync(pubDir)
    .filter((f) => /^selection-report-\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .map((f) => ({ date: f.match(/(\d{4}-\d{2}-\d{2})/)![1], file: f }))
    .sort((a, b) => b.date.localeCompare(a.date));
  writeFileSync(path.join(pubDir, "selection-reports.json"), JSON.stringify(issues, null, 2));

  // 給 /write-issue 用：本期最終選出的稿（含切角）+ Fumet 種子，當寫作的輸入
  writeFileSync(path.join(dir, "selected.json"), JSON.stringify({ date, selected: selectedPieces, fumet: report.fumet ?? null }, null, 2));

  // 雙輸出 + 持久化（只在 --save：避免開發測試污染 vault / 庫存）
  if (persist) {
    const reportDir = path.join(VAULT_BASE, "選題報告");
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(path.join(reportDir, `${date} 選題報告.md`), mdReport(report, features.map((c) => pieceOf(c, "feature")), quicks.map((c) => pieceOf(c, "quick"))));

    backlog.remove(selectedComp.map((c) => c.link)); // 出刊的移出庫存
    backlog.upsert(notSelected, now); // 合格未選的留/加回庫存
    backlog.save();
    writeFileSync(path.join(VAULT_BASE, "庫存.md"), mdBacklogFile(backlog.all(), date));

    // 持久化 seen：本期候選池全標記 seen、出刊的標 published。
    // 下期 sr-prep 的 selectNewArticles 會自動濾掉這些 → 不重複撈、不重複發。
    // 只在 --save（出刊）寫，所以重跑 sr-prep 仍可重現（seen 在出刊那刻才定版）。
    const seen = await new SeenStore().load();
    try {
      const pool = JSON.parse(readFileSync(path.join(dir, "pool.json"), "utf8")) as { id: string; title: string; link: string }[];
      for (const p of pool) seen.add(canonicalUrl(p.link) || p.id, now, p.title);
    } catch {
      /* 無 pool.json（舊流程）→ 退而求其次只標記候選 */
    }
    for (const c of candidates) seen.add(c.id, now, c.title);
    for (const c of selectedComp) seen.setStatus(canonicalUrl(c.link), "published");
    await seen.save();
    console.log(`✓ seen.json：${seen.size()} 筆（下期 sr-prep 自動去重，不重複撈/發）`);
  }

  // 終端摘要
  console.log(`\n=== /selection-report build（${date}）===`);
  console.log(`候選 ${candidates.length} → 過閘門 ${scored.length}（砍 ${screened.length}）→ 建議入選 ${selectedComp.length}`);
  console.log(`  長文(mise) ${features.length}、快訊(passe) ${quicks.length}、進庫存 ${notSelected.length}`);
  console.log(`✓ HTML：public/${htmlName}`);
  if (persist) {
    console.log(`✓ Obsidian：${path.join(VAULT_BASE, "選題報告", date + " 選題報告.md")}`);
    console.log(`✓ Obsidian：${path.join(VAULT_BASE, "庫存.md")}（${backlog.all().length} 則）`);
    console.log(`✓ 持久化 data/backlog.json`);
  } else {
    console.log("（未加 --save：只產 HTML，未寫 Obsidian / 未動 backlog.json）");
  }
}

main().catch((e) => {
  console.error("sr-build 失敗：", e);
  process.exit(1);
});
