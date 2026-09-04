export function createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool }) {
  return profilePrompt(
    `${instruction} Use the complete implementation source provided above. Every suggestion item must include a complete copy-pasteable \`// codescope ignore: ...\` comment in ignore_example; never leave it blank. Use an empty array when a category has no suggestions; do not emit placeholders or no-suggestion items. For findings, include the path and related line number(s).`,
    suggestionTool,
  );
}
