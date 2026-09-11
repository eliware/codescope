export const contractPolicy = `## Eliware Convention v8 review boundaries

Use the supplied Convention v8 structured records and repository evidence as
the contract for this review. Apply only requirements whose declared
applicability includes the repository. Do not import requirements from older
convention versions, unrelated projects, or unsupplied external documents.
When the supplied repository includes \`specs/conventions.json\`, use its
applicability and directive map to select the repository's convention records.
The full Convention v8 JSON records must be supplied from the sibling
conventions/specs checkout for detailed alignment review; absent records are
unknown evidence, not permission to apply legacy requirements.

Review whether supplied implementation, tests, documentation, configuration,
metadata, JSON specifications, examples, and validation results are accurate,
coherent, complete, and aligned with the applicable v8 directives. Treat
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
