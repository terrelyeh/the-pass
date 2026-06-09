// === 第二段：LLM 評分（硬閘門 + 五面向）===
// 設計見 docs/selection-mechanism.md §5–§6。
//   screen（硬閘門）：cheap 模型(Haiku) 判斷「真 AI/科技×食物、可成人話故事」→ pass/fail
//   score（五面向）：strong 模型(Opus) 對過閘門者打 0–5 五面向 + 編輯路由 + 主理由
// 沒有 ANTHROPIC_API_KEY 時自動走 dry-run（關鍵字代理），讓 pipeline 端到端可測。
//
// 模型選擇依產品決策（Terrel：第一關便宜模型、評分強模型）：
//   SCREEN = claude-haiku-4-5（便宜快）  /  SCORE = claude-opus-4-8（強）

import Anthropic from "@anthropic-ai/sdk";
import { scoreRelevance } from "./relevance";
import type { RawArticle } from "./fetcher";

const SCREEN_MODEL = "claude-haiku-4-5";
const SCORE_MODEL = "claude-opus-4-8";

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
  screenReason: string;
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
// Prompts
// ─────────────────────────────────────────────

const SCREEN_SYSTEM = `你是 The Pass（出菜口）的總編輯，負責「硬閘門」初篩。
The Pass 用 AI 報導「AI/科技如何改變你我的飲食生活」，調性是「新鮮感與發現的驚喜」，不是乾的產業新聞。
判斷這篇是否「通過閘門」（pass=true）需同時滿足：
1. 真的是 AI/科技 × 飲食的交集（語意判斷，不是關鍵字巧合，例如餐廳名含 "tail" 不算 AI）。
2. 事實可查、不是空泛炒作或純廣告。
3. 有潛力翻成「先找到人」的人味故事，而不是只有融資金額/技術規格的乾稿。
寬鬆但誠實：寧可讓邊界案例通過交給後段評分，也不要漏掉有潛力的前沿題目。只輸出 JSON。`;

const SCORE_SYSTEM = `你是 The Pass（出菜口）的總編輯。為這篇 AI/科技×飲食新聞打「五面向」分數（每項 0–5 整數）。
- surprise 驚喜/新鮮：是「我從沒想過 AI 還能這樣碰食物」，還是又一則融資稿？（最重要）
- local 在地獨家：亞洲在地？英文大媒體還沒報？
- human 人味：有沒有具體的人、具體的處境？
- conversation 可談性：能勾出一個好問題、讓人想轉發或回信嗎？
- substance 事實扎實：有真材實料，不是空泛吹捧？
再指派 best-fit 編輯：mise（有具體的人/處境→長文）、passe（事實夠硬夠新→快訊）。
注意：不要指派 fumet——Fumet 的結尾提問是讀完本期選出的長文後「提煉」出來的，不從候選池選稿。可談性高的故事 = 給 Fumet 好素材，但仍歸 mise 或 passe。
再寫一句 hook（主理由「為什麼是這篇」，繁體中文，≤40字，講故事鉤子不是分數）。只輸出 JSON。`;

const SCREEN_SCHEMA = {
  type: "object",
  properties: { pass: { type: "boolean" }, reason: { type: "string" } },
  required: ["pass", "reason"],
  additionalProperties: false,
} as const;

const SCORE_SCHEMA = {
  type: "object",
  properties: {
    surprise: { type: "integer" },
    local: { type: "integer" },
    human: { type: "integer" },
    conversation: { type: "integer" },
    substance: { type: "integer" },
    editor: { type: "string", enum: ["mise", "passe"] },
    hook: { type: "string" },
  },
  required: ["surprise", "local", "human", "conversation", "substance", "editor", "hook"],
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

// ─────────────────────────────────────────────
// 真實 LLM 呼叫
// ─────────────────────────────────────────────

async function realScreen(client: Anthropic, a: RawArticle): Promise<{ pass: boolean; reason: string }> {
  const resp = await client.messages.create({
    model: SCREEN_MODEL,
    max_tokens: 256,
    system: SCREEN_SYSTEM,
    output_config: { format: { type: "json_schema", schema: SCREEN_SCHEMA } },
    messages: [{ role: "user", content: articlePrompt(a) }],
  });
  const j = extractJson(firstText(resp.content));
  return { pass: Boolean(j.pass), reason: String(j.reason ?? "") };
}

async function realScore(
  client: Anthropic,
  a: RawArticle
): Promise<{ dimensions: Dimensions; editor: Editor; hook: string }> {
  const resp = await client.messages.create({
    model: SCORE_MODEL,
    max_tokens: 512,
    system: SCORE_SYSTEM,
    output_config: { format: { type: "json_schema", schema: SCORE_SCHEMA } },
    messages: [{ role: "user", content: articlePrompt(a) }],
  });
  const j = extractJson(firstText(resp.content)) as Record<string, number | string>;
  const editor = (["mise", "passe"].includes(String(j.editor)) ? j.editor : "passe") as Editor;
  return {
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

function mockScreen(a: RawArticle): { pass: boolean; reason: string } {
  const s = scoreRelevance(a);
  return {
    pass: s >= 10,
    reason: s >= 10 ? "dry-run：關鍵字代理判定 AI×食物雙重命中" : "dry-run：關鍵字代理未達雙重命中",
  };
}

function mockScore(a: RawArticle): { dimensions: Dimensions; editor: Editor; hook: string } {
  const base = clamp05(scoreRelevance(a) / 4);
  return {
    dimensions: { surprise: base, local: 2, human: Math.max(1, base - 1), conversation: base, substance: 3 },
    editor: base >= 4 ? "mise" : "passe",
    hook: "（dry-run）依關鍵字推估，待真實 LLM 評分",
  };
}

// ─────────────────────────────────────────────
// Pipeline：candidates → screen → score → 排序
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
    const screen = dry ? mockScreen(a) : await realScreen(client!, a);
    if (!screen.pass) {
      screenedOut++;
      continue;
    }
    const sc = dry ? mockScore(a) : await realScore(client!, a);
    scored.push({
      article: a,
      dimensions: sc.dimensions,
      weighted: weightedOf(sc.dimensions),
      editor: sc.editor,
      hook: sc.hook,
      screenReason: screen.reason,
    });
  }

  scored.sort((x, y) => y.weighted - x.weighted);

  return {
    scored,
    meta: { mode: dry ? "dry-run" : "live", candidates: pool.length, screenedOut, scored: scored.length },
  };
}
