export function appendUserMessages(request, additions = []) {
  if (!additions.length) return request;
  const next = structuredClone(request);
  const message = next.input.filter((item) => item.role === 'user').at(-1);
  const content = message?.content?.find((part) => part.type === 'input_text');
  if (!content) throw new Error('Request must contain a final user input_text message');
  content.text += `\n\n${additions.join('\n')}`;
  return next;
}
