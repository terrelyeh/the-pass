// === 選題報告產生器 ===
// 每期 pipeline 跑完（fetch→dedup→Opus 評估）後，把結果渲染成「內部選題報告」HTML，
// 供總編 + 團隊開選題會、做最後拍板。設計見 docs/selection-mechanism.md §7。

import type { Dimensions, Editor } from "./scorer";

export interface ReportPiece {
  title: string;
  source: string;
  lang?: string;
  date?: string;
  link: string;
  dimensions: Dimensions;
  weighted: number;
  editor: Editor;
  role: "feature" | "quick"; // 出刊角色：長文（Mise）/ 快訊（Passe）
  hook: string; // 主理由「為什麼是這篇」
  angles?: string[]; // 切角選項（≥2，供選題會挑換）
}

// Fumet 的結尾提問：從本期選出的長文「提煉」而來，不是從候選選稿、不打分。
export interface FumetQuestion {
  question: string;
  from: string; // 提煉自哪幾篇長文
}

export interface ReportReject {
  title: string;
  source: string;
  reason: string;
  link?: string; // 來源連結（庫存/已篩除也附上）
}

// 本週掃描的 active 來源與抓回篇數
export interface ScannedSource {
  name: string;
  count: number;
  stream?: "A" | "B";
}

// 候選名單一列（完整候選池，供選題會自由挑換）
export interface CandidateRow {
  title: string;
  source: string;
  link: string;
  weighted: number;
  editor: Editor;
  oneLine: string;
}

export interface SelectionReport {
  issueLabel: string; // 例：2026-06-10（週二）
  generatedAt: string;
  stats: { fetched: number; deduped: number; candidates: number; selected: number };
  selected: ReportPiece[]; // 只含長文 + 快訊（從候選池選+打分）
  fumet?: FumetQuestion; // 結尾提問（從本期長文提煉）
  backlog: ReportReject[]; // 合格沒選上（reason = 為什麼進庫存）
  screenedOut: ReportReject[]; // 硬閘門砍（reason = 為什麼）
  flags: string[]; // 編輯室提醒
  scannedSources?: ScannedSource[]; // 本週掃描來源列表與狀態
  candidatePool?: CandidateRow[]; // 完整候選名單（供選題會挑換）
}

const EDITOR_LABEL: Record<Editor, string> = { mise: "Mise 長文", passe: "Passe 快訊" };
const DIM_LABEL = [
  ["surprise", "驚喜"],
  ["local", "在地"],
  ["human", "人味"],
  ["conversation", "可談"],
  ["substance", "扎實"],
] as const;

const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function dimBars(d: Dimensions): string {
  return `<div class="dims">${DIM_LABEL.map(([k, label]) => {
    const v = d[k as keyof Dimensions];
    return `<div class="dim"><span class="dl">${label}</span><span class="db"><span class="dbf" style="width:${(v / 5) * 100}%"></span></span><span class="dv">${v}</span></div>`;
  }).join("")}</div>`;
}

function pieceCard(p: ReportPiece, idx: number): string {
  const roleClass = p.role === "feature" ? "feature" : "quick";
  const angles = p.angles && p.angles.length ? p.angles : [];
  const anglesHtml = angles.length
    ? `<div class="angles"><div class="angles-h">🎬 切角（A 為預設，點選即換）</div>${angles
        .map((a, i) => `<div class="angle${i === 0 ? " sel" : ""}"><span class="angle-k">${["A", "B", "C", "D"][i] ?? String(i + 1)}</span><span class="angle-t">${esc(a)}</span></div>`)
        .join("")}</div>`
    : "";
  return `
  <div class="piece ${roleClass}" data-decidable>
    <div class="piece-head">
      <span class="rank">${idx}</span>
      <span class="editor editor-${p.editor}">${EDITOR_LABEL[p.editor]}</span>
      <span class="weighted">${p.weighted}</span>
      <span class="decide">
        <label><input type="checkbox" class="dc-adopt" checked> 採用</label>
        <label><input type="checkbox" class="dc-backlog"> 退庫存</label>
      </span>
    </div>
    <h3>${esc(p.title)}</h3>
    <div class="meta">${esc(p.source)}${p.lang ? " · " + esc(p.lang) : ""}${p.date ? " · " + esc(p.date) : ""} · <a href="${esc(p.link)}" target="_blank" rel="noopener">原文 ↗</a></div>
    ${dimBars(p.dimensions)}
    <p class="hook"><strong>💡 為什麼是這篇：</strong>${esc(p.hook)}</p>
    ${anglesHtml}
  </div>`;
}

export function renderReport(r: SelectionReport): string {
  const features = r.selected.filter((p) => p.role === "feature");
  const quicks = r.selected.filter((p) => p.role === "quick");

  const rejectRows = (items: ReportReject[]) =>
    items
      .map(
        (x) =>
          `<tr><td>${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.title)} ↗</a>` : esc(x.title)}</td><td class="src">${esc(x.source)}</td><td class="why">${esc(x.reason)}</td></tr>`
      )
      .join("");

  return `<!DOCTYPE html>
<html lang="zh-Hant"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>選題報告 ${esc(r.issueLabel)} — The Pass</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--red:#C0392B;--green:#27AE60;--serif:'Noto Serif TC',Georgia,serif;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif',var(--serif);}
*{margin:0;padding:0;box-sizing:border-box}html{font-size:19px}body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.72;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.layout{display:flex;align-items:flex-start}
.sidebar{position:sticky;top:0;align-self:flex-start;width:208px;flex:none;height:100vh;overflow-y:auto;border-right:1px solid var(--border);background:var(--bg-warm);padding:1.4rem .9rem}
.sb-h{font-family:var(--display);font-size:1.15rem;color:var(--ink);margin:0 .4rem .15rem}
.sb-sub{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-muted);margin:0 .4rem 1rem}
.issue-list a{display:block;padding:.4rem .55rem;border-radius:7px;font-size:.82rem;color:var(--ink-light);text-decoration:none;margin:.12rem 0;font-variant-numeric:tabular-nums}
.issue-list a:hover{background:var(--white)}
.issue-list a.current{background:var(--accent);color:#fff;font-weight:600}
.issue-list .empty{font-size:.74rem;color:var(--ink-muted);padding:.4rem .55rem;display:block}
.main{flex:1;min-width:0}
.export-btn{font-family:var(--sans);font-size:.78rem;font-weight:600;color:#fff;background:var(--accent);border:none;border-radius:8px;padding:.5rem .9rem;cursor:pointer;margin:.2rem 0 .7rem .5rem}
.export-btn:hover{background:#a6790a}
.wrap{max-width:880px;margin:0 auto;padding:2.5rem 1.5rem 5rem}
@media(max-width:760px){.layout{flex-direction:column}.sidebar{position:static;width:100%;height:auto;border-right:none;border-bottom:1px solid var(--border);padding:.6rem .8rem;display:flex;align-items:baseline;gap:.4rem}.sb-sub{display:none}.issue-list{display:flex;gap:.3rem;overflow-x:auto}.issue-list a{white-space:nowrap;margin:0}.issue-list .empty{white-space:nowrap}}
.hero{text-align:center;border-bottom:1px solid var(--border);padding-bottom:1.75rem;margin-bottom:1.5rem}
.hero .label{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600}
.hero h1{font-family:var(--display);font-size:2.4rem;font-weight:400;margin:.4rem 0 .3rem}
.hero .sub{color:var(--ink-muted);font-size:.85rem}
.funnel{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0 2.5rem}
.fstep{background:var(--white);border:1px solid var(--border);border-radius:8px;padding:.6rem 1rem;text-align:center;min-width:90px}
.fstep .n{font-family:var(--display);font-size:1.5rem;color:var(--ink)}.fstep .l{font-size:.65rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.05em}
.fstep.hi{border-color:var(--accent-light);background:#fffdf6}.fstep.hi .n{color:var(--accent)}
.farrow{align-self:center;color:var(--accent);font-size:1.1rem}
.sec{margin:2.5rem 0 1rem}.sec h2{font-family:var(--display);font-size:1.5rem;font-weight:400}.sec .h-sub{font-size:.78rem;color:var(--ink-muted);margin-top:.15rem}
.block-label{font-family:var(--sans);font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin:1.5rem 0 .5rem}
.piece{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:1.1rem 1.3rem;margin:.7rem 0;position:relative;overflow:hidden}
.piece::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;background:var(--accent-light)}
.piece.feature::before{background:var(--accent);width:4px}.piece.fumet::before{background:#7B8A6E}
.piece-head{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.4rem}
.rank{font-family:var(--display);font-size:1.1rem;color:var(--ink-muted);min-width:1.2rem}
.editor{font-size:.66rem;font-weight:700;padding:.18rem .55rem;border-radius:100px;color:#fff}
.editor-mise{background:var(--accent)}.editor-passe{background:#5A6178}.editor-fumet{background:#7B8A6E}
.weighted{font-family:var(--display);font-size:1.35rem;color:var(--ink);margin-left:.1rem}
.weighted::before{content:'分 ';font-family:var(--sans);font-size:.6rem;color:var(--ink-muted);vertical-align:middle}
.decide{margin-left:auto;display:flex;gap:.7rem;font-size:.72rem;color:var(--ink-light)}
.decide label{cursor:pointer;user-select:none}.decide input{vertical-align:-1px}
.piece h3{font-family:var(--serif);font-size:1.05rem;font-weight:600;line-height:1.45;margin:.1rem 0}
.meta{font-size:.72rem;color:var(--ink-muted);margin-bottom:.55rem}.meta a{color:var(--accent);text-decoration:none}
.dims{display:flex;flex-wrap:wrap;gap:.4rem .9rem;margin:.5rem 0 .6rem}
.dim{display:flex;align-items:center;gap:.35rem;font-size:.8rem}
.dim .dl{color:var(--ink-muted);min-width:1.9rem}.dim .db{width:54px;height:6px;background:var(--bg-warm);border-radius:3px;overflow:hidden}
.dim .dbf{display:block;height:100%;background:var(--accent-light)}.dim .dv{font-weight:700;color:var(--ink-light)}
.hook{font-family:var(--serif);font-size:1.02rem;line-height:1.72;margin:.4rem 0 .2rem}.hook strong{color:var(--accent)}
.note{font-size:.86rem;color:var(--ink-light);font-style:italic}
.angles{margin-top:.5rem;padding-top:.5rem;border-top:1px dashed var(--border)}
.angles-h{font-size:.72rem;font-weight:700;color:var(--accent);letter-spacing:.03em;margin-bottom:.3rem}
.angle{font-size:.86rem;color:var(--ink-light);line-height:1.55;margin:.12rem 0;display:flex;gap:.5rem;align-items:baseline;cursor:pointer;border-radius:6px;padding:.25rem .4rem;transition:background .12s}
.angle:hover{background:var(--bg-warm)}
.angle.sel{background:#fffaf0;box-shadow:inset 0 0 0 1px var(--accent-light)}.angle.sel .angle-t{color:var(--ink);font-weight:500}
.angle-k{font-family:var(--sans);font-size:.66rem;font-weight:700;color:#fff;background:var(--accent-light);border-radius:4px;padding:.05rem .4rem;flex:none}
.angle.sel .angle-k{background:var(--accent)}
.piece.dropped{opacity:.45}.piece.dropped h3{text-decoration:line-through}.piece.dropped .angles{display:none}
.piece.reangle{box-shadow:inset 0 0 0 1.5px var(--accent-light)}.piece.reangle .angles{background:#fffdf6;border-radius:6px;padding:.5rem .6rem;border-top:none}
.decide-summary{font-family:var(--sans);font-size:.84rem;font-weight:600;color:var(--ink-light);background:var(--bg-warm);border:1px solid var(--border);border-radius:8px;padding:.45rem .9rem;display:inline-block;margin:.2rem 0 .7rem}.decide-summary b{color:var(--ink)}
.piece.fumet-q::before{background:#7B8A6E;width:4px}
.fq{font-family:var(--serif);font-size:1.1rem;line-height:1.75;color:var(--ink);margin:.35rem 0 .2rem}
.fq-tag{margin-left:auto;font-size:.66rem;color:var(--ink-muted)}
table{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:.5rem}
th{text-align:left;padding:.45rem .6rem;border-bottom:2px solid var(--border);font-size:.66rem;letter-spacing:.05em;color:var(--ink-muted);text-transform:uppercase}
td{padding:.5rem .6rem;border-bottom:1px solid var(--border);vertical-align:top}td.src{color:var(--ink-muted);white-space:nowrap;font-size:.74rem}td.why{color:var(--ink-light)}
table a{color:var(--accent);text-decoration:none}table a:hover{text-decoration:underline}
.flags{background:var(--ink);color:rgba(255,255,255,.9);border-radius:10px;padding:1.1rem 1.4rem;margin-top:.6rem}
.flags li{list-style:none;padding-left:1.2rem;position:relative;margin:.45rem 0;font-size:.85rem}
.flags li::before{content:'▸';position:absolute;left:0;color:var(--accent-light)}
.foot{text-align:center;color:var(--ink-muted);font-size:.72rem;margin-top:3rem;border-top:1px solid var(--border);padding-top:1.5rem}
.foot .b{font-family:var(--display);color:var(--ink);font-size:.95rem}
@media print{.decide,.sidebar,.export-btn{display:none}.layout{display:block}body{background:#fff}}
</style></head><body>
<div class="layout">
<aside class="sidebar"><div class="sb-h">The Pass</div><div class="sb-sub">選題報告</div><nav class="issue-list" id="issueList"><span class="empty">載入中…</span></nav></aside>
<div class="main">
<div class="wrap">
  <div class="hero">
    <div class="label">Editorial Selection · 選題報告</div>
    <h1>本期選題提案</h1>
    <div class="sub">${esc(r.issueLabel)} · 由 pipeline 自動初選，供選題會拍板 · 產出 ${esc(r.generatedAt)}</div>
  </div>

  <div class="funnel">
    <div class="fstep"><div class="n">${r.stats.fetched}</div><div class="l">抓取</div></div>
    <div class="farrow">→</div>
    <div class="fstep"><div class="n">${r.stats.deduped}</div><div class="l">去重後</div></div>
    <div class="farrow">→</div>
    <div class="fstep"><div class="n">${r.stats.candidates}</div><div class="l">候選</div></div>
    <div class="farrow">→</div>
    <div class="fstep hi"><div class="n">${r.stats.selected}</div><div class="l">建議入選</div></div>
  </div>

  <div class="sec"><h2>本期建議出刊</h2><div class="h-sub">每篇附五面向分數 + 主理由 + 多個切角（A 為預設，點 B/C 即換角度）。採用/退庫存即時更新；不存檔，純會議輔助。</div></div>
  <div class="decide-summary" id="ds">採用 <b>—</b> · 換角度 <b>—</b> · 退庫存 <b>—</b></div><button class="export-btn" id="exportBtn">⬇ 匯出決定</button>
  ${features.length ? `<div class="block-label">長文（Mise）</div>${features.map((p, i) => pieceCard(p, i + 1)).join("")}` : ""}
  ${quicks.length ? `<div class="block-label">快訊（Passe）</div>${quicks.map((p, i) => pieceCard(p, features.length + i + 1)).join("")}` : ""}
  ${
    r.fumet
      ? `<div class="block-label">結尾提問（Fumet）</div>
    <div class="piece fumet-q">
      <div class="piece-head"><span class="editor editor-fumet">Fumet 提問</span><span class="fq-tag">從本期長文提煉 · 非選稿</span></div>
      <p class="fq">${esc(r.fumet.question)}</p>
      <p class="note">🧩 提煉自：${esc(r.fumet.from)}</p>
    </div>`
      : ""
  }

  ${
    r.candidatePool && r.candidatePool.length
      ? `<div class="sec"><h2>候選名單（完整候選池）</h2><div class="h-sub">本期所有通過 Opus 評估的候選（${r.candidatePool.length} 則），依分數排序，供選題會自由挑換。</div></div>
  <div class="tbl-wrap"><table><thead><tr><th>#</th><th>分</th><th>編輯</th><th>標題</th><th>來源</th><th class="dh">一句話</th></tr></thead><tbody>${r.candidatePool
          .map(
            (c, i) =>
              `<tr><td>${i + 1}</td><td><strong>${c.weighted}</strong></td><td><span class="badge ${c.editor === "mise" ? "pass" : "warn"}">${c.editor}</span></td><td><a href="${esc(c.link)}" target="_blank" rel="noopener">${esc(c.title)} ↗</a></td><td class="src">${esc(c.source)}</td><td class="why">${esc(c.oneLine)}</td></tr>`
          )
          .join("")}</tbody></table></div>`
      : ""
  }

  ${
    r.backlog.length
      ? `<div class="sec"><h2>進庫存</h2><div class="h-sub">合格但這期沒選上——下期重新競爭 / 餵 IG / 月報。</div></div>
  <table><thead><tr><th>標題</th><th>來源</th><th>為什麼進庫存</th></tr></thead><tbody>${rejectRows(r.backlog)}</tbody></table>`
      : ""
  }

  ${
    r.screenedOut.length
      ? `<div class="sec"><h2>已篩除</h2><div class="h-sub">硬閘門砍掉——讓你知道沒漏掉，也看得到判斷理由。</div></div>
  <table><thead><tr><th>標題</th><th>來源</th><th>為什麼砍</th></tr></thead><tbody>${rejectRows(r.screenedOut)}</tbody></table>`
      : ""
  }

  ${
    r.flags.length
      ? `<div class="sec"><h2>編輯室提醒</h2></div><div class="flags"><ul>${r.flags.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`
      : ""
  }

  ${
    r.scannedSources && r.scannedSources.length
      ? `<div class="sec"><h2>本週掃描來源</h2><div class="h-sub">這期實際抓取的 active 來源與抓回篇數（共 ${r.scannedSources.length} 個來源、${r.scannedSources.reduce((n, s) => n + s.count, 0)} 篇）。</div></div>
  <div class="tbl-wrap"><table><thead><tr><th>來源</th><th>流</th><th>抓回篇數</th></tr></thead><tbody>${r.scannedSources
          .slice()
          .sort((a, b) => b.count - a.count)
          .map((s) => `<tr><td>${esc(s.name)}</td><td>${s.stream ? `<span class="badge ${s.stream === "A" ? "pass" : "warn"}">${s.stream}</span>` : "—"}</td><td>${s.count}</td></tr>`)
          .join("")}</tbody></table></div>`
      : ""
  }

  <div class="foot"><div class="b">The Pass 出菜口</div>內部選題報告 · 機器初選、人來拍板</div>
</div>
</div></div>
<script>
window.__ISSUE_DATE__=${JSON.stringify(r.generatedAt)};
(function(){
  function refresh(){
    var a=0,c=0,b=0;
    document.querySelectorAll('.piece[data-decidable]').forEach(function(p){
      var ad=p.querySelector('.dc-adopt'),bk=p.querySelector('.dc-backlog');
      p.classList.toggle('dropped', bk.checked);
      var angs=p.querySelectorAll('.angle'), sel=0;
      angs.forEach(function(el,i){ if(el.classList.contains('sel')) sel=i; });
      var changed = sel>0 && !bk.checked;
      p.classList.toggle('reangle', changed);
      if(bk.checked) b++; else if(ad.checked) a++;
      if(changed) c++;
    });
    var ds=document.getElementById('ds');
    if(ds) ds.innerHTML='採用 <b>'+a+'</b> · 換角度 <b>'+c+'</b> · 退庫存 <b>'+b+'</b>';
  }
  document.addEventListener('click', function(e){
    var ang=e.target.closest ? e.target.closest('.angle') : null;
    if(!ang) return;
    var p=ang.closest('.piece'); if(!p) return;
    p.querySelectorAll('.angle').forEach(function(el){ el.classList.remove('sel'); });
    ang.classList.add('sel');
    refresh();
  });
  document.addEventListener('change', function(e){
    var t=e.target; if(!t.classList) return;
    if(!(t.classList.contains('dc-adopt')||t.classList.contains('dc-backlog'))) return;
    var p=t.closest('.piece');
    if(t.classList.contains('dc-backlog') && t.checked){ var ad=p.querySelector('.dc-adopt'); if(ad) ad.checked=false; }
    if(t.classList.contains('dc-adopt') && t.checked){ var bk=p.querySelector('.dc-backlog'); if(bk) bk.checked=false; }
    refresh();
  });
  refresh();

  // 左側日期切換：讀 selection-reports.json（永遠最新），列出所有期、highlight 本期
  (function loadIssues(){
    var box=document.getElementById('issueList'); if(!box) return;
    fetch('selection-reports.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(list){
      if(!list||!list.length){ box.innerHTML='<span class="empty">（尚無其他期）</span>'; return; }
      box.innerHTML=list.map(function(it){
        var cur=it.date===window.__ISSUE_DATE__?' class="current"':'';
        return '<a href="selection-report-'+it.date+'.html"'+cur+'>'+it.date+'</a>';
      }).join('');
    }).catch(function(){ box.innerHTML='<span class="empty">（索引讀取失敗）</span>'; });
  })();

  // 匯出決定：採用/退庫存 + 選的切角 → Markdown → 複製到剪貼簿（貼進 Obsidian 會議與決策）
  var btn=document.getElementById('exportBtn');
  if(btn) btn.addEventListener('click', function(){
    var adopt=[], drop=[];
    document.querySelectorAll('.piece[data-decidable]').forEach(function(p){
      var h=p.querySelector('h3'), title=h?h.textContent.trim():'';
      var e=p.querySelector('.editor'), ed=e?e.textContent.trim():'';
      var bk=p.querySelector('.dc-backlog'), ad=p.querySelector('.dc-adopt');
      if(bk&&bk.checked){ drop.push('- '+title); return; }
      if(ad&&ad.checked){
        var sel=p.querySelector('.angle.sel .angle-t');
        adopt.push('- **'+title+'**（'+ed+'）'+(sel?'｜切角：'+sel.textContent.trim():''));
      }
    });
    var md='# 選題決定 '+window.__ISSUE_DATE__+'\\n\\n## 採用（'+adopt.length+'）\\n'+(adopt.join('\\n')||'（無）')+'\\n\\n## 退庫存（'+drop.length+'）\\n'+(drop.join('\\n')||'（無）')+'\\n';
    function done(){ btn.textContent='✓ 已複製，貼進 Obsidian'; setTimeout(function(){ btn.textContent='⬇ 匯出決定'; },2500); }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(md).then(done,function(){ window.prompt('複製以下決定：',md); }); }
    else window.prompt('複製以下決定：',md);
  });
})();
</script>
</body></html>`;
}
