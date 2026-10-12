export function getFunctionToolName(request) {
  return request.tool_choice?.name ?? request.tools?.find((tool) => tool.type === "function")?.name;
}
