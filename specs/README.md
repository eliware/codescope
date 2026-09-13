# CodeScope specifications

This is the developer-facing specification for CodeScope. It covers the
externally observable CLI, repository-input, profile, response, and boundary
contracts. Normative language such as MUST and MUST NOT describes required
behavior; explanatory text provides context and is not itself a requirement.

This directory describes the intended externally observable behavior of the
current CodeScope implementation. It is the detailed reference behind the
public README.

Start with [overview.md](overview.md), then use the table of contents below.
This index is the specification overview; see [README.md](README.md) when
linking to the complete specification set from tooling.

Return to the [root README](../README.md) for installation, usage, safety, and
support information.

## Table of contents

- [Overview](overview.md) — product purpose, workflow, and contracts.
- [CLI](cli.md) — commands, options, output, and exit behavior.
- [Repository input](repository-input.md) — file discovery, ordering, and test evidence.
- [Review profiles](review-profiles.md) — review and suggestion profile behavior.
- [Structured results](structured-results.md) — provider tools and result shape.
- [Requirements](requirements.md) — repository-level requirements.
- [Out of scope](out-of-scope.md) — deliberately unsupported or excluded behavior.
- [Directives](directives.json) — CodeScope's CLI, review-profile, and supplied-evidence contract.
- [Authority](authority.json) — CodeScope-local authority distribution.
- [Convention specification](conventions.json) — local convention-evidence selection; canonical requirements remain authoritative in Eliware Conventions.
