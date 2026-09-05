export function createCombinedAllPrompt({ allPrompt, unifiedTool, releaseGate = false }) {
  return {
    ...allPrompt,
    tools: [unifiedTool],
    tool_choice: { type: 'function', name: unifiedTool.name },
    input: [
      ...allPrompt.input.map((message) =>
        message.role === 'user'
          ? {
              ...message,
              content: message.content.map((part) => ({
                ...part,
                text: `${part.text}\nIMPORTANT: return one unified report. Put every concrete actionable issue and its actionable recommendation together in one finding. Do not report non-actionable, speculative, already-satisfied, intentional, duplicate, or no-change items. Do not duplicate a finding as a separate suggestion. Every category must contain at least one item. If a category has no actionable finding, use exactly one sentinel with severity none, location none, finding No issues found., blank recommendation, blank rationale, and blank ignore_example. Never emit a P2/P3 item whose recommendation is "No change".`,
              })),
            }
          : message,
      ),
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Final completeness rule: in this single turn, call exactly one submit_unified_review tool. List every concrete actionable finding supported by the supplied input, with its recommendation and rationale in the same item. Only supplied repository files, package.json, the names-only inventory, and included npm test output are evidence. Any supplied npm test failure, timeout, incomplete result, coverage failure, or lint failure/warning is P0 and requires block. ${releaseGate ? 'This is a release gate: report only unresolved P0 or qualifying P1 blockers; use the no-issues item for every category with no qualifying blocker.' : 'P2 and P3 findings must be reported but must not block.'} Every category must contain at least one item. For a category with no concrete actionable finding, use exactly one no-issues item; never use an empty array. Do not report non-actionable, speculative, already-satisfied, intentional, duplicate, or no-change items. Do not report absent external evidence or duplicate the same finding. Treat nearby codescope ignore comments as authoritative.`,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Runtime contract clarification: provider JSON is intentionally accepted after JSON parsing and verdict extraction only. Do not report legacy parser or validator strictness, empty-array handling, sentinel enforcement, or missing response fields as findings; those checks are intentionally not runtime gates.',
          },
        ],
      },
    ],
  };
}
