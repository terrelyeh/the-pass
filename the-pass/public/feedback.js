/* The Pass — 區塊回饋（導出式、零後端）
 * 用法：在 <body> 標 data-fb-blocks="選擇器"（哪些元素是一個「區塊」）；
 *   選填 data-fb-title="子選擇器"（區塊標題從哪取，預設用區塊自身文字）、
 *   data-fb-anchor="子選擇器"（按鈕掛在區塊內哪裡，預設掛在區塊本身）。
 * 每個區塊自動長出「💬 回饋」鈕 → 點了開預填 email（主旨帶頁面＋區塊標題）。
 * 想換信箱或改成 Google Form：改 EMAIL 常數即可。
 */
(function () {
  var EMAIL = "terrel.yeh@gmail.com"; // ← 改這裡換收件信箱
  var body = document.body;
  var sel = body.getAttribute("data-fb-blocks");
  if (!sel) return;
  var titleSel = body.getAttribute("data-fb-title");
  var anchorSel = body.getAttribute("data-fb-anchor");
  var PAGE = (document.title.split("—")[0] || document.title).trim();

  var css =
    ".fb-btn{display:inline-flex;align-items:center;gap:.2rem;font-family:inherit;font-size:.7rem;font-weight:500;" +
    "color:#8B90A0;background:none;border:1px solid #E8E6E1;border-radius:100px;padding:.1rem .55rem;cursor:pointer;" +
    "vertical-align:middle;transition:.15s;line-height:1.5;white-space:nowrap}" +
    ".fb-btn:hover{color:#B8860B;border-color:#D4A843;background:#fffaf0}" +
    "h2 .fb-btn{margin-left:.55rem;font-weight:500}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  function openFb(title) {
    var subj = "[The Pass 回饋] " + PAGE + " · " + title;
    var bd = "區塊：" + title + "\n頁面：" + location.href + "\n\n我的意見：\n";
    location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(bd);
  }

  Array.prototype.forEach.call(document.querySelectorAll(sel), function (blk) {
    var src = titleSel ? blk.querySelector(titleSel) : null;
    var title = (src || blk).textContent.replace(/\s+/g, " ").trim().slice(0, 48);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fb-btn";
    btn.textContent = "💬 回饋";
    btn.setAttribute("aria-label", "對「" + title + "」回饋");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openFb(title);
    });
    var anchor = anchorSel ? blk.querySelector(anchorSel) : blk;
    (anchor || blk).appendChild(btn);
  });
})();
