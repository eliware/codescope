import { runPromptCommand } from "./prompt/command.mjs";
import { runProfileCommand } from "./profile/command.mjs";
import { readPrompt } from "../profiles/prompt-sources/read-content.mjs";

export async function runReviewCommand(
  command,
  {
    mode = "review",
    option,
    options = [],
    effort,
    model,
    usage,
    dryRun,
    debugRequest,
    promptText,
    add,
    cwd,
    write,
    review,
  },
) {
  if (command === "prompt")
    return runPromptCommand({
      cwd,
      write,
      review,
      promptText,
      model,
      effort,
      add,
      usage,
      debugRequest,
    });
  if (command === "analyze-refactor")
    return runPromptCommand({
      cwd,
      write,
      review,
      promptText: readPrompt("refactor.md"),
      model,
      effort,
      webSearch: false,
      add,
      usage,
      debugRequest,
    });
  return runProfileCommand(command, {
    mode,
    option,
    options,
    effort,
    model,
    usage,
    dryRun,
    debugRequest,
    cwd,
    write,
    review,
    add,
  });
}
