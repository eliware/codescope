import {
  parseCombinedToolResponse,
  parseReviewToolResponse,
} from '../response/review-response.mjs';

export function toolCategories(tool) {
  const categories = Object.keys(
    tool?.parameters?.properties?.issues?.properties ??
      tool?.parameters?.properties?.suggestions?.properties ??
      {},
  );
  return categories.length ? categories : undefined;
}

export function parseProviderResult(providerResponse, request, combined) {
  const toolName = request.tool_choice?.name ?? 'submit_review';
  if (combined)
    return parseCombinedToolResponse(
      providerResponse,
      toolCategories(request.tools?.find((tool) => tool.name === 'submit_review')),
      toolCategories(request.tools?.find((tool) => tool.name === 'submit_suggestions')),
    );
  const categories = toolCategories(request.tools?.[0]);
  return toolName === 'submit_suggestions'
    ? parseReviewToolResponse(providerResponse, 'submit_suggestions', categories)
    : parseReviewToolResponse(providerResponse, 'submit_review', categories);
}
