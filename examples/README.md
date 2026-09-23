# Examples

[Back to the root README](../README.md)

This directory contains runnable example inputs for CodeScope documentation.
The review example is indexed below.

## Setup and prerequisites

Install Node.js 26 and CodeScope, and provide credentials through user-owned
configuration when a provider request is needed. Never place real credentials in
an example or commit them.

Prerequisites: Node.js 26, CodeScope, and a user-owned provider token only when
the example contacts the provider. Secret-safe placeholder: `<redacted>`.

## Expected results and security

The example documentation describes a successful command shape and the safe,
read-only evidence boundary users should expect.

Expected results: CodeScope returns a review result without modifying the
reviewed repository.

- [Review example](review/README.md)
