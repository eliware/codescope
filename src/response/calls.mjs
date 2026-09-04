export const responseError = (message, cause) =>
  Object.assign(new Error(message, { cause }), { code: 'INVALID_RESPONSE' });

export function getFunctionCalls(response, name) {
  return (Array.isArray(response?.output) ? response.output : []).filter(
    (item) => item?.type === 'function_call' && item.name === name,
  );
}
