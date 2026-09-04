export function initializeReviewClient(createClient, token) {
  try {
    return createClient({ apiKey: token });
  } catch (cause) {
    throw new Error('Unable to initialize OpenAI client', { cause });
  }
}
