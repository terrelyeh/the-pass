// === LLM 評估：Opus 全程（硬閘門 + 五面向，同一次呼叫）===
// 設計見 docs/selection-mechanism.md §5–§6。
//   去重後的每一篇 → Opus 一次呼叫：先過硬閘門(pass/fail)，過了就打五面向 + 編輯路由 + 主理由。
//   不先用關鍵字粗篩、也不用便宜模型做第一關——關鍵字會漏會誤判，而每日去重後的池子夠小，
//   值得用最強模型全看（最一致、最不漏稿）。產品決策（Terrel）：全程都用 Opus。
// 沒有 ANTHROPIC_API_KEY 時自動走 dry-run（關鍵字代理），讓 pipeline 端到端可測。

import Anthropic from "@anthropic-ai/sdk";
import { scoreRelevance } from "./relevance";
import type { RawArticle } from "./fetcher";

const MODEL = "claude-opus-4-8";

// 來源故事只路由到 mise（長文）或 passe（快訊）。
// Fumet 的結尾提問不在此選——它由本期選出的長文「提煉」而來（見 editorial-guidelines），不是從候選挑一篇。
export type Editor = "mise" | "passe";

export interface Dimensions {
  surprise: number; // 驚喜/新鮮
  local: number; // 在地獨家
  human: number; // 人味
  conversation: number; // 可談性
  substance: number; // 事實扎實
}

const WEIGHTS = { surprise: 3, local: 2.5, human: 2.5, conversation: 2, substance: 1 };

export interface ScoredArticle {
  article: RawArticle;
  dimensions: Dimensions;
  weighted: number;
  editor: Editor;
  hook: string; // 主理由「為什麼是這篇」
  screenReason: string; // 硬閘門理由（過 or 砍）
}

export interface ScorePipelineResult {
  scored: ScoredArticle[];
  meta: { mode: "live" | "dry-run"; candidates: number; screenedOut: number; scored: number };
}

const clamp05 = (n: number) => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
const weightedOf = (d: Dimensions) =>
  +(
    d.surprise * WEIGHTS.surprise +
    d.local * WEIGHTS.local +
    d.human * WEIGHTS.human +
    d.conversation * WEIGHTS.conversation +
    d.substance * WEIGHTS.substance
  ).toFixed(1);

// ─────────────────────────────────────────────
// Prompt（硬閘門 + 五面向，一次完成）
// ─────────────────────────────────────────────

const EVAL_SYSTEM = `你是 The Pass（出菜口）的總編輯，獨自完成整個選題評估。
The Pass 用 AI 報導「飲食生活裡的新鮮事」，調性是「新鮮感與發現的驚喜」，不是乾的產業新聞。
**編輯方向（團隊 2026-06-11 定）：飲食／餐飲／食物優先，AI／科技為輔與加分。** 食物是主角；AI／科技是讓題目更前沿、更獨特的加分，不是入選門檻。

第一步 · 硬閘門（pass）：需同時滿足
1. 真的是「飲食／餐飲／食物」的題目（食物優先）。AI／科技不是必要條件——純食物的新鮮題目也能過；只擋掉「跟吃完全無關」的（例：純無人機政策、跟食物無連結的純 AI 研究；餐廳名含 "tail" 不算數）。
2. 事實可查、不是空泛炒作或純廣告。
3. 有潛力翻成「先找到人」的人味故事，而不是只有融資金額/技術規格的乾稿。
寬鬆但誠實：寧可讓邊界案例通過，也不要漏掉有潛力的前沿題目。
沒過閘門 → pass=false、reason 說明原因、五面向全填 0、editor 填 passe、hook 留空字串。

第二步 · 過閘門者打「五面向」（每項 0–5 整數）：
- surprise 驚喜/新鮮：是「台灣沒看過的新鮮飲食事」嗎？（最重要）驚喜可來自食物本身（新食材／做法／文化），或 AI／科技讓食物有了沒想過的可能（後者是加分亮點）。又一則融資稿＝低分。
- local 在地獨家：亞洲在地？英文大媒體還沒報？
- human 人味：有沒有具體的人、具體的處境？
- conversation 可談性：能勾出一個好問題、讓人想轉發或回信嗎？
- substance 事實扎實：有真材實料，不是空泛吹捧？
再指派 best-fit 編輯：mise（有具體的人/處境→長文）、passe（事實夠硬夠新→快訊）。
注意：不要指派 fumet——Fumet 的結尾提問是讀完本期選出的長文後「提煉」出來的，不從候選池選稿。可談性高 = 給 Fumet 好素材，但仍歸 mise 或 passe。
再寫一句 hook（主理由「為什麼是這篇」，繁體中文，≤40字，講故事鉤子不是分數）。

只輸出 JSON。`;

const EVAL_SCHEMA = {
  type: "object",
  properties: {
    pass: { type: "boolean" },
    reason: { type: "string" },
    surprise: { type: "integer" },
    local: { type: "integer" },
    human: { type: "integer" },
    conversation: { type: "integer" },
    substance: { type: "integer" },
    editor: { type: "string", enum: ["mise", "passe"] },
    hook: { type: "string" },
  },
  required: ["pass", "reason", "surprise", "local", "human", "conversation", "substance", "editor", "hook"],
  additionalProperties: false,
} as const;

function articlePrompt(a: RawArticle): string {
  return [
    `標題：${a.title}`,
    `來源：${a.sourceName}（${a.sourceLanguage} / ${a.sourceCategory}）`,
    `日期：${a.pubDate}`,
    `摘要：${(a.summary || "").slice(0, 600)}`,
  ].join("\n");
}

// 從回應取出 JSON（防禦式：抓第一個 { 到最後一個 }）
function extractJson(text: string): Record<string, unknown> {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) return {};
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return {};
  }
}

function firstText(content: Anthropic.Messages.ContentBlock[]): string {
  const b = content.find((x): x is Anthropic.Messages.TextBlock => x.type === "text");
  return b?.text ?? "";
}

interface Evaluation {
  pass: boolean;
  reason: string;
  dimensions: Dimensions;
  editor: Editor;
  hook: string;
}

// ─────────────────────────────────────────────
// 真實 LLM 呼叫（Opus 一次完成硬閘門 + 五面向）
// ─────────────────────────────────────────────

async function realEvaluate(client: Anthropic, a: RawArticle): Promise<Evaluation> {
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: EVAL_SYSTEM,
    output_config: { format: { type: "json_schema", schema: EVAL_SCHEMA } },
    messages: [{ role: "user", content: articlePrompt(a) }],
  });
  const j = extractJson(firstText(resp.content)) as Record<string, number | string | boolean>;
  const editor = (["mise", "passe"].includes(String(j.editor)) ? j.editor : "passe") as Editor;
  return {
    pass: Boolean(j.pass),
    reason: String(j.reason ?? ""),
    dimensions: {
      surprise: clamp05(j.surprise as number),
      local: clamp05(j.local as number),
      human: clamp05(j.human as number),
      conversation: clamp05(j.conversation as number),
      substance: clamp05(j.substance as number),
    },
    editor,
    hook: String(j.hook ?? ""),
  };
}

// ─────────────────────────────────────────────
// dry-run（無金鑰）：用關鍵字分數做確定性代理，讓 pipeline 可測
// ─────────────────────────────────────────────

function mockEvaluate(a: RawArticle): Evaluation {
  const s = scoreRelevance(a);
  const pass = s >= 10;
  if (!pass) {
    return {
      pass: false,
      reason: "dry-run：關鍵字代理未達雙重命中",
      dimensions: { surprise: 0, local: 0, human: 0, conversation: 0, substance: 0 },
      editor: "passe",
      hook: "",
    };
  }
  const base = clamp05(s / 4);
  return {
    pass: true,
    reason: "dry-run：關鍵字代理判定 AI×食物雙重命中",
    dimensions: { surprise: base, local: 2, human: Math.max(1, base - 1), conversation: base, substance: 3 },
    editor: base >= 4 ? "mise" : "passe",
    hook: "（dry-run）依關鍵字推估，待真實 LLM 評分",
  };
}

// ─────────────────────────────────────────────
// Pipeline：候選 → Opus 評估（硬閘門 + 五面向）→ 排序
// ─────────────────────────────────────────────

export async function scorePipeline(
  candidates: RawArticle[],
  opts: { dryRun?: boolean; max?: number } = {}
): Promise<ScorePipelineResult> {
  const dry = opts.dryRun || !process.env.ANTHROPIC_API_KEY;
  const client = dry ? null : new Anthropic();
  const pool = opts.max ? candidates.slice(0, opts.max) : candidates;

  const scored: ScoredArticle[] = [];
  let screenedOut = 0;

  for (const a of pool) {
    const ev = dry ? mockEvaluate(a) : await realEvaluate(client!, a);
    if (!ev.pass) {
      screenedOut++;
      continue;
    }
    scored.push({
      article: a,
      dimensions: ev.dimensions,
      weighted: weightedOf(ev.dimensions),
      editor: ev.editor,
      hook: ev.hook,
      screenReason: ev.reason,
    });
  }

  scored.sort((x, y) => y.weighted - x.weighted);

  return {
    scored,
    meta: { mode: dry ? "dry-run" : "live", candidates: pool.length, screenedOut, scored: scored.length },
  };
}
