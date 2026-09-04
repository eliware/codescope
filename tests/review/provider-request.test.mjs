import { requestProviderResponse } from '../../src/review/provider-request.mjs';

test('passes the prepared request to Responses', async () => {
  let received;
  const response = { output: [] };
  const client = {
    responses: {
      create: async (...args) => {
        received = args;
        return response;
      },
    },
  };
  await expect(
    requestProviderResponse(
      client,
      { model: 'gpt-5.6-luna', input: ['input'], tool_choice: 'auto' },
      'signal',
    ),
  ).resolves.toBe(response);
  expect(received[0]).toMatchObject({
    input: ['input'],
    tool_choice: 'auto',
  });
  expect(received[1]).toEqual({ signal: 'signal' });
});
