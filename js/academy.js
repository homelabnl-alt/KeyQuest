(function (global) {
  let engine = null;
  let lessonIndex = 0;
  let badFlash = false;

  function listHtml(state) {
    return KQ_DATA.lessons.map((lesson, i) => {
      const locked = i > state.academyUnlocked;
      const stars = state.academyStars[lesson.id] || 0;
      const starStr = "★★★".slice(0, stars) + "☆☆☆".slice(stars);
      return (
        '<button class="lesson-card' + (locked ? " locked" : "") + '" data-lesson="' + i + '" ' +
        (locked ? "disabled" : "") + ' type="button">' +
        "<h3>" + (i + 1) + ". " + lesson.title + "</h3>" +
        '<p class="keys">' + lesson.keys + "</p>" +
        "<p>" + lesson.blurb + "</p>" +
        '<div class="stars">' + (locked ? "🔒" : starStr) + "</div>" +
        "</button>"
      );
    }).join("");
  }

  function start(index, ui) {
    lessonIndex = index;
    const lesson = KQ_DATA.lessons[index];
    engine = new KQ.TypingEngine(lesson.prompt);
    badFlash = false;
    document.getElementById("lesson-title").textContent = lesson.title;
    document.getElementById("ac-hint").textContent = "Fingers on the home row. Type: " + lesson.blurb;
    KQKeyboard.render(document.getElementById("academy-keyboard"));
    paint();
    ui.show("academy-play");
  }

  function paint() {
    if (!engine) return;
    KQKeyboard.renderPrompt(document.getElementById("ac-prompt"), engine.prompt, engine.index, badFlash);
    KQKeyboard.highlight(document.getElementById("academy-keyboard"), engine.expected());
    document.getElementById("ac-wpm").textContent = Math.round(engine.wpm());
    document.getElementById("ac-acc").textContent = Math.round(engine.accuracy()) + "%";
    const pct = Math.round((engine.index / engine.prompt.length) * 100);
    document.getElementById("ac-prog").textContent = pct + "%";
  }

  function onKey(e, ui) {
    if (!engine || engine.done()) return;
    if (e.key === "Tab") return;
    if (e.key.length === 1 || e.key === " ") e.preventDefault();
    const res = engine.handle(e.key);
    const kb = document.getElementById("academy-keyboard");
    if (res === "ok") {
      badFlash = false;
      KQ.AudioFx.ok();
      KQKeyboard.flash(kb, e.key, "ok");
      ui.spark();
      document.getElementById("ac-feedback").textContent = "Nice!";
      document.getElementById("ac-feedback").className = "feedback good";
      paint();
      if (engine.done()) finish(ui);
    } else if (res === "bad") {
      badFlash = true;
      KQ.AudioFx.bad();
      KQKeyboard.flash(kb, e.key, "no");
      document.getElementById("ac-feedback").textContent = "Try the glowing key.";
      document.getElementById("ac-feedback").className = "feedback bad";
      paint();
      setTimeout(() => { badFlash = false; paint(); }, 180);
    }
  }

  function finish(ui) {
    const acc = engine.accuracy();
    const wpm = engine.wpm();
    const stars = KQ.starsFromAccuracy(acc);
    const lesson = KQ_DATA.lessons[lessonIndex];
    const gained = 40 + stars * 20 + Math.round(wpm);
    ui.awardXp(gained);
    ui.recordStars("academyStars", lesson.id, stars);
    if (stars >= 1 && lessonIndex === ui.state.academyUnlocked && lessonIndex < KQ_DATA.lessons.length - 1) {
      ui.state.academyUnlocked = lessonIndex + 1;
    }
    if (stars >= 1 && lessonIndex === 0) ui.unlock("first-lesson");
    const homeDone = [0, 1, 2].every((i) => (ui.state.academyStars[KQ_DATA.lessons[i].id] || 0) >= 1);
    if (homeDone) ui.unlock("home-master");
    const allDone = KQ_DATA.lessons.every((l) => (ui.state.academyStars[l.id] || 0) >= 1);
    if (allDone) ui.unlock("scholar");
    if (wpm >= 30) ui.unlock("speed-30");
    if (acc >= 100) ui.unlock("perfect");
    ui.persist();
    const pass = stars >= 1;
    document.getElementById("ac-feedback").textContent = pass
      ? "Lesson complete! " + stars + " star(s), " + Math.round(wpm) + " WPM, " + Math.round(acc) + "% accuracy. +" + gained + " XP"
      : "Need 85% accuracy to earn a star. You got " + Math.round(acc) + "%. Try again!";
    document.getElementById("ac-feedback").className = "feedback " + (pass ? "good" : "bad");
    if (pass) KQ.AudioFx.win();
    ui.toast(pass ? "Lesson cleared!" : "Almost — keep practicing!");
  }

  function active() {
    return !!engine && !engine.done();
  }

  function stop() {
    engine = null;
  }

  global.KQAcademy = { listHtml, start, onKey, active, stop };
})(window);
