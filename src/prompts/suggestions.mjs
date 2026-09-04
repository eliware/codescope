export function createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool }) {
  return profilePrompt(
    `${instruction} Use the complete implementation source provided above. For suggestions, every category array must contain at least one item; when empty, emit one placeholder with location \`none\`, suggestion \`No suggestions found.\`, rationale \`\`, and empty ignore_example. For findings, include the path and related line number(s), grouped by priority only when the profile identifies issues.`,
    suggestionTool,
  );
}
