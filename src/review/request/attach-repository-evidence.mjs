import {
  frameRepositoryContent,
  frameReviewInstructions,
} from "../../prompts/untrusted-boundary.mjs";
import { defaultDeveloperText } from "../../prompts/guidance.mjs";
import { extractTestSpecPromptContext } from "../../test-specs/prompt-context.mjs";

const PLACEHOLDER = "<combine-mjs here>";

function formatTestSpecDeveloperInstructions(instructions) {
  return instructions
    ? `Applicable Eliware Test conventions for this repository:\n${instructions}`
    : "";
}

export function attachRepositoryEvidence(request, combined) {
  const testSpecContext = extractTestSpecPromptContext(combined);
  const developer = request.input.find((item) => item.role === "developer");
  const content = developer.content.find((item) => item.type === "input_text");
  if (content.text.includes(PLACEHOLDER)) {
    content.text = content.text.replaceAll(
      PLACEHOLDER,
      frameRepositoryContent(testSpecContext.combined),
    );
    const conventions = formatTestSpecDeveloperInstructions(testSpecContext.instructions);
    if (conventions) content.text += `\n\n${conventions}`;
    return request;
  }
  if (content.text !== defaultDeveloperText)
    throw new Error(
      "Prompt developer text must contain <combine-mjs here> or use the built-in developer prompt",
    );
  const instructionMessages = request.input.filter((item) => item.role === "user");
  const instructionContent = instructionMessages.flatMap((message) => message.content);
  if (!instructionContent.some((part) => part.type === "input_text"))
    throw new Error("prompt must contain a user input_text part for repository source");
  const developerInstructions = [
    content.text.trim(),
    formatTestSpecDeveloperInstructions(testSpecContext.instructions),
  ]
    .filter(Boolean)
    .join("\n\n");
  const reviewInstructions = instructionContent
    .filter((part) => part.type === "input_text")
    .map(({ text }) => text)
    .filter(Boolean)
    .join("\n\n");
  const repositoryContent = frameRepositoryContent(testSpecContext.combined);
  request.input = [
    {
      role: "developer",
      content: [{ type: "input_text", text: developerInstructions }],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: frameReviewInstructions(repositoryContent, reviewInstructions),
        },
      ],
    },
  ];
  return request;
}
