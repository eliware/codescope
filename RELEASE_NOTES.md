# Release Notes

## 12.0.0 — 2026-10-11

### Changed

- Finding reviews now make one provider request and return its review.
- Use the `@eliware/openai` v12 model catalog and pricing calculators.
- Add reasoning-summary deltas and request IDs to debug event output.
- Add provider error details to API failure output.

## 11.0.0 — 2026-10-03

### Added

- Added CodeScope, a read-only CLI for repository reviews, suggestions, and token estimates.
- Added profiles for architecture, security, reliability, performance, API design, dependencies, conventions, and release readiness.
- Added comprehensive reviews.
- Added custom prompts, model and effort options, usage reports, and dry-run estimates.
- Added evidence handling that leaves reviewed repositories unchanged.
- Added a rule that CodeScope does not run repository commands or tests.
