// 產出 public/delivery.html — 顧問交付（獨立文件：左側目錄 + 本週實作 + 累積交付）。
// 新增一期：在 periods 最前面加一筆（含 aiHours / topic）→ npx tsx scripts/gen-delivery.ts → 部署。
import { writeFileSync } from "fs";

interface Deliverable { item: string; value: string; link?: string; status: string }
interface Period {
  label: string; // 2026-06-10
  range: string; // 2026/06/10
  topic: string; // 一句話主題（給左側目錄）
  aiHours: number; // 本期 AI 協作時數
  resultLink?: string; // 本週成果入口（如選題系統 hub）
  tldr: string;
  deliverables: Deliverable[];
  decisions: string[];
  next: string[];
}

const periods: Period[] = [
  {
    label: "2026-06-10",
    range: "2026/06/10",
    topic: "選題自動化系統 + 來源庫收斂",
    aiHours: 4,
    resultLink: "https://thepass.cc/hub.html",
    tldr: "完成「選題自動化系統」與「編輯會議用的選題報告」，並把來源庫收斂成 30 個聚焦食物的來源。本期請團隊拍板一個編輯方向。",
    deliverables: [
      { item: "選題自動化系統", value: "抓取 → 去重 → 初篩 → AI 評分 → 選題報告。把「憑感覺挑題」變成有方法、可重複", status: "完成" },
      { item: "選題報告（會議文件）", value: "建議出刊 + 完整候選名單 + 庫存 + 已篩除理由 + 本週掃描來源，會議可互動挑選", link: "https://thepass.cc/selection-report-demo.html", status: "完成" },
      { item: "來源庫盤點與收斂", value: "審核 50+ 來源 → 收斂成 30 個聚焦食物的來源 + 取材策略", link: "https://thepass.cc/sources-status", status: "完成" },
      { item: "來源審核工具 /audit-sources", value: "一鍵評估新來源該不該收，可重複", link: "https://thepass.cc/audit-sources.html", status: "完成" },
      { item: "統一入口 hub + 機制/審核說明", value: "團隊隨時可看最新狀況", link: "https://thepass.cc/hub.html", status: "完成" },
    ],
    decisions: ["編輯方向：維持嚴格「AI×食物」交集 vs 轉「食物優先、AI 為其中一個角度」（實測候選池已偏後者）"],
    next: ["方向定版後做 /selection-report 定版工具（每期一鍵產報告）", "規劃寫作階段（Mise/Passe/Fumet 把選出的題目寫成一期，對照既有 3 期 demo）"],
  },
];

const baseline = [
  ["品牌定位 + Project Brief + 編輯指南", "https://thepass.cc/project-brief.html"],
  ["三位 AI 編輯人設 + AI 編輯室", "https://thepass.cc/editors.html"],
  ["3 期 Demo Issues（成品格式範本）", "https://thepass.cc/demo-index.html"],
  ["域名 thepass.cc + Vercel 部署", "https://thepass.cc"],
];

const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const totalHours = periods.reduce((n, p) => n + p.aiHours, 0);
const totalItems = periods.reduce((n, p) => n + p.deliverables.length, 0);

const periodBlock = (p: Period, isLatest: boolean) => `
  <section id="p-${esc(p.label)}" class="period">
    <div class="p-head"><h2>${isLatest ? "本週實作" : esc(p.range)}</h2><span class="p-when">${esc(p.label)} · AI 協作 ${p.aiHours} hr</span></div>
    <p class="tldr">${esc(p.tldr)}</p>
    ${p.resultLink ? `<p class="result"><a href="${esc(p.resultLink)}" target="_blank" rel="noopener">→ 看本週成果（選題系統入口）</a></p>` : ""}
    <div class="tbl"><table><thead><tr><th>交付項目</th><th>內容 / 價值</th><th>連結</th><th>狀態</th></tr></thead><tbody>
      ${p.deliverables.map((d) => `<tr><td class="it">${esc(d.item)}</td><td class="v">${esc(d.value)}</td><td>${d.link ? `<a href="${esc(d.link)}" target="_blank" rel="noopener">↗</a>` : "—"}</td><td class="st">${esc(d.status)}</td></tr>`).join("")}
    </tbody></table></div>
    <div class="blk decide"><h3>需團隊決策</h3><ul>${p.decisions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="blk"><h3>接下來任務</h3><ul>${p.next.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  </section>`;

const html = `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>顧問交付 — The Pass</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--green:#27AE60;--serif:'Noto Serif TC',Georgia,serif;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif',var(--serif);}
*{margin:0;padding:0;box-sizing:border-box}html{font-size:18px;scroll-behavior:smooth}body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.top{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--border);background:var(--white)}
.top-in{max-width:1080px;margin:0 auto;padding:.5rem 1.5rem;display:flex;justify-content:space-between;align-items:center}
.top h1{font-family:var(--display);font-size:1.25rem;font-weight:400;line-height:1.25}
.top .stat{font-size:.78rem;color:var(--ink-muted)}.top .stat b{color:var(--accent);font-family:var(--display);font-size:1.05rem}
.layout{display:grid;grid-template-columns:210px 1fr;max-width:1080px;margin:0 auto;min-height:calc(100vh - 4rem)}
.side{position:sticky;top:2.9rem;align-self:start;height:calc(100vh - 2.9rem);overflow-y:auto;border-right:1px solid var(--border);background:var(--white);padding:1.6rem 1rem 2rem 1.25rem}
.side .lbl{font-size:.62rem;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-muted);font-weight:600;margin-bottom:.7rem}
.side a{display:block;text-decoration:none;padding:.45rem .6rem;border-radius:6px;margin-bottom:.2rem}.side a:hover{background:var(--bg-warm)}
.side a .d{font-size:.78rem;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums;display:block}.side a .t{font-size:.74rem;color:var(--ink-light);line-height:1.25;display:block;margin-top:.05rem}
.side .more{font-size:.7rem;color:var(--ink-muted);margin-top:.4rem;padding:.3rem .6rem}
.main{padding:1.8rem 2rem 4rem;max-width:760px}
.period{margin-bottom:2.5rem;scroll-margin-top:3.2rem}
.p-head{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.5rem;border-bottom:2px solid var(--accent-light);padding-bottom:.4rem;margin-bottom:.7rem}
.p-head h2{font-family:var(--display);font-size:1.5rem;font-weight:400}.p-when{font-size:.78rem;color:var(--ink-muted)}
.tldr{font-family:var(--serif);font-size:1rem;line-height:1.75;color:var(--ink);margin:.4rem 0 .6rem}
.result{margin:0 0 .9rem;font-size:.86rem;font-weight:500}
.tbl{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.86rem}
th{text-align:left;padding:.45rem .6rem;border-bottom:2px solid var(--border);font-size:.66rem;letter-spacing:.04em;color:var(--ink-muted);text-transform:uppercase;white-space:nowrap}
td{padding:.5rem .6rem;border-bottom:1px solid var(--border);vertical-align:top}td.it{font-weight:600;white-space:nowrap}td.v{color:var(--ink-light);font-size:.83rem;line-height:1.55}td.st{text-align:center;color:var(--green);font-weight:600;white-space:nowrap}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.blk h3{font-size:.74rem;font-weight:700;letter-spacing:.04em;color:var(--accent);text-transform:uppercase;margin:.8rem 0 .3rem}
.blk li,.lst li{list-style:none;position:relative;padding-left:1.2rem;font-size:.9rem;line-height:1.7;margin:.15rem 0}
.blk li::before,.lst li::before{content:'▸';position:absolute;left:0;color:var(--accent-light)}
.decide li::before{content:'◆';color:var(--accent)}
.sec-h{font-family:var(--display);font-size:1.35rem;font-weight:400;margin:2rem 0 .5rem;padding-top:.5rem;border-top:1px solid var(--border)}
.foot{color:var(--ink-muted);font-size:.76rem;margin-top:2.5rem;border-top:1px solid var(--border);padding-top:1.3rem}.foot .b{font-family:var(--display);color:var(--ink);font-size:1rem}
@media(max-width:820px){.layout{grid-template-columns:1fr}.side{display:none}.main{padding:1.3rem 1.4rem 3rem}.top h1{font-size:1.2rem}}
</style></head><body>
<div class="top"><div class="top-in">
  <h1>AI 編輯專案 ｜ 顧問交付紀錄</h1>
  <div class="stat">累計 <b>${totalItems}</b> 項交付 · AI 協作 <b>${totalHours}</b> hr</div>
</div></div>
<div class="layout">
  <aside class="side">
    <div class="lbl">進度紀錄</div>
    ${periods.map((p) => `<a href="#p-${esc(p.label)}"><span class="d">${esc(p.label)}</span><span class="t">${esc(p.topic)}</span></a>`).join("")}
  </aside>
  <main class="main">
    ${periods.map((p, i) => periodBlock(p, i === 0)).join("")}
    <h2 class="sec-h">既有基礎</h2>
    <ul class="lst">${baseline.map(([t, l]) => `<li><a href="${esc(l)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join("")}</ul>
    <div class="foot"><div class="b">The Pass 出菜口</div>顧問交付 · Terrel Yeh · AI 輔助實作</div>
  </main>
</div></body></html>`;

writeFileSync(new URL("../public/delivery.html", import.meta.url), html);
console.log(`✓ public/delivery.html（${periods.length} 期 · 累計 ${totalItems} 項 · AI ${totalHours} hr）`);
