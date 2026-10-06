export const scopePolicy = `Use supplied specifications and nearby documentation to determine project scope. If they say that behavior is intentional, accepted, supported, or out of scope, and the code follows that rule, do not report it.

Do not hide a separate defect, a missed documented condition, or an effect outside that rule. Report the concern if the code breaks the documentation, misses a required condition, or causes a proven effect outside the accepted scope.

Before you report an issue, check the related code, tests, specifications, and documentation. Omit the issue if those sources handle or disprove it. Report only the part that remains unhandled.

Follow an ignore comment only if it is near the cited code, names the same behavior, and agrees with the related code and documentation. Ignore comments that are broad, old, unrelated, or unclear. Do not report an intentional test-contract change when the supplied test and code define the same contract.`;
