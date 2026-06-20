/* The Pass — 區塊回饋（導出式、零後端）
 * 在 <body> 標 data-fb-blocks="選擇器"，每個區塊自動長出「💬 回饋」鈕。
 * 點了：把「頁面＋區塊＋意見範本」複製到剪貼簿 + 跳提示，使用者貼到 email/Slack 給 Terrel。
 * （改用複製而非 mailto：mailto 依賴本機郵件程式，web Gmail 用戶點了常沒反應。）
 * 選填：data-fb-title（標題子選擇器）、data-fb-anchor（按鈕掛在區塊內哪裡）。
 */
(function () {
  var body = document.body;
  var sel = body.getAttribute("data-fb-blocks");
  if (!sel) return;
  var titleSel = body.getAttribute("data-fb-title");
  var anchorSel = body.getAttribute("data-fb-anchor");
  var PAGE = (document.title.split("—")[0] || document.title).trim();

  var css =
    ".fb-btn{display:inline-flex;align-items:center;gap:.2rem;font-family:inherit;font-size:.7rem;font-weight:500;color:#8B90A0;background:none;border:1px solid #E8E6E1;border-radius:100px;padding:.1rem .55rem;cursor:pointer;vertical-align:middle;transition:.15s;line-height:1.5;white-space:nowrap}" +
    ".fb-btn:hover{color:#B8860B;border-color:#D4A843;background:#fffaf0}" +
    "h2 .fb-btn{margin-left:.55rem;font-weight:500}" +
    ".fb-toast{position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%) translateY(1rem);background:#2C3345;color:#fff;font-family:inherit;font-size:.82rem;line-height:1.5;padding:.7rem 1.1rem;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:.22s;z-index:9999;max-width:90vw;text-align:center}" +
    ".fb-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var toast = document.createElement("div");
  toast.className = "fb-toast";
  document.body.appendChild(toast);
  var tmr;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(tmr);
    tmr = setTimeout(function () { toast.classList.remove("show"); }, 3600);
  }

  function tmpl(title) {
    return "【The Pass 團隊回饋】\n頁面：" + PAGE + "\n區塊：" + title + "\n連結：" + location.href + "\n\n我的意見：\n";
  }
  function fallbackCopy(text, ok, fail) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.top = "-9999px"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      var done = document.execCommand("copy");
      document.body.removeChild(ta);
      done ? ok() : fail();
    } catch (e) { fail(); }
  }
  function copy(title) {
    var text = tmpl(title);
    var ok = function () { showToast("已複製「" + title + "」的回饋範本 — 貼到 email／Slack／訊息給 Terrel 即可 ✓"); };
    var fail = function () { showToast("複製失敗：請把這段回饋給 Terrel — " + title); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text, ok, fail); });
    } else {
      fallbackCopy(text, ok, fail);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(sel), function (blk) {
    var src = titleSel ? blk.querySelector(titleSel) : null;
    var title = (src || blk).textContent.replace(/\s+/g, " ").trim().slice(0, 48);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fb-btn";
    btn.textContent = "💬 回饋";
    btn.setAttribute("aria-label", "複製「" + title + "」的回饋範本");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      copy(title);
    });
    var anchor = anchorSel ? blk.querySelector(anchorSel) : blk;
    (anchor || blk).appendChild(btn);
  });
})();
