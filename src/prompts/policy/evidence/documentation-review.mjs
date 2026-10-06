export const documentationReviewPolicy = [
  "Use P1 and block the verdict when docs say that a command, API, option, or required use exists, but it does not.",
  "Use P2 or P3 for small errors in wording, format, or examples. Use a higher priority only when the docs give wrong instructions for the app or API.",
  "Do not report a claim about an external project just because its code or official docs are not supplied. Treat the claim as unknown. Report it only when supplied evidence disproves it or shows a concrete effect in this repository.",
].join(" ");
