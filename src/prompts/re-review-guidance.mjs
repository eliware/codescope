export function createReviewFollowUpInstructions() {
  return `Double-check each finding in the prior review against the supplied code, tests, specifications, and documentation.

Keep a finding only if the supplied evidence demonstrates a current, material defect in supported usage. A plausible risk, theoretical edge case, missing test by itself, API preference, or behavior outside the documented contract is not enough.

For each finding, verify that the cited code causes the stated impact. If any important part of the claim or impact is unsupported, omit it. If only a narrower defect is demonstrated, correct the finding to state only that defect.

Do not add findings. Return the complete final review using the required tool and schema, with only fully substantiated issues. If none remain in a category, return its required no-issues sentinel. Do not include explanations.`;
}
