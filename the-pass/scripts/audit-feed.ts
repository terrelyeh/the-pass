// 來源 audit 的「機械層」：給一批網址，找出可用 feed + 活性 + 近期樣本標題。
// 內容走向/適配判斷由 Claude（/audit-sources skill）讀樣本後做。
// 用法：npx tsx scripts/audit-feed.ts <url1> <url2> ...
import Parser from "rss-parser";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const parser = new Parser({ timeout: 15000, headers: { "User-Agent": UA } });
const PATHS = ["/feed/", "/feed", "/rss", "/rss.xml", "/atom.xml", "/index.xml", "/feeds/news/", "/rss/allArticle.xml", "/blogs/news.atom", "/journal?format=rss"];

async function findAndParse(url: string) {
  const origin = new URL(url).origin;
  const bases = [url.replace(/\/$/, ""), origin].filter((v, i, a) => a.indexOf(v) === i);
  for (const base of bases) {
    for (const p of PATHS) {
      try {
        const f = await parser.parseURL(base + p);
        if ((f.items || []).length) return { feed: base + p, f };
      } catch {
        /* try next */
      }
    }
  }
  // autodiscovery：抓首頁找 <link rel=alternate rss/atom>
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    const html = await r.text();
    const m = html.match(/<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]*>/i);
    const href = m && (m[0].match(/href=["']([^"']+)["']/) || [])[1];
    if (href) {
      const abs = href.startsWith("http") ? href : origin + (href.startsWith("/") ? "" : "/") + href;
      const f = await parser.parseURL(abs);
      if ((f.items || []).length) return { feed: abs, f };
    }
  } catch {
    /* none */
  }
  return null;
}

(async () => {
  const urls = process.argv.slice(2);
  if (!urls.length) {
    console.log("用法：npx tsx scripts/audit-feed.ts <url1> <url2> ...");
    return;
  }
  for (const url of urls) {
    const res = await findAndParse(url);
    if (!res) {
      console.log(`\n❌ ${url} — 無可用 feed（紙本/JS-only/擋 bot/不存在）`);
      continue;
    }
    const items = res.f.items || [];
    const dates = items.map((i) => new Date(i.isoDate || i.pubDate || 0)).filter((d) => +d > 0).sort((a, b) => +b - +a);
    const latest = dates[0] ? dates[0].toISOString().slice(0, 10) : "?";
    const age = dates[0] ? Math.round((Date.now() - +dates[0]) / 86400000) : 9999;
    const fresh = age <= 30 ? "🟢" : age <= 90 ? "🟡" : "🔴";
    console.log(`\n${fresh} ${res.f.title || url}`);
    console.log(`   feed: ${res.feed}`);
    console.log(`   ${items.length} 篇 · 最新 ${latest}（${age} 天前）· 簡介: ${(res.f.description || "").replace(/\s+/g, " ").slice(0, 90)}`);
    console.log(`   近期樣本（給 Claude 判內容走向）：`);
    items.slice(0, 12).forEach((it) => {
      const snip = (it.contentSnippet || it.content || "").replace(/\s+/g, " ").slice(0, 70);
      console.log(`     • ${(it.title || "").slice(0, 70)}${snip ? " — " + snip : ""}`);
    });
  }
})().then(
  () => process.exit(0),
  (e) => { console.error(e); process.exit(1); }
);
