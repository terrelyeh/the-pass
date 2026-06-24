/**
 * gen-backlog-page.ts
 * 把選題庫存（data/backlog.json）渲染成團隊看的網頁 public/backlog.html。
 * 真實來源 = data/backlog.json（由 /selection-report 的 sr-build --save 持久化）。
 *   npx tsx scripts/gen-backlog-page.ts
 * 每次選題 --save 後跑一次即可同步（gitignore 的 backlog.json 不上線，但生成的 html 會 commit 上線）。
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type Entry = {
  title: string; source: string; link?: string; url?: string;
  editor?: "mise" | "passe" | "fumet"; weighted?: number; hook?: string;
  enteredAt?: string; expiresAt?: string; rounds?: number;
};

let backlog: Entry[] = [];
try { backlog = JSON.parse(readFileSync(join(ROOT, "data/backlog.json"), "utf8")); }
catch { backlog = []; }
backlog.sort((a, b) => (b.weighted || 0) - (a.weighted || 0));

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ymd = (iso?: string) => (iso ? String(iso).slice(0, 10) : "—");
const NOW = Date.now();
const daysLeft = (iso?: string) => (iso ? Math.max(0, Math.round((Date.parse(iso) - NOW) / 86400000)) : null);
const EDITOR: Record<string, string> = { mise: "Mise · 長文", passe: "Passe · 快訊", fumet: "Fumet · 提問" };

const cards = backlog.map((e) => {
  const dl = daysLeft(e.expiresAt);
  const href = e.link || e.url || "";
  return `
  <div class="row">
    <div class="score">${e.weighted ?? "—"}</div>
    <div class="body">
      <div class="t">${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(e.title)}</a>` : esc(e.title)}</div>
      ${e.hook ? `<div class="hook">${esc(e.hook)}</div>` : ""}
      <div class="meta"><span class="src">${esc(e.source || "")}</span>${e.editor ? `<span class="ed">${esc(EDITOR[e.editor] || e.editor)}</span>` : ""}<span class="dt">進庫存 ${ymd(e.enteredAt)} · 保鮮到 ${ymd(e.expiresAt)}${dl !== null ? `（剩 ${dl} 天）` : ""}${e.rounds ? ` · 第 ${e.rounds} 輪` : ""}</span></div>
    </div>
  </div>`;
}).join("");

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>選題庫存 — The Pass</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&family=JetBrains+Mono:wght@500&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif','Noto Serif TC',serif;--mono:'JetBrains Mono',monospace;}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.wrap{max-width:1040px;margin:0 auto;padding:2.6rem 1.5rem 5rem}
.back{font-size:.8rem;color:var(--ink-muted);text-decoration:none}.back:hover{color:var(--accent)}
.hero{border-bottom:1px solid var(--border);padding:1rem 0 1.5rem;margin-bottom:.6rem}
.hero .label{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:600}
.hero h1{font-family:var(--display);font-size:2.3rem;font-weight:400;margin:.3rem 0}
.hero .sub{color:var(--ink-light);font-size:.95rem;max-width:600px}
.stat{font-size:.82rem;color:var(--ink-muted);margin:.7rem 0 1.4rem}.stat b{color:var(--accent);font-size:1.1rem;font-family:var(--display)}
.row{display:grid;grid-template-columns:auto 1fr;gap:1rem;align-items:start;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:.9rem 1.1rem;margin:.55rem 0}
.score{font-family:var(--display);font-size:1.5rem;color:var(--accent);min-width:2.2rem;text-align:center;line-height:1.3}
.body .t{font-weight:600;font-size:1rem;line-height:1.45}.body .t a{color:var(--ink);text-decoration:none}.body .t a:hover{color:var(--accent)}
.body .hook{font-family:var(--serif);font-size:.92rem;color:var(--ink-light);margin:.3rem 0 .4rem;line-height:1.7}
.body .meta{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-size:.74rem;color:var(--ink-muted)}
.body .meta .src{font-weight:600;color:var(--ink-light)}
.body .meta .ed{background:var(--bg-warm);border:1px solid var(--border);border-radius:100px;padding:.05rem .5rem}
.empty{background:var(--white);border:1px dashed var(--border);border-radius:10px;padding:1.5rem;text-align:center;color:var(--ink-muted)}
.note{font-family:var(--serif);font-size:.92rem;color:var(--ink-light);border-left:3px solid var(--accent-light);background:var(--bg-warm);border-radius:0 6px 6px 0;padding:.7rem 1rem;margin:1.5rem 0 0}
.foot{text-align:center;color:var(--ink-muted);font-size:.76rem;margin-top:2.5rem;border-top:1px solid var(--border);padding-top:1.4rem}.foot a{color:var(--accent);text-decoration:none}
</style></head><body>
<div class="wrap">
<a class="back" href="hub.html">← 回入口</a>
<div class="hero">
<div class="label">選題庫存 · Backlog</div>
<h1>選題庫存</h1>
<div class="sub">合格、但這期沒選上的稿。保留 30 天，下期跟新文章<b>重新競爭</b>——讓每期都選「當下最好的」，不浪費好料。</div>
</div>
<div class="stat">目前在庫 <b>${backlog.length}</b> 篇 · 保鮮期 30 天 · 依分數排序</div>
${backlog.length ? cards : `<div class="empty">目前庫存是空的——上一期合格的稿都選上了，或都過了保鮮期。</div>`}
<div class="note">庫存怎麼運作：每期選題時，上期庫存的稿會和本期新評分的稿<b>一起排序競爭</b>。選上的出刊、沒選上的留庫存（保留原進庫存日，不續命）；超過 30 天自動淘汰。真實狀態存在 <code>data/backlog.json</code>，這頁由 <code>gen-backlog-page.ts</code> 生成。</div>
<div class="foot">The Pass 出菜口 · 選題庫存 · <a href="selection-report.html">看最新選題報告</a> · <a href="hub.html">系統入口</a></div>
</div></body></html>`;

writeFileSync(join(ROOT, "public/backlog.html"), html);
console.log(`✓ 選題庫存頁 → public/backlog.html（${backlog.length} 篇在庫）`);
