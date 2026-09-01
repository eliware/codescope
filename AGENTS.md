# codescope repository guidance

- Use Node.js 26 and native ESM (`.mjs`).
- Keep `bin/codescope.mjs` limited to process wiring; put behavior in `lib/`.
- Put tests in `tests/` and run `npm test` and `npm run lint` before handoff.
- Do not commit secrets or runtime state.
- Do not deploy, release, tag, commit, or push without explicit authorization.
