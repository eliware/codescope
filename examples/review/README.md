# Review example

From a repository root with `@eliware/codescope` installed and
`OPENAI_API_TOKEN` configured outside the repository, run:

```text
codescope all --effort=none
```

The command reviews the supplied implementation, tests, documentation, and
metadata, then prints one structured result. It does not modify the reviewed
repository. Use `codescope --help` for the owner workflow and available
profiles.
