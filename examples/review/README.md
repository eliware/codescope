# Review example

## Prerequisites

Install Node.js 26 and CodeScope. Configure a user-owned provider token if the
review will contact the provider; use `OPENAI_API_TOKEN=<redacted>` as the only
placeholder and never substitute a real secret in committed files.

## Usage

Run `codescope all` from a repository root. This directory is intentionally
empty of credentials and runtime state; use a real repository as the review root
when trying the CLI.

## Expected results

CodeScope emits the provider review result and does not modify the reviewed
repository. Provider failures produce a nonzero command result.
