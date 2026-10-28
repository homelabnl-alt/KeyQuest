(function (global) {
  const PLAYER_HP = 3;

  let stageIndex = 0;
  let promptIndex = 0;
  let engine = null;
  let foeHp = 0;
  let foeMax = 0;
  let hearts = PLAYER_HP;
  let playing = false;
  let uiRef = null;
  let badFlash = false;
  let misses = 0;

  function trailHtml(state) {
    return KQ_DATA.stages.map((stage, i) => {
      const locked = i > state.adventureUnlocked;
      const stars = state.adventureStars[stage.id] || 0;
      const starStr = "★★★".slice(0, stars) + "☆☆☆".slice(stars);
      return (
        '<button class="stage-card' + (stage.boss ? " boss" : "") + (locked ? " locked" : "") +
        '" data-stage="' + i + '" ' + (locked ? "disabled" : "") + ' type="button">' +
        '<span class="stage-emoji">' + stage.enemy + "</span>" +
        "<div><h3>" + (i + 1) + ". " + stage.title + (stage.boss ? " — FINAL BOSS" : "") + "</h3>" +
        "<p>" + stage.enemyName + " · " + (locked ? "Locked" : starStr) + "</p></div>" +
        "</button>"
      );
    }).join("");
  }

  function start(index, ui) {
    uiRef = ui;
    stageIndex = index;
    promptIndex = 0;
    const stage = KQ_DATA.stages[index];
    foeMax = stage.hp;
    foeHp = stage.hp;
    hearts = PLAYER_HP;
    playing = true;
    misses = 0;
    document.getElementById("adv-over").classList.add("hidden");
    document.getElementById("adv-title").textContent = stage.title;
    document.getElementById("foe-sprite").textContent = stage.enemy;
    document.getElementById("foe-name").textContent = stage.enemyName;
    document.getElementById("adv-flavor").textContent = stage.flavor;
    document.getElementById("hero-sprite").textContent = "🦊";
    KQKeyboard.render(document.getElementById("adv-keyboard"));
    loadPrompt();
    paintBattle();
    ui.show("adventure-play");
  }

  function loadPrompt() {
    const stage = KQ_DATA.stages[stageIndex];
    const text = stage.prompts[promptIndex];
    engine = new KQ.TypingEngine(text);
    badFlash = false;
    misses = 0;
    KQKeyboard.renderPrompt(document.getElementById("adv-prompt"), text, 0, false);
    KQKeyboard.highlight(document.getElementById("adv-keyboard"), engine.expected());
    document.getElementById("adv-feedback").textContent = stage.boss ? "Land a hit on King Typo!" : "Type to attack!";
    document.getElementById("adv-feedback").className = "feedback";
  }

  function paintBattle() {
    document.getElementById("adv-hearts").textContent = "❤️".repeat(hearts) + "🖤".repeat(PLAYER_HP - hearts);
    document.getElementById("foe-hp").style.width = Math.max(0, (foeHp / foeMax) * 100) + "%";
    if (engine) {
      document.getElementById("adv-wpm").textContent = Math.round(engine.wpm());
      document.getElementById("adv-acc").textContent = Math.round(engine.accuracy()) + "%";
    }
  }

  function hitFoe() {
    foeHp -= 1;
    const sprite = document.getElementById("foe-sprite");
    sprite.classList.remove("hit");
    void sprite.offsetWidth;
    sprite.classList.add("hit");
    KQ.AudioFx.hit();
    uiRef.spark();
  }

  function hurtPlayer() {
    hearts -= 1;
    KQ.AudioFx.bad();
    const sprite = document.getElementById("hero-sprite");
    sprite.classList.remove("hit");
    void sprite.offsetWidth;
    sprite.classList.add("hit");
    paintBattle();
    if (hearts <= 0) {
      end(false);
    }
  }

  function onKey(e) {
    if (!playing || !engine) return;
    if (e.key === "Tab") return;
    if (e.key.length === 1 || e.key === " ") e.preventDefault();
    const res = engine.handle(e.key);
    const kb = document.getElementById("adv-keyboard");
    if (res === "ok") {
      badFlash = false;
      KQ.AudioFx.ok();
      KQKeyboard.flash(kb, e.key, "ok");
      KQKeyboard.renderPrompt(document.getElementById("adv-prompt"), engine.prompt, engine.index, false);
      KQKeyboard.highlight(kb, engine.expected());
      paintBattle();
      if (engine.done()) {
        if (engine.wpm() >= 30) uiRef.unlock("speed-30");
        if (engine.accuracy() >= 100) uiRef.unlock("perfect");
        hitFoe();
        promptIndex += 1;
        const stage = KQ_DATA.stages[stageIndex];
        paintBattle();
        if (foeHp <= 0 || promptIndex >= stage.prompts.length) {
          end(true);
        } else {
          document.getElementById("adv-feedback").textContent = "Hit! Next word!";
          document.getElementById("adv-feedback").className = "feedback good";
          loadPrompt();
        }
      }
    } else if (res === "bad") {
      badFlash = true;
      misses += 1;
      KQKeyboard.flash(kb, e.key, "no");
      KQKeyboard.renderPrompt(document.getElementById("adv-prompt"), engine.prompt, engine.index, true);
      document.getElementById("adv-feedback").textContent = "Oops! " + (3 - (misses % 3 || 3)) + " more miss(es) until a heart is lost.";
      document.getElementById("adv-feedback").className = "feedback bad";
      if (misses % 3 === 0) {
        document.getElementById("adv-feedback").textContent = "The foe strikes back!";
        hurtPlayer();
      }
      setTimeout(() => {
        if (playing && engine) {
          KQKeyboard.renderPrompt(document.getElementById("adv-prompt"), engine.prompt, engine.index, false);
        }
      }, 180);
    }
  }

  function end(won) {
    playing = false;
    const stage = KQ_DATA.stages[stageIndex];
    const acc = engine ? engine.accuracy() : 0;
    const wpm = engine ? engine.wpm() : 0;
    const stars = won ? Math.max(1, KQ.starsFromAccuracy(Math.max(acc, 90))) : 0;
    if (won) {
      document.getElementById("hero-sprite").classList.add("win");
      KQ.AudioFx.win();
      uiRef.awardXp(60 + (stage.boss ? 80 : 0) + stars * 15);
      uiRef.recordStars("adventureStars", stage.id, stars);
      if (stageIndex === uiRef.state.adventureUnlocked && stageIndex < KQ_DATA.stages.length - 1) {
        uiRef.state.adventureUnlocked = stageIndex + 1;
      }
      if (stageIndex === 0) uiRef.unlock("trail");
      if (stage.boss) uiRef.unlock("dragon");
      uiRef.persist();
      document.getElementById("adv-over-title").textContent = stage.boss ? "King Typo falls!" : "Victory!";
      document.getElementById("adv-over-text").textContent =
        Math.round(wpm) + " WPM · " + Math.round(acc) + "% accuracy · +" + (60 + stars * 15) + " XP";
      document.getElementById("adv-over-stars").textContent = "⭐".repeat(stars);
    } else {
      KQ.AudioFx.over();
      document.getElementById("adv-over-title").textContent = "Retreat!";
      document.getElementById("adv-over-text").textContent = "The foe was too tricky. Rest and try again!";
      document.getElementById("adv-over-stars").textContent = "";
    }
    document.getElementById("adv-over").classList.remove("hidden");
    uiRef.refreshHub();
  }

  function active() {
    return playing;
  }

  function stop() {
    playing = false;
    engine = null;
    const over = document.getElementById("adv-over");
    if (over) over.classList.add("hidden");
  }

  global.KQAdventure = { trailHtml, start, onKey, active, stop };
})(window);
