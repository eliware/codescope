import { baseRequest, webSearchTool } from "../../src/prompts/request-envelope.mjs";

test("defines the shared Responses request envelope", () => {
  expect(baseRequest.reasoning.effort).toBe("none");
  expect(baseRequest.reasoning.summary).toBe("auto");
  expect(baseRequest.parallel_tool_calls).toBe(false);
  expect(baseRequest.tool_choice).toBe("auto");
  expect(baseRequest.tools).toContainEqual(webSearchTool);
  expect(webSearchTool).toEqual({
    type: "web_search",
    user_location: { type: "approximate" },
    search_context_size: "medium",
  });
});
