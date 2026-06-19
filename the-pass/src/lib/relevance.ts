// === 關鍵字相關性評分 ===
// 純函式、零依賴，故 fetcher / scorer 都能 import 而不產生循環或 RSS 依賴。
// 用途：scorer 在「dry-run（無金鑰）」時用它當確定性代理，讓 pipeline 端到端可測。
// 正式評估已改為 Opus 全程（硬閘門 + 五面向），不再用關鍵字粗篩（決策見 selection-mechanism.md）。
// 刻意放寬到 AI + 鄰近科技（含食品生技），高召回為主。

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

export interface RelevanceDetail {
  score: number; // 綜合分（向後相容 scoreRelevance）
  food: number; // 命中幾個食物關鍵字
  tech: number; // 命中幾個 AI/科技關鍵字
}

/**
 * 拆解版：回傳綜合分 + 食物/科技各自命中數。
 * /selection-report 的粗篩用 food/tech 分量做「食物優先」排序（有食物訊號者優先入池），
 * 而非只看綜合分（綜合分對 AI×食物雙重命中灌水，會把純食物題擠到後面、違反食物優先方向）。
 */
export function relevanceDetail(article: Scorable): RelevanceDetail {
  const text = `${article.title} ${article.summary}`.toLowerCase();

  let tech = 0;
  let food = 0;

  // "AI" 縮寫用詞邊界比對，避免誤中 tail / available / again 等含 "ai" 的字
  if (/\bai\b/.test(text) || text.includes("a.i.")) tech++;

  for (const kw of techKeywords) if (text.includes(kw)) tech++;
  for (const kw of foodKeywords) if (text.includes(kw)) food++;

  let score: number;
  if (tech > 0 && food > 0) score = 10 + tech + food; // 雙重命中
  else if (tech > 0) score = 5 + tech; // 只 AI/科技
  else if (food > 0) score = 2 + food; // 只食物
  else score = 0;

  return { score, food, tech };
}

/** AI/科技 × 食物 關鍵字相關性分數。雙重命中 ≥10；只 AI/科技 ≥5；只食物 ≥2；無關 0。 */
export function scoreRelevance(article: Scorable): number {
  return relevanceDetail(article).score;
}
