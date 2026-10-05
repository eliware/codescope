export function createReviewFollowUpInstructions() {
  return `Independently check every finding in the preceding initial review against the original repository content and applicable conventions. Apply the same reporting threshold and priority rules as the initial review.

For each initial finding ID, record exactly one assessment: real, partially_real, or false_positive.

Give each assessment a concise basis tied to the supplied evidence. For a false_positive, identify what evidence disproves the finding or why its causal path does not establish a defect. For a partially_real finding, identify what was corrected.

Check each claim within a finding separately. If any supported defect remains, retain the finding under its original ID and correct it to state only that defect. Do not discard an entire finding because one detail is false. Do not discard one finding because another finding in the same category is false. Passing tests, absence of a dedicated test, or uncertainty alone do not disprove a defect demonstrated by the supplied code and contract.

Preserve real findings, correcting inaccurate wording without changing their substance.

Do not introduce unrelated findings. Return every surviving finding in the final category arrays and exactly one assessment for every initial finding ID. Use empty arrays where no findings survive. Return the complete final review using the required tool and schema.`;
}
