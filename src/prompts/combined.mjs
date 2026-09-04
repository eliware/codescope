export function createCombinedAllPrompt({ allPrompt, reviewTool, suggestionTool }) {
  return {
    ...allPrompt,
    tools: [reviewTool, suggestionTool],
    tool_choice: 'auto',
    parallel_tool_calls: true,
    input: [
      ...allPrompt.input.map((message) =>
        message.role === 'user'
          ? {
              ...message,
              content: message.content.map((part) => ({
                ...part,
                text: `${part.text}\nIMPORTANT: report only concrete actionable findings. A statement that something is supported, accepted, or has no discrepancy is never a finding; use the required no-issues placeholder. Do not turn omission from an explicitly non-exhaustive example list into a documentation finding. The all profile intentionally uses tool_choice auto with parallel_tool_calls true and requires exactly one submit_review plus exactly one submit_suggestions call; do not report that intentional contract as an issue. The all profile includes tests in both review and suggestion modes. Focused parser and injected-client tests are meaningful evidence for internal tool routing; do not demand subprocess or duplicate end-to-end tests unless a concrete failure is demonstrated. The executable is a pure Node wiring barrel, so imported main tests are sufficient; never report missing subprocess smoke coverage as a finding. Also call submit_suggestions exactly once for useful improvements; call both tools before completing.`,
              })),
            }
          : message,
      ),
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Final completeness rule: in this single turn, call exactly one submit_review tool and exactly one submit_suggestions tool in parallel; do not call either tool sequentially or more than once. List every concrete finding supported by the supplied input. Only supplied repository files, package.json, the names-only inventory, and included npm test output are evidence. Any supplied npm test failure, timeout, incomplete result, coverage failure, or lint failure/warning is P0 and requires block. Proven coverage-measurement defects, stale or contaminated validation artifacts, and missing tests that leave required behavior or 100×4 unverified are P1 even when the current test command passes. Do not demand or report absent CI, npm pack, npm audit, Git status, deployment, rollback, registry, or other external evidence. Do not report absence of unsupplied command output as a test gap. Do not demand every profile cross-product when representative focused tests cover the shared implementation. If a category has no concrete finding, emit only its exact no-issues placeholder; a statement that no contradiction or issue was found is never itself a finding. The documented --usage forms are supported; do not invent a command-parser discrepancy. Treat nearby codescope ignore comments as authoritative.',
          },
        ],
      },
    ],
  };
}
