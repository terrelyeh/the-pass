// 從 sources.ts 自動生成 public/sources.html（選題來源頁，tier 分組的策略呈現）。
// 取代舊的手刻版——單一真實來源 = sources.ts，兩頁(sources.html / sources-status)永遠一致。
// 改了 sources.ts 後重跑：npx tsx scripts/gen-sources-page.ts
import { sources, type Source } from "../src/lib/sources";
import { writeFileSync } from "fs";

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TIER_INFO: Record<number, [string, string]> = {
  1: ["核心信源", "每天必須監測 · The Pass 的主食材"],
  2: ["主力來源", "高頻監測 · 內容骨幹"],
  3: ["補充來源", "在地深度 · 特定領域"],
  4: ["前沿雷達", "AI 前沿淘金 · 低產但可能獨家"],
  5: ["觀察名單", "低產量或實驗性 · 待驗證/觀察"],
};
const CAT: Record<string, string> = { "ai-food-tech": "AI×食品科技", "food-industry": "餐飲產業", "culture-opinion": "文化觀點", "ai-frontier": "AI 前沿", "tech-startup": "科技新創" };

const active = sources.filter((s) => s.status === "active");
const pending = sources.filter((s) => s.status === "pending");
const aCount = sources.filter((s) => s.stream === "A").length;
const bCount = sources.filter((s) => s.stream === "B").length;

function row(s: Source): string {
  const streamChip = `<span class="chip ${s.stream === "A" ? "a" : "b"}">${s.stream}</span>`;
  const status = s.status === "active" ? `<span class="st on">● Active</span>` : `<span class="st off">○ Pending</span>`;
  const feed = s.feedUrl ? `<span class="fy">✓</span>` : `<span class="fn">—</span>`;
  return `<tr><td class="nm">${esc(s.name)}</td><td>${streamChip}</td><td>${CAT[s.category] ?? s.category}</td><td>${s.language.toUpperCase()}</td><td>${status}</td><td>${feed}</td><td class="ds">${esc(s.description)}</td></tr>`;
}

function tierSection(tier: number): string {
  const inTier = sources.filter((s) => s.tier === tier).sort((a, b) => (a.status === b.status ? 0 : a.status === "active" ? -1 : 1));
  if (!inTier.length) return "";
  const [label, desc] = TIER_INFO[tier];
  return `<div class="tier"><div class="tier-h"><span class="tdot t${tier}"></span><span class="tt">Tier ${tier} — ${label}</span></div><p class="td">${desc}</p>
  <div class="tbl"><table><thead><tr><th>來源</th><th>流</th><th>分類</th><th>語言</th><th>狀態</th><th>Feed</th><th class="dh">說明</th></tr></thead><tbody>${inTier.map(row).join("")}</tbody></table></div></div>`;
}

const NAV = `<nav><div class="nav-inner"><a href="project-brief.html" class="nav-brand">The Pass</a><ul class="nav-links">
<li><a href="project-brief.html">提案簡報</a></li><li><a href="editorial-guidelines.html">編輯指南</a></li>
<li><a href="sources.html" class="active">選題來源</a></li><li><a href="illustration-guide.html">插畫指南</a></li>
<li><a href="selection-mechanism.html">篩選機制</a></li><li><a href="implementation-plan.html">實作計畫</a></li>
<li><a href="demo-index.html">Demo</a></li></ul>
<button class="nav-hamburger" onclick="document.querySelector('.nav-links').classList.toggle('mobile-open')" aria-label="選單">☰</button></div></nav>`;

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>選題來源 — The Pass</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--green:#27AE60;--serif:'Noto Serif TC',Georgia,serif;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif',var(--serif);}
*{margin:0;padding:0;box-sizing:border-box}html{font-size:18px}body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,250,248,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.nav-inner{position:relative;max-width:1080px;margin:0 auto;padding:.8rem 1.5rem;display:flex;justify-content:space-between;align-items:center}
.nav-brand{font-family:var(--display);font-size:1.15rem;font-weight:700;color:var(--ink);text-decoration:none}
.nav-links{display:flex;gap:1.3rem;list-style:none}.nav-links a{font-size:.8rem;color:var(--ink-light);text-decoration:none}.nav-links a:hover{color:var(--accent)}.nav-links a.active{color:var(--ink);font-weight:500}
.nav-hamburger{display:none;background:none;border:none;cursor:pointer;font-size:1.4rem;color:var(--ink)}
.wrap{max-width:1040px;margin:0 auto;padding:6rem 1.5rem 5rem}
.hero{text-align:center;border-bottom:1px solid var(--border);padding-bottom:1.6rem;margin-bottom:1.4rem}
.hero .label{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600}
.hero h1{font-family:var(--display);font-size:2.5rem;font-weight:400;margin:.4rem 0 .3rem}
.hero .sub{color:var(--ink-muted);font-size:.9rem;max-width:560px;margin:0 auto}
.stats{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:1.4rem 0 2rem}
.stat{background:var(--white);border:1px solid var(--border);border-radius:8px;padding:.65rem 1.1rem;text-align:center;min-width:90px}
.stat .n{font-family:var(--display);font-size:1.6rem;color:var(--ink)}.stat .l{font-size:.68rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.04em}
.stat.on{border-color:var(--green)}.stat.on .n{color:var(--green)}.stat.off{border-color:var(--accent-light)}.stat.off .n{color:var(--accent)}
.tier{margin:2rem 0}.tier-h{display:flex;align-items:center;gap:.5rem}.tdot{width:9px;height:9px;border-radius:50%}
.t1{background:var(--accent)}.t2{background:#7B8A6E}.t3{background:#6E7F8A}.t4{background:var(--ink-light)}.t5{background:var(--ink-muted)}
.tt{font-family:var(--display);font-size:1.35rem}.td{font-size:.8rem;color:var(--ink-muted);margin:.1rem 0 .5rem 1rem}
.tbl{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.85rem}
th{text-align:left;padding:.45rem .55rem;border-bottom:2px solid var(--border);font-size:.66rem;letter-spacing:.04em;color:var(--ink-muted);text-transform:uppercase;white-space:nowrap}
td{padding:.45rem .55rem;border-bottom:1px solid var(--border);vertical-align:top}td.nm{font-weight:600;white-space:nowrap}td.ds{color:var(--ink-light);font-size:.8rem;line-height:1.5}
.chip{font-size:.66rem;font-weight:700;padding:.1rem .45rem;border-radius:100px}.chip.a{background:rgba(123,138,110,.16);color:#5d6b4e}.chip.b{background:rgba(184,134,11,.14);color:var(--accent)}
.st{font-size:.72rem;font-weight:600;white-space:nowrap}.st.on{color:var(--green)}.st.off{color:var(--accent)}
.fy{color:var(--green)}.fn{color:var(--ink-muted)}
.foot{text-align:center;color:var(--ink-muted);font-size:.76rem;margin-top:3rem;border-top:1px solid var(--border);padding-top:1.4rem}.foot .b{font-family:var(--display);color:var(--ink);font-size:1rem}
.note{background:var(--bg-warm);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;padding:.7rem 1rem;font-size:.82rem;color:var(--ink-light);margin:1rem 0}
@media(max-width:840px){.nav-links{display:none}.nav-hamburger{display:block}.nav-links.mobile-open{display:flex!important;flex-direction:column;position:absolute;top:100%;right:1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.7rem 1rem;gap:.5rem}}
@media(max-width:640px){td.ds,th.dh{display:none}}
</style></head><body>
${NAV}
<div class="wrap">
<div class="hero"><div class="label">Source Directory · 選題來源</div><h1>選題來源</h1>
<p class="sub">The Pass 的內容從這裡來。兩條進料線（Stream A 食物→AI / B AI→食物）× 優先級（Tier 1–5）。本頁由程式 sources.ts 自動生成，每次部署同步。</p></div>
<div class="stats">
<div class="stat"><div class="n">${sources.length}</div><div class="l">總來源</div></div>
<div class="stat on"><div class="n">${active.length}</div><div class="l">Active</div></div>
<div class="stat off"><div class="n">${pending.length}</div><div class="l">Pending</div></div>
<div class="stat"><div class="n">${aCount}/${bCount}</div><div class="l">Stream A / B</div></div>
</div>
<p class="note">本頁＝選題來源與狀態的單一文件，隨 <code>sources.ts</code> 每次部署同步。狀態 <span class="st on">● Active</span> = 進 pipeline 抓取；<span class="st off">○ Pending</span> = 已登錄／部分驗證，尚未啟用。</p>
${[1, 2, 3, 4, 5].map(tierSection).join("")}
<div class="foot"><div class="b">The Pass 出菜口</div>選題來源 · 由 sources.ts 自動生成，全部經 feed 連通 + 食物密度 audit</div>
</div></body></html>`;

writeFileSync(new URL("../public/sources.html", import.meta.url), html);
console.log(`✓ public/sources.html 已從 sources.ts 重新生成（${sources.length} 個來源）`);
