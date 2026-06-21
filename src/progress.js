/* progress.js — remembers which concepts are mastered or need review.
 * Stored locally on the device only. No accounts, no tracking.
 */
(function (root) {
  "use strict";
  var KEY = "permitpal.progress.v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
  }

  // status: "got" (correct first try) or "review" (needed help / missed)
  function set(id, status) {
    if (!id) return;
    var d = load();
    // never downgrade a "got" to "review" within the same record unless missed again
    d[id] = status;
    save(d);
  }
  function get(id) { return load()[id]; }

  function reviewIds() {
    var d = load(), out = [];
    for (var k in d) if (d[k] === "review") out.push(k);
    return out;
  }

  function stats(allIds) {
    var d = load(), got = 0, review = 0, seen = 0;
    (allIds || []).forEach(function (id) {
      if (d[id] === "got") { got++; seen++; }
      else if (d[id] === "review") { review++; seen++; }
    });
    return { got: got, review: review, seen: seen, total: (allIds || []).length };
  }

  function reset() { save({}); }

  root.Progress = { set: set, get: get, reviewIds: reviewIds, stats: stats, reset: reset };
})(typeof window !== "undefined" ? window : this);
