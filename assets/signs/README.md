# Road sign art

These SVGs are the **official U.S. road signs** from the **MUTCD** (Manual on Uniform
Traffic Control Devices, published by the Federal Highway Administration). They are works
of the U.S. federal government and are therefore in the **public domain** — free to use,
copy, and modify, with no attribution required. Kentucky uses the federal MUTCD signs, so
these are the accurate, test-day-correct images.

Source: [Wikimedia Commons, "PD MUTCD" category](https://commons.wikimedia.org/wiki/Category:PD_MUTCD)
(mirrors of the FHWA Standard Highway Signs files at <https://mutcd.fhwa.dot.gov>).

| File | Sign | MUTCD code |
|------|------|-----------|
| `stop.svg` | Stop | R1-1 |
| `yield.svg` | Yield | R1-2 |
| `do-not-enter.svg` | Do Not Enter | R5-1 |
| `one-way-left.svg` / `one-way-right.svg` | One Way (left / right) | R6-1L / R6-1R |
| `no-u-turn.svg` | No U-Turn | R3-4 |
| `no-left-turn.svg` | No Left Turn | R3-2 |
| `pedestrian.svg` | Pedestrian crossing | W11-2 |
| `curve.svg` | Curve (right) | W1-2R |
| `merge.svg` | Merge (right) | W4-1R |
| `school.svg` | School / school crossing | S1-1 |
| `railroad.svg` | Railroad advance warning | W10-1 |
| `work-zone.svg` | Workers (work zone) | W21-1a |

These are loaded by `src/scenekit.js` (`officialSign()`) for the sign-recognition
questions. The small stop/yield signs drawn *inside* road scenes (4-way stops, merges)
are still simple vector shapes — a full sign at that size would be illegible.

To add or change a sign: drop the SVG here, reference it from `scenekit.js`, and add the
path to `ASSETS` in `sw.js` (and bump `CACHE`) so it works offline.
