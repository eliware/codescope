# CodeScope directives

[Back to the root README](../README.md)

This directory contains CodeScope's v8 JSON directive records. Each directive
has explicit `dos` and `donts`; these records are the only normative
specification format for this repository.

- [directives.json](directives.json) defines CodeScope's authority over CLI
  behavior, review profiles, and supplied-evidence conventions.
- [contracts.json](contracts.json) is the normative contract reference for
  implementing and verifying those directives; source and tests are evidence,
  not contract authority.
- [authority.json](authority.json) records the ownership distribution.
- [conventions.json](conventions.json) defines how canonical Eliware
  Convention v8 records are selected as review evidence.

Eliware Docs remains authoritative for shared documentation and the authority
map. Eliware Conventions remains authoritative for repository requirements.
Operations and Test8 behavior are outside CodeScope's authority.

- [Requirements](requirements.md) describes how to read and implement these
  specification records.
- [Out of scope](out-of-scope.md) records behavior CodeScope deliberately does
  not own.
