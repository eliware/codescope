import { reviewTool } from './tool-schemas.mjs';
import { defaultDeveloperText } from './guidance.mjs';
import { baseRequest } from './request-envelope.mjs';

export function createProfilePrompt(focus, tool = reviewTool, { globalReviewInstructions } = {}) {
  return {
    ...baseRequest,
    tools: [tool],
    tool_choice: { type: 'function', name: tool.name },
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `${globalReviewInstructions}\n\nClassify test gaps and documentation discrepancies as P1 only when they satisfy every P1 evidence and release-scope condition above; otherwise classify them P2 or P3. Treat proven coverage-measurement defects, stale or contaminated validation artifacts, and missing tests that leave required behavior or 100×4 unverified as P1 even when the current test command passes. Never emit a statement such as no discrepancy found as an issue; use the category sentinel. Do not report any non-actionable item: each reported item must have a concrete location, evidence of a current impact, and a specific practical next action. If none qualifies, emit only the category sentinel. Minor edge cases and ordinary coverage polish are P2/P3. Do not treat absent output from commands not supplied in the input as a defect or test gap. The documented direct and grouped CLI option combinations are supported; do not report parser behavior as a defect without reproducing a concrete failing invocation.\n\nProfile focus: ${focus}`,
          },
        ],
      },
    ],
  };
}
