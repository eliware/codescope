const allowedFields = [
  "model",
  "input",
  "text",
  "reasoning",
  "tools",
  "tool_choice",
  "parallel_tool_calls",
  "store",
  "include",
  "service_tier",
  "prompt_cache_options",
];

export function prepareAllowedRequestFields(prompt) {
  const source = structuredClone(prompt);
  const unexpected = Object.keys(source).filter((field) => !allowedFields.includes(field));
  if (unexpected.length)
    throw new Error(`Prompt contains unsupported fields: ${unexpected.join(", ")}`);
  const request = Object.fromEntries(
    allowedFields
      .filter((field) => field in source)
      .map((field) => [field, structuredClone(source[field])]),
  );
  if (
    (request.model !== undefined && (typeof request.model !== "string" || !request.model)) ||
    (request.tools !== undefined && !Array.isArray(request.tools)) ||
    (request.store !== undefined && typeof request.store !== "boolean")
  )
    throw new Error("prompt.json contains invalid Responses API fields");
  return request;
}
