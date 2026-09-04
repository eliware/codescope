import {
  parseCombinedToolResponse,
  parseSuggestionToolResponse,
} from '../response/review-response.mjs';
import { parseReviewToolResponse } from '../response/review-parser.mjs';
import { parseUnifiedToolResponse } from '../response/unified-parser.mjs';

export function toolCategories(tool) {
  const categories = Object.keys(
    tool?.parameters?.properties?.issues?.properties ??
      tool?.parameters?.properties?.suggestions?.properties ??
      tool?.parameters?.properties?.findings?.properties ??
      {},
  );
  return categories.length ? categories : undefined;
}

export function parseProviderResult(providerResponse, request, combined) {
  if (request.tool_choice?.name === 'submit_unified_review')
    return parseUnifiedToolResponse(providerResponse, toolCategories(request.tools?.[0]));
  const toolName = request.tool_choice?.name ?? 'submit_review';
  if (
    combined &&
    request.tools?.some((tool) => tool.name === 'submit_review') &&
    request.tools?.some((tool) => tool.name === 'submit_suggestions')
  )
    return parseCombinedToolResponse(
      providerResponse,
      toolCategories(request.tools?.find((tool) => tool.name === 'submit_review')),
      toolCategories(request.tools?.find((tool) => tool.name === 'submit_suggestions')),
    );
  const categories = toolCategories(request.tools?.[0]);
  return toolName === 'submit_suggestions'
    ? parseSuggestionToolResponse(providerResponse, categories)
    : parseReviewToolResponse(providerResponse, categories);
}
