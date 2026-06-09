// === 關鍵字相關性評分（第一關粗篩用）===
// 純函式、零依賴，故 fetcher 與 prefilter 都能 import 而不產生循環或 RSS 依賴。
// 「第一關粗篩」刻意放寬到 AI + 鄰近科技（含食品生技），高召回為主——
// 「夠不夠 AI / 有沒有料」的品牌判斷交給後段 LLM 語意閘門（決策見 selection-mechanism.md）。

export interface Scorable {
  title: string;
  summary: string;
}

// 注意：不要放裸 "ai"（includes 會誤中 tail/available/again），"AI" 縮寫用詞邊界 \bai\b。
const techKeywords = [
  // AI / 自動化 / 機器人
  "artificial intelligence", "machine learning", "deep learning", "robot",
  "automat", "autonomous", "drone", "algorithm", "neural", "gpt", "llm",
  "computer vision", "generative", "predictive",
  // 食品科技 / 生技 / 農業科技
  "cultured meat", "cultivated meat", "cell-based", "cellular agricultur",
  "precision fermentation", "bioreactor", "biotech", "alt protein",
  "alternative protein", "plant-based", "synthetic biolog", "crispr",
  "gene-edit", "vertical farm", "foodtech", "food tech", "agritech", "agtech", "sensor",
  // 韓
  "인공지능", "로봇", "자동화", "생성형", "스마트", "배양육", "세포배양",
  "대체육", "발효", "푸드테크", "바이오", "알고리즘",
  // 日
  "人工知能", "ロボット", "自動化", "培養肉", "細胞性", "細胞農業",
  "精密発酵", "発酵", "植物肉", "植物性", "代替肉", "フードテック",
  "バイオ", "アルゴリズム", "生成",
];

const foodKeywords = [
  "food", "restaurant", "chef", "kitchen", "cook", "menu", "recipe",
  "dining", "meal", "ingredient", "culinary", "hospitality", "delivery",
  "식품", "외식", "레스토랑", "주방", "요리", "셰프", "배달",
  "食品", "レストラン", "料理", "厨房",
];

/** AI/科技 × 食物 關鍵字相關性分數。雙重命中 ≥10；只 AI/科技 ≥5；只食物 ≥2；無關 0。 */
export function scoreRelevance(article: Scorable): number {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  let aiScore = 0;
  let foodScore = 0;

  // "AI" 縮寫用詞邊界比對，避免誤中 tail / available / again 等含 "ai" 的字
  if (/\bai\b/.test(text) || text.includes("a.i.")) aiScore++;

  for (const kw of techKeywords) if (text.includes(kw)) aiScore++;
  for (const kw of foodKeywords) if (text.includes(kw)) foodScore++;

  if (aiScore > 0 && foodScore > 0) return 10 + aiScore + foodScore; // 雙重命中
  if (aiScore > 0) return 5 + aiScore; // 只 AI/科技
  if (foodScore > 0) return 2 + foodScore; // 只食物
  return 0;
}
