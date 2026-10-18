export function formatTestSpecDeveloperInstructions(instructions) {
  return instructions
    ? `Applicable Eliware Test conventions for this repository:\n${instructions}`
    : "";
}
