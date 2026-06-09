// 來源狀態頁 — 直接讀 src/lib/sources.ts，每次部署自動反映最新 active/pending 狀態。
// 固定網址：/sources-status（單一真實來源，永遠跟程式一致）。
import { sources, type Source } from "@/lib/sources";

export const metadata = {
  title: "來源狀態 — The Pass",
  description: "The Pass 選題來源的 active / pending 狀態，與程式碼同步。",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Instrument+Serif&display=swap');
:root{--ink:#2C3345;--ink-light:#5A6178;--ink-muted:#8B90A0;--bg:#FAFAF8;--bg-warm:#F5F3EF;--accent:#B8860B;--accent-light:#D4A843;--border:#E8E6E1;--white:#fff;--green:#27AE60;--serif:'Noto Serif TC',Georgia,serif;--sans:'Noto Sans TC',sans-serif;--display:'Instrument Serif',var(--serif);}
*{margin:0;padding:0;box-sizing:border-box}html{font-size:18px}
body{font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.wrap{max-width:960px;margin:0 auto;padding:2.5rem 1.5rem 5rem}
.hero{text-align:center;border-bottom:1px solid var(--border);padding-bottom:1.6rem;margin-bottom:1.5rem}
.hero .label{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:600}
.hero h1{font-family:var(--display);font-size:2.4rem;font-weight:400;margin:.4rem 0 .3rem}
.hero .sub{color:var(--ink-muted);font-size:.9rem}
.stats{display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0 2rem}
.stat{background:var(--white);border:1px solid var(--border);border-radius:8px;padding:.7rem 1.2rem;text-align:center;min-width:96px}
.stat .n{font-family:var(--display);font-size:1.7rem;color:var(--ink)}.stat .l{font-size:.7rem;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.05em}
.stat.on{border-color:var(--green)}.stat.on .n{color:var(--green)}.stat.off{border-color:var(--accent-light)}.stat.off .n{color:var(--accent)}
.callout{background:var(--ink);color:rgba(255,255,255,.92);border-radius:10px;padding:1rem 1.3rem;margin:1.5rem 0;font-size:.9rem;line-height:1.7}.callout b{color:var(--accent-light)}
.sec{margin:2.4rem 0 .6rem}.sec h2{font-family:var(--display);font-size:1.55rem;font-weight:400}
.sub-label{font-family:var(--sans);font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin:1.3rem 0 .4rem}
.tbl{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.86rem;margin-bottom:.5rem}
th{text-align:left;padding:.5rem .6rem;border-bottom:2px solid var(--border);font-size:.68rem;letter-spacing:.04em;color:var(--ink-muted);text-transform:uppercase;white-space:nowrap}
td{padding:.5rem .6rem;border-bottom:1px solid var(--border);vertical-align:top}
td.name{font-weight:600;color:var(--ink);white-space:nowrap}
td.desc{color:var(--ink-light);font-size:.82rem;line-height:1.5}
.chip{font-size:.66rem;font-weight:700;padding:.12rem .5rem;border-radius:100px;white-space:nowrap}
.chip.a{background:rgba(123,138,110,.16);color:#5d6b4e}.chip.b{background:rgba(184,134,11,.14);color:var(--accent)}
.tier{font-family:var(--sans);font-weight:700;color:var(--ink-light);font-size:.8rem}
.feed-y{color:var(--green);font-size:.78rem}.feed-n{color:var(--ink-muted);font-size:.78rem}
.foot{text-align:center;color:var(--ink-muted);font-size:.76rem;margin-top:3rem;border-top:1px solid var(--border);padding-top:1.4rem}
.foot .b{font-family:var(--display);color:var(--ink);font-size:1rem}
@media(max-width:640px){td.desc{display:none}th.desc-h{display:none}}
`;

const CAT_LABEL: Record<string, string> = {
  "ai-food-tech": "AI×食品科技",
  "food-industry": "餐飲產業",
  "culture-opinion": "文化觀點",
  "ai-frontier": "AI 前沿",
  "tech-startup": "科技新創",
};

function Rows({ list }: { list: Source[] }) {
  return (
    <>
      {list
        .slice()
        .sort((a, b) => a.tier - b.tier)
        .map((s) => (
          <tr key={s.id}>
            <td className="name">{s.name}</td>
            <td><span className="tier">T{s.tier}</span></td>
            <td>{CAT_LABEL[s.category] ?? s.category}</td>
            <td>{s.language.toUpperCase()}</td>
            <td>{s.feedUrl ? <span className="feed-y">✓ {s.feedType}</span> : <span className="feed-n">—</span>}</td>
            <td className="desc">{s.description}</td>
          </tr>
        ))}
    </>
  );
}

function Table({ list }: { list: Source[] }) {
  return (
    <div className="tbl">
      <table>
        <thead>
          <tr>
            <th>來源</th>
            <th>Tier</th>
            <th>分類</th>
            <th>語言</th>
            <th>Feed</th>
            <th className="desc-h">說明</th>
          </tr>
        </thead>
        <tbody>
          <Rows list={list} />
        </tbody>
      </table>
    </div>
  );
}

export default function SourcesStatus() {
  const active = sources.filter((s) => s.status === "active");
  const pending = sources.filter((s) => s.status === "pending");
  const byStream = (list: Source[], st: "A" | "B") => list.filter((s) => s.stream === st);
  const pendingFoodA = pending.filter((s) => s.stream === "A" && s.feedUrl).length;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="wrap">
        <div className="hero">
          <div className="label">Source Status · 來源狀態</div>
          <h1>選題來源狀態</h1>
          <div className="sub">與程式碼 sources.ts 同步 · 每次部署自動更新</div>
        </div>

        <div className="stats">
          <div className="stat"><div className="n">{sources.length}</div><div className="l">總來源</div></div>
          <div className="stat on"><div className="n">{active.length}</div><div className="l">Active 抓取中</div></div>
          <div className="stat off"><div className="n">{pending.length}</div><div className="l">Pending 待啟用</div></div>
          <div className="stat"><div className="n">{sources.filter((s) => s.stream === "A").length}/{sources.filter((s) => s.stream === "B").length}</div><div className="l">Stream A / B</div></div>
        </div>

        {pendingFoodA > 0 && (
          <div className="callout">
            💡 Pending 裡有 <b>{pendingFoodA} 個食物來源（Stream A）feed 已驗證可用</b>，隨時可升 active 擴大食物覆蓋（尤其日/韓在地）。
          </div>
        )}

        <div className="sec"><h2>✅ Active — 會被抓取</h2></div>
        <div className="sub-label">Stream A · 食物 → 找 AI</div>
        <Table list={byStream(active, "A")} />
        <div className="sub-label">Stream B · AI 前沿 → 找食物</div>
        <Table list={byStream(active, "B")} />

        <div className="sec"><h2>⏸️ Pending — 待啟用（目前不抓）</h2></div>
        <div className="sub-label">Stream A · 食物來源</div>
        <Table list={byStream(pending, "A")} />
        <div className="sub-label">Stream B · AI / 科技來源</div>
        <Table list={byStream(pending, "B")} />

        <div className="foot">
          <div className="b">The Pass 出菜口</div>
          來源狀態 · 兩條進料線（Stream A/B）× 優先級（Tier 1–5）
        </div>
      </div>
    </>
  );
}
