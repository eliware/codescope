import { parse } from "yaml";

export function compileTestSpecRecords(files, sources) {
  if (files.length !== sources.length)
    throw new Error("Test convention filenames and contents must have matching lengths");
  const rules = { dos: [], donts: [] };
  for (const [index, source] of sources.entries()) {
    const file = files[index];
    let record;
    try {
      record = parse(source, { maxAliasCount: 100, stringKeys: true, uniqueKeys: true });
    } catch (cause) {
      throw new Error(`Unable to parse Eliware Test convention ${file}`, { cause });
    }
    if (!record || typeof record !== "object" || Array.isArray(record))
      throw new Error(`Eliware Test convention ${file} must contain a mapping`);
    collectDirectiveRules(record.directives, rules, file);
  }
  return { dos: uniqueRules(rules.dos), donts: uniqueRules(rules.donts) };
}

function collectDirectiveRules(directives, rules, file) {
  if (!Array.isArray(directives))
    throw new Error(`Eliware Test convention ${file} must contain a directives list`);
  for (const directive of directives) {
    if (!directive || typeof directive !== "object" || Array.isArray(directive))
      throw new Error(`Eliware Test convention ${file} contains an invalid directive`);
    collectRuleList(directive.dos, rules.dos, file, "dos");
    collectRuleList(directive.donts, rules.donts, file, "donts");
    if (directive.directives !== undefined)
      collectDirectiveRules(directive.directives, rules, file);
  }
}

function collectRuleList(values, target, file, field) {
  if (values === undefined) return;
  if (!Array.isArray(values))
    throw new Error(`Eliware Test convention ${file} has an invalid ${field} list`);
  for (const value of values) {
    if (typeof value !== "string")
      throw new Error(`Eliware Test convention ${file} has a non-text ${field} rule`);
    const normalized = value.replace(/\s+/gu, " ").trim();
    if (normalized) target.push(normalized);
  }
}

function uniqueRules(rules) {
  return [...new Set(rules)];
}
