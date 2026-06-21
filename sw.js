/* sw.js — offline cache for Permit Pal.
 * Bump CACHE when you change files so users get the update.
 */
var CACHE = "permitpal-v8";
var ASSETS = [
  "./",
  "index.html",
  "app.css",
  "manifest.webmanifest",
  "assets/icon.svg",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/signs/stop.svg",
  "assets/signs/yield.svg",
  "assets/signs/do-not-enter.svg",
  "assets/signs/no-u-turn.svg",
  "assets/signs/no-left-turn.svg",
  "assets/signs/one-way-left.svg",
  "assets/signs/one-way-right.svg",
  "assets/signs/pedestrian.svg",
  "assets/signs/curve.svg",
  "assets/signs/merge.svg",
  "assets/signs/school.svg",
  "assets/signs/railroad.svg",
  "assets/signs/work-zone.svg",
  "assets/signs/ped-walk.svg",
  "assets/signs/ped-hand.svg",
  "src/scenekit.js",
  "src/speech.js",
  "src/progress.js",
  "src/settings.js",
  "src/engine.js",
  "content/ky/signs.json",
  "content/ky/signals.json",
  "content/ky/markings.json",
  "content/ky/right-of-way.json",
  "content/ky/lane-use.json",
  "content/ky/sharing-road.json",
  "content/ky/conditions.json",
  "content/ky/parking.json",
  "content/ky/facts.json"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) {
          try { c.put(e.request, res.clone()); } catch (err) {}
          return res;
        });
      }).catch(function () { return hit; });
    })
  );
});
