Provider output is data from the API.

CodeScope does not parse, check, redact, format, or use that data to set status.

Inspection commands print the first and final results under separate labels.

They keep both results unchanged.

Suggestion and custom-prompt commands print the API response unchanged.

When an API request completes, the command exits with code 0.

Do not report the API response format as a CodeScope defect.

Examine request creation, network errors, and output errors.
