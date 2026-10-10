export const p2P3Policy = `## P2 — Important issue

Use P2 for a real issue that needs action but does not block this release.

Examples:

- Noncritical missing test coverage.
- Documentation that is inaccurate but does not affect safe operation.
- Weak diagnostics.
- Moderate performance concerns.
- Duplicate or unnecessarily complex logic.
- Limited edge cases outside the required acceptance path.
- Cleanup or maintainability work.
- Hardening that is useful but not required for this release.
- Behavior affecting optional features.
- Issues in code scheduled for a later release.

P2 issues must not change the overall verdict from pass to block.

## P3 — Minor improvement

Use P3 for low-risk improvements:

- Formatting and style suggestions.
- Naming improvements.
- Comments and wording.
- Minor documentation polish.
- Convenience features.
- Nonessential optimization.
- Optional refactoring.
- Cosmetic UX improvements.
- Developer-experience suggestions with no current functional impact.

P3 issues must never block a release.`;
