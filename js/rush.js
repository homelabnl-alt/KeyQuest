(function (global) {
  const START_LIVES = 3;

  let playing = false;
  let score = 0;
  let lives = START_LIVES;
  let combo = 0;
  let wave = 1;
  let engine = null;
  let word = "";
  let limitMs = 8000;
  let startedAt = 0;
  let raf = 0;
  let uiRef = null;

  function hearts(n) {
    return "❤️".repeat(n) + "🖤".repeat(Math.max(0, START_LIVES - n));
  }

  function pickWord() {
    const bucket = Math.min(5, wave);
    const list = KQ_DATA.rushWords[bucket];
    return list[Math.floor(Math.random() * list.length)];
  }

  function nextWord() {
    word = pickWord();
    engine = new KQ.TypingEngine(word);
    limitMs = Math.max(2800, 8200 - (wave - 1) * 700);
    startedAt = Date.now();
    KQKeyboard.renderPrompt(document.getElementById("rush-word"), word, 0, false);
    KQKeyboard.highlight(document.getElementById("rush-keyboard"), engine.expected());
    document.getElementById("rush-wave").textContent = "Wave " + wave + " · " + (limitMs / 1000).toFixed(1) + "s";
    document.getElementById("rush-feedback").textContent = "Type it!";
    document.getElementById("rush-feedback").className = "feedback";
  }

  function tick() {
    if (!playing) return;
    const left = Math.max(0, 1 - (Date.now() - startedAt) / limitMs);
    document.getElementById("rush-timer").style.transform = "scaleX(" + left + ")";
    if (left <= 0) {
      miss("Time's up!");
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function paintHud() {
    document.getElementById("rush-score").textContent = String(score);
    document.getElementById("rush-combo").textContent = "x" + Math.max(1, combo);
    document.getElementById("rush-lives").textContent = hearts(lives);
    document.getElementById("rush-best").textContent = String(uiRef.state.rushBest);
  }

  function start(ui) {
    uiRef = ui;
    playing = true;
    score = 0;
    lives = START_LIVES;
    combo = 0;
    wave = 1;
    document.getElementById("rush-over").classList.add("hidden");
    KQKeyboard.render(document.getElementById("rush-keyboard"));
    paintHud();
    nextWord();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
    ui.show("rush");
  }

  function miss(reason) {
    combo = 0;
    lives -= 1;
    KQ.AudioFx.bad();
    paintHud();
    document.getElementById("rush-feedback").textContent = reason;
    document.getElementById("rush-feedback").className = "feedback bad";
    if (lives <= 0) {
      gameOver();
      return;
    }
    nextWord();
  }

  function gameOver() {
    playing = false;
    cancelAnimationFrame(raf);
    engine = null;
    if (score > uiRef.state.rushBest) uiRef.state.rushBest = score;
    uiRef.awardXp(Math.round(score / 8));
    if (score >= 500) uiRef.unlock("rush-500");
    if (score >= 2000) uiRef.unlock("rush-2000");
    uiRef.persist();
    KQ.AudioFx.over();
    document.getElementById("rush-over-text").textContent =
      "Score " + score + " · Best " + uiRef.state.rushBest + " · Wave " + wave;
    document.getElementById("rush-over").classList.remove("hidden");
    paintHud();
    uiRef.refreshHub();
  }

  function onKey(e) {
    if (!playing || !engine) return;
    if (e.key === "Tab") return;
    if (e.key.length === 1 || e.key === " ") e.preventDefault();
    const res = engine.handle(e.key);
    const kb = document.getElementById("rush-keyboard");
    if (res === "ok") {
      KQ.AudioFx.ok();
      KQKeyboard.flash(kb, e.key, "ok");
      KQKeyboard.renderPrompt(document.getElementById("rush-word"), word, engine.index, false);
      KQKeyboard.highlight(kb, engine.expected());
      if (engine.done()) {
        combo += 1;
        if (combo > uiRef.state.maxCombo) uiRef.state.maxCombo = combo;
        const gained = word.length * 10 * Math.max(1, combo);
        score += gained;
        if (combo > 0 && combo % 4 === 0) wave += 1;
        if (combo >= 8) uiRef.unlock("combo-8");
        if (engine.wpm() >= 30) uiRef.unlock("speed-30");
        uiRef.spark();
        paintHud();
        nextWord();
      }
    } else if (res === "bad") {
      miss("Oops! Combo lost.");
    }
  }

  function active() {
    return playing;
  }

  function stop() {
    playing = false;
    cancelAnimationFrame(raf);
    engine = null;
    const over = document.getElementById("rush-over");
    if (over) over.classList.add("hidden");
  }

  global.KQRush = { start, onKey, active, stop };
})(window);
