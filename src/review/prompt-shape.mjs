export function validatePromptShape(prompt) {
  if (!prompt || typeof prompt !== 'object' || Array.isArray(prompt))
    throw new Error('Prompt option must be a top-level object');
  if (!Array.isArray(prompt.input)) throw new Error('prompt.json must define input as an array');
  if (prompt.input.some((item) => !item || typeof item !== 'object' || Array.isArray(item)))
    throw new Error('prompt.json input entries must be objects');
  if (
    prompt.input.some(
      (item) =>
        typeof item.role !== 'string' ||
        !Array.isArray(item.content) ||
        item.content.some(
          (part) =>
            !part ||
            typeof part !== 'object' ||
            Array.isArray(part) ||
            typeof part.type !== 'string' ||
            (part.type === 'input_text' && typeof part.text !== 'string'),
        ),
    )
  )
    throw new Error('prompt input messages have invalid shapes');
  const developers = prompt.input.filter((item) => item.role === 'developer');
  if (developers.length !== 1) throw new Error('prompt.json must contain exactly one developer message');
  if (developers[0].content.filter((part) => part.type === 'input_text').length !== 1)
    throw new Error('prompt developer message must contain exactly one input_text part');
}
