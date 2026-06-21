# Authoring lessons

A lesson ("scenario") is a small block of JSON. You usually don't write any SVG — you describe a scene using ready-made pieces, and the scene kit draws it.

Each lesson file in `content/ky/` looks like:

```json
{
  "module": "signs",
  "title": "Road Signs",
  "description": "Recognize signs by shape, color, and meaning.",
  "scenarios": [ /* ... one object per question ... */ ]
}
```

## A scenario

```json
{
  "id": "sign-stop",                 // unique across ALL files
  "concept": "Stop sign",            // short topic name
  "manualRef": "Traffic Signs",      // section of the KY manual it teaches
  "interaction": "choose-one",       // tap-target | tap-zone | choose-one
  "prompt": "Tap the sign that means STOP.",
  "audio": null,                     // optional; defaults to the prompt text
  "scene": { "template": "row", "items": [ /* ... */ ] },
  "feedback": {
    "correct": "That's the stop sign — eight sides and red.",
    "yield":  "That's a yield sign. Try again.",
    "default": "The stop sign is red with eight sides. Try again."
  },
  "hint": "a"                        // optional: id of the element to pulse after 2 misses
}
```

**How answers work:** mark the right element with `"correct": true`. Give wrong elements a `key` (or rely on their `id`) and add a matching entry in `feedback`. On a wrong tap the engine shows `feedback[key]` (or `feedback[id]`), falling back to `feedback.default`. On a right tap it shows `feedback.correct`.

## Templates

Set `scene.template` to one of these and fill in its fields.

### `intersection`
A 4-way (`"kind":"cross"`) or T-intersection (`"kind":"tee"`). `"control"` can be `"stop-all"`, `"yield"`, or `"none"`.
```json
{ "template":"intersection", "kind":"cross", "control":"stop-all",
  "cars":[
    {"id":"you","from":"south","label":"YOU","key":"you"},
    {"id":"other","from":"east","correct":true}
  ],
  "ped":{"id":"ped","at":"north","correct":true}   // optional
}
```
`from`: `south` | `north` | `east` | `west`. Cars face toward the center automatically.

### `road`
A vertical two-lane road. Options: `crosswalk` (bool), `railroad` (bool), `bus` (`{"cy":150}`), `turnArrow` (`"left"`).
```json
{ "template":"road", "crosswalk":true,
  "ped":{"id":"ped","onCrosswalk":true,"correct":true},
  "cars":[ {"id":"you","lane":"right","at":"bottom","dir":"up","label":"YOU","decor":true} ] }
```
Car fields: `lane` (`left`/`right`), `at` (`top`/`mid`/`bottom`), `dir` (`up`/`down`), `color`, `label`, `decor` (true = not tappable).
For **tap-zone**, add `zones` (tappable rectangles) and an optional `marker` reveal:
```json
"zones":[ {"id":"before","rect":[200,148,70,182],"correct":true}, {"id":"onwalk","rect":[200,80,70,58],"key":"onwalk"} ],
"marker":[235,150], "reward":"markZone"
```

### `merge`
A main road with a yielding side road. Cars use `"role":"main"` (the through car) and `"role":"you"`.

### `roundabout`
Cars use `"role":"circulating"` and `"role":"you"`.

### `row`
Two to four items side by side — perfect for "tap the right one" sign/signal/line questions.
```json
{ "template":"row", "items":[
  {"id":"a","type":"sign","name":"stop","correct":true,"caption":"A"},
  {"id":"b","type":"sign","name":"yield","key":"yield","caption":"B"}
] }
```
Item `type`:
- `sign` — `name` is one of: `stop, yield, doNotEnter, oneWay (arg "left"/"right"), speedLimit (arg number), noUTurn, noLeftTurn, warning, pedestrianXing, curve, merge, school, railroad, workZone`.
- `signal` — `state`: `red, yellow, green, greenArrowLeft, redArrowLeft, flashRed, flashYellow`.
- `pedSignal` — `state`: `walk, dontwalk, count`.
- `miniRoad` — `line: {color:"yellow"|"white", pattern:"solid"|"dashed"|"double"}` and optional `cars:[{lane,dir,color}]`.
- `card` — `text` (a short label or number).

Mark any item `"decor": true` to show it without making it tappable (use this when the answer is in `choices`).

**Auto-pooled sign questions.** For "tap the sign" questions, set `"pool": "signs"` on the scene and list **only the correct sign** in `items`. The engine then shows that sign plus a fresh random pick of other signs each time (so the answer set and its position both vary). Control it with:
- `"show"` — how many signs to display (default 3).
- `"exclude"` — sign names to keep out, so a category question never gets two valid answers (e.g. the "tap the warning sign" question excludes the other yellow diamonds `merge`, `pedestrianXing`, `workZone`).

```json
{ "template":"row", "pool":"signs", "show":3, "exclude":["merge","pedestrianXing","workZone"],
  "items":[ {"id":"b","type":"sign","name":"curve","correct":true} ] }
```
Wrong taps fall back to `feedback.default`, so write a `default` that describes the *correct* sign. The correct item's `id` is still what `hint` points to.

## Answer buttons (`choices`)

For "what should you do?" questions, add big tappable buttons under the scene:
```json
"choices":[
  {"id":"stop","label":"Stop and wait","correct":true},
  {"id":"pass","label":"Pass slowly"}
]
```
Feedback is keyed by each choice's `id`.

## Before you submit

Run the checker:
```bash
node scripts/validate.js
```
It confirms every scenario has a correct answer, a `feedback.correct`, a known template, a valid `hint`, and that the scene actually renders. Keep language simple and kind (aim for a 4th–6th grade reading level), and add a `manualRef` so reviewers can verify the rule.
