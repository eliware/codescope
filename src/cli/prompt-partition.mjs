export function partitionPromptArgs(args) {
  const delimiter = args.indexOf('--');
  return {
    promptArgs:
      delimiter < 0 ? args.filter((value) => !value.startsWith('--')) : args.slice(0, delimiter),
    optionArgs:
      delimiter < 0 ? args.filter((value) => value.startsWith('--')) : args.slice(delimiter + 1),
  };
}
