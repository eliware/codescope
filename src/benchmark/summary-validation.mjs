export function validateSummaryEfforts(results, efforts) {
  const snapshot = results.map((result) => ({ ...result }));
  const uniqueResults = [...new Map(snapshot.map((result) => [result.effort, result])).values()];
  const duplicateEfforts = [
    ...new Set(
      snapshot
        .map((result) => result.effort)
        .filter((effort, index, all) => all.indexOf(effort) !== index),
    ),
  ];
  const declaredEfforts = new Set(efforts);
  const resultByEffort = new Map(uniqueResults.map((result) => [result.effort, result]));
  const hasExactEfforts =
    resultByEffort.size === declaredEfforts.size &&
    [...declaredEfforts].every((effort) => resultByEffort.has(effort)) &&
    [...resultByEffort.keys()].every((effort) => declaredEfforts.has(effort));
  return { snapshot, duplicateEfforts, resultByEffort, hasExactEfforts };
}
