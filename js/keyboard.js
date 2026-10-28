(function (global) {
  const ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "?"],
    [" "]
  ];
  const HOME = new Set(["a", "s", "d", "f", "j", "k", "l", ";"]);

  function keyId(ch) {
    if (ch === " ") return "space";
    return "k-" + encodeURIComponent(ch.toLowerCase());
  }

  function render(container) {
    container.innerHTML = "";
    const kb = document.createElement("div");
    kb.className = "keyboard";
    ROWS.forEach((row, i) => {
      const r = document.createElement("div");
      r.className = "kb-row";
      row.forEach((ch) => {
        const el = document.createElement("div");
        el.className = "key";
        if (HOME.has(ch)) el.classList.add("home");
        if (ch === " ") {
          el.classList.add("space");
          el.textContent = "space";
        } else {
          el.textContent = ch;
        }
        el.dataset.ch = ch;
        el.id = container.id + "-" + keyId(ch);
        r.appendChild(el);
      });
      if (i === 1) r.style.paddingLeft = "18px";
      if (i === 2) r.style.paddingLeft = "36px";
      kb.appendChild(r);
    });
    container.appendChild(kb);
  }

  function highlight(container, ch) {
    container.querySelectorAll(".key").forEach((el) => {
      el.classList.remove("next", "ok", "no");
    });
    if (!ch) return;
    const target = ch.toLowerCase();
    const el = container.querySelector('.key[data-ch="' + cssEscape(target) + '"]');
    if (el) el.classList.add("next");
  }

  function flash(container, ch, cls) {
    const el = container.querySelector('.key[data-ch="' + cssEscape((ch || "").toLowerCase()) + '"]');
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 180);
  }

  function cssEscape(value) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
    return value.replace(/"/g, '\\"');
  }

  function renderPrompt(el, prompt, index, bad) {
    el.innerHTML = "";
    for (let i = 0; i < prompt.length; i += 1) {
      const span = document.createElement("span");
      const ch = prompt[i];
      span.className = "ch";
      span.textContent = ch === " " ? "·" : ch;
      if (i < index) span.classList.add("done");
      else if (i === index) span.classList.add(bad ? "bad" : "now");
      else span.classList.add("wait");
      el.appendChild(span);
    }
  }

  global.KQKeyboard = { render, highlight, flash, renderPrompt };
})(window);
