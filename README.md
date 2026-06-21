# Permit Pal 🚗

### See it. Hear it. Tap it.

**A free, visual-first way to practice for the Kentucky permit test — made for every kind of learner.**

Instead of walls of text, you *look* at a road scene, *hear* the question read aloud, and *tap* the answer — who goes first, where to stop, what a sign or line means. Every answer gives gentle, spoken feedback, and you can try as many times as you need.

Permit Pal was built for learners who do better with pictures and audio than with text-heavy quizzes. It's **especially helpful for students on an IEP, with learning differences, low literacy, or test anxiety, for English language learners, and for anyone who finds text-heavy practice tests hard** — and it turns out that helps just about everyone.

> **Live demo:** https://permitpal.ericpullen.com  
> **Repo:** https://github.com/ericpullen/permitpal

_Suggested GitHub topics (for discoverability): `drivers-ed` `permit-test` `kentucky` `accessibility` `special-education` `iep` `visual-learning` `assistive-technology` `a11y`._

---

## Why it's different

- **See it, don't just read it.** Top-down road scenes for right-of-way, signs, signals, and lane markings.
- **Audio on everything.** Questions and feedback are spoken aloud.
- **No pressure.** No timers. Unlimited retries. A hint appears after a couple of misses.
- **Built for accessibility.** Big tap targets, color is never the only cue, an easy-to-read font option, a high-contrast mode, and reduced-motion support.
- **Works offline.** Add it to your home screen and practice anywhere.
- **Private.** Progress is saved on your device. No accounts, no tracking, no ads.

## What it covers

The Kentucky knowledge test is 40 questions (about 10 on signs/signals and 30 on road rules); you need 32 right to pass. Permit Pal focuses on the concepts that benefit most from seeing them:

Right-of-way · Road signs · Traffic lights · Road lines · Lanes & turns · Sharing the road (bikes, trucks, work zones) · Weather & conditions · Parking · Key safe-driving rules.

It's a study aid, not a replacement for the official **[Kentucky Driver Manual](https://drive.ky.gov/Drivers/Documents/Kentucky-Driver-Manual.pdf)**. Always defer to the manual.

---

## Run it locally

It's a plain static site — no build step.

```bash
# any static server works; for example:
python3 -m http.server 8000
# then open http://localhost:8000
```

(Open via a server, not by double-clicking `index.html` — the lessons load with `fetch`, which needs `http://`.)

## Host it for free

- **GitHub Pages:** push this repo, then enable Pages on the `main` branch (root). Done.
- **Amazon S3:** upload the folder to a bucket with static website hosting on.
- Any static host (Netlify, Cloudflare Pages, etc.) works the same way.

---

## Project layout

```
index.html            app shell (start / home / play / done / settings)
app.css               styles
src/
  scenekit.js         reusable SVG primitives + scene templates
  engine.js           loads lessons, handles taps, feedback, modes
  speech.js           spoken prompts (browser voice + optional recordings)
  progress.js         saves what you've learned (on-device)
  settings.js         sound / motion / font / contrast
content/ky/*.json     the lessons (this is where most contributions go)
schema/               scenario shape reference
scripts/validate.js   checks every lesson (run by CI)
```

Adding or editing lessons rarely means touching code — see **[AUTHORING.md](AUTHORING.md)**.

## Contributing

Contributions welcome, especially new scenarios and accuracy fixes. See **[CONTRIBUTING.md](CONTRIBUTING.md)**. Every pull request is automatically checked by `scripts/validate.js`.

## Adding another state

Lessons live under `content/<state>/`. To support another state, add a new folder of JSON lessons in the same format and point the engine's module list at it. The engine and scene kit don't change.

---

## Accuracy & disclaimer

Permit Pal is an independent, community study aid. It is **not affiliated with or endorsed by** the Kentucky State Police, the Kentucky Transportation Cabinet, or the Commonwealth of Kentucky. State-specific numbers and rules can change — verify anything important against the current Kentucky Driver Manual before relying on it. Lessons cite the manual section they teach (`manualRef`).

## License

- **Code:** [MIT](LICENSE).
- **Lesson content & illustrations:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — reuse and remix with attribution.
- **Road sign art** (`assets/signs/`): official U.S. MUTCD signs, **public domain** (U.S. federal government work) — see [`assets/signs/README.md`](assets/signs/README.md).

Made with care to help one learner, and shared so it can help anyone.
