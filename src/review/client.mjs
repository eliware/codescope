export function initializeReviewClient(createClient, token) {
  try {
    return createClient({ apiKey: token });
  } catch (cause) {
    throw new Error("Cannot initialize OpenAI client", { cause });
  }
}
