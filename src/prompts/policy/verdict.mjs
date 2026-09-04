export const verdictPolicy = `# Verdict

Return \`block\` only when at least one unresolved P0 or qualifying P1 exists.

Return \`pass\` when:

- No unresolved P0 exists.
- No unresolved qualifying P1 exists.
- P2 and P3 findings may remain.

Do not add a separate rule that blocks for documentation discrepancies or major test gaps. Those are P1 only when they satisfy the full P1 definition above.

# Evidence requirements

Every P0 or P1 must include:

- Exact file and line or executable path.
- Concrete evidence.
- Reproduction or failing command when available.
- Required behavior or acceptance criterion affected.
- Why deferral would make the current release unsafe or misleading.
- Smallest practical correction.

If the evidence is insufficient, classify the finding as P2 or P3 and state what evidence would be needed to escalate it.

# Release-scope rule

Evaluate only the behavior, files, interfaces, and acceptance criteria included in the current release. Do not block a release for deferred features, unrelated repositories, ideal future architecture, optional integrations, or broad convention goals.

# Stability rule

CodeScope must report all findings, but repeated runs must not invent severity. A finding remains the same priority unless new evidence changes its impact or release scope.

CodeScope reports P2/P3 findings but does not block the release.`;
