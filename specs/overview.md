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
- Review output is the exact provider response for AI-to-AI transport, not a
  guaranteed machine-readable programmatic API.
- Provider-output shape is transport guidance rather than a CodeScope API
  acceptance gate; CodeScope's own response handling remains reviewable.
- Review findings use P0–P3 priorities in the provider's requested output.
- Suggestion profiles return recommendations in the provider's requested output.
- `all` requests a comprehensive review and writes the provider response unchanged.
- The tool is read-only apart from its own output.
