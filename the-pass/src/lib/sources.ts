export interface Source {
  id: string;
  name: string;
  url: string;
  feedUrl: string;
  language: "en" | "ko" | "ja" | "th";
  category: "ai-food-tech" | "food-industry" | "culture-opinion";
  tier: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export const sources: Source[] = [
  // === AI & Food Tech (English) ===
  {
    id: "the-spoon",
    name: "The Spoon",
    url: "https://thespoon.tech",
    feedUrl: "https://thespoon.tech/feed/",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    description: "Food tech media covering AI, robotics, and automation in food",
  },
  {
    id: "agfunder",
    name: "AgFunder News",
    url: "https://agfundernews.com",
    feedUrl: "https://agfundernews.com/feed",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    description: "AgriFood tech investment and innovation news",
  },
  {
    id: "techcrunch-food",
    name: "TechCrunch (Food)",
    url: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/tag/food/feed/",
    language: "en",
    category: "ai-food-tech",
    tier: 2,
    description: "Tech news covering food startups and food tech",
  },

  // === Food Industry (Korean) ===
  {
    id: "foodbank-kr",
    name: "식품외식경제",
    url: "https://www.foodbank.co.kr",
    feedUrl: "http://www.foodbank.co.kr/rss/allArticle.xml",
    language: "ko",
    category: "food-industry",
    tier: 2,
    description: "Korean food & restaurant industry news",
  },

  // === Food Industry (English) ===
  {
    id: "restaurant-business",
    name: "Restaurant Business",
    url: "https://www.restaurantbusinessonline.com",
    feedUrl: "https://www.restaurantbusinessonline.com/rss.xml",
    language: "en",
    category: "food-industry",
    tier: 2,
    description: "US restaurant industry news and analysis",
  },
  {
    id: "nrn",
    name: "Nation's Restaurant News",
    url: "https://www.nrn.com",
    feedUrl: "https://www.nrn.com/rss.xml",
    language: "en",
    category: "food-industry",
    tier: 2,
    description: "Restaurant industry news, trends, and analysis",
  },

  // === Culture & Opinion ===
  {
    id: "eater",
    name: "Eater",
    url: "https://www.eater.com",
    feedUrl: "https://www.eater.com/rss/index.xml",
    language: "en",
    category: "culture-opinion",
    tier: 3,
    description: "Food culture, restaurant news, and dining trends",
  },
];
