Check supplied CI files for syntax, runners, triggers, and commands.

Use an Ubuntu runner when the repository rules require CI.

A Windows runner is optional unless the rules require it.

A supplied workflow file proves that the workflow exists.

Do not report "missing CI workflow proof" when the file is supplied or listed in the file inventory.

Do not require saved CI results.

Do not say that CI passed or failed unless the result is supplied.

Do not report missing CI results when release docs describe Ubuntu or Windows CI.

Report a mismatch only when the supplied workflow contradicts the docs.
