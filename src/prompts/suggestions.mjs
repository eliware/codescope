export function createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool }) {
  return profilePrompt(
    `${instruction} Use the complete implementation source provided above. Report only concrete, actionable suggestions supported by the evidence. Each suggestion must identify a specific location, a real current opportunity or shortcoming, and a practical change the owner can make. Do not report speculation, hypothetical risks without evidence, already-satisfied concerns, intentional documented behavior, duplicate observations, or suggestions that require no change. Every category must contain at least one item. When a category has no actionable suggestions, return exactly one sentinel with location \`none\`, suggestion \`No suggestions found.\`, blank rationale, and blank ignore_example. Every real suggestion item must include a complete copy-pasteable \`// codescope ignore: ...\` comment in ignore_example. For findings, include the path and related line number(s).`,
    suggestionTool,
  );
}
