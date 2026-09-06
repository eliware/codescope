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
                text: `${part.text}\nIMPORTANT: return one unified report. Put every actionable issue and its actionable recommendation together in one finding. Use only supplied evidence; CodeScope cannot run commands or inspect unavailable files. Do not report unsupported speculation, but do report credible edge cases when the supplied implementation supports a concrete impact. Do not report fully satisfied, intentional, duplicate, or no-change items. Do not duplicate a finding as a separate suggestion. Every category must contain at least one item. A sentinel is not a finding: it must be the sole category item, use severity none and location none, use exactly No issues found., and leave recommendation, rationale, and ignore_example blank. If a category has no actionable finding, use exactly one sentinel with severity none, location none, finding No issues found., blank recommendation, blank rationale, and blank ignore_example. Never emit a P2/P3 item whose recommendation is "No change".`,
              })),
            }
          : message,
      ),
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Final completeness rule: in this single turn, call exactly one submit_unified_review tool. List every actionable finding supported by the supplied input, with its recommendation and rationale in the same item. Only supplied repository files, package.json, the names-only inventory, and included command output are evidence. CodeScope cannot run tests, inspect unavailable files, or verify external state. Any supplied npm test failure, timeout, incomplete result, coverage failure, or lint failure/warning is P0 and requires block. Supplied workflow files are configuration evidence: if the inventory or context contains a workflow, do not report missing CI workflow evidence. Do not require or infer CI execution results; do not report that CI passed, failed, or lacks proof of passing without actual CI output. ${releaseGate ? 'This release-gate rule overrides ordinary all-profile reporting: report only unresolved P0 and qualifying P1 blockers, and use exactly one valid no-issues sentinel for every category without such a blocker.' : 'P2 and P3 findings must be reported but must not block.'} Every category must contain at least one item. For a category with no actionable finding, use exactly one valid no-issues sentinel; never use an empty array or a finding-shaped placeholder. Do not report unsupported speculation, but do report credible edge cases when the supplied implementation supports a concrete impact. Do not report fully satisfied, intentional, duplicate, or no-change items. Do not report absent external evidence or duplicate the same finding. Honor only precise, attached, scope-matching ignore comments; treat broad, stale, unrelated, or ambiguous comments as non-authoritative.`,
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: "Runtime contract clarification for every profile: do not report the provider's returned JSON shape, missing fields, category contents, sentinels, duplicate calls, or tool arguments as CodeScope defects. Those are provider-output guidance, not runtime acceptance gates. Continue reviewing CodeScope's own request construction, response parsing, output preservation, fallback handling, error mapping, tool-call handling, and verdict extraction. Report concrete defects in those implementations, including lost output, failed pretty-printing, or status derived from a non-verdict signal.",
          },
        ],
      },
    ],
  };
}
