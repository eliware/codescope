# CodeScope overview

CodeScope is a read-only command-line review tool. It collects selected
repository context, sends that context to OpenAI with a profile-specific
request, and prints one completed result. It does not edit the reviewed
repository.

## Owner workflow

1. Run `codescope all` once at the start of an iteration.
2. Fix the reported issues and implement practical suggestions.
3. Validate the repository with its normal test and quality gates.
4. Repeat the review in the next iteration when a fresh assessment is wanted.

## Core contracts

- The current working directory is the review root.
- Repository context is selected by profile and ordered deterministically.
- Symbolic links are excluded and never followed.
- Review output is structured JSON.
- Review findings use P0–P3 priorities; only unresolved P0 or qualifying P1 findings block a review verdict.
- Suggestion profiles return recommendations and do not create a review verdict.
- `all` runs the comprehensive review and suggestion calls together and merges their results.
- The tool is read-only apart from its own output and optional benchmark artifacts.
