// 產出 public/selection-report-demo.html。
// 目前內容 = 2026-06-10 第一次編輯會議的真實 curate（29 來源、總編輯人工評分）。
// renderer 改版或重新 curate 後重跑：npx tsx scripts/demo-report.ts
import { renderReport, type SelectionReport } from "../src/lib/report";
import { writeFileSync } from "fs";

const FT = "Food Tech Insider", FV = "Foovo", RB = "Restaurant Business", AGF = "AgFunder News", DFL = "DigitalFoodLab", TS_ = "The Spoon", TF = "식품음료신문 (Thinkfood)", JM = "Jennifer Makan";

const r: SelectionReport = {
  issueLabel: "2026-06-10 · 第一次編輯會議",
  generatedAt: "2026-06-10",
  stats: { fetched: 365, deduped: 344, candidates: 40, selected: 6 },
  selected: [
    { role: "feature", editor: "mise", weighted: 44.5, title: "世界第一座「培養肉農場」在荷蘭開張", source: FV, lang: "ja", date: "06-09", link: "https://foodtech-japan.com/2026/06/09/respectfarms-2/", dimensions: { surprise: 5, local: 3, human: 4, conversation: 4, substance: 4 }, hook: "養了一輩子牛的荷蘭酪農，開始在自家農場裡「種」細胞肉——這是農夫的下一步，還是最後一步？", angles: ["從那位酪農的早晨寫起——他第一次走進『種肉』設備那天", "從消費者角度：第一個吃到『農場細胞肉』的人，怎麼形容那個味道", "從爭議切：當農場開始『種』肉，誰還算農夫？"] },
    { role: "feature", editor: "mise", weighted: 41, title: "拜託，別用 AI 幫你從酒單上點酒", source: JM, lang: "en", date: "06-08", link: "https://jennifermakan.substack.com/p/for-fcks-sake-dont-use-ai-to-order", dimensions: { surprise: 4, local: 2, human: 4, conversation: 5, substance: 4 }, hook: "獨立寫作者的怒吼：當 AI 能告訴你該喜歡哪支酒，那「品味」還剩多少是你的？", angles: ["保留她的第一人稱怒氣與幽默，原汁原味", "拉到普世：當 AI 幫你選，你還會『犯錯』與『發現』嗎", "對照：侍酒師的『手感』vs 演算法的『最佳解』"] },
    { role: "quick", editor: "passe", weighted: 38, title: "AI 生成的「假醫生」賣保健食品，遭韓國食藥處查處", source: TF, lang: "ko", date: "06-10", link: "https://www.thinkfood.co.kr/news/articleView.html?idxno=200527", dimensions: { surprise: 4, local: 4, human: 2, conversation: 4, substance: 3 }, hook: "AI 捏造的醫生，正在你的社群賣食品。", angles: ["從受害者：相信『醫生』而買了食品的人", "從監管：食藥處怎麼抓到 AI 假醫生"] },
    { role: "quick", editor: "passe", weighted: 36, title: "用二氧化碳做的蛋白質「Solein」在美國開賣", source: FV, lang: "ja", date: "06-10", link: "https://foodtech-japan.com/2026/06/10/solar-foods-19/", dimensions: { surprise: 5, local: 2, human: 2, conversation: 4, substance: 3 }, hook: "從空氣裡長出來的蛋白質，上架了。", angles: ["從一口的角度：第一個吃到『空氣蛋白質』的人", "從危機：糧食短缺下，這是救命還是噱頭"] },
    { role: "quick", editor: "passe", weighted: 34.5, title: "AI 兩週「設計」出一塊植物雞肉", source: FT, lang: "en", date: "06-07", link: "https://foodtechinsider.net/36m-ai-built-a-plant-based-chicken-in-just-2-weeks/", dimensions: { surprise: 5, local: 1, human: 2, conversation: 4, substance: 4 }, hook: "食物研發從此以「週」計？", angles: ["從速度震撼：兩週 vs 傳統數年", "從『誰被取代』：食品研發員怎麼看"] },
    { role: "quick", editor: "passe", weighted: 34, title: "漢堡連鎖放棄植物肉，把焦點換回「真蔬菜」", source: RB, lang: "en", date: "06-08", link: "https://www.restaurantbusinessonline.com/food/burger-chains-rethink-plant-based-burgers-putting-focus-vegetables", dimensions: { surprise: 4, local: 2, human: 2, conversation: 4, substance: 4 }, hook: "植物『肉』退燒，真蔬菜回來了——White Castle、Shake Shack 帶頭。", angles: ["從鐘擺：植物『肉』退燒、真蔬菜回潮", "從消費者：為什麼大家不想吃『假肉』了"] },
  ],
  fumet: {
    question: "一邊我們開始用細胞「種」出肉，一邊有人勸你別讓 AI 幫你選酒——當技術既能造出食物、又能告訴你該喜歡什麼，那一頓飯裡，還剩多少「口味」真的是你自己的？",
    from: "本期長文：荷蘭培養肉農場 × 別用 AI 點酒",
  },
  candidatePool: [
    { title: "世界第一座「培養肉農場」在荷蘭開張", source: FV, link: "https://foodtech-japan.com/2026/06/09/respectfarms-2/", weighted: 44.5, editor: "mise", oneLine: "酪農在農場裡『種』細胞肉" },
    { title: "拜託，別用 AI 幫你點酒", source: JM, link: "https://jennifermakan.substack.com/p/for-fcks-sake-dont-use-ai-to-order", weighted: 41, editor: "mise", oneLine: "AI 告訴你該喜歡什麼酒，品味還是你的嗎" },
    { title: "AI 假醫生賣保健食品遭韓國查處", source: TF, link: "https://www.thinkfood.co.kr/news/articleView.html?idxno=200527", weighted: 38, editor: "passe", oneLine: "AI 捏造的醫生在社群賣食品" },
    { title: "為什麼科技還沒拯救餐廳", source: RB, link: "https://www.restaurantbusinessonline.com/technology/why-technology-hasnt-saved-restaurants-yet", weighted: 37, editor: "mise", oneLine: "數位化救過餐廳，現在反而壓垮它" },
    { title: "用 CO2 做的蛋白質 Solein 在美開賣", source: FV, link: "https://foodtech-japan.com/2026/06/10/solar-foods-19/", weighted: 36, editor: "passe", oneLine: "從空氣裡長出來的蛋白質" },
    { title: "AI 兩週設計出一塊植物雞肉", source: FT, link: "https://foodtechinsider.net/36m-ai-built-a-plant-based-chicken-in-just-2-weeks/", weighted: 34.5, editor: "passe", oneLine: "食物研發以『週』計" },
    { title: "漢堡連鎖放棄植物肉、回歸真蔬菜", source: RB, link: "https://www.restaurantbusinessonline.com/food/burger-chains-rethink-plant-based-burgers-putting-focus-vegetables", weighted: 34, editor: "passe", oneLine: "植物肉退燒，真蔬菜回來" },
    { title: "下一個食物科技突破，可能來自太空", source: DFL, link: "https://digitalfoodlab.com/why-the-next-foodtech-breakthrough-may-come-from-space/", weighted: 33, editor: "mise", oneLine: "太空 × 食物的下一步" },
    { title: "Cargill 用 AI 把肉從廚餘救回餐桌", source: TS_, link: "https://thespoon.tech/cargill-is-using-ai-to-divert-thousand-of-pounds-of-meat-back-on-the-table/", weighted: 32, editor: "passe", oneLine: "AI 在垃圾桶前攔下幾千磅的肉" },
    { title: "4 顆馬鈴薯 = 1 公升牛奶的酪蛋白", source: FV, link: "https://foodtech-japan.com/2026/06/03/finally-foods-2/", weighted: 31, editor: "passe", oneLine: "用馬鈴薯種出牛奶蛋白" },
    { title: "Fazer 細胞性可可：沒有可可的巧克力", source: FV, link: "https://foodtech-japan.com/2026/06/04/fazer-2/", weighted: 30, editor: "passe", oneLine: "沒有可可的巧克力" },
    { title: "乳清短缺，價格暴漲 40%", source: FT, link: "https://foodtechinsider.net/whey-shortage-food-giants-scramble-as-prices-surge-40/", weighted: 29, editor: "passe", oneLine: "蛋白質貨架上的怪事" },
    { title: "京大新創用魚自己的菌養殖魚", source: FV, link: "https://foodtech-japan.com/2026/06/05/holo-bio/", weighted: 28, editor: "passe", oneLine: "用魚的菌，養出更強壯的魚" },
    { title: "AI 食物浪費工具：什麼有效、什麼是炒作", source: AGF, link: "https://agfundernews.com/what-investors-should-know-before-backing-ai-tools-for-food-waste-management-report", weighted: 27, editor: "passe", oneLine: "投資人該知道的 AI 食物浪費真相" },
    { title: "植物肉的訃聞漏了什麼", source: AGF, link: "https://agfundernews.com/guest-article-what-the-obituaries-for-plant-based-meat-miss", weighted: 26, editor: "mise", oneLine: "植物肉真死了，還是只是太貴" },
    { title: "韓國辣椒醬走向世界最佳醬料", source: TF, link: "https://www.thinkfood.co.kr/news/articleView.html?idxno=200439", weighted: 25, editor: "mise", oneLine: "Gochujang 如何進了牛津字典" },
  ],
  backlog: [
    { title: "為什麼科技還沒拯救餐廳", source: RB, link: "https://www.restaurantbusinessonline.com/technology/why-technology-hasnt-saved-restaurants-yet", reason: "好題、feature 等級，但這期兩篇長文已滿——下期優先。" },
    { title: "下一個食物科技突破，可能來自太空", source: DFL, link: "https://digitalfoodlab.com/why-the-next-foodtech-breakthrough-may-come-from-space/", reason: "角度新，但離『吃』較遠，下期看發展。" },
    { title: "植物肉的訃聞漏了什麼", source: AGF, link: "https://agfundernews.com/guest-article-what-the-obituaries-for-plant-based-meat-miss", reason: "與『漢堡回歸蔬菜』同主題，留一篇就好。" },
  ],
  screenedOut: [
    { title: "Food Tech 本週 $131M / $4.3B / 5 Bombshells（多篇週報摘要）", source: FT, reason: "😴 週報摘要、非單一故事——當趨勢脈搏可以，不整篇選為一則。" },
    { title: "Where to Eat in Chicago（James Beard）", source: "Eater", link: "https://www.eater.com/maps/best-restaurants-chicago", reason: "🚫 純餐廳清單、無新意、20 天前。" },
    { title: "DJI 用戶請 FCC 重新考慮無人機禁令", source: AGF, link: "https://agfundernews.com/please-reverse-this-decision-dji-users-urge-fcc-to-rethink-foreign-drone-ban", reason: "🚫 無關食物（無人機政策）。" },
    { title: "農業機器人的黃金時代（泛論）", source: AGF, reason: "😴 農業機器人泛論、偏產業、無具體人/故事。" },
  ],
  flags: [
    "本期候選偏 alt-protein/食品科技（Foovo + Food Tech Insider 量大）——已用 Jennifer Makan（別用 AI 點酒）、餐廳趨勢、韓國在地平衡，但可再補更多『人/在地餐飲』題。",
    "식품외식경제（foodbank-kr）這次 feed DNS 失敗（getaddrinfo）——可能 http:// 或暫時性，已記待查（其餘 28 個來源正常）。",
    "Food Tech Insider 多為『週報摘要』而非單一故事——適合當趨勢脈搏，但別整篇選為一則。",
    "方向已定（2026-06-11 團隊會議）：飲食／餐飲／食物優先，AI／科技為輔與加分。硬閘門以食物為準、AI／科技角度計入加分（不再要求硬性 AI×食物交集）。",
  ],
  scannedSources: [
    { name: "The Spoon", count: 15, stream: "A" }, { name: "AgFunder News", count: 15, stream: "A" }, { name: "TechCrunch (Food)", count: 15, stream: "A" },
    { name: "Restaurant Business", count: 15, stream: "A" }, { name: "Nation's Restaurant News", count: 15, stream: "A" }, { name: "QSR Magazine", count: 15, stream: "A" },
    { name: "The Caterer", count: 15, stream: "A" }, { name: "食品産業新聞社 (SSNP)", count: 15, stream: "A" }, { name: "식품음료신문 (Thinkfood)", count: 15, stream: "A" },
    { name: "フードリンク FDN", count: 15, stream: "A" }, { name: "한국외식신문", count: 15, stream: "A" }, { name: "푸드투데이", count: 15, stream: "A" },
    { name: "Table Talk", count: 15, stream: "A" }, { name: "Jennifer Makan", count: 15, stream: "A" }, { name: "Sourced Journeys", count: 15, stream: "A" },
    { name: "Technically Food", count: 15, stream: "B" }, { name: "Oy Vey It's A Food Newsletter", count: 15, stream: "B" },
    { name: "Eater", count: 10, stream: "A" }, { name: "Restaurant Dive", count: 10, stream: "A" }, { name: "Foovo", count: 10, stream: "A" },
    { name: "飲食店ドットコム foodist", count: 10, stream: "A" }, { name: "外食産業新聞社", count: 10, stream: "A" }, { name: "フードスタジアム", count: 10, stream: "A" },
    { name: "The Food Institute", count: 10, stream: "A" }, { name: "Momentum Works (The Lowdown)", count: 10, stream: "B" }, { name: "DigitalFoodLab", count: 10, stream: "B" },
    { name: "Good Food Institute", count: 10, stream: "B" }, { name: "Food Tech Insider", count: 10, stream: "B" }, { name: "식품외식경제", count: 0, stream: "A" },
  ],
};

writeFileSync(new URL("../public/selection-report-demo.html", import.meta.url), renderReport(r));
console.log("✓ public/selection-report-demo.html 已產出（第一次編輯會議真實 curate）");
