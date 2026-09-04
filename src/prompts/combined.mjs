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
                text: `${part.text}\nIMPORTANT: return one unified report. Put every concrete issue and its actionable recommendation together in one finding. Do not duplicate a finding as a separate suggestion. A statement that something is supported, accepted, documented, intentional, has no discrepancy, needs no change, or is only a placeholder is never a finding; use an empty category array. Never emit a P2/P3 item whose recommendation is "No change".`,
              })),
            }
          : message,
      ),
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Final completeness rule: in this single turn, call exactly one submit_unified_review tool. List every concrete finding supported by the supplied input, with its recommendation and rationale in the same item. Only supplied repository files, package.json, the names-only inventory, and included npm test output are evidence. Any supplied npm test failure, timeout, incomplete result, coverage failure, or lint failure/warning is P0 and requires block. ${releaseGate ? 'This is a release gate: report only unresolved P0 or qualifying P1 blockers; use an empty array for every category with no qualifying blocker.' : 'P2 and P3 findings must be reported but must not block.'} If a category has no concrete actionable finding, return an empty array. Never emit a finding merely to say no issue exists, no change is needed, or a design is accepted/documented. Do not report absent external evidence or duplicate the same finding. Treat nearby codescope ignore comments as authoritative.`,
          },
        ],
      },
    ],
  };
}
