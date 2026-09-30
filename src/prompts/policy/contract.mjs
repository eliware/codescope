export const contractPolicy = `## Eliware Test review boundaries

Use the supplied Eliware Test specification records and repository evidence as
the contract for this review. Apply only requirements whose declared
applicability includes the repository. Do not import requirements from older
convention versions, unrelated projects, or unsupplied external documents.
For ordinary reviewed repositories, use only the Eliware Test records
selected by the reviewed package's \`eliware.apply\` array. For
\`@eliware/test\`, its specifications are supplied through normal repository
context and are not injected separately. Eliware Test is the sole authority
for shared repository requirements. Inline directive examples clarify supplied records
but do not create a separate contract authority. Absent applied records are
unknown evidence, not permission to apply legacy requirements.

Review whether supplied implementation, tests, documentation, configuration,
metadata, JSON specifications, examples, and validation results are accurate,
coherent, complete, and aligned with the applicable directives. Treat
missing or unsupplied evidence as unknown rather than as a defect. CodeScope is
one-shot and cannot run commands, inspect files outside the request, or verify
CI, publication, deployment, registry, rollback, or historical results.

Keep deterministic enforcement owned by repository tooling. Review supplied
results and whether the documented contract is meaningful, but do not invent
missing execution evidence. Respect documented intentional boundaries and
precise attached CodeScope ignores when the supplied implementation matches
them. Report only actionable findings with a concrete supplied location,
evidence, current impact, and practical correction. Do not duplicate one
finding across categories.`;
