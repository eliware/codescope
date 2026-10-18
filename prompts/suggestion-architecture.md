Suggest architecture optimizations only.

Read all supplied source code.

Suggest only useful changes that the supplied code proves.

Give a file path, a current improvement, and a practical change.

Do not report guesses, risks without proof, work that the code does, documented behavior, duplicates, or changes that are not needed.

Put at least one item in every category.

If a category has no suggestion, return one sentinel: locations ["none"], suggestion "No suggestions found.", rationale: [], ignore_example: "".

For each valid suggestion, give one or more short causes in order.

Start each cause with "Because".

End with the benefit of the change.

Do not add more causes.

For each valid suggestion, include a full // codescope ignore: ... comment in ignore_example.

Give paths and line numbers for each suggestion.
