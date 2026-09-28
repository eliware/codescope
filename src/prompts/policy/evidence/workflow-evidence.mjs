export const workflowEvidencePolicy = [
  "Inspect supplied CI workflow files for their presence, syntax, declared runners, triggers, and configured commands; an Ubuntu runner is required where the repository contract requires CI, and a Windows runner is optional unless explicitly required.",
  'A supplied workflow file containing the required runner is positive evidence that the workflow is present; never report "missing CI workflow evidence" when that file is supplied or listed in the inventory.',
  "Do not require stored CI execution results and do not report that CI passed, failed, or lacks proof of passing unless an actual CI result is supplied.",
  "Do not report release documentation that describes Ubuntu or Windows CI guarantees as missing evidence merely because execution results are absent; report it only when supplied workflow configuration contradicts the claim.",
].join(" ");
