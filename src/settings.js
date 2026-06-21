/* settings.js — accessibility & comfort options, saved on the device. */
(function (root) {
  "use strict";
  var KEY = "permitpal.settings.v1";
  var defaults = { sound: true, motion: true, font: "default", contrast: false };
  var state = load();

  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY)) || {}); }
    catch (e) { return Object.assign({}, defaults); }
  }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function apply() {
    if (typeof document === "undefined") return;
    var b = document.body;
    if (!b) return;
    b.classList.toggle("font-dyslexic", state.font === "dyslexic");
    b.classList.toggle("high-contrast", !!state.contrast);
    b.classList.toggle("reduce-motion", !state.motion);
    if (root.Speech && root.Speech.setEnabled) root.Speech.setEnabled(state.sound);
  }

  function set(k, v) { state[k] = v; persist(); apply(); }
  function get(k) { return state[k]; }
  function all() { return Object.assign({}, state); }

  root.Settings = { set: set, get: get, all: all, apply: apply };
})(typeof window !== "undefined" ? window : this);
