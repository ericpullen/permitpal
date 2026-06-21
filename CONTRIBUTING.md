# Contributing

Thanks for helping make driving practice easier to access. Contributions of all sizes are welcome — fixing a rule, improving wording, adding a scenario, or improving accessibility.

## Ways to help

- **Fix accuracy.** If a rule is wrong or out of date, open an issue or PR with the correct info and the Kentucky Driver Manual section.
- **Add scenarios.** See [AUTHORING.md](AUTHORING.md). Most lessons are just JSON.
- **Improve accessibility.** Screen-reader labels, keyboard support, clearer visuals.
- **Record audio.** Drop `audio/ky/<scenario-id>.mp3` files for a warm, consistent voice (the app uses them automatically and falls back to the browser voice).

## Workflow

1. Fork and create a branch.
2. Make your change.
3. Run the checker locally:
   ```bash
   node scripts/validate.js
   ```
4. Open a pull request. CI runs the same check automatically.

## Quality bar (please keep)

- **Plain, kind language.** Short sentences. Aim for a 4th–6th grade reading level. Feedback should teach, never scold.
- **Accuracy first.** Cite the manual (`manualRef`). Don't include exact fine amounts; rules and numbers change.
- **Accessibility.**
  - Color is never the only cue — pair it with shape, icon, or words.
  - Tap targets stay large.
  - Don't rely on motion to convey meaning (some users turn it off).
- **One decision per screen.** Keep each scenario about a single idea.

## Code of conduct

Be kind and constructive. This project exists to help people, including learners who find traditional tests hard. Assume good faith and keep feedback supportive.

## Disclaimer

Permit Pal is an independent study aid, not affiliated with the Kentucky State Police, the Kentucky Transportation Cabinet, or the Commonwealth of Kentucky. Always defer to the official manual.
