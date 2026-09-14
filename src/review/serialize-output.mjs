export function serializeOutput(output) {
  try {
    const serialized = JSON.stringify(output, (_key, value) => {
      if (typeof value === 'bigint') return { type: 'bigint', value: value.toString() };
      if (typeof value === 'symbol') return { type: 'symbol', value: String(value) };
      if (typeof value === 'function') return { type: 'function', value: String(value) };
      return value;
    });
    return serialized === undefined ? JSON.stringify({ type: typeof output }) : serialized;
  } catch {
    return JSON.stringify({ type: 'unserializable' });
  }
}
