# Style Profile · Risograph（現役 ACTIVE）

> The Pass 插圖的「現役風格 profile」——**機器／管線用的單一真實來源**。
> 人看的完整版＝ `public/illustration-guide.html`（同一份資訊、給人讀的版本）。
> `/publish-issue` 生圖時讀這份規格 ＋ 用下面〈錨點圖〉當 nanobanana 的 `input_image`。

## 一句話
利落線條 × Risograph 印刷感 × 有態度的人物。街頭藝術 meets 編輯插畫。

## 配色
- **Teal `#2B8C8C`**（科技／數位）· **Burnt Orange `#D4713D`**（溫暖／人味／食物）· **Ochre/Gold `#C49B2A`**（品牌色）· **Cream/Beige `#FAF8F3`**（背景，留白多）
- 平面色塊、不漸層；halftone 半色調點；色塊疊印是特色不是錯誤。
- 色調可隨編輯／主題呼吸（Mise 暖、Passe 冷、Fumet 土），但永遠保持平面印刷感。

## 線條
自信果斷的黑色墨線（簽字筆／刷子一筆成形），介於手繪與印刷之間。不要完美向量、不要水彩暈染、不要毛邊。

## 人物
有態度、但**看不出國籍**。可見：性別／年齡／職業（廚師帽、圍裙、白袍）／情緒。不可見：國籍／種族／膚色／詳細五官。窄瞇眼、簡單線嘴、極簡鼻；個性靠姿勢和配件、不靠臉。當代穿著（現代廚師服、棒球帽），帶一點「你確定嗎？」的懷疑。

## 構圖
人是主角、AI 是背景／陪襯（大小不代表權力）。背景極簡、留白多。構圖即觀點（諷刺／哲理／暗喻），不是新聞配圖。16:9。

## 品牌固定元素（寫進 prompt，不用 CSS 後加）
- **出菜框（The Pass Frame）**：抽象的手繪矩形邊框，有 Risograph 質感。
- **桌鈴（Service Bell）**：左下角一個小 dome 桌鈴，約佔畫面 3–5%。

## 禁忌
文字（場景內標牌除外）、水彩／油畫、可愛／卡通、寫實／3D／攝影、企業 stock、特定種族特徵、太完美、太多細節、中國風／水墨／東方古典。

## 錨點圖（餵給 nanobanana `input_image_path_1/2`）
- `public/img/style-ramen.png`
- `public/img/style-approved.png`
- `public/img/style-brainwave.png`

> 註：現役風格的錨點沿用既有位置 `public/img/`，本檔指過去（不重複存）。**未來新風格的 profile，錨點圖放進該 profile 自己的資料夾**（如 `docs/illustration/styles/<name>/anchor-*.png`）。

## 提示詞片段（每次生圖貼這段）
```
Editorial illustration with crisp ink lines on cream paper.
[場景描述 — 人物在做什麼、AI 元素是什麼].
The character has [情緒 — skeptical/annoyed/thoughtful] expression,
minimal face with narrow squinting eyes and simple line mouth.
Bold confident black outlines, NOT watercolor.
Colors are flat and graphic — [主色描述] applied as solid
risograph-style overlapping shapes with visible halftone dots.
Background is flat cream/beige with subtle ink splatters and print marks.
Street art meets editorial print style.

FRAMING: The entire illustration is contained within a subtle
hand-drawn rectangular border — like a kitchen pass/service window.
The border has the same risograph print texture as the illustration.
In the bottom-left corner, a small dome-shaped service bell sits as a
tiny signature mark, drawn in the same ink line style.

Scene-appropriate text (signs, object labels) is OK.
NO captions, titles, or explanatory text outside the scene.
```

## Negative
```
watercolor, painterly, soft edges, blurry, pastel, gradient,
realistic, photography, 3D, anime, cute, caption text, title text,
typography, oil painting, corporate illustration,
Chinese ink painting, oriental, traditional Asian art, calligraphy brush,
digital frame, clean geometric border, CSS-style border
```
