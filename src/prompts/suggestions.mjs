import { suggestionOutputPolicy } from "./policy/suggestion-output-policy.mjs";

export function createImplementationOnlyPrompt(instruction, { profilePrompt, suggestionTool }) {
  return profilePrompt(
    `${instruction} Read all supplied source code. Suggest only useful changes that the evidence supports. Give a file path, a current opportunity, and a practical change. Do not report guesses, risks without evidence, work the code already does, documented behavior, duplicates, or changes that are not needed. Put at least one item in every category. ${suggestionOutputPolicy} Give paths and line numbers for each suggestion.`,
    suggestionTool,
  );
}
