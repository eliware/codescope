import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const combinedReviewGuidance = readFileSync(
  fileURLToPath(new URL("../../../prompts/policy/combined-review-guidance.md", import.meta.url)),
  "utf8",
).trim();
