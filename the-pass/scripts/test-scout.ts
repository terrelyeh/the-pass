// 測試 scout：只跑 2 條 query（省 credits），驗證 RawArticle 形狀 + 批內去重。
//   npx tsx scripts/test-scout.ts
import { fetchScout } from "../src/lib/scout";
import { scoutQueries } from "../src/lib/scout-queries";

const subset = scoutQueries.filter((q) => ["th-local", "theme-redefine"].includes(q.key));
console.log(`跑 ${subset.length} 條 query：${subset.map((q) => q.label).join("、")}\n`);

const { articles, perQuery } = fetchScout({ queries: subset, limit: 5 });

console.log("perQuery:", JSON.stringify(perQuery, null, 2));
console.log(`\n${articles.length} 篇 scout RawArticle：\n`);
for (const a of articles) {
  console.log(`• [${a.sourceLanguage}] ${a.title}`);
  console.log(`   ${a.sourceName} · ${a.pubDate.slice(0, 10)} · ${a.sourceId}`);
  console.log(`   ${a.link}`);
  console.log(`   ↳ ${(a.summary || "").slice(0, 90)}\n`);
}
