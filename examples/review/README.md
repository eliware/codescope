# Review example

## Prerequisites

Install `@eliware/codescope` and configure `OPENAI_API_TOKEN` outside the
repository. Run the example from the root of the repository being reviewed.

## Usage

From that repository root, run:

```text
codescope all --effort=none
```

## Expected result

The command reviews the supplied implementation, tests, documentation, and
metadata, then prints one structured result. It does not modify the reviewed
repository. Use `codescope --help` for the owner workflow and available
profiles.
