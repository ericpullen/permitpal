/* ============================================================
 * engine.js — loads JSON content, renders scenes via SceneKit,
 * wires taps/choices, gives feedback, tracks progress, runs modes.
 * ============================================================ */
(function (root) {
  "use strict";

  // module file order + classification for the mock test
  var MODULES = [
    { file: "signs", group: "signs" },
    { file: "signals", group: "signs" },
    { file: "markings", group: "signs" },
    { file: "right-of-way", group: "rules" },
    { file: "lane-use", group: "rules" },
    { file: "sharing-road", group: "rules" },
    { file: "conditions", group: "rules" },
    { file: "parking", group: "rules" },
    { file: "facts", group: "rules" }
  ];
  var CONTENT_BASE = "content/ky/";

  var data = {};        // file -> module object
  var allScenarios = [];// flat list with .module + .group attached
  var byId = {};

  // play state
  var deck = [], pos = 0, misses = 0, answered = false, deckTitle = "", scored = false, score = 0;

  /* ---------- boot ---------- */
  function $(id) { return document.getElementById(id); }
  function show(id) {
    ["screen-start", "screen-home", "screen-play", "screen-done"].forEach(function (s) {
      var el = $(s); if (el) el.classList.toggle("hidden", s !== id);
    });
  }

  function init() {
    if (root.Settings) root.Settings.apply();
    wireChrome();
    loadAll().then(function () {
      if (!startFromHash()) buildHome();
      root.addEventListener("hashchange", startFromHash);
    }).catch(function (e) {
      var el = $("home-modules");
      if (el) el.innerHTML = '<p class="note">Could not load lessons. If you opened this file directly, run it from a web server or host it online (GitHub Pages / S3).</p>';
      console.error(e);
    });
  }

  function loadAll() {
    return Promise.all(MODULES.map(function (m) {
      return fetch(CONTENT_BASE + m.file + ".json").then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + m.file);
        return r.json();
      }).then(function (json) {
        data[m.file] = json;
        (json.scenarios || []).forEach(function (s) {
          s.module = m.file; s.moduleTitle = json.title; s.group = m.group;
          allScenarios.push(s); byId[s.id] = s;
        });
      });
    }));
  }

  /* ---------- home / menu ---------- */
  function buildHome() {
    show("screen-home");
    var wrap = $("home-modules");
    if (!wrap) return;
    var html = "";
    MODULES.forEach(function (m) {
      var mod = data[m.file]; if (!mod) return;
      var ids = (mod.scenarios || []).map(function (s) { return s.id; });
      var st = root.Progress ? root.Progress.stats(ids) : { got: 0, total: ids.length };
      html += '<button class="module-card" data-module="' + m.file + '">' +
        '<span class="mc-title">' + esc(mod.title) + '</span>' +
        '<span class="mc-sub">' + ids.length + ' lessons' + (st.got ? ' · ' + st.got + ' learned' : '') + '</span>' +
        '</button>';
    });
    wrap.innerHTML = html;
    wrap.querySelectorAll(".module-card").forEach(function (b) {
      b.addEventListener("click", function () { startModule(b.getAttribute("data-module")); });
    });

    // review count
    var rb = $("btn-review");
    if (rb && root.Progress) {
      var n = root.Progress.reviewIds().length;
      rb.classList.toggle("hidden", n === 0);
      var c = $("review-count"); if (c) c.textContent = n;
    }
  }

  function startModule(file) {
    var mod = data[file]; if (!mod) return;
    startDeck((mod.scenarios || []).slice(), mod.title, false);
  }
  // Dev shortcut: open one scenario directly via URL hash, e.g. #q=lane-center-turn-use
  // (also callable from the console as Engine.jump("id")). Returns false if no match.
  function startFromHash() {
    var m = (root.location && root.location.hash || "").match(/q=([\w-]+)/);
    if (!m) return false;
    var sc = byId[m[1]];
    if (!sc) { console.warn("No scenario with id:", m[1]); return false; }
    startDeck([sc], sc.moduleTitle || "Preview", false);
    return true;
  }
  function jump(id) { root.location.hash = "q=" + id; if (!startFromHash()) console.warn("Unknown id:", id); }
  function startMixed() {
    startDeck(shuffle(allScenarios.slice()), "Mixed Practice", false);
  }
  function startReview() {
    var ids = root.Progress ? root.Progress.reviewIds() : [];
    var list = ids.map(function (i) { return byId[i]; }).filter(Boolean);
    if (!list.length) return;
    startDeck(shuffle(list), "Review", false);
  }
  function startMock() {
    var signs = shuffle(allScenarios.filter(function (s) { return s.group === "signs"; })).slice(0, 10);
    var rules = shuffle(allScenarios.filter(function (s) { return s.group === "rules"; })).slice(0, 20);
    startDeck(shuffle(signs.concat(rules)), "Practice Test", true);
  }

  /* ---------- deck flow ---------- */
  function startDeck(list, title, isScored) {
    deck = list; pos = 0; deckTitle = title; scored = isScored; score = 0;
    if (!deck.length) return;
    show("screen-play");
    renderCurrent();
  }

  function renderCurrent() {
    misses = 0; answered = false;
    var sc = deck[pos];
    if (root.Speech) root.Speech.stop();

    // title + dots
    var t = $("play-title"); if (t) t.textContent = deckTitle;
    renderDots();

    // prompt
    var p = $("prompt"); if (p) p.textContent = sc.prompt || "";

    // scene — "tap the sign" rows (pool:"signs") pull a fresh random set of
    // distractor signs each render; row items are then shuffled so the correct
    // answer's position can't be memorized. Spatial scenes (intersections,
    // roads) keep their real layout, where position carries meaning.
    var stage = $("scene");
    var scene = sc.scene;
    if (scene && scene.items) {
      var items = scene.pool === "signs" ? buildSignItems(scene) : scene.items.slice();
      if (items.length > 1) items = shuffle(items);
      scene = cloneScene(scene, items);
    }
    if (stage) stage.innerHTML = root.SceneKit ? root.SceneKit.render(scene) : "";

    // choices — shuffle a copy too, so the right button isn't always in the same spot
    var ch = $("choices");
    if (ch) {
      if (sc.choices && sc.choices.length) {
        ch.classList.remove("hidden");
        ch.innerHTML = pickChoices(sc).map(function (c) {
          return '<button class="choice tap-btn"' + (c.correct ? ' data-correct="1"' : "") +
            (c.key ? ' data-key="' + esc(c.key) + '"' : "") + (c.id ? ' data-id="' + esc(c.id) + '"' : "") +
            '>' + esc(c.label) + '</button>';
        }).join("");
      } else { ch.classList.add("hidden"); ch.innerHTML = ""; }
    }

    // feedback + next
    var fb = $("feedback"); if (fb) { fb.className = "feedback"; fb.textContent = ""; }
    var nx = $("btn-next"); if (nx) { nx.classList.add("hidden"); nx.textContent = (pos === deck.length - 1) ? "Finish" : "Next"; }

    // wire interactions
    bindTargets(sc);

    // speak the prompt
    if (root.Speech) root.Speech.speak(sc.audio || sc.prompt, sc.id);
  }

  function bindTargets(sc) {
    var stage = $("scene"), ch = $("choices");
    var activate = function (el) {
      if (answered || !el) return;
      evaluate(sc, el.getAttribute("data-correct") === "1", el.getAttribute("data-key"), el.getAttribute("data-id"), el);
    };
    var click = function (e) { activate(e.target.closest(".tap, .tap-btn")); };
    // Keyboard support for the SVG scene targets (the <button> choices handle keys natively).
    var keydown = function (e) {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      var el = e.target.closest(".tap");
      if (!el) return;
      e.preventDefault();
      activate(el);
    };
    if (stage) { stage.onclick = click; stage.onkeydown = keydown; }
    if (ch) ch.onclick = click;
  }

  function evaluate(sc, correct, key, id, el) {
    var fb = $("feedback");
    if (correct) {
      answered = true;
      el.classList.add("right");
      doReward(sc);
      var msg = (sc.feedback && sc.feedback.correct) || "Correct!";
      flash(fb, msg, true);
      if (root.Speech) root.Speech.speak(msg);
      if (root.Progress) root.Progress.set(sc.id, misses === 0 ? "got" : "review");
      if (scored && misses === 0) score++;
      var nx = $("btn-next"); if (nx) nx.classList.remove("hidden");
    } else {
      misses++;
      if (el) { el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong"); }
      var m = (sc.feedback && (sc.feedback[key] || sc.feedback[id])) || (sc.feedback && sc.feedback.default) || "Not quite — try again.";
      flash(fb, m, false);
      if (root.Speech) root.Speech.speak(m);
      if (root.Progress) root.Progress.set(sc.id, "review");
      if (misses >= 2 && sc.hint) pulseHint(sc.hint);
    }
  }

  function doReward(sc) {
    var stage = $("scene"); if (!stage) return;
    if (sc.reward === "markZone") {
      var mark = stage.querySelector("#mark");
      if (mark) { mark.style.transition = "opacity .3s ease"; mark.style.opacity = "1"; }
    } else {
      // pulse the correct scene target (if any)
      var c = stage.querySelector('[data-correct="1"]');
      if (c) { c.classList.add("chosen"); }
    }
  }

  function pulseHint(hintId) {
    var stage = $("scene"), ch = $("choices");
    var el = (stage && stage.querySelector('[data-id="' + cssEsc(hintId) + '"]')) ||
      (ch && ch.querySelector('[data-id="' + cssEsc(hintId) + '"]'));
    if (el) { el.classList.remove("hintpulse"); void el.offsetWidth; el.classList.add("hintpulse"); }
  }

  function flash(el, msg, good) {
    if (!el) return;
    el.textContent = msg;
    el.className = "feedback show " + (good ? "good" : "bad");
  }

  function renderDots() {
    var d = $("dots"); if (!d) return;
    var html = "";
    for (var i = 0; i < deck.length; i++) {
      var cls = "dot" + (i < pos ? " done" : "") + (i === pos ? " current" : "");
      html += '<span class="' + cls + '"></span>';
    }
    d.innerHTML = html;
  }

  function next() {
    if (pos < deck.length - 1) { pos++; renderCurrent(); }
    else finish();
  }

  function finish() {
    show("screen-done");
    var sum = $("done-summary");
    if (sum) {
      if (scored) {
        var need = Math.ceil(deck.length * 0.8);
        var passed = score >= need;
        sum.innerHTML = '<div class="score ' + (passed ? "pass" : "fail") + '">' + score + ' / ' + deck.length + '</div>' +
          '<p>' + (passed ? "Great job — that's a passing score!" : "Good effort. Keep practicing the tricky ones.") + '</p>' +
          '<p class="note">On the real Kentucky test you need ' + Math.ceil(40 * 0.8) + ' out of 40 to pass.</p>';
      } else {
        sum.innerHTML = '<div class="score">Nice work!</div><p>You finished ' + deck.length + ' ' + (deck.length === 1 ? "lesson" : "lessons") + '.</p>';
      }
    }
  }

  /* ---------- chrome (buttons, settings) ---------- */
  function wireChrome() {
    var start = $("btn-start");
    if (start) start.addEventListener("click", function () {
      if (root.Speech) root.Speech.warm();
      buildHome();
    });

    on("btn-next", function () { next(); });
    on("btn-home", function () { buildHome(); });
    on("btn-home-2", function () { buildHome(); });
    on("btn-mixed", function () { startMixed(); });
    on("btn-mock", function () { startMock(); });
    on("btn-review", function () { startReview(); });
    on("btn-again", function () { startDeck(deck.slice(), deckTitle, scored); });

    // settings panel
    on("btn-settings", function () { togglePanel(true); });
    on("btn-settings-close", function () { togglePanel(false); });
    on("btn-mute", function () {
      var nowOn = !(root.Settings && root.Settings.get("sound"));
      if (root.Settings) root.Settings.set("sound", nowOn);
      reflectMute();
    });
    reflectMute();
    wireSettingsControls();
  }

  function reflectMute() {
    var b = $("btn-mute"); if (!b) return;
    var on = !root.Settings || root.Settings.get("sound");
    b.textContent = on ? "🔊" : "🔇";
    b.setAttribute("aria-label", on ? "Sound on" : "Sound off");
  }

  function togglePanel(open) {
    var p = $("panel-settings"); if (p) p.classList.toggle("open", open);
    syncSettingsUI();
  }

  function wireSettingsControls() {
    on("set-sound", null, "change", function (e) { root.Settings.set("sound", e.target.checked); reflectMute(); });
    on("set-motion", null, "change", function (e) { root.Settings.set("motion", e.target.checked); });
    on("set-contrast", null, "change", function (e) { root.Settings.set("contrast", e.target.checked); });
    on("set-font", null, "change", function (e) { root.Settings.set("font", e.target.checked ? "dyslexic" : "default"); });
  }
  function syncSettingsUI() {
    if (!root.Settings) return;
    setChecked("set-sound", root.Settings.get("sound"));
    setChecked("set-motion", root.Settings.get("motion"));
    setChecked("set-contrast", root.Settings.get("contrast"));
    setChecked("set-font", root.Settings.get("font") === "dyslexic");
  }
  function setChecked(id, v) { var e = $(id); if (e) e.checked = !!v; }

  /* ---------- helpers ---------- */
  function on(id, click, evt, fn) {
    var el = $(id); if (!el) return;
    if (click) el.addEventListener("click", click);
    if (evt && fn) el.addEventListener(evt, fn);
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // shallow copy of a scene with a new items array (so we never mutate the source scenario)
  function cloneScene(scene, items) { var o = {}; for (var k in scene) if (scene.hasOwnProperty(k)) o[k] = scene[k]; o.items = items; return o; }

  // Signs the engine can drop in as distractors for "tap the sign" questions.
  var SIGN_DISTRACTORS = ["stop", "yield", "doNotEnter", "oneWay", "speedLimit", "noUTurn", "noLeftTurn", "pedestrianXing", "curve", "merge", "school", "railroad", "workZone"];
  function signItem(name, i) {
    var it = { type: "sign", name: name, id: "d" + i, key: name };
    if (name === "speedLimit") it.arg = [25, 35, 45, 55, 65][Math.floor(Math.random() * 5)];
    else if (name === "oneWay") it.arg = Math.random() < 0.5 ? "left" : "right";
    return it;
  }
  // Pick which answer buttons to show. With sc.choiceShow set, keep the correct
  // answer(s) and a fresh random subset of the wrong ones (so the option set
  // varies between attempts); otherwise show every choice. Always shuffled.
  function pickChoices(sc) {
    var list = sc.choices.slice();
    var show = sc.choiceShow || 0;
    if (!show || show >= list.length) return shuffle(list);
    var correct = list.filter(function (c) { return c.correct; });
    var wrongs = shuffle(list.filter(function (c) { return !c.correct; }));
    return shuffle(correct.concat(wrongs.slice(0, Math.max(1, show - correct.length))));
  }

  // Build a sign-recognition item set: the authored correct sign plus a fresh
  // random pick of safe distractor signs. scene.exclude drops look-alikes so a
  // category question (e.g. "tap the warning sign") can't get two valid answers.
  function buildSignItems(scene) {
    var correct = null, i;
    for (i = 0; i < scene.items.length; i++) if (scene.items[i].correct) { correct = scene.items[i]; break; }
    if (!correct) return scene.items.slice();
    var show = scene.show || 3, exclude = scene.exclude || [];
    var cands = SIGN_DISTRACTORS.filter(function (name) {
      return name !== correct.name && exclude.indexOf(name) < 0;
    });
    shuffle(cands);
    var out = [correct];
    for (i = 0; i < cands.length && out.length < show; i++) out.push(signItem(cands[i], i));
    return out;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }

  root.Engine = { init: init, jump: jump };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
