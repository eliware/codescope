export function createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool }) {
  return profilePrompt(
    `${instruction} Read all supplied source code. Suggest only useful changes that the evidence supports. Give a file path, a current opportunity, and a practical change. Do not report guesses, risks without evidence, work the code already does, documented behavior, duplicates, or changes that are not needed. Put at least one item in every category. If a category has no suggestion, return one sentinel: location \`none\`, suggestion \`No suggestions found.\`, rationale: [], ignore_example: \`\`. For each real suggestion, give one or more short reasons in order. Start each reason with "Because". End with why the change helps. Do not add extra reasons. For each real suggestion, include a full \`// codescope ignore: ...\` comment in ignore_example. Give paths and line numbers for findings.`,
    suggestionTool,
  );
}
