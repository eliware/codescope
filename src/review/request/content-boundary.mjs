import { fillPrompt } from "../../profiles/prompt-sources/read-content.mjs";

export function frameRepositoryContent(content) {
  return fillPrompt("boundary-repository.md", { CONTENT: content });
}

export function frameReviewContent(repositoryContent) {
  return fillPrompt("boundary-content.md", { CONTENT: repositoryContent });
}

export function frameReviewInstructions(instructions) {
  return fillPrompt("boundary-instructions.md", { INSTRUCTIONS: instructions });
}

export function frameCustomPrompt(repositoryContent, prompt) {
  return fillPrompt("boundary-custom.md", { CONTENT: repositoryContent, PROMPT: prompt });
}
