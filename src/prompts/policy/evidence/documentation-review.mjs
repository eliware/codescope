export const documentationReviewPolicy = [
  "Documentation that falsely claims a command, API, option, or required usage path exists when it does not is a qualifying P1 and requires verdict block.",
  "Minor documentation wording, formatting, examples, and other documentation discrepancies remain P2/P3 unless they materially misrepresent how to use the app or API.",
  "Claims about linked external projects are not findings just because the referenced project's code or authoritative docs are absent. Treat those claims as unknown unless authoritative evidence is supplied; report them only when supplied evidence directly contradicts them or shows concrete impact in the reviewed repository.",
].join(" ");
