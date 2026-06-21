#!/usr/bin/env node
/* validate.js — checks every scenario file and renders each scene.
 * No dependencies. Run: node scripts/validate.js
 * Exit code 1 on any error (used by CI).
 */
"use strict";
var fs = require("fs");
var path = require("path");
var SceneKit = require("../src/scenekit.js");

var DIR = path.join(__dirname, "..", "content", "ky");
var TEMPLATES = SceneKit.TEMPLATES;
var INTERACTIONS = ["tap-target", "tap-zone", "choose-one"];

var errors = [], warnings = [], count = 0, seenIds = {};

function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

function collectIdsAndKeys(sc) {
  var ids = [], keys = [];
  var scene = sc.scene || {};
  (scene.cars || []).forEach(function (c) { if (c.id) ids.push(c.id); if (c.key) keys.push(c.key); });
  (scene.items || []).forEach(function (c) { if (c.id) ids.push(c.id); if (c.key) keys.push(c.key); });
  (scene.zones || []).forEach(function (c) { if (c.id) ids.push(c.id); if (c.key) keys.push(c.key); });
  if (scene.ped && scene.ped.id) ids.push(scene.ped.id);
  if (scene.ped && scene.ped.key) keys.push(scene.ped.key);
  (sc.choices || []).forEach(function (c) { if (c.id) ids.push(c.id); if (c.key) keys.push(c.key); });
  return { ids: ids, keys: keys };
}

function hasCorrect(sc) {
  var scene = sc.scene || {};
  var pools = [scene.cars, scene.items, scene.zones, sc.choices];
  var found = false;
  pools.forEach(function (p) { (p || []).forEach(function (x) { if (x && x.correct) found = true; }); });
  if (scene.ped && scene.ped.correct) found = true;
  return found;
}

function checkScenario(sc, file) {
  var where = file + " :: " + (sc.id || "(no id)");
  ["id", "concept", "interaction", "prompt", "scene", "feedback"].forEach(function (f) {
    if (!sc[f]) err(where + " — missing '" + f + "'");
  });
  if (sc.id) {
    if (seenIds[sc.id]) err("duplicate id '" + sc.id + "' (" + file + " and " + seenIds[sc.id] + ")");
    else seenIds[sc.id] = file;
  }
  if (sc.interaction && INTERACTIONS.indexOf(sc.interaction) < 0) err(where + " — unknown interaction '" + sc.interaction + "'");
  if (sc.scene && TEMPLATES.indexOf(sc.scene.template) < 0) err(where + " — unknown template '" + (sc.scene && sc.scene.template) + "'");
  if (!hasCorrect(sc)) err(where + " — no element marked correct:true");
  if (!sc.feedback || !sc.feedback.correct) err(where + " — feedback.correct is required");

  var ck = collectIdsAndKeys(sc);
  if (sc.hint && ck.ids.indexOf(sc.hint) < 0) err(where + " — hint '" + sc.hint + "' is not an element id");

  // feedback keys (besides correct/default) should match a key or id
  Object.keys(sc.feedback || {}).forEach(function (k) {
    if (k === "correct" || k === "default") return;
    if (ck.keys.indexOf(k) < 0 && ck.ids.indexOf(k) < 0)
      warn(where + " — feedback key '" + k + "' has no matching element key/id");
  });

  // render the scene to catch throws
  try {
    var svg = SceneKit.render(sc.scene);
    if (typeof svg !== "string" || svg.indexOf("<svg") !== 0) err(where + " — scene did not render to SVG");
  } catch (e) {
    err(where + " — scene render threw: " + e.message);
  }
  count++;
}

fs.readdirSync(DIR).filter(function (f) { return f.endsWith(".json"); }).forEach(function (f) {
  var full = path.join(DIR, f), json;
  try { json = JSON.parse(fs.readFileSync(full, "utf8")); }
  catch (e) { err(f + " — invalid JSON: " + e.message); return; }
  if (!json.module) err(f + " — missing 'module'");
  if (!Array.isArray(json.scenarios)) { err(f + " — missing 'scenarios' array"); return; }
  json.scenarios.forEach(function (sc) { checkScenario(sc, f); });
});

console.log("Checked " + count + " scenarios across content/ky/");
if (warnings.length) { console.log("\nWarnings (" + warnings.length + "):"); warnings.forEach(function (w) { console.log("  ! " + w); }); }
if (errors.length) {
  console.log("\nErrors (" + errors.length + "):");
  errors.forEach(function (e) { console.log("  ✗ " + e); });
  process.exit(1);
}
console.log("\nAll good ✓");
