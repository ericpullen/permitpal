/* test/e2e.js — drive the real app in a simulated browser. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "https://example.org/permitpal/" });
const { window } = dom;
global.window = window; global.document = window.document;
window.SpeechSynthesisUtterance = function () {}; window.speechSynthesis = { speak() {}, cancel() {} };
window.Audio = function () { return { play: () => Promise.reject(), onerror: null }; };
// localStorage is provided by jsdom

// stub fetch -> read local files
window.fetch = function (url) {
  try {
    const p = path.join(ROOT, url);
    const txt = fs.readFileSync(p, "utf8");
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(txt)) });
  } catch (e) { return Promise.resolve({ ok: false, status: 404 }); }
};

// load scripts in order into the window
["src/scenekit.js", "src/speech.js", "src/progress.js", "src/settings.js", "src/engine.js"].forEach(f => {
  const code = fs.readFileSync(path.join(ROOT, f), "utf8");
  window.eval(code);
});

const $ = id => window.document.getElementById(id);
const assert = (c, m) => { if (!c) { console.error("FAIL:", m); process.exitCode = 1; } else console.log("ok:", m); };

// engine.init runs on DOMContentLoaded; trigger it
window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

setTimeout(() => {
  // content loaded?
  const cards = window.document.querySelectorAll(".module-card");
  assert(cards.length >= 8, "home shows module cards (" + cards.length + ")");

  // open the signs module
  const signsCard = [...cards].find(c => c.getAttribute("data-module") === "signs");
  assert(!!signsCard, "found signs module card");
  signsCard.click();

  // play screen visible, scene rendered
  assert(!$("screen-play").classList.contains("hidden"), "play screen visible");
  const svg = $("scene").querySelector("svg");
  assert(!!svg, "scene rendered an SVG");
  const targets = $("scene").querySelectorAll(".tap");
  assert(targets.length >= 2, "scene has tappable targets (" + targets.length + ")");

  // tap a WRONG one first
  const wrong = [...targets].find(t => t.getAttribute("data-correct") !== "1");
  wrong && wrong.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert($("feedback").classList.contains("bad"), "wrong tap shows 'bad' feedback");
  assert($("btn-next").classList.contains("hidden"), "Next hidden after wrong tap");

  // tap the CORRECT one
  const right = [...targets].find(t => t.getAttribute("data-correct") === "1");
  right.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert($("feedback").classList.contains("good"), "correct tap shows 'good' feedback");
  assert(!$("btn-next").classList.contains("hidden"), "Next shown after correct tap");

  // advance
  const dotsBefore = $("dots").querySelector(".current");
  $("btn-next").click();
  assert(!!$("scene").querySelector("svg"), "second scenario rendered after Next");

  // test a choose-one (choices buttons) scenario by jumping to signals module
  $("btn-home").click();
  const signalsCard = [...window.document.querySelectorAll(".module-card")].find(c => c.getAttribute("data-module") === "signals");
  signalsCard.click();
  // first signals scenario uses choices
  const choiceBtns = $("choices").querySelectorAll(".tap-btn");
  assert(choiceBtns.length >= 2, "choose-one renders choice buttons (" + choiceBtns.length + ")");
  const rightChoice = [...choiceBtns].find(b => b.getAttribute("data-correct") === "1");
  rightChoice.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert($("feedback").classList.contains("good"), "correct choice shows good feedback");

  // progress saved?
  const saved = JSON.parse(window.localStorage.getItem("permitpal.progress.v1") || "{}");
  assert(Object.keys(saved).length >= 1, "progress saved to localStorage");

  console.log("\nDONE — exit code", process.exitCode || 0);
}, 300);
