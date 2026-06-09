// 示範用：把一份固定的選題資料渲染成 public/selection-report-demo.html。
// 用途：renderer 改版後重新產出示範報告。真實 pipeline 會用 scorer 的輸出取代這份固定資料。
// 跑法：npx tsx scripts/demo-report.ts
import { renderReport, type SelectionReport } from "../src/lib/report";
import { writeFileSync } from "fs";

const r: SelectionReport = {
  issueLabel: "2026-06-10（示範）",
  generatedAt: "2026-06-10",
  stats: { fetched: 200, deduped: 200, candidates: 18, selected: 5 },
  selected: [
    { role: "feature", editor: "mise", weighted: 44.5, title: "世界第一座「培養肉農場」在荷蘭開張", source: "Foovo", lang: "ja", date: "06-09", link: "https://foodtech-japan.com/2026/06/09/respectfarms-2/", dimensions: { surprise: 5, local: 3, human: 4, conversation: 4, substance: 4 }, hook: "養了一輩子牛的荷蘭酪農，開始在自家農場裡「種」細胞肉——這是農夫的下一步，還是最後一步？", note: "從那位酪農的早晨寫起，不要從『培養肉技術』寫起。" },
    { role: "feature", editor: "mise", weighted: 41.5, title: "AI 正在殺死食譜部落格——然後另一個 AI 想救活它們", source: "The Spoon", lang: "en", date: "06-06", link: "https://thespoon.tech/ai-is-breaking-the-recipe-blog-model-allspice-thinks-it-can-also-save-it/", dimensions: { surprise: 5, local: 1, human: 4, conversation: 5, substance: 4 }, hook: "同一個技術同時是兇手和救星，獨立食譜創作者的生計卡在中間——天生就是 The Pass 的調性。" },
    { role: "quick", editor: "passe", weighted: 34.5, title: "AI 兩週「設計」出一塊植物雞肉", source: "Food Tech Insider", lang: "en", date: "06-06", link: "https://foodtechinsider.net/36m-ai-built-a-plant-based-chicken-in-just-2-weeks/", dimensions: { surprise: 5, local: 1, human: 2, conversation: 4, substance: 4 }, hook: "食物研發從此以「週」計？" },
    { role: "quick", editor: "passe", weighted: 32, title: "德國 Formo 用發酵做出牛起司的蛋白質，送 FDA", source: "Foovo", lang: "ja", date: "06-03", link: "https://foodtech-japan.com/2026/06/03/formo-7/", dimensions: { surprise: 4, local: 2, human: 2, conversation: 3, substance: 4 }, hook: "以後的起司，可能沒有牛。" },
    { role: "quick", editor: "passe", weighted: 31.5, title: "Chef Robotics 累計出餐破 1 億份", source: "The Spoon", lang: "en", date: "04-22", link: "https://thespoon.tech/with-over-100-million-meals-served-chef-robotics-hopes-to-become-food-robotics-category-defining-success-story/", dimensions: { surprise: 3, local: 1, human: 4, conversation: 3, substance: 4 }, hook: "機器人廚房過了『玩具』階段，創辦人 8 年長跑的里程碑。" },
  ],
  fumet: {
    question: "一邊是農夫開始在田裡「種」肉，一邊是 AI 開始替我們寫食譜——當「養」和「記」都交給了技術，那個站在爐火前、用手感判斷鹹淡的人，未來到底還算不算數？",
    from: "本期長文：荷蘭培養肉農場 × AI 與食譜部落格",
  },
  backlog: [
    { title: "點餐 AI 與餐廳『好客』能否共存", source: "Restaurant Business", reason: "來源是 podcast 摘要、事實薄，不適合當稿；但它的『效率 vs 溫度』張力是 Fumet 的好素材。" },
    { title: "釀酒廠可能讓植物肉達成本平價", source: "Food Tech Insider", reason: "角度好，但這期替代蛋白已夠多，下期再戰。" },
    { title: "40 家食品巨頭押注再生農業", source: "Food Tech Insider", reason: "偏產業，待找到『人』的角度再上。" },
  ],
  screenedOut: [
    { title: "Chef Robotics 募資 $14.75M", source: "TechCrunch (2024-01)", reason: "⏰ 時效：feed 回傳 2024 舊聞，過期。" },
    { title: "HealthifyMe AI 印度菜辨識", source: "TechCrunch (2023-09)", reason: "⏰ 時效：2023 舊聞。" },
    { title: "Nestlé 收購 Yfood $469M", source: "TechCrunch (2023-04)", reason: "⏰ 時效：2023 舊聞。" },
    { title: "Clover Food Lab 被金主救回", source: "Restaurant Business", reason: "🚫 無 AI/科技角度：純植物餐廳財務。" },
    { title: "Goop 跨足食物", source: "Technically Food", reason: "🚫 無科技角度 + 偏舊。" },
    { title: "Appetronix 併購 Cibotica", source: "The Spoon", reason: "😴 產業 M&A，乾稿、無人味。" },
  ],
  flags: [
    "本期偏替代蛋白（培養肉 / casein / 植物雞肉）——已壓一篇進庫存，你可考慮換更不同領域的進來。",
    "TechCrunch Food feed 一直回 2023–24 舊聞——pipeline 待加嚴格時效過濾。",
    "「40 家食品巨頭」出現兩篇（標題不同、Jaccard 沒抓到是同一則）——語意去重待 LLM 層補強。",
  ],
};

writeFileSync(new URL("../public/selection-report-demo.html", import.meta.url), renderReport(r));
console.log("✓ public/selection-report-demo.html 已重新產出");
