const DELIMITER_ERROR = "Only --effort=... or --model=... may follow --";

export function normalizeTrailingPromptOptions(tokens) {
  const options = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "--effort" || token === "--model") {
      const value = tokens[++index];
      if (value === undefined || value.startsWith("-")) throw new Error(DELIMITER_ERROR);
      options.push(`${token}=${value}`);
    } else if (token.startsWith("--effort=") || token.startsWith("--model=")) {
      options.push(token);
    } else {
      throw new Error(DELIMITER_ERROR);
    }
  }
  return options;
}
