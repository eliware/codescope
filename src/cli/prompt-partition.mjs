export function partitionPromptArgs(args) {
  const delimiter = args.indexOf('--');
  const isOption = (value) =>
    value.startsWith('--effort=') || value.startsWith('--model=') || ['--dry-run', '--usage'].includes(value);
  const optionArgs = delimiter < 0 ? args.filter(isOption) : args.slice(delimiter + 1);
  if (delimiter >= 0 && optionArgs.some((value) => !isOption(value)))
    throw new Error('Only --effort=... or --model=... may follow --');
  return {
    promptArgs:
      delimiter < 0 ? args.filter((value) => !isOption(value)) : args.slice(0, delimiter),
    optionArgs,
  };
}
