(function (global) {
  const SAVE_KEY = "keyquest-save-v1";
  const XP_PER_LEVEL = 120;

  const defaultState = () => ({
    name: "Captain Keys",
    xp: 0,
    mute: false,
    academyUnlocked: 0,
    academyStars: {},
    rushBest: 0,
    maxCombo: 0,
    adventureUnlocked: 0,
    adventureStars: {},
    achievements: [],
    plays: 0
  });

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (err) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      return false;
    }
  }

  function calcWpm(correctChars, elapsedMs) {
    if (!elapsedMs || elapsedMs <= 0) return 0;
    const minutes = elapsedMs / 60000;
    return (correctChars / 5) / minutes;
  }

  function calcAccuracy(correct, incorrect) {
    const total = correct + incorrect;
    if (total <= 0) return 100;
    return (correct / total) * 100;
  }

  function starsFromAccuracy(acc) {
    if (acc >= 98) return 3;
    if (acc >= 92) return 2;
    if (acc >= 85) return 1;
    return 0;
  }

  function levelFromXp(xp) {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }

  function xpIntoLevel(xp) {
    return xp % XP_PER_LEVEL;
  }

  const AudioFx = {
    ctx: null,
    enabled: true,
    ensure() {
      try {
        if (!this.ctx) {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return null;
          this.ctx = new Ctx();
        }
        if (this.ctx.state === "suspended") this.ctx.resume();
        return this.ctx;
      } catch (err) {
        this.enabled = false;
        return null;
      }
    },
    beep(freq, dur, type, gain) {
      if (!this.enabled) return;
      let ctx = null;
      try {
        ctx = this.ensure();
      } catch (err) {
        return;
      }
      if (!ctx) return;
      try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      g.gain.value = gain || 0.05;
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.stop(ctx.currentTime + dur);
      } catch (err) {
        /* ignore audio failures so gameplay continues */
      }
    },
    ok() { this.beep(660, 0.08, "triangle", 0.04); },
    bad() { this.beep(180, 0.12, "square", 0.04); },
    win() { this.beep(523, 0.12); setTimeout(() => this.beep(659, 0.12), 90); setTimeout(() => this.beep(784, 0.18), 180); },
    hit() { this.beep(392, 0.1, "sawtooth", 0.03); },
    over() { this.beep(220, 0.25, "sawtooth", 0.05); }
  };

  class TypingEngine {
    constructor(prompt) {
      this.prompt = prompt;
      this.index = 0;
      this.correct = 0;
      this.incorrect = 0;
      this.startedAt = 0;
      this.finishedAt = 0;
    }
    start() {
      if (!this.startedAt) this.startedAt = Date.now();
    }
    expected() {
      return this.prompt[this.index] || "";
    }
    done() {
      return this.index >= this.prompt.length;
    }
    handle(key) {
      if (this.done()) return "done";
      if (key.length !== 1) return "ignore";
      this.start();
      const want = this.expected();
      const got = key;
      const match = want.toLowerCase() === got.toLowerCase() || want === got;
      if (match) {
        this.correct += 1;
        this.index += 1;
        if (this.done()) this.finishedAt = Date.now();
        return "ok";
      }
      this.incorrect += 1;
      return "bad";
    }
    elapsed() {
      const end = this.finishedAt || Date.now();
      if (!this.startedAt) return 0;
      return end - this.startedAt;
    }
    wpm() {
      return calcWpm(this.correct, this.elapsed());
    }
    accuracy() {
      return calcAccuracy(this.correct, this.incorrect);
    }
  }

  global.KQ = {
    SAVE_KEY,
    XP_PER_LEVEL,
    load,
    save,
    calcWpm,
    calcAccuracy,
    starsFromAccuracy,
    levelFromXp,
    xpIntoLevel,
    AudioFx,
    TypingEngine,
    defaultState
  };
})(window);
