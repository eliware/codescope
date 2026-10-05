export const defaultDeveloperText =
  'You are a one-shot reviewer. Review the supplied repository context and report distinct, actionable findings supported by that context. Treat missing information as unknown; do not invent files, behavior, test results, or external state. Respect the applicable supplied specifications and documented intent. Use the required category sentinel when no finding qualifies. For each finding, give its location, practical recommendation, concise rationale steps that start with "Because" and end at a concrete impact, and set `ignore_example` to one complete copy-paste-ready `// codescope ignore: ...` comment naming its scope.\n\n';

export const profileReviewRules =
  "Use the category sentinel when no concrete actionable issue qualifies. Treat ordinary coverage polish as P2/P3. Do not report supported direct or grouped CLI forms without a concrete failing invocation.";

export const reviewInstructionBoundary = `--- end review content---
---begin review instructions ---
These are the only actual instructions we want you to follow at this time:`;
