// === scout 查詢模板（單一真實來源）===
// 「查詢式進料」用的常駐 query，像 sources.ts 之於 RSS。改 scout 撈什麼只動這裡。
// 配方來自 4 輪 probe（2026-06-22）的結論：
//   ① --sources news ＋ 在地語言 query ＋ food-culture/人（不掛 AI/tech）＝ 撈到 RSS 看不到的在地題
//   ② 不綁區域、綁主題的 query 能跨洲捕捉驚奇，維護成本低
//   ③ 英文查亞洲/大市場 ≒ 撞 RSS、被機構事件洗版 → 預設關
//   ④ recall 易碎：過細的詞會回 0–1 條 → 模板偏「少硬詞、可放寬」
//
// 每條 query 跑 firecrawl search（--sources news --tbs qdr:m [--country]）。
// 輪播控預算：要省 credits 時把部分 enabled 設 false，或 fetchScout({ queries }) 傳子集。

export type ScoutGroup = "local" | "theme" | "region-en";

export interface ScoutQuery {
  key: string; // 唯一 id；會變成 sourceId: scout-<key>
  label: string; // 人看的標籤（log／報告）
  query: string; // 丟給 firecrawl 的搜尋字串
  lang: string; // th/ko/ja/vi/en/es — 標進 RawArticle.sourceLanguage
  country?: string; // --country 代碼（鎖區域；對英文 query 幫助有限，語言才是強槓桿）
  group: ScoutGroup;
  enabled: boolean;
  note?: string;
}

export const scoutQueries: ScoutQuery[] = [
  // ── 在地語言：最強槓桿（撈台灣看不到的在地題）──
  { key: "th-local", label: "泰國 · 在地語言", query: "เทรนด์อาหาร ร้านอาหารใหม่ เชฟ", lang: "th", country: "th", group: "local", enabled: true, note: "probe 撈到 มะยงชิด 熱、Chef's Table 新奢侈" },
  { key: "ko-local", label: "韓國 · 在地語言", query: "한국 외식 트렌드 새로운 맛집", lang: "ko", country: "kr", group: "local", enabled: true, note: "放寬後 recall 修好；撈到 C-franchise 熱點、wellness/sober dining" },
  { key: "ja-local", label: "日本 · 在地語言", query: "日本 グルメ 新店 話題 シェフ", lang: "ja", country: "jp", group: "local", enabled: true, note: "在地語言消滅美國洗版；偏 PR/百貨，之後可再加反零售字" },
  { key: "vi-local", label: "越南 · 在地語言", query: "ẩm thực Việt Nam xu hướng mới nhà hàng đầu bếp", lang: "vi", country: "vn", group: "local", enabled: true, note: "小市場、同事件高度同稿 → 去重要強" },
  { key: "es-latam", label: "拉美 · 西語", query: "gastronomía restaurante chef nueva tendencia ingredientes nativos", lang: "es", country: "mx", group: "local", enabled: true, note: "祕魯 pe 單獨 recall 偏低，放寬到拉美/mx" },

  // ── 跨區主題：不綁國，捕捉任何洲的驚奇（最划算）──
  { key: "theme-redefine", label: "主題 · 重寫某國料理", query: "chef redefining national cuisine local indigenous ingredients fine dining", lang: "en", group: "theme", enabled: true, note: "probe 撈到尚比亞 14 道式、非洲-加勒比料理" },
  { key: "theme-ferment", label: "主題 · 不尋常發酵/保存", query: "unusual fermentation preservation technique chef ingredient", lang: "en", group: "theme", enabled: true, note: "發酵/保存是高驚喜軸，跨區" },

  // ── 區域英文：補充用，易撞 RSS / 被機構事件洗版 → 預設關 ──
  { key: "nordic-en", label: "北歐 · 英文", query: "Nordic Scandinavian chef fermentation foraging sustainability new restaurant", lang: "en", country: "dk", group: "region-en", enabled: false, note: "英文易被『米其林北歐』事件洗版；gem 要靠在地語言/主題" },
  { key: "us-frontier", label: "美國 · AI 前沿", query: "cultured meat food robotics AI restaurant startup launch", lang: "en", country: "us", group: "region-en", enabled: false, note: "前沿那層你 RSS（The Spoon/AgFunder）已覆蓋；開放搜尋多半重複 → 預設關" },
];

/** 目前啟用的 scout queries（enabled:true）。 */
export const enabledScoutQueries = (): ScoutQuery[] => scoutQueries.filter((q) => q.enabled);
