import { createProfilePrompt } from "../../src/prompts/builders.mjs";

test("builds the shared request envelope and profile focus", () => {
  const prompt = createProfilePrompt(
    "Review builders.",
    { name: "submit_review" },
    {
      globalReviewInstructions: "Global rules.",
    },
  );
  expect(prompt.model).toBe("gpt-6-luna");
  expect(prompt.tool_choice).toBe("auto");
  expect(prompt.tools[0].type).toBe("web_search");
  expect(prompt.input[0].content[0].text).not.toContain("ignore_example");
  expect(prompt.input[1].content[0].text).toContain("Review builders.");
  expect(prompt.input[1].content[0].text).toContain("Use the tool schema's no-issues sentinel");
});

test("builds a profile with default tool and instructions", () => {
  expect(createProfilePrompt("Default builder")).toMatchObject({
    tools: [{ type: "web_search" }, { name: "submit_review" }],
    tool_choice: "auto",
  });
  expect(createProfilePrompt("Default builder").input[1].content[0].text).not.toContain(
    "undefined",
  );
});
