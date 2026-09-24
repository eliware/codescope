import { createCombinedAllPrompt } from "../../src/prompts/combined.mjs";

const buildPrompt = (releaseGate = false) => {
  const system = { role: "system", content: [{ type: "input_text", text: "system" }] };
  const user = { role: "user", content: [{ type: "input_text", text: "review" }] };
  const allPrompt = { model: "gpt-6-luna", input: [system, user] };
  const result = createCombinedAllPrompt({
    allPrompt,
    unifiedTool: { name: "submit_unified_review" },
    releaseGate,
  });
  return { allPrompt, result, system, user };
};

test("adds the unified tool and appends guidance after original prompt input", () => {
  const { allPrompt, result, system } = buildPrompt();
  expect(result.tools).toEqual([{ name: "submit_unified_review" }]);
  expect(result.tool_choice).toEqual({ type: "function", name: "submit_unified_review" });
  expect(result.parallel_tool_calls).toBeUndefined();
  expect(result.model).toBe("gpt-6-luna");
  expect(result.input[0]).toBe(system);
  expect(result.input[1].content[0].text).toMatch(/^review\nIMPORTANT:/u);
  expect(result.input).toHaveLength(allPrompt.input.length + 2);
  expect(allPrompt.input[1].content[0].text).toBe("review");
});

test("switches only the completeness message for release-gate mode", () => {
  const standard = buildPrompt().result;
  const release = buildPrompt(true).result;
  expect(standard.input.at(-2).content[0].text).not.toBe(release.input.at(-2).content[0].text);
  expect(standard.input.at(-1)).toEqual(release.input.at(-1));
});
