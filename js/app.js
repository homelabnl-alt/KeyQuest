(function () {
  const state = KQ.load();
  KQ.AudioFx.enabled = !state.mute;

  const screens = {
    hub: document.getElementById("screen-hub"),
    academy: document.getElementById("screen-academy"),
    "academy-play": document.getElementById("screen-academy-play"),
    rush: document.getElementById("screen-rush"),
    adventure: document.getElementById("screen-adventure"),
    "adventure-play": document.getElementById("screen-adventure-play")
  };

  function show(name) {
    Object.keys(screens).forEach((key) => {
      screens[key].classList.toggle("active", key === name);
    });
    if (name !== "academy-play") KQAcademy.stop();
    if (name !== "rush") KQRush.stop();
    if (name !== "adventure-play") KQAdventure.stop();
  }

  function persist() {
    KQ.save(state);
    refreshChrome();
  }

  function refreshChrome() {
    document.getElementById("player-name").textContent = state.name;
    const level = KQ.levelFromXp(state.xp);
    const into = KQ.xpIntoLevel(state.xp);
    document.getElementById("player-level").textContent = String(level);
    document.getElementById("xp-fill").style.width = (into / KQ.XP_PER_LEVEL) * 100 + "%";
    document.getElementById("xp-text").textContent = into + " / " + KQ.XP_PER_LEVEL + " XP";
    const stars =
      Object.values(state.academyStars).reduce((a, b) => a + b, 0) +
      Object.values(state.adventureStars).reduce((a, b) => a + b, 0);
    document.getElementById("star-total").textContent = String(stars);
    document.getElementById("btn-mute").textContent = state.mute ? "🔇" : "🔊";
    document.getElementById("btn-mute").setAttribute("aria-pressed", String(state.mute));
    if (stars >= 12) unlock("stars-12");
    if (level >= 5) unlock("level-5");
  }

  function refreshHub() {
    const nextLesson = Math.min(state.academyUnlocked + 1, KQ_DATA.lessons.length);
    document.getElementById("academy-meta").textContent = "Lesson " + nextLesson + " of " + KQ_DATA.lessons.length;
    document.getElementById("rush-meta").textContent = "Best: " + state.rushBest;
    document.getElementById("adventure-meta").textContent =
      "Stage " + Math.min(state.adventureUnlocked + 1, KQ_DATA.stages.length) + " of " + KQ_DATA.stages.length;
    document.getElementById("lesson-grid").innerHTML = KQAcademy.listHtml(state);
    document.getElementById("adventure-trail").innerHTML = KQAdventure.trailHtml(state);
    refreshChrome();
  }

  function awardXp(amount) {
    const before = KQ.levelFromXp(state.xp);
    state.xp += Math.max(0, Math.round(amount));
    const after = KQ.levelFromXp(state.xp);
    if (after > before) {
      toast("Level up! You are level " + after + "!");
      KQ.AudioFx.win();
    }
    persist();
  }

  function recordStars(bucket, id, stars) {
    const prev = state[bucket][id] || 0;
    if (stars > prev) state[bucket][id] = stars;
  }

  function unlock(id) {
    if (state.achievements.indexOf(id) !== -1) return;
    state.achievements.push(id);
    const meta = KQ_DATA.achievements.find((a) => a.id === id);
    toast("Trophy: " + (meta ? meta.title : id));
    persist();
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  function spark() {
    const layer = document.getElementById("fx-layer");
    const n = document.createElement("div");
    n.className = "spark";
    n.textContent = ["⭐", "✨", "🌟"][Math.floor(Math.random() * 3)];
    n.style.left = 20 + Math.random() * 60 + "%";
    n.style.top = 40 + Math.random() * 30 + "%";
    layer.appendChild(n);
    setTimeout(() => n.remove(), 800);
  }

  function renderAchievements() {
    document.getElementById("achieve-grid").innerHTML = KQ_DATA.achievements.map((a) => {
      const got = state.achievements.indexOf(a.id) !== -1;
      return (
        '<div class="achieve-card' + (got ? "" : " locked") + '">' +
        "<div>" + (got ? "🏆" : "🔒") + "</div><h3>" + a.title + "</h3><p>" + a.desc + "</p></div>"
      );
    }).join("");
  }

  const ui = {
    state,
    show,
    persist,
    refreshHub,
    awardXp,
    recordStars,
    unlock,
    toast,
    spark
  };

  function go(dest) {
    try { KQ.AudioFx.ensure(); } catch (err) {}
    if (dest === "academy") {
      refreshHub();
      show("academy");
    } else if (dest === "rush") {
      KQRush.start(ui);
    } else if (dest === "adventure") {
      refreshHub();
      show("adventure");
    } else if (dest === "hub") {
      refreshHub();
      show("hub");
    } else if (dest === "academy-play") {
      show("academy");
    }
  }

  document.addEventListener("click", (e) => {
    try {
      try { KQ.AudioFx.ensure(); } catch (err) {}
      const el = e.target && (e.target.nodeType === 1 ? e.target : e.target.parentElement);
      if (!el || typeof el.closest !== "function") return;
      const goto = el.closest("[data-goto]");
      if (goto) {
        go(goto.getAttribute("data-goto"));
        return;
      }
      const lessonBtn = el.closest("[data-lesson]");
      if (lessonBtn && !lessonBtn.disabled) {
        KQAcademy.start(Number(lessonBtn.getAttribute("data-lesson")), ui);
        return;
      }
      const stageBtn = el.closest("[data-stage]");
      if (stageBtn && !stageBtn.disabled) {
        KQAdventure.start(Number(stageBtn.getAttribute("data-stage")), ui);
      }
    } catch (err) {
      console.error(err);
    }
  });

  document.getElementById("btn-home").addEventListener("click", () => {
    refreshHub();
    show("hub");
  });

  document.getElementById("btn-name").addEventListener("click", () => {
    const next = window.prompt("Hero name?", state.name);
    if (next && next.trim()) {
      state.name = next.trim().slice(0, 18);
      persist();
    }
  });

  document.getElementById("btn-mute").addEventListener("click", () => {
    state.mute = !state.mute;
    KQ.AudioFx.enabled = !state.mute;
    persist();
  });

  document.getElementById("btn-achievements").addEventListener("click", () => {
    renderAchievements();
    document.getElementById("overlay-achievements").classList.remove("hidden");
  });
  document.getElementById("close-achievements").addEventListener("click", () => {
    document.getElementById("overlay-achievements").classList.add("hidden");
  });
  document.getElementById("overlay-achievements").addEventListener("click", (e) => {
    if (e.target.id === "overlay-achievements") e.target.classList.add("hidden");
  });

  document.getElementById("rush-retry").addEventListener("click", () => KQRush.start(ui));
  document.getElementById("adv-continue").addEventListener("click", () => {
    document.getElementById("adv-over").classList.add("hidden");
    refreshHub();
    show("adventure");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("overlay-achievements").classList.add("hidden");
    }
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (KQAcademy.active()) KQAcademy.onKey(e, ui);
    else if (KQRush.active()) KQRush.onKey(e);
    else if (KQAdventure.active()) KQAdventure.onKey(e);
  });

  refreshHub();
  show("hub");

  window.KeyQuestTest = {
    calcWpm: KQ.calcWpm,
    calcAccuracy: KQ.calcAccuracy,
    starsFromAccuracy: KQ.starsFromAccuracy,
    state,
    show,
    startLesson: (i) => KQAcademy.start(i, ui),
    startRush: () => KQRush.start(ui),
    startStage: (i) => KQAdventure.start(i, ui),
    go,
    ui
  };
})();
