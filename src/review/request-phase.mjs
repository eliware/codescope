import { prepareRequest } from "./request.mjs";
import { preparePlainTextRequest } from "./plain-text-request.mjs";

export function prepareReviewRequest(
  prompt,
  combined,
  model,
  plainText,
  additions = [],
  webSearch = true,
) {
  const request = prepareRequest(prompt, combined);
  if (model) request.model = model;
  const prepared =
    plainText !== undefined
      ? preparePlainTextRequest(request, plainText, combined, webSearch)
      : request;
  if (!additions.length) return prepared;
  const next = structuredClone(prepared);
  const message = next.input.filter((item) => item.role === "user").at(-1);
  const content = message?.content?.find((part) => part.type === "input_text");
  if (!content) throw new Error("Request must contain a final user input_text message");
  content.text += `\n\n${additions.join("\n")}`;
  return next;
}
