import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("keeps substantiated portions when other claims in a finding are false", () => {
  expect(createReviewFollowUpInstructions()).toBe(
    `Double-check each finding in the prior review independently against the supplied code, tests, specifications, and documentation.

Keep a finding only if the supplied evidence demonstrates a current, material defect in supported usage. A plausible risk, theoretical edge case, missing test by itself, API preference, or behavior outside the documented contract is not enough.

For each finding, check each claim and its impact separately. If only part of a finding is supported, retain and correct that finding to describe the substantiated defect; do not omit the whole finding just because another detail is false or overstated. Omit it only when no material defect remains. Evaluate every prior finding independently, so rejecting one finding never removes another valid finding in the same category. Use a category sentinel only when none of its prior findings has a substantiated portion.

Do not add findings. Return the complete final review using the required tool and schema, preserving fully substantiated issues and corrected substantiated portions only. If none remain in a category, return its required no-issues sentinel. Do not include explanations.`,
  );
});
