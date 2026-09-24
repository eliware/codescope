import { errorChainText } from "./cause-chain.mjs";
import { EXIT_CODES } from "./exit-codes.mjs";

export function classifyErrorMessage(cause) {
  const text = errorChainText(cause);
  if (/timed out/u.test(text)) return EXIT_CODES.TEST_TIMEOUT;
  if (
    /Usage:|Unknown command|Unknown option|Unexpected arguments|requires a value|Effort must be|not valid for/u.test(
      text,
    )
  )
    return EXIT_CODES.USAGE;
  if (/OPENAI_API_TOKEN|\.codescope|environment variable/u.test(text))
    return EXIT_CODES.CONFIGURATION;
  if (/Unable to (read|inspect)|ENOENT|input file|source file/u.test(text)) return EXIT_CODES.INPUT;
  if (
    /Invalid (review|suggestion|combined|tool|function) response|verdict|category array/u.test(text)
  )
    return EXIT_CODES.RESPONSE;
  if (/OpenAI|API request|initialize OpenAI|authentication/u.test(text)) return EXIT_CODES.API;
  return undefined;
}
