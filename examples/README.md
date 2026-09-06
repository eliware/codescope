# CodeScope examples

These examples demonstrate the primary read-only review workflow. They use
placeholders and require an OpenAI API token configured outside the repository;
never replace the placeholder with a committed credential.

## Contents

- [Review](review/) ([instructions](review/README.md)) — run a comprehensive review from another
  repository root and receive one structured result.

## Prerequisites and usage

Install CodeScope, configure `OPENAI_API_TOKEN` in the supported user-level
configuration, change to the repository you want to review, and follow the
command in the linked example. A successful run prints a completed review and
does not modify the reviewed repository.

Return to the [root README](../README.md) or the
[end-user documentation](../docs/README.md) for setup, configuration, and
troubleshooting details.
