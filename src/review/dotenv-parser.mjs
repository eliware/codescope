import { parseDotenvAssignment, parseDotenvValue } from "./dotenv-value-parser.mjs";

const TOKEN_NAME = "OPENAI_API_TOKEN";

export function loadEnv(text = "", environment) {
  if (!environment || typeof environment !== "object" || Array.isArray(environment))
    throw new Error("Environment must be a mutable object");
  for (const line of text.split(/\r?\n/u)) {
    const assignment = parseDotenvAssignment(line);
    if (!assignment) {
      if (new RegExp(`^\\s*(?:export\\s+)?${TOKEN_NAME}\\b`, "u").test(line))
        throw new Error("Invalid .env line");
      continue;
    }
    if (assignment.name !== TOKEN_NAME) continue;
    const value = parseDotenvValue(assignment.value);
    if (environment[TOKEN_NAME]?.trim() || !value.trim()) continue;
    environment[TOKEN_NAME] = value;
  }
}
