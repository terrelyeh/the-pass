/**
 * gen-editor-source-page.ts
 * 把「餵給 AI 編輯的源頭 md」渲染成一頁團隊看的網頁。
 * 真實來源 = 各 md 檔；改了 md → 重跑此腳本 → public/editor-source.html 同步。
 *   npx tsx scripts/gen-editor-source-page.ts
 * 零依賴：內建小型 markdown→html 轉換器（夠用於本專案的 md 構件）。
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---- 來源清單（檔案 + 標籤 + 「改它會怎樣」）----
const EDITORS = [
  { key: "mise", name: "Mise", role: "今日觀察（長文）", soul: "docs/editors/mise-soul.md", memory: "docs/editors/mise-memory.md" },
  { key: "passe", name: "Passe", role: "本期快訊", soul: "docs/editors/passe-soul.md", memory: "docs/editors/passe-memory.md" },
  { key: "fumet", name: "Fumet", role: "留一個問題", soul: "docs/editors/fumet-soul.md", memory: "docs/editors/fumet-memory.md" },
  { key: "amuse", name: "Amuse", role: "菜單之外（特別企劃）", soul: "docs/editors/amuse-soul.md", memory: "docs/editors/amuse-memory.md" },
];
const SHARED = [
  { key: "voices", title: "寫作風格守則（Voices）", file: ".claude/skills/write-issue/refs/voices.md", note: "四位編輯「怎麼寫」的可執行規則、招式、標題鐵則。想調寫作風格，主要改這裡。" },
  { key: "antislop", title: "反 AI 味底線（共用）", file: ".claude/skills/write-issue/refs/anti-slop.md", note: "全編輯共用的底線：事實不可扭曲、禁用開頭／詞彙／結構。" },
  { key: "chief", title: "總編審核清單（7 項）", file: ".claude/skills/write-issue/refs/chief-editor-checklist.md", note: "每期寫完，總編逐項對照查核的標準。" },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- 小型 markdown → html ----
function inline(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function cells(r: string): string[] {
  return r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}
function renderTable(rows: string[]): string {
  if (!rows.length) return "";
  const head = cells(rows[0]);
  const hasHead = rows[1] && cells(rows[1]).every((c) => /^:?-+:?$/.test(c));
  let h = "<table>";
  if (hasHead) h += "<thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead>";
  h += "<tbody>";
  for (const r of hasHead ? rows.slice(2) : rows) h += "<tr>" + cells(r).map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
  return h + "</tbody></table>";
}
function mdToHtml(md: string): string {
  md = md.replace(/^---\n[\s\S]*?\n---\n/, "");      // 去 YAML frontmatter（如有）
  md = md.replace(/^\s*#\s+.*\n/, "");                // 去開頭 H1（卡片標題已命名）
  const L = md.split("\n");
  const out: string[] = [];
  let i = 0;
  const isBlock = (s: string) => /^(#{1,6}\s|>\s?|---+\s*$|\s*[-*]\s+|\s*\d+\.\s+|\s*\|)/.test(s);
  while (i < L.length) {
    const line = L[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const lv = Math.min(6, h[1].length + 1); out.push(`<h${lv}>${inline(h[2])}</h${lv}>`); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < L.length && /^>\s?/.test(L[i])) { buf.push(L[i].replace(/^>\s?/, "")); i++; }
      out.push(`<blockquote>${buf.map((b) => (b.trim() === "" ? "" : inline(b))).join("<br>")}</blockquote>`);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const buf: string[] = [];
      while (i < L.length && /^\s*\|.*\|\s*$/.test(L[i])) { buf.push(L[i]); i++; }
      out.push(renderTable(buf));
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < L.length && /^\s*[-*]\s+/.test(L[i])) { buf.push(L[i].replace(/^\s*[-*]\s+/, "")); i++; }
      out.push(`<ul>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < L.length && /^\s*\d+\.\s+/.test(L[i])) { buf.push(L[i].replace(/^\s*\d+\.\s+/, "")); i++; }
      out.push(`<ol>${buf.map((b) => `<li>${inline(b)}</li>`).join("")}</ol>`);
      continue;
    }
    const buf: string[] = [];
    while (i < L.length && !/^\s*$/.test(L[i]) && !isBlock(L[i])) { buf.push(L[i]); i++; }
    out.push(`<p>${buf.map(inline).join("<br>")}</p>`);
  }
  return out.join("\n");
}

const read = (rel: string) => {
  try { return readFileSync(join(ROOT, rel), "utf8"); }
  catch { return `（讀不到 ${rel}）`; }
};

const card = (title: string, file: string, note: string) => `
<div class="src">
  <div class="src-h"><span class="src-t">${esc(title)}</span><code class="src-f">${esc(file)}</code></div>
  <div class="src-note">改這個檔 → ${esc(note)}</div>
  <div class="md">${mdToHtml(read(file))}</div>
</div>`;

// ---- 側欄 ----
const sideEditors = EDITORS.map((e) => `<a href="#ed-${e.key}"><span class="d">${esc(e.name)}</span><span class="t">${esc(e.role)}</span></a>`).join("");
const sideShared = SHARED.map((s) => `<a href="#sh-${s.key}"><span class="d">${esc(s.title.replace(/（.*/, ""))}</span></a>`).join("");

// ---- 內容 ----
const editorSections = EDITORS.map((e) => `
<section id="ed-${e.key}" class="grp">
  <h2 class="grp-h">${esc(e.name)} <span class="grp-role">· ${esc(e.role)}</span></h2>
  ${card(`${e.name} · 人格 Soul`, e.soul, "改他「在乎什麼、為什麼這樣寫」（最深層）")}
  ${card(`${e.name} · 記憶 Memory`, e.memory, "他學到的準則＋寫過的主題；多由系統每期回寫")}
</section>`).join("");

const sharedSections = SHARED.map((s) => `
<section id="sh-${s.key}" class="grp">
  ${card(s.title, s.file, s.note)}
</section>`).join("");

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>編輯源頭 · 寫作風格 — The Pass</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--serif:'Noto Serif TC',Georgia,serif;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif',var(--serif);}
*{margin:0;padding:0;box-sizing:border-box}html{font-size:18px;scroll-behavior:smooth}body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
nav{position:sticky;top:0;z-index:70;background:rgba(250,250,248,.93);backdrop-filter:blur(10px);border-bottom:1px solid var(--border)}
.nav-in{max-width:1080px;margin:0 auto;padding:.7rem 1.5rem;display:flex;justify-content:space-between;align-items:center}
.nav-b{font-family:var(--display);font-size:1.15rem;color:var(--ink);text-decoration:none}
.nav-l{display:flex;gap:1.1rem;list-style:none}.nav-l a{font-size:.8rem;color:var(--ink-light);text-decoration:none}.nav-l a:hover{color:var(--accent)}
.hero{max-width:1080px;margin:0 auto;padding:2.2rem 1.5rem .6rem}
.hero .lab{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600}
.hero h1{font-family:var(--display);font-size:2.4rem;font-weight:400;margin:.3rem 0}
.hero .sub{color:var(--ink-muted);font-size:.92rem;max-width:680px}
.intro{max-width:1080px;margin:1rem auto 0;padding:0 1.5rem}
.intro-box{background:var(--bg-warm);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;padding:1rem 1.25rem;font-size:.9rem;line-height:1.7}
.intro-box b{color:var(--ink)}.intro-box .lyr{display:flex;flex-wrap:wrap;gap:.5rem;margin:.6rem 0 .2rem}
.intro-box .lyr span{background:var(--white);border:1px solid var(--border);border-radius:100px;padding:.15rem .7rem;font-size:.78rem}
.intro-box a{color:var(--accent);text-decoration:none}
.layout{display:grid;grid-template-columns:212px 1fr;max-width:1080px;margin:1.2rem auto 0;gap:0}
.side{position:sticky;top:3.6rem;align-self:start;max-height:calc(100vh - 4rem);overflow-y:auto;border-right:1px solid var(--border);padding:1.2rem 1rem 2rem 1.5rem}
.side .lbl{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-muted);font-weight:700;margin:1rem 0 .5rem}.side .lbl:first-child{margin-top:0}
.side a{display:block;text-decoration:none;padding:.4rem .55rem;border-radius:6px;margin-bottom:.12rem}.side a:hover{background:var(--bg-warm)}
.side a .d{font-size:.82rem;font-weight:700;color:var(--ink);display:block}.side a .t{font-size:.72rem;color:var(--ink-light);display:block}
.main{padding:1.4rem 2rem 5rem;min-width:0;max-width:780px}
.grp{margin-bottom:2.2rem;scroll-margin-top:4rem}
.grp-h{font-family:var(--display);font-size:1.7rem;font-weight:400;border-bottom:2px solid var(--accent-light);padding-bottom:.3rem;margin-bottom:1rem}
.grp-role{font-size:.95rem;color:var(--ink-muted)}
.src{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.3rem;margin-bottom:1.1rem}
.src-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem;justify-content:space-between}
.src-t{font-weight:700;font-size:1rem;color:var(--ink)}
.src-f{font-family:ui-monospace,Menlo,monospace;font-size:.7rem;color:var(--ink-muted);background:var(--bg-warm);padding:.1rem .45rem;border-radius:5px}
.src-note{font-size:.78rem;color:var(--accent);margin:.35rem 0 .8rem;font-weight:500}
.md{font-size:.92rem;line-height:1.75;color:var(--ink-light)}
.md h2{font-family:var(--sans);font-size:1.05rem;font-weight:700;color:var(--ink);margin:1.3rem 0 .4rem}
.md h3{font-size:.96rem;font-weight:700;color:var(--ink);margin:1.1rem 0 .35rem}
.md h4{font-size:.88rem;font-weight:700;color:var(--ink-light);margin:.9rem 0 .3rem}
.md p{margin:.55rem 0}.md strong{color:var(--ink);font-weight:700}
.md ul,.md ol{margin:.5rem 0 .5rem 0;padding-left:1.3rem}.md li{margin:.25rem 0}
.md blockquote{border-left:3px solid var(--accent-light);background:var(--bg-warm);border-radius:0 6px 6px 0;padding:.6rem .9rem;margin:.7rem 0;color:var(--ink);font-style:normal}
.md table{width:100%;border-collapse:collapse;font-size:.84rem;margin:.7rem 0}
.md th{text-align:left;padding:.4rem .55rem;border-bottom:2px solid var(--border);font-size:.78rem;color:var(--ink-muted)}
.md td{padding:.4rem .55rem;border-bottom:1px solid var(--border);vertical-align:top}
.md code{font-family:ui-monospace,Menlo,monospace;font-size:.84em;background:var(--bg-warm);padding:.05rem .3rem;border-radius:4px;color:var(--ink)}
.md hr{border:none;border-top:1px solid var(--border);margin:1rem 0}
.md a{color:var(--accent);text-decoration:none}
.foot{max-width:1080px;margin:0 auto;padding:1.5rem;color:var(--ink-muted);font-size:.76rem;border-top:1px solid var(--border)}.foot .b{font-family:var(--display);color:var(--ink);font-size:1rem}
@media(max-width:820px){.layout{grid-template-columns:1fr}.side{display:none}.nav-l{display:none}.main{padding:1.2rem 1.3rem 3rem}.hero h1{font-size:1.9rem}}
</style></head><body data-fb-blocks=".src" data-fb-title=".src-t" data-fb-anchor=".src-h">
<nav><div class="nav-in"><a href="hub.html" class="nav-b">The Pass</a><ul class="nav-l">
<li><a href="editors.html">AI 編輯室</a></li>
<li><a href="write-issue-architecture.html">寫作架構</a></li>
<li><a href="hub.html">系統入口</a></li></ul></div></nav>

<div class="hero">
<div class="lab">Editorial Source · 寫作源頭</div>
<h1>編輯源頭 · 寫作風格</h1>
<div class="sub">這是真正餵給三位 AI 編輯的內容——他們的人格、記憶、寫作守則。想調整 AI 寫出來的東西，就從這裡看、從這裡提。</div>
</div>
<div class="intro"><div class="intro-box">
<b>怎麼用這頁：</b>下面每一塊都對應一個實際的源頭檔（右上角灰底就是檔案路徑）。看到想調整的地方 → 標出是哪個檔的哪一段、想怎麼改 → 給 Terrel；Terrel 改 md、重生此頁，下一期出刊就生效。
<div class="lyr"><span><b>Soul</b> 人格＝為什麼這樣寫（最深）</span><span><b>Memory</b> 記憶＝學到/寫過什麼</span><span><b>Voices</b> 守則＝怎麼寫</span></div>
想看這三層怎麼在出刊時組起來，見 <a href="write-issue-architecture.html">寫作架構</a>。
</div></div>

<div class="layout">
  <aside class="side">
    <div class="lbl">三位編輯</div>
    ${sideEditors}
    <div class="lbl">共用守則</div>
    ${sideShared}
  </aside>
  <main class="main">
    ${editorSections}
    <h2 class="grp-h" style="margin-top:.5rem">共用守則</h2>
    ${sharedSections}
  </main>
</div>
<div class="foot"><div class="b">The Pass 出菜口</div>編輯源頭 · 從 md 自動生成（改 md → 跑 scripts/gen-editor-source-page.ts 重生）</div>
<script src="feedback.js" defer></script>
</body></html>`;

const outPath = join(ROOT, "public/editor-source.html");
writeFileSync(outPath, html);
console.log(`✓ 編輯源頭頁 → ${outPath}`);
console.log(`  來源：${EDITORS.length} 位編輯（soul+memory）+ ${SHARED.length} 份共用守則`);
