# 交付紀錄 — The Pass 選題系統（顧問實作）

> 顧問（Terrel Yeh）以 AI 輔助方式為 {團隊} 實作的累積交付清單。最新在上。
> 每期週報後把該期項目追加到這裡。狀態：✅ 上線 / 🚧 進行中 / 🗓 規劃中。
> 對照 git 紀錄即為逐項實作稽核。

---

## 2026-06-10（選題系統 + 來源庫）

| 項目 | 類型 | 連結 / 位置 | 狀態 |
|------|------|------------|------|
| 選題自動化 pipeline（抓取→去重→初篩→AI 評分→報告） | 系統 | `src/lib/*` | ✅ |
| 選題報告（編輯會議文件，含完整候選池 + 互動切角） | 交付物 | thepass.cc/selection-report-demo.html | ✅ |
| 來源庫收斂（審 50+ → 30 個聚焦食物）+ 取材策略 | 策略 + 資料 | thepass.cc/sources-status | ✅ |
| 來源審核工具 /audit-sources（一鍵評估新來源） | 可重複工具 | thepass.cc/audit-sources.html | ✅ |
| 選題機制設計文件 | 文件 | thepass.cc/selection-mechanism.html | ✅ |
| 統一入口 hub | 頁面 | thepass.cc/hub.html | ✅ |
| 來源「單一真實來源」+ 頁面自動生成 | 架構 | `src/lib/sources.ts` | ✅ |
| 技術文件交接（CLAUDE.md / README） | 文件 | repo | ✅ |

**本期需團隊決策：** 編輯方向（嚴格 AI×食物 vs 食物優先）。

---

## 既有基礎（本案承接前已有）

| 項目 | 連結 | 狀態 |
|------|------|------|
| 品牌定位 + Project Brief + 編輯指南 | thepass.cc/project-brief.html | ✅ |
| 三位 AI 編輯人設 + AI 編輯室 | thepass.cc/editors.html | ✅ |
| 3 期 Demo Issues（成品格式範本，AI 直接選題） | thepass.cc/demo-index.html | ✅ |
| 插畫風格 + IG Carousel demo | thepass.cc/illustration-guide.html | ✅ |
| 域名 thepass.cc + Vercel 部署 | thepass.cc | ✅ |

---

## 規劃中（roadmap）

| 項目 | 狀態 |
|------|------|
| /selection-report 定版工具（方向定後） | 🗓 |
| 寫作階段：/mise /passe /fumet（選題→成品一期） | 🗓 |
| 自動化上線（排程 + Supabase + Ghost） | 🗓 |
