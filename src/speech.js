/* speech.js — spoken prompts & feedback.
 * Uses the browser's built-in speech. If a recorded clip exists at
 * audio/ky/<id>.mp3 it is preferred (warmer, consistent voice).
 */
(function (root) {
  "use strict";
  var enabled = true;
  var warmed = false;
  var current = null;

  function supported() { return typeof window !== "undefined" && "speechSynthesis" in window; }

  function warm() {            // call once from a user gesture (iOS needs this)
    if (warmed || !supported()) return;
    try { var u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis.speak(u); warmed = true; } catch (e) {}
  }

  function stop() {
    if (current && current.pause) { try { current.pause(); current.currentTime = 0; } catch (e) {} current = null; }
    if (supported()) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  function speak(text, audioId) {
    if (!enabled || !text) return;
    stop();
    if (audioId) {
      try {
        var a = new Audio("audio/ky/" + audioId + ".mp3");
        current = a;
        a.play().then(function () {}).catch(function () { ttsSpeak(text); });
        a.onerror = function () { ttsSpeak(text); };
        return;
      } catch (e) { /* fall through to TTS */ }
    }
    ttsSpeak(text);
  }

  function ttsSpeak(text) {
    if (!supported()) return;
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function setEnabled(v) { enabled = !!v; if (!enabled) stop(); }
  function isEnabled() { return enabled; }

  root.Speech = { speak: speak, stop: stop, warm: warm, setEnabled: setEnabled, isEnabled: isEnabled };
})(typeof window !== "undefined" ? window : this);
