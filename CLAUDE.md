# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Permit Pal is a visual-first, accessibility-focused web app for practicing the Kentucky permit (knowledge) test. Learners see a top-down road scene, hear the question read aloud, and tap the answer. It is built for users who struggle with text-heavy quizzes (IEP/learning differences, low literacy, test anxiety, ELL).

It is a **plain static site with no build step** — vanilla ES5-style JavaScript, served directly. Lessons are JSON; rendering is hand-rolled SVG.

## Commands

```bash
npm run validate   # node scripts/validate.js — checks every lesson + renders each scene (CI runs this)
npm test           # validate.js + test/e2e.js (jsdom-driven smoke test of the real app)
npm start          # python3 -m http.server 8000  → open http://localhost:8000
```

- **Always serve over HTTP**, never open `index.html` via `file://` — lessons load with `fetch`, which needs `http://`.
- `npm test` requires the one dev dependency (`jsdom`); run `npm install` first.
- There is no linter or formatter and no compile step. CI (`.github/workflows/validate.yml`) only runs `node scripts/validate.js`.
- No single-test runner — `validate.js` checks all content; `test/e2e.js` is one self-contained script.
- **Jump straight to one question** for testing: open `http://localhost:8000/#q=<scenario-id>` (or run `Engine.jump("<id>")` in the console). The hash starts a single-scenario deck — handy after tweaking a scene.

## Architecture

Scripts load in a fixed order in `index.html` and attach themselves to the `window` global (no modules/bundler). Each `src/*.js` file is an IIFE that exposes one global: `SceneKit`, `Speech`, `Progress`, `Settings`, `Engine`. `Engine.init()` runs on `DOMContentLoaded` and drives everything.

The whole app is **one HTML file with four screens** (`#screen-start`, `#screen-home`, `#screen-play`, `#screen-done`) toggled via a `hidden` class — there is no router.

Data flow: `engine.js` fetches the JSON lesson files → flattens them into `allScenarios` → renders the current scenario's `scene` through `SceneKit.render()` → wires tap/choice handlers → on a tap, `evaluate()` checks `data-correct`, shows `feedback`, speaks it, and records mastery in `Progress`.

### The modules

- **`src/engine.js`** — orchestrator. Owns the `MODULES` list (file order + `signs`/`rules` grouping used by the mock test), play state (`deck`, `pos`, `misses`, `score`), screen switching, and the practice modes: per-module, Mixed, Review (weak spots), and the scored Practice Test (10 sign questions + 20 rules questions, pass = 80%).
- **`src/scenekit.js`** — the SVG engine. Low-level primitives (`car`, `pedestrian`, sign/signal drawers) compose into named `TEMPLATES` (`intersection`, `road`, `merge`, `roundabout`, `row`). `SceneKit.render(scene)` returns an SVG **string**. This file is the single source of truth for which templates and sign names exist, and is shared verbatim by Node (`validate.js` requires it via `module.exports`) and the browser. Sign-recognition art is the **official public-domain MUTCD signs** in `assets/signs/*.svg`, referenced via `officialSign()` (an `<image>` element); the small stop/yield signs drawn *inside* road scenes stay simple vector shapes. See `assets/signs/README.md`.
- **`src/progress.js`** — per-scenario mastery in `localStorage` (`permitpal.progress.v1`). Status is `"got"` (correct first try) or `"review"` (missed/needed help). Drives the "Review weak spots" mode. On-device only; no accounts or network.
- **`src/speech.js`** — speaks prompts/feedback. Prefers a recorded clip at `audio/ky/<scenario-id>.mp3`, falls back to the browser's `speechSynthesis`. `warm()` must be called from a user gesture (iOS requirement) — done on the Start button.
- **`src/settings.js`** — sound / motion / font (dyslexia-friendly) / contrast toggles, persisted to `localStorage`, applied as classes/attributes on the document.
- **`sw.js`** — service worker, cache-first offline support. **Lists every asset explicitly** in `ASSETS` and keys on `CACHE = "permitpal-vN"`.

### Tappability contract (engine ↔ scenekit)

A scene/choice element is tappable when its rendered SVG/button carries class `tap` or `tap-btn`. The engine reads three attributes off the tapped element: `data-correct="1"` (the right answer), `data-key`, and `data-id`. Wrong-answer feedback is looked up as `feedback[key] || feedback[id] || feedback.default`. Keep this in mind when adding new SceneKit primitives — they must emit these classes/attributes to be interactive.

## Content (the common case)

Most contributions are **JSON lesson edits, not code**. Lessons live in `content/ky/<module>.json`; each has a `module`, `title`, and a `scenarios` array. Adding a new state = a new `content/<state>/` folder in the same format + pointing `MODULES`/`CONTENT_BASE` in `engine.js` at it; the engine and scene kit don't change.

**`AUTHORING.md` is the authoritative reference** for scenario shape, the template fields, available sign/signal names, and how answers + feedback are keyed. Read it before editing or adding scenarios. `schema/scenario.schema.json` is the shape reference.

After any content change, run `node scripts/validate.js` — it enforces unique `id`s, a `correct:true` element, a `feedback.correct`, known template/interaction, valid `hint`, and that the scene actually renders without throwing.

### When you touch content or src files, also:

- **Bump `CACHE` in `sw.js`** (e.g. `permitpal-v1` → `v2`) so returning users get the update — the worker is cache-first and won't otherwise refetch.
- **Add new files to `sw.js`'s `ASSETS`** list (new lesson JSON, new `src/` file) or they won't be available offline.

## Conventions

- Vanilla ES5-style JS (`var`, IIFEs, no arrow functions in `src/`), no dependencies in shipped code. Keep it that way — it runs unbundled in the browser.
- Content quality bar (from `CONTRIBUTING.md`): plain/kind language at a 4th–6th grade reading level; color is never the only cue; large tap targets; never depend on motion; one decision per scenario; cite the manual via `manualRef`; don't include exact fine amounts (they change).
