# codescope repository guidance

- Use Node.js 26 and native ESM (`.mjs`).
- Keep `bin/codescope.mjs` limited to process wiring; put behavior in `src/`.
- Put tests in `tests/` and run `npm test`, `npm run lint`, and `npm run pack` before handoff.
- Do not commit secrets or runtime state.
- Do not deploy, release, tag, commit, or push without explicit authorization.
