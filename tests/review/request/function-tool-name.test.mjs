import { getFunctionToolName } from "../../../src/review/request/function-tool-name.mjs";

test("returns the named tool from an explicit function choice", () => {
  expect(getFunctionToolName({ tool_choice: { name: "chosen" } })).toBe("chosen");
});

test("returns the function tool when the request allows automatic choice", () => {
  const request = { tools: [{ type: "web_search" }, { type: "function", name: "submit_review" }] };
  expect(getFunctionToolName(request)).toBe("submit_review");
});

test("returns undefined when the request has no function tool", () => {
  expect(getFunctionToolName({ tools: [{ type: "web_search" }] })).toBeUndefined();
});
