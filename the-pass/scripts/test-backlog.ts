// 庫存 backlog 跨期競爭測試：證明「沒選上→進庫存→下期重新競爭→過期淘汰」真的有效。
// 跑法：npx tsx scripts/test-backlog.ts
import fs from "fs";
import os from "os";
import path from "path";
import { BacklogStore, buildCompetitorPool, type Competitor } from "../src/lib/backlog";
import type { ScoredArticle, Editor } from "../src/lib/scorer";

const TMP = path.join(os.tmpdir(), `backlog-test-${process.pid}.json`);

// 造一篇已評分文章（只填測試需要的欄位）
function scored(title: string, weighted: number, editor: Editor = "passe"): ScoredArticle {
  return {
    article: {
      id: title,
      sourceId: "s",
      sourceName: "Test",
      sourceLanguage: "en",
      sourceCategory: "food",
      sourceTier: 1,
      title,
      link: `https://example.com/${encodeURIComponent(title)}`,
      summary: "",
      pubDate: "2026-06-10",
      fetchedAt: "2026-06-10",
    },
    dimensions: { surprise: 0, local: 0, human: 0, conversation: 0, substance: 0 },
    weighted,
    editor,
    hook: `hook:${title}`,
    screenReason: "pass",
  };
}

// 簡化的「選一期」：取分數最高的 N 篇
const selectTop = (pool: Competitor[], n: number) => pool.slice(0, n);

let pass = true;
const check = (label: string, cond: boolean) => {
  console.log(`${cond ? "✓" : "✗"} ${label}`);
  if (!cond) pass = false;
};

try {
  fs.rmSync(TMP, { force: true });

  // ── 第 1 期（6/10）：4 篇合格，選 2 篇出刊，其餘 2 篇進庫存 ──
  const r1 = [scored("A 韓國辣醬 AI", 30), scored("B 培養肉新廠", 26), scored("C 咖啡風味預測", 22), scored("D 餐廳排班演算", 18)];
  const s1 = new BacklogStore(TMP);
  s1.prune("2026-06-10T00:00:00Z"); // 空庫存
  const pool1 = buildCompetitorPool(r1, s1.all());
  const issue1 = selectTop(pool1, 2); // 選 A、B
  s1.remove(issue1.map((c) => c.link)); // 出刊的移出（本就不在庫存）
  s1.upsert(pool1.slice(2), "2026-06-10T00:00:00Z"); // C、D 進庫存
  s1.save();
  check("第1期出刊 = A,B", issue1.map((c) => c.title[0]).join("") === "AB");
  check("第1期後庫存 = C,D（2 篇）", s1.all().length === 2);

  // ── 第 2 期（6/13，3 天後）：新一批；庫存 C,D 一起重新競爭 ──
  const s2 = new BacklogStore(TMP); // 從磁碟重新載入，證明有持久化
  check("第2期載入庫存 = 2 篇（跨進程持久化）", s2.all().length === 2);
  const expired2 = s2.prune("2026-06-13T00:00:00Z");
  check("第2期沒有過期（保鮮期 14 天內）", expired2.length === 0);
  const r2 = [scored("E 新題普通", 20), scored("F 新題很弱", 12)];
  const pool2 = buildCompetitorPool(r2, s2.all()); // C(22) D(18) E(20) F(12) → 排序 C,E,D,F
  check("候選池含庫存撈回的 C（origin=backlog）", pool2.some((c) => c.title.startsWith("C") && c.origin === "backlog"));
  const issue2 = selectTop(pool2, 2); // C、E
  check("第2期出刊 = C,E（庫存的 C 打贏新的 E 之上）", issue2.map((c) => c.title[0]).join("") === "CE");
  s2.remove(issue2.map((c) => c.link)); // C 出刊 → 移出庫存
  s2.upsert(pool2.filter((c) => !issue2.includes(c)), "2026-06-13T00:00:00Z"); // D,E,F 留庫存（D rounds+1）
  s2.save();
  const d = s2.all().find((e) => e.title.startsWith("D"));
  check("C 出刊後移出庫存", !s2.all().some((e) => e.title.startsWith("C")));
  check("D 仍在庫存且 rounds=2（競爭第2次）", !!d && d.rounds === 2);
  check("D 的保鮮期仍是 6/10 起算（沒被續命）", !!d && d.expiresAt.startsWith("2026-06-24"));

  // ── 第 3 期（6/30）：D 的保鮮期（6/10+14=6/24）已過 → 自動淘汰 ──
  const s3 = new BacklogStore(TMP);
  const expired3 = s3.prune("2026-06-30T00:00:00Z");
  check("第3期：過期淘汰含 D", expired3.some((e) => e.title.startsWith("D")));
  check("D 已不在庫存", !s3.all().some((e) => e.title.startsWith("D")));

  console.log(`\n${pass ? "✅ 全部通過" : "❌ 有失敗"}`);
} finally {
  fs.rmSync(TMP, { force: true });
}

process.exit(pass ? 0 : 1);
