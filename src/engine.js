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
      buildHome();
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

    // scene
    var stage = $("scene");
    if (stage) stage.innerHTML = root.SceneKit ? root.SceneKit.render(sc.scene) : "";

    // choices
    var ch = $("choices");
    if (ch) {
      if (sc.choices && sc.choices.length) {
        ch.classList.remove("hidden");
        ch.innerHTML = sc.choices.map(function (c) {
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
    var handler = function (e) {
      if (answered) return;
      var el = e.target.closest(".tap, .tap-btn");
      if (!el) return;
      var correct = el.getAttribute("data-correct") === "1";
      var key = el.getAttribute("data-key");
      var id = el.getAttribute("data-id");
      evaluate(sc, correct, key, id, el);
    };
    if (stage) stage.onclick = handler;
    if (ch) ch.onclick = handler;
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
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }

  root.Engine = { init: init };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
