/* ============================================================
 * scenekit.js — reusable SVG primitives + scene templates
 * No dependencies. Returns SVG strings. Browser global: SceneKit.
 * Also exported for Node (used by scripts/validate + render tests).
 * ============================================================ */
(function (root) {
  "use strict";

  /* ---- palette ---- */
  var C = {
    sky: "#E6F1EE", road: "#454C53", grass: "#CDE6CF", line: "#F4C95D",
    white: "#FFFFFF", you: "#2F6FB0", other: "#E0883E", third: "#5BA89A",
    correct: "#2E9E6B", ink: "#213A4A", inkSoft: "#5B7180", redSign: "#D23B3B",
    glass: "#cfe7ff"
  };

  /* ---- low-level helpers ---- */
  function esc(s) { return String(s == null ? "" : s); }

  // A car centered at (cx,cy). dir: up|down|left|right. Optional label.
  function car(cx, cy, opts) {
    opts = opts || {};
    var color = opts.color || C.you;
    var dir = opts.dir || "up";
    var label = opts.label || "";
    var rot = { up: 0, down: 180, left: 90, right: -90 }[dir] || 0;
    var x = cx - 22, y = cy - 35;
    var lbl = label
      ? '<text x="22" y="40" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="#fff" transform="rotate(' + (-rot) + ' 22 35)">' + esc(label) + '</text>'
      : "";
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ' 22 35)">' +
      '<rect x="3" y="2" width="38" height="66" rx="12" fill="' + color + '"/>' +
      // headlights at the front (white) + tail lights at the rear (red) — show travel direction
      '<rect x="7" y="2" width="9" height="5" rx="2.5" fill="#fff6c8"/>' +
      '<rect x="28" y="2" width="9" height="5" rx="2.5" fill="#fff6c8"/>' +
      '<rect x="7" y="63" width="9" height="5" rx="2.5" fill="#e8453b"/>' +
      '<rect x="28" y="63" width="9" height="5" rx="2.5" fill="#e8453b"/>' +
      '<rect x="8" y="9" width="28" height="16" rx="6" fill="' + C.glass + '" opacity=".85"/>' +
      '<rect x="8" y="44" width="28" height="16" rx="6" fill="' + C.glass + '" opacity=".7"/>' +
      '<rect x="6" y="30" width="32" height="9" rx="4" fill="#ffffff" opacity=".25"/>' +
      lbl + '</g>';
  }

  function pedestrian(cx, cy, color) {
    color = color || "#34495E";
    return '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<circle cx="0" cy="-12" r="6" fill="' + color + '"/>' +
      '<rect x="-5" y="-6" width="10" height="16" rx="4" fill="' + color + '"/>' +
      '<rect x="-5" y="9" width="4" height="11" rx="2" fill="' + color + '"/>' +
      '<rect x="1" y="9" width="4" height="11" rx="2" fill="' + color + '"/>' +
      '</g>';
  }

  // Top-down cyclist: two wheels, frame, handlebars, and a helmeted rider.
  function bicycle(cx, cy, opts) {
    opts = opts || {};
    var jersey = opts.color || "#2F6FB0";
    var dir = opts.dir || "up";
    var rot = { up: 0, down: 180, left: 90, right: -90 }[dir] || 0;
    return '<g transform="translate(' + cx + ',' + cy + ') rotate(' + rot + ')">' +
      '<rect x="-3" y="-32" width="6" height="22" rx="3" fill="#2b2b2b"/>' +
      '<rect x="-3" y="10" width="6" height="22" rx="3" fill="#2b2b2b"/>' +
      '<line x1="0" y1="-20" x2="0" y2="20" stroke="#9aa0a6" stroke-width="3"/>' +
      '<line x1="-13" y1="-16" x2="13" y2="-16" stroke="#6b7177" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="-9" y1="-3" x2="-13" y2="-15" stroke="' + jersey + '" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="9" y1="-3" x2="13" y2="-15" stroke="' + jersey + '" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="-10" y="-6" width="20" height="20" rx="9" fill="' + jersey + '"/>' +
      '<circle cx="0" cy="-1" r="8" fill="#f2d2b6"/>' +
      '<path d="M-8 -1 a8 8 0 0 1 16 0 z" fill="#E0883E"/>' +
      '</g>';
  }

  // Top-down 18-wheeler: a short tractor (cab) coupled to a long trailer, with axles.
  function truck(cx, cy, opts) {
    opts = opts || {};
    var cab = opts.color || "#4b5560";
    var dir = opts.dir || "up";
    var rot = { up: 0, down: 180, left: 90, right: -90 }[dir] || 0;
    var wheel = function (y, h) { return '<rect x="-23" y="' + y + '" width="7" height="' + h + '" rx="2" fill="#222"/><rect x="16" y="' + y + '" width="7" height="' + h + '" rx="2" fill="#222"/>'; };
    return '<g transform="translate(' + cx + ',' + cy + ') rotate(' + rot + ')">' +
      wheel(-62, 14) + wheel(44, 12) + wheel(58, 12) +                                  // steer axle + two trailer axles
      '<rect x="-19" y="-34" width="38" height="106" rx="5" fill="#e4e7ea" stroke="#c2c8cd" stroke-width="2"/>' +  // trailer
      '<rect x="-19" y="-37" width="38" height="6" rx="2" fill="#b9c0c6"/>' +            // coupling line
      '<rect x="-19" y="-74" width="38" height="40" rx="9" fill="' + cab + '"/>' +        // cab
      '<rect x="-13" y="-71" width="26" height="11" rx="4" fill="' + C.glass + '" opacity=".9"/>' +  // windshield
      '<rect x="-16" y="-75" width="7" height="4" rx="2" fill="#fff6c8"/><rect x="9" y="-75" width="7" height="4" rx="2" fill="#fff6c8"/>' +  // headlights
      '<rect x="-17" y="69" width="7" height="4" rx="2" fill="#e8453b"/><rect x="10" y="69" width="7" height="4" rx="2" fill="#e8453b"/>' +    // tail lights
      '</g>';
  }

  // Side-view fire hydrant (sits on the grass shoulder).
  function hydrant(cx, cy) {
    return '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<rect x="-13" y="16" width="26" height="6" rx="2" fill="#9b1c1c"/>' +
      '<rect x="-10" y="-8" width="20" height="26" rx="6" fill="#e23b3b"/>' +
      '<path d="M-10 -6 a10 10 0 0 1 20 0 z" fill="#e23b3b"/>' +
      '<rect x="-4" y="-20" width="8" height="10" rx="3" fill="#c62828"/>' +
      '<rect x="-16" y="0" width="7" height="9" rx="2.5" fill="#c62828"/>' +
      '<rect x="9" y="0" width="7" height="9" rx="2.5" fill="#c62828"/>' +
      '</g>';
  }

  // Direction-of-travel arrow painted in a lane (dir: "up" | "down").
  function laneArrow(x, dir) {
    return dir === "down"
      ? '<path d="M' + x + ' 56 V128 M' + (x - 12) + ' 106 L' + x + ' 128 L' + (x + 12) + ' 106" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>'
      : '<path d="M' + x + ' 128 V56 M' + (x - 12) + ' 78 L' + x + ' 56 L' + (x + 12) + ' 78" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>';
  }

  // Center two-way left-turn lane (TWLTL): a shared middle lane bordered on each
  // side by a solid yellow outer line and a dashed yellow inner line, with a
  // separate yellow left-turn arrow for each travel direction (one points up and
  // hooks left; the other points down and hooks left for oncoming traffic).
  // Used by the road template when scene.centerTurnLane is set.
  function centerTurnArrow(cy, dir) {
    var p = dir === "down"
      ? 'M200 ' + (cy - 24) + ' V' + (cy + 4) + ' q0 18 20 18 l6 0 M224 ' + (cy + 22) + ' l-9 -7 M224 ' + (cy + 22) + ' l-9 7'
      : 'M200 ' + (cy + 24) + ' V' + (cy - 4) + ' q0 -18 -20 -18 l-6 0 M176 ' + (cy - 22) + ' l9 -7 M176 ' + (cy - 22) + ' l9 7';
    return '<path d="' + p + '" fill="none" stroke="' + C.line + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function centerTurnLaneMarks() {
    var Y = C.line;
    return '<line x1="166" y1="0" x2="166" y2="400" stroke="' + Y + '" stroke-width="4"/>' +
      '<line x1="234" y1="0" x2="234" y2="400" stroke="' + Y + '" stroke-width="4"/>' +
      '<line x1="174" y1="0" x2="174" y2="400" stroke="' + Y + '" stroke-width="3" stroke-dasharray="20 16"/>' +
      '<line x1="226" y1="0" x2="226" y2="400" stroke="' + Y + '" stroke-width="3" stroke-dasharray="20 16"/>' +
      centerTurnArrow(108, "up") + centerTurnArrow(292, "down");
  }

  // Official public-domain MUTCD sign art, referenced from assets/signs/.
  // Rendered into a 2s x 2s box centered at (0,0); each sign's aspect ratio is preserved.
  // Used for the sign-recognition questions (the `row` template).
  function officialSign(file, s) {
    return '<image href="assets/signs/' + file + '" x="' + (-s) + '" y="' + (-s) + '" width="' + (2 * s) + '" height="' + (2 * s) + '" preserveAspectRatio="xMidYMid meet"/>';
  }

  // Lightweight drawn stop/yield used only as small in-scene decoration (e.g. the
  // corners of a 4-way stop, or a yield at a merge) where a full sign would be illegible.
  function stopSign(cx, cy, r) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = Math.PI / 8 + i * Math.PI / 4;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + C.redSign + '" stroke="#fff" stroke-width="' + (r * 0.12) + '"/>' +
      '<text x="' + cx + '" y="' + (cy + r * 0.32) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (r * 0.7) + '" fill="#fff">STOP</text>';
  }

  function yieldSign(cx, cy, s) {
    s = s || 26;
    return '<g transform="translate(' + cx + ',' + cy + ')">' +
      '<polygon points="0,' + (-s) + ' ' + s + ',' + (s * 0.7) + ' ' + (-s) + ',' + (s * 0.7) + '" fill="#fff" stroke="' + C.redSign + '" stroke-width="' + (s * 0.27) + '" stroke-linejoin="round"/>' +
      '<text x="0" y="' + (s * 0.42) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (s * 0.42) + '" fill="' + C.redSign + '">YIELD</text>' +
      '</g>';
  }

  /* ---- sign library (centered at 0,0; caller translates) ---- */
  var SIGNS = {
    stop: function (s) { return officialSign("stop.svg", s); },
    yield: function (s) { return officialSign("yield.svg", s); },
    doNotEnter: function (s) { return officialSign("do-not-enter.svg", s); },
    // One Way is a wide 3:1 sign, so it gets a wider box than the square officialSign helper.
    oneWay: function (s, dir) {
      var file = dir === "left" ? "one-way-left.svg" : "one-way-right.svg";
      return '<image href="assets/signs/' + file + '" x="' + (-1.2 * s) + '" y="' + (-0.4 * s) + '" width="' + (2.4 * s) + '" height="' + (0.8 * s) + '" preserveAspectRatio="xMidYMid meet"/>';
    },
    speedLimit: function (s, n) {
      n = n == null ? 35 : n;
      return '<rect x="' + (-s * 0.7) + '" y="' + (-s) + '" width="' + (s * 1.4) + '" height="' + (s * 2) + '" rx="5" fill="#fff" stroke="#222" stroke-width="' + (s * 0.08) + '"/>' +
        '<text x="0" y="' + (-s * 0.42) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (s * 0.26) + '" fill="#222">SPEED</text>' +
        '<text x="0" y="' + (-s * 0.14) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (s * 0.26) + '" fill="#222">LIMIT</text>' +
        '<text x="0" y="' + (s * 0.62) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (s * 0.85) + '" fill="#222">' + n + '</text>';
    },
    noUTurn: function (s) { return officialSign("no-u-turn.svg", s); },
    noLeftTurn: function (s) { return officialSign("no-left-turn.svg", s); },
    pedestrianXing: function (s) { return officialSign("pedestrian.svg", s); },
    curve: function (s) { return officialSign("curve.svg", s); },
    merge: function (s) { return officialSign("merge.svg", s); },
    school: function (s) { return officialSign("school.svg", s); },
    railroad: function (s) { return officialSign("railroad.svg", s); },
    workZone: function (s) { return officialSign("work-zone.svg", s); }
  };

  function sign(name, s, arg) {
    s = s || 40;
    var fn = SIGNS[name];
    if (!fn) return '<rect x="' + (-s) + '" y="' + (-s) + '" width="' + (2 * s) + '" height="' + (2 * s) + '" fill="#ccc"/>';
    return fn(s, arg);
  }

  /* ---- traffic signal head (centered at 0,0) ---- */
  function signal(state, s) {
    s = s || 30;
    var lamp = function (cy, on, color) {
      return '<circle cx="0" cy="' + cy + '" r="' + (s * 0.55) + '" fill="' + (on ? color : "#2b2b2b") + '"' + (on ? ' filter="url(#glow)"' : "") + '/>';
    };
    var arrow = function (cy, dir, color) {
      var d = dir === "left"
        ? 'M' + (s * 0.35) + ' ' + cy + ' H' + (-s * 0.25) + ' M' + (-s * 0.02) + ' ' + (cy - s * 0.22) + ' L' + (-s * 0.32) + ' ' + cy + ' L' + (-s * 0.02) + ' ' + (cy + s * 0.22)
        : 'M' + (-s * 0.35) + ' ' + cy + ' H' + (s * 0.25) + ' M' + (s * 0.02) + ' ' + (cy - s * 0.22) + ' L' + (s * 0.32) + ' ' + cy + ' L' + (s * 0.02) + ' ' + (cy + s * 0.22);
      return '<circle cx="0" cy="' + cy + '" r="' + (s * 0.55) + '" fill="#2b2b2b"/><path d="' + d + '" stroke="' + color + '" stroke-width="' + (s * 0.13) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    };
    var top, mid, bot, blink = "";
    if (state === "red") { top = lamp(-s * 1.3, true, "#E74C3C"); mid = lamp(0, false); bot = lamp(s * 1.3, false); }
    else if (state === "yellow") { top = lamp(-s * 1.3, false); mid = lamp(0, true, "#F1C40F"); bot = lamp(s * 1.3, false); }
    else if (state === "green") { top = lamp(-s * 1.3, false); mid = lamp(0, false); bot = lamp(s * 1.3, true, "#2ECC71"); }
    else if (state === "greenArrowLeft") { top = lamp(-s * 1.3, false); mid = lamp(0, false); bot = arrow(s * 1.3, "left", "#2ECC71"); }
    else if (state === "redArrowLeft") { top = arrow(-s * 1.3, "left", "#E74C3C"); mid = lamp(0, false); bot = lamp(s * 1.3, false); }
    else if (state === "flashRed") { top = lamp(-s * 1.3, true, "#E74C3C"); mid = lamp(0, false); bot = lamp(s * 1.3, false); blink = ' class="blink"'; }
    else if (state === "flashYellow") { top = lamp(-s * 1.3, false); mid = lamp(0, true, "#F1C40F"); bot = lamp(s * 1.3, false); blink = ' class="blink"'; }
    else { top = lamp(-s * 1.3, false); mid = lamp(0, false); bot = lamp(s * 1.3, false); }
    return '<g' + blink + '><rect x="' + (-s * 0.9) + '" y="' + (-s * 2.1) + '" width="' + (s * 1.8) + '" height="' + (s * 4.2) + '" rx="' + (s * 0.4) + '" fill="#1c1c1c"/>' + top + mid + bot + '</g>';
  }

  function pedSignal(state, s) {     // walk / dontwalk / count
    s = s || 30;
    // dark signal housing + the official MUTCD pedestrian symbol (white walking
    // person, or Portland-orange raised hand) centered on it.
    var housing = '<rect x="' + (-s * 0.95) + '" y="' + (-s * 0.95) + '" width="' + (s * 1.9) + '" height="' + (s * 1.9) + '" rx="' + (s * 0.2) + '" fill="#1c1c1c"/>';
    var sym;
    if (state === "count") sym = '<text x="0" y="' + (s * 0.4) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="' + (s * 1.1) + '" fill="#F39C12">7</text>';
    else sym = '<image href="assets/signs/' + (state === "walk" ? "ped-walk.svg" : "ped-hand.svg") + '" x="' + (-s * 0.75) + '" y="' + (-s * 0.7) + '" width="' + (s * 1.5) + '" height="' + (s * 1.4) + '" preserveAspectRatio="xMidYMid meet"/>';
    return housing + sym;
  }

  /* ---- defs (filter for lit lamps) ---- */
  function defs() {
    return '<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">' +
      '<feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  }

  /* ---- road pieces ---- */
  function vRoad() { return '<rect x="130" y="0" width="140" height="400" fill="' + C.road + '"/>'; }
  function grass() { return '<rect width="400" height="400" fill="' + C.grass + '"/>'; }

  function crosswalk(yTop) {
    yTop = yTop || 80;
    var stripes = "";
    for (var i = 0; i < 5; i++) stripes += '<rect x="' + (140 + i * 26) + '" y="' + yTop + '" width="16" height="50" fill="#fff" rx="2"/>';
    return stripes + '<rect x="200" y="' + (yTop + 58) + '" width="70" height="9" fill="#fff"/>';
  }

  // Railroad crossing: tracks across the scene, a train approaching from the left,
  // a crossbuck with flashing red lights, and a lowered gate arm over your lane.
  function railroadCrossing() {
    var ty = 150, s = "";
    s += '<rect x="0" y="' + ty + '" width="400" height="40" fill="#6b5440"/>';
    for (var x = 2; x < 400; x += 22) s += '<rect x="' + x + '" y="' + ty + '" width="7" height="40" fill="#5a4634"/>';
    s += '<line x1="0" y1="' + (ty + 9) + '" x2="400" y2="' + (ty + 9) + '" stroke="#cfcfcf" stroke-width="4"/>';
    s += '<line x1="0" y1="' + (ty + 31) + '" x2="400" y2="' + (ty + 31) + '" stroke="#cfcfcf" stroke-width="4"/>';
    // train approaching from the left (not yet at the crossing)
    s += '<rect x="8" y="156" width="44" height="28" rx="4" fill="#8a4a3a"/>' +
      '<rect x="58" y="153" width="58" height="34" rx="6" fill="#37404a"/>' +
      '<rect x="92" y="160" width="22" height="20" rx="3" fill="#2a313a"/>' +
      '<rect x="64" y="159" width="22" height="13" rx="3" fill="' + C.glass + '" opacity=".8"/>' +
      '<rect x="110" y="166" width="6" height="8" rx="2" fill="#fff6c8"/>';
    // crossing signal mast on the right shoulder (your approach side)
    s += '<rect x="283" y="148" width="7" height="80" fill="#3c3c3c"/>';
    s += '<g transform="translate(286,140)" stroke="#222" stroke-width="2">' +
      '<rect x="-22" y="-5" width="44" height="10" rx="2" fill="#fff" transform="rotate(45)"/>' +
      '<rect x="-22" y="-5" width="44" height="10" rx="2" fill="#fff" transform="rotate(-45)"/></g>';
    s += '<circle cx="277" cy="167" r="6.5" fill="#e23b3b" class="blink-a"/>';
    s += '<circle cx="296" cy="167" r="6.5" fill="#e23b3b" class="blink-b"/>';
    // lowered gate arm across your (right) lane
    s += '<circle cx="285" cy="210" r="5" fill="#3c3c3c"/>';
    s += '<rect x="198" y="206" width="86" height="9" rx="3" fill="#fff"/>';
    s += '<rect x="198" y="206" width="22" height="9" fill="#d23b3b"/>';
    s += '<rect x="242" y="206" width="22" height="9" fill="#d23b3b"/>';
    return s;
  }

  /* ---- attribute helpers for tappable actors ---- */
  function dataAttrs(a) {
    if (!a) return "";
    var s = "";
    if (a.id) s += ' data-id="' + esc(a.id) + '"';
    if (a.correct) s += ' data-correct="1"';
    if (a.key) s += ' data-key="' + esc(a.key) + '"';
    return s;
  }
  // open a <g> with a combined class list + data attrs (+ optional id + aria label).
  // Tappable groups are keyboard-focusable buttons (the engine handles Enter/Space).
  function openG(a, extraClasses, domId, aria, extra) {
    if (a && a.decor) return "<g" + (domId ? ' id="' + domId + '"' : "") + (extra || "") + ">";
    var cls = ["tap"].concat(extraClasses || []).join(" ");
    var lbl = aria ? ' aria-label="' + esc(aria) + '"' : "";
    return '<g class="' + cls + '" tabindex="0" role="button"' + lbl + dataAttrs(a) + (domId ? ' id="' + domId + '"' : "") + (extra || "") + ">";
  }
  function wrapTap(a, inner, aria) { return openG(a, [], null, aria) + inner + "</g>"; }

  // Spoken labels for screen-reader users.
  var SIGN_LABEL = {
    stop: "stop sign", yield: "yield sign", doNotEnter: "do not enter sign", oneWay: "one way sign",
    speedLimit: "speed limit sign", noUTurn: "no U-turn sign", noLeftTurn: "no left turn sign",
    pedestrianXing: "pedestrian crossing sign", curve: "curve sign", merge: "merge sign",
    school: "school sign", railroad: "railroad crossing sign", workZone: "work zone sign"
  };
  var SIGNAL_LABEL = {
    red: "red light", yellow: "yellow light", green: "green light", greenArrowLeft: "green left arrow",
    redArrowLeft: "red left arrow", flashRed: "flashing red light", flashYellow: "flashing yellow light"
  };
  function rowAria(it) {
    if (it.type === "sign") return SIGN_LABEL[it.name] || "sign";
    if (it.type === "signal") return SIGNAL_LABEL[it.state] || "traffic light";
    if (it.type === "pedSignal") return it.state === "walk" ? "walk signal" : "don't walk signal";
    if (it.type === "miniRoad") return it.caption || "road";
    if (it.type === "card") return it.text || "option";
    return "option";
  }

  /* =========================================================
   * TEMPLATES — each takes the scenario `scene` object and
   * returns the full <svg>...</svg> string.
   * ========================================================= */

  var CROSS_POS = {
    south: { cx: 232, cy: 322, dir: "up" },
    north: { cx: 168, cy: 78, dir: "down" },
    east: { cx: 322, cy: 168, dir: "left" },
    west: { cx: 78, cy: 232, dir: "right" }
  };
  var CROSS_SIGN = { south: [122, 300], north: [278, 100], east: [300, 278], west: [100, 122] };
  // white stop line across the approaching (right-hand) lane, just before the intersection box
  var STOP_BAR = {
    south: '<rect x="202" y="272" width="66" height="7" fill="#fff"/>',
    north: '<rect x="132" y="121" width="66" height="7" fill="#fff"/>',
    east: '<rect x="272" y="132" width="7" height="66" fill="#fff"/>',
    west: '<rect x="121" y="202" width="7" height="66" fill="#fff"/>'
  };

  function tplIntersection(scene) {
    var kind = scene.kind || "cross";
    var svg = '<svg class="scene" viewBox="0 0 400 400" role="img">' + grass();
    // roads
    svg += '<rect x="130" y="0" width="140" height="400" fill="' + C.road + '"/>';
    if (kind === "cross") svg += '<rect x="0" y="130" width="400" height="140" fill="' + C.road + '"/>';
    else if (kind === "tee") svg += '<rect x="0" y="130" width="400" height="140" fill="' + C.road + '"/>'; // through horizontal; vertical only below
    // For tee: cover the top vertical stub with grass (road only comes from bottom)
    if (kind === "tee") svg += '<rect x="130" y="0" width="140" height="130" fill="' + C.grass + '"/>';
    // center lines (broken at the box); north approach only exists for cross
    if (kind === "cross") svg += '<line x1="200" y1="0" x2="200" y2="120" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
    svg += '<line x1="200" y1="280" x2="200" y2="400" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
    if (kind === "cross" || kind === "tee") {
      svg += '<line x1="0" y1="200" x2="120" y2="200" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
      svg += '<line x1="280" y1="200" x2="400" y2="200" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
    }
    // control signs + matching white stop lines
    var control = scene.control || "none";
    if (control === "stop-all") {
      Object.keys(CROSS_SIGN).forEach(function (k) {
        if (kind === "tee" && k === "north") return;
        var p = CROSS_SIGN[k]; svg += STOP_BAR[k] + '<g transform="translate(' + p[0] + ',' + p[1] + ')">' + stopSign(0, 0, 15) + '</g>';
      });
    } else if (control === "yield") {
      var p = CROSS_SIGN.south; svg += '<g transform="translate(' + (p[0] + 24) + ',' + p[1] + ')">' + yieldSign(0, 0, 16) + '</g>';
    } else if (control === "stop") {
      // single stop sign + stop line on your (south / minor-road) approach
      svg += STOP_BAR.south + '<g transform="translate(286, 292)">' + stopSign(0, 0, 15) + '</g>';
    }
    // pedestrian (optional)
    if (scene.ped) {
      var pp = { north: [200, 70], south: [200, 330], east: [330, 200], west: [70, 200] }[scene.ped.at || "north"];
      svg += wrapTap(scene.ped, pedestrian(pp[0], pp[1], "#34495E"), "person crossing");
    }
    // cars — optionally animate them driving up to the intersection (scene.animate),
    // staggered by each car's optional `delay` so "same time" vs "first" reads visually.
    (scene.cars || []).forEach(function (c) {
      var pos = CROSS_POS[c.from] || CROSS_POS.south;
      var aria = (c.label ? c.label + ", " : "") + "car coming from the " + c.from;
      var cls = scene.animate ? ["arrive-" + c.from] : [];
      var extra = (scene.animate && c.delay) ? ' style="animation-delay:' + c.delay + 's"' : "";
      svg += openG(c, cls, null, aria, extra) +
        car(pos.cx, pos.cy, { dir: c.dir || pos.dir, color: c.color || (c.label === "YOU" ? C.you : C.other), label: c.label || "" }) + "</g>";
    });
    return svg + "</svg>";
  }

  function tplRoad(scene) {
    // A center two-way left-turn lane needs three lanes, so the roadway is
    // widened in that mode (and narrows back to two lanes otherwise).
    var ctl = scene.centerTurnLane;
    var roadX = ctl ? 90 : 130, roadW = ctl ? 220 : 140;
    var edgeL = roadX + 9, edgeR = roadX + roadW - 9;
    var svg = '<svg class="scene" viewBox="0 0 400 400" role="img">' + grass() +
      '<rect x="' + roadX + '" y="0" width="' + roadW + '" height="400" fill="' + C.road + '"/>';
    // a driveway leading off to the left (so "turn left into a driveway" reads)
    if (scene.driveway === "left") {
      svg += '<rect x="0" y="170" width="' + roadX + '" height="60" fill="#b9bfc4"/>' +
        '<rect x="8" y="176" width="42" height="48" rx="4" fill="#d9b48c" stroke="#b8916a" stroke-width="2"/>' +
        '<path d="M4 178 L29 160 L54 178 Z" fill="#9b6b4a"/>' +
        '<rect x="23" y="200" width="13" height="24" fill="#7a5436"/>';
    }
    // white edge (fog) lines on both sides of the roadway
    svg += '<line x1="' + edgeL + '" y1="0" x2="' + edgeL + '" y2="400" stroke="#fff" stroke-width="4"/>';
    svg += '<line x1="' + edgeR + '" y1="0" x2="' + edgeR + '" y2="400" stroke="#fff" stroke-width="4"/>';
    // divider: a center two-way left-turn lane, OR a single line —
    // yellow dashed = two-way (default); white dashed = lanes going the same way
    if (scene.centerTurnLane) {
      svg += centerTurnLaneMarks();
    } else {
      var divCol = scene.divider === "white" ? "#fff" : C.line;
      svg += '<line x1="200" y1="0" x2="200" y2="400" stroke="' + divCol + '" stroke-width="5" stroke-dasharray="22 18"/>';
    }
    // a cross street ahead (the intersection you're approaching)
    if (scene.crossStreet) {
      svg += '<rect x="0" y="0" width="400" height="58" fill="' + C.road + '"/>';
      svg += '<line x1="' + edgeL + '" y1="62" x2="' + edgeR + '" y2="62" stroke="#fff" stroke-width="6"/>';
    }
    // direction-of-travel arrows painted in the through lanes. With a dedicated
    // left-turn lane (turnArrow:"left-lane"), the left lane shows only the turn
    // arrow, so suppress its straight arrow.
    var aL = ctl ? 132 : 165, aR = ctl ? 268 : 235;
    var turnLaneLeft = scene.turnArrow === "left-lane";
    if (scene.arrows === "up") {
      if (!turnLaneLeft) svg += laneArrow(aL, "up");
      svg += laneArrow(aR, "up");
    } else if (scene.arrows === "twoway") svg += laneArrow(aL, "down") + laneArrow(aR, "up");
    // fire hydrant on the right shoulder
    if (scene.hydrant) svg += hydrant(300, scene.hydrant.y || 150);
    if (scene.crosswalk) svg += crosswalk(80);
    if (scene.railroad) svg += railroadCrossing();
    // turn arrow hint on your car
    if (scene.turnArrow === "left") {
      // blue hint: your car's intended path — up out of the right lane, then left
      svg += '<path d="M235 262 V224 Q235 200 182 200 M182 200 l14 -8 M182 200 l14 8" fill="none" stroke="#9fd9ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>';
    } else if (scene.turnArrow === "left-lane") {
      // white left-turn arrow painted in the left lane near the intersection —
      // marks it as a dedicated left-turn lane
      svg += '<path d="M165 210 V118 q0 -22 -24 -22 M139 96 l12 -6 M139 96 l12 6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>';
    }
    var LANE = ctl ? { left: 132, center: 200, right: 268 } : { left: 165, right: 235 };
    var AT = { top: 80, mid: 200, bottom: 300 };
    // zones (tap-zone)
    (scene.zones || []).forEach(function (z) {
      var r = z.rect;
      svg += '<rect class="tap" tabindex="0" role="button" aria-label="' + esc(z.aria || "spot on the road") + '"' + dataAttrs(z) + ' x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="transparent"/>';
    });
    // result marker placeholder for tap-zone (engine reveals)
    if (scene.marker) {
      var m = scene.marker;
      svg += '<g id="mark" style="opacity:0"><line x1="' + (m[0] - 30) + '" y1="' + m[1] + '" x2="' + (m[0] + 30) + '" y2="' + m[1] + '" stroke="' + C.correct + '" stroke-width="7"/><circle cx="' + m[0] + '" cy="' + m[1] + '" r="15" fill="' + C.correct + '"/><path d="M' + (m[0] - 6) + ' ' + m[1] + ' l4 4 l8 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>';
    }
    // school bus ahead (yellow, red flashing lamps + stop arm)
    if (scene.bus) {
      var by = scene.bus.cy || 150;
      svg += '<g><rect x="206" y="' + (by - 48) + '" width="58" height="96" rx="10" fill="#F4C400" stroke="#caa200" stroke-width="2"/>' +
        '<rect x="212" y="' + (by - 40) + '" width="46" height="20" rx="4" fill="#bfe0ef"/>' +
        '<rect x="212" y="' + (by - 14) + '" width="46" height="18" rx="4" fill="#bfe0ef"/>' +
        '<text x="235" y="' + (by + 30) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="#7a5b00">BUS</text>' +
        '<circle cx="214" cy="' + (by - 44) + '" r="4" fill="#E74C3C" class="blink"/><circle cx="256" cy="' + (by - 44) + '" r="4" fill="#E74C3C" class="blink"/>' +
        '<rect x="186" y="' + (by - 6) + '" width="20" height="20" rx="3" fill="#E74C3C"/><text x="196" y="' + (by + 9) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="#fff">S</text>' +
        '</g>';
    }
    // pedestrian (beside road, or on the crosswalk)
    if (scene.ped) {
      if (scene.ped.onCrosswalk) {
        svg += wrapTap(scene.ped, pedestrian(205, 105, "#34495E"), "person in the crosswalk");
      } else {
        var px = scene.ped.side === "right" ? 285 : 115;
        svg += wrapTap(scene.ped, pedestrian(px, scene.ped.y || 110, "#34495E"), "person near the road");
      }
    }
    // cars (or a bicycle, when c.bike is set — cyclists ride near the right curb)
    (scene.cars || []).forEach(function (c) {
      var cy = AT[c.at || "bottom"];
      if (c.bike) {
        svg += openG(c, [], c.markId, "bicycle") + bicycle(252, cy, { dir: c.dir || "up", color: c.color || "#2F6FB0" }) + '</g>';
        return;
      }
      if (c.truck) {
        svg += openG(c, c.roll ? ["roll"] : [], c.markId, "big truck") + truck(LANE[c.lane || "right"], cy, { dir: c.dir || "up", color: c.color }) + '</g>';
        return;
      }
      var cx = LANE[c.lane || "right"];
      svg += openG(c, c.roll ? ["roll"] : [], c.markId, c.label || "car") +
        car(cx, cy, { dir: c.dir || "up", color: c.color || (c.label === "YOU" ? C.you : C.other), label: c.label || "" }) + '</g>';
    });
    return svg + "</svg>";
  }

  function tplMerge(scene) {
    var svg = '<svg class="scene" viewBox="0 0 400 400" role="img">' + grass();
    svg += '<rect x="0" y="150" width="400" height="110" fill="' + C.road + '"/>';
    svg += '<rect x="165" y="250" width="70" height="150" fill="' + C.road + '"/>';
    svg += '<line x1="0" y1="205" x2="150" y2="205" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
    svg += '<line x1="250" y1="205" x2="400" y2="205" stroke="' + C.line + '" stroke-width="5" stroke-dasharray="20 16"/>';
    svg += '<g transform="translate(272,300)">' + yieldSign(0, 0, 24) + '</g>';
    (scene.cars || []).forEach(function (c) {
      if (c.role === "main") svg += openG(c, ["roll"], "carMain", "the car already on the road") + car(62, 205, { dir: "right", color: c.color || C.other }) + "</g>";
      else svg += openG(c, [], null, "your car") + car(200, 335, { dir: "up", color: C.you, label: "YOU" }) + "</g>";
    });
    return svg + "</svg>";
  }

  function tplRoundabout(scene) {
    var svg = '<svg class="scene" viewBox="0 0 400 400" role="img">' + grass();
    // four approach/exit legs (drawn first, then the ring covers the middle)
    svg += '<rect x="170" y="0" width="60" height="400" fill="' + C.road + '"/>';
    svg += '<rect x="0" y="170" width="400" height="60" fill="' + C.road + '"/>';
    // circulating roadway + raised landscaped center island
    svg += '<circle cx="200" cy="200" r="118" fill="' + C.road + '"/>';
    svg += '<circle cx="200" cy="200" r="62" fill="#bcdcc0" stroke="#98c29e" stroke-width="6"/>';
    // lane edge hint just outside the island
    svg += '<circle cx="200" cy="200" r="72" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="10 12" opacity=".7"/>';
    // counter-clockwise flow arrows (top→left, right→up, bottom→right, left→down)
    svg += '<g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85">' +
      '<path d="M210 110 L198 102 L210 94"/>' +
      '<path d="M290 210 L298 198 L306 210"/>' +
      '<path d="M190 290 L202 298 L190 306"/>' +
      '<path d="M110 190 L102 202 L94 190"/></g>';
    // bottom approach yield for YOU
    svg += '<g transform="translate(250,330)">' + yieldSign(0, 0, 20) + '</g>';
    (scene.cars || []).forEach(function (c) {
      // circulating car sits on the left of the ring, heading down (counter-clockwise) toward the entry
      if (c.role === "circulating") svg += openG(c, ["roll"], "carCirc", "a car already in the roundabout") + car(110, 205, { dir: "down", color: c.color || C.other }) + "</g>";
      else svg += openG(c, [], null, "your car") + car(200, 355, { dir: "up", color: C.you, label: "YOU" }) + "</g>";
    });
    return svg + "</svg>";
  }

  function miniRoad(line, cars) {
    var w = 130, h = 215, x = -w / 2, y = -h / 2;
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + C.road + '"/>';
    var lc = line.color === "white" ? C.white : C.line;
    if (line.pattern === "double") {
      s += '<line x1="-6" y1="' + (y + 6) + '" x2="-6" y2="' + (y + h - 6) + '" stroke="' + lc + '" stroke-width="5"/>';
      s += '<line x1="6" y1="' + (y + 6) + '" x2="6" y2="' + (y + h - 6) + '" stroke="' + lc + '" stroke-width="5"/>';
    } else if (line.pattern === "solidDash") {
      // solid line on the left, dashed (broken) line on the right — passing is
      // allowed only for traffic on the side with the broken line.
      s += '<line x1="-6" y1="' + (y + 6) + '" x2="-6" y2="' + (y + h - 6) + '" stroke="' + lc + '" stroke-width="5"/>';
      s += '<line x1="6" y1="' + (y + 6) + '" x2="6" y2="' + (y + h - 6) + '" stroke="' + lc + '" stroke-width="5" stroke-dasharray="20 16"/>';
    } else {
      var dash = line.pattern === "dashed" ? ' stroke-dasharray="20 16"' : "";
      s += '<line x1="0" y1="' + (y + 6) + '" x2="0" y2="' + (y + h - 6) + '" stroke="' + lc + '" stroke-width="6"' + dash + '/>';
    }
    (cars || []).forEach(function (cc) {
      var cx = cc.lane === "left" ? -30 : 30;
      var cy = cc.dir === "down" ? -45 : 35;
      s += car(cx, cy, { dir: cc.dir || "up", color: cc.color || C.you });
    });
    return s;
  }

  function tplRow(scene) {
    var items = scene.items || [];
    var n = items.length, vb = scene.tall ? 300 : 280;
    var svg = '<svg class="scene" viewBox="0 0 400 ' + vb + '" role="img">' + defs() + '<rect width="400" height="' + vb + '" fill="' + C.sky + '"/>';
    items.forEach(function (it, i) {
      var cx = Math.round(400 * (i + 1) / (n + 1));
      var cy = it.type === "miniRoad" ? 130 : 120;
      var inner;
      if (it.type === "sign") inner = sign(it.name, it.size || 42, it.arg);
      else if (it.type === "signal") inner = signal(it.state, it.size || 26);
      else if (it.type === "pedSignal") inner = pedSignal(it.state, it.size || 26);
      else if (it.type === "miniRoad") inner = miniRoad(it.line || { color: "yellow", pattern: "solid" }, it.cars);
      else if (it.type === "card") inner = '<rect x="-55" y="-60" width="110" height="120" rx="14" fill="#fff" stroke="#dbe6e3" stroke-width="2"/><text x="0" y="6" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="44">' + esc(it.text || "?") + '</text>';
      else inner = "";
      var g = '<g transform="translate(' + cx + ',' + cy + ')">' + inner + '</g>';
      svg += wrapTap(it, g, rowAria(it));
      if (it.caption) svg += '<text x="' + cx + '" y="' + (vb - 22) + '" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="700" font-size="17" fill="' + C.inkSoft + '">' + esc(it.caption) + '</text>';
    });
    return svg + "</svg>";
  }

  var TEMPLATES = {
    intersection: tplIntersection,
    road: tplRoad,
    merge: tplMerge,
    roundabout: tplRoundabout,
    row: tplRow
  };

  function render(scene) {
    if (!scene || !scene.template) return '<svg viewBox="0 0 400 200"><text x="200" y="100" text-anchor="middle">no scene</text></svg>';
    var fn = TEMPLATES[scene.template];
    if (!fn) return '<svg viewBox="0 0 400 200"><text x="200" y="100" text-anchor="middle">unknown template: ' + esc(scene.template) + '</text></svg>';
    return fn(scene);
  }

  var SceneKit = {
    render: render, car: car, sign: sign, signal: signal, pedSignal: pedSignal,
    pedestrian: pedestrian, palette: C, TEMPLATES: Object.keys(TEMPLATES), SIGNS: Object.keys(SIGNS)
  };

  if (typeof module !== "undefined" && module.exports) module.exports = SceneKit;
  else root.SceneKit = SceneKit;
})(typeof window !== "undefined" ? window : this);
