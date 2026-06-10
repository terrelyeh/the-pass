// === 庫存 backlog store：跨期延續「合格但沒選上」的文章 ===
// 設計見 docs/selection-mechanism.md §9。一句話：合格沒選上的不丟，存進庫存帶「保鮮期」，
// 下期跟新評分的一起重新競爭——你永遠選「當下最好的」，而不是「這批裡最好的」。
//
// 一期的庫存互動（四步）：
//   1. prune(now)            丟掉過期的（保鮮期到了，食物新聞會餿）
//   2. buildCompetitorPool   庫存倖存者 + 本期新評分 → 合成候選池、依分數排序
//   3.（呼叫端選一期）        選題會挑出本期出刊的
//   4. remove(selected)       出刊的移出庫存；upsert(沒選上的合格篇) 留/加回庫存
//      save()                 寫回 data/backlog.json
//
// 持久化：JSON 檔（與 seen.json 同層，已 gitignore）。正式版可換 Supabase，介面不變。

import fs from "fs";
import path from "path";
import { canonicalUrl } from "./dedup";
import type { Editor, ScoredArticle } from "./scorer";

export interface BacklogEntry {
  url: string; // canonical link，唯一鍵
  title: string;
  source: string;
  link: string; // 原始連結（顯示用）
  editor: Editor;
  weighted: number; // 分數（重新競爭用）
  hook: string;
  enteredAt: string; // 首次進庫存（ISO）——決定保鮮期，重進不會續命
  expiresAt: string; // 保鮮期截止（ISO）
  rounds: number; // 已參與幾期競爭（訊號：一直競爭卻選不上 = 該淘汰或這類題不合）
}

export interface Competitor {
  url: string;
  title: string;
  source: string;
  link: string;
  editor: Editor;
  weighted: number;
  hook: string;
  origin: "new" | "backlog"; // 這篇是本期新抓的、還是庫存撈出來重戰的
  rounds: number; // backlog 來的才 > 0
}

export const DEFAULT_FRESHNESS_DAYS = 30;
const DAY_MS = 86_400_000;
const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();

function scoredToCompetitor(s: ScoredArticle): Competitor {
  return {
    url: canonicalUrl(s.article.link),
    title: s.article.title,
    source: s.article.sourceName,
    link: s.article.link,
    editor: s.editor,
    weighted: s.weighted,
    hook: s.hook,
    origin: "new",
    rounds: 0,
  };
}

function entryToCompetitor(e: BacklogEntry): Competitor {
  return {
    url: e.url,
    title: e.title,
    source: e.source,
    link: e.link,
    editor: e.editor,
    weighted: e.weighted,
    hook: e.hook,
    origin: "backlog",
    rounds: e.rounds,
  };
}

export class BacklogStore {
  private file: string;
  private entries: Map<string, BacklogEntry>;

  constructor(file: string = path.join(process.cwd(), "data", "backlog.json")) {
    this.file = file;
    this.entries = new Map();
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8")) as BacklogEntry[];
      for (const e of raw) this.entries.set(e.url, e);
    } catch {
      // 沒有檔案 = 空庫存（首次跑）
    }
  }

  all(): BacklogEntry[] {
    return [...this.entries.values()];
  }

  /** 丟掉過期（expiresAt <= now），回傳被丟的——給報告「過期淘汰」一欄用 */
  prune(nowISO: string): BacklogEntry[] {
    const dropped: BacklogEntry[] = [];
    for (const e of [...this.entries.values()]) {
      if (e.expiresAt <= nowISO) {
        dropped.push(e);
        this.entries.delete(e.url);
      }
    }
    return dropped;
  }

  /** 出刊選上的 → 移出庫存（已經見刊，不再競爭） */
  remove(links: string[]): void {
    for (const l of links) this.entries.delete(canonicalUrl(l));
  }

  /**
   * 這期合格但沒選上的 → 加入/更新庫存。
   * 已在庫存者：保留原 enteredAt/expiresAt（不續命，避免殭屍題永遠賴著），更新分數、rounds+1。
   */
  upsert(items: Competitor[], nowISO: string, freshnessDays = DEFAULT_FRESHNESS_DAYS): void {
    for (const c of items) {
      const url = canonicalUrl(c.url);
      const existing = this.entries.get(url);
      if (existing) {
        existing.weighted = c.weighted;
        existing.hook = c.hook;
        existing.editor = c.editor;
        existing.rounds += 1;
      } else {
        this.entries.set(url, {
          url,
          title: c.title,
          source: c.source,
          link: c.link,
          editor: c.editor,
          weighted: c.weighted,
          hook: c.hook,
          enteredAt: nowISO,
          expiresAt: addDays(nowISO, freshnessDays),
          rounds: 1,
        });
      }
    }
  }

  save(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.all(), null, 2));
  }
}

/**
 * 合成候選池：庫存倖存者 + 本期新評分，依分數排序（高→低），供選題會挑一期。
 * 同一篇（canonical link）若兩邊都有，以本期新評分為準（分數較新）。
 * 去重已在抓取階段做過，這裡只防「庫存舊版 vs 本期新版」撞 URL。
 */
export function buildCompetitorPool(
  scoredThisRun: ScoredArticle[],
  backlog: BacklogEntry[]
): Competitor[] {
  const byUrl = new Map<string, Competitor>();
  for (const e of backlog) byUrl.set(e.url, entryToCompetitor(e));
  for (const s of scoredThisRun) {
    const c = scoredToCompetitor(s);
    byUrl.set(c.url, c); // 新評分覆蓋同 URL 的庫存版本
  }
  return [...byUrl.values()].sort((a, b) => b.weighted - a.weighted);
}
