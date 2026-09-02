import { prepareRequest } from '../src/review-request.mjs';
import { defaultDeveloperText } from '../src/prompt.mjs';

const message = (content = [{ type: 'input_text', text: '<combine-mjs here>' }]) => ({ role: 'developer', content });

test('prepares placeholder and default prompts', () => {
  const request = prepareRequest({ model: 'x', tools: [], store: false, input: [message()] }, 'SOURCE');
  expect(request.input[0].content[0].text).toContain('SOURCE');
  const defaultRequest = prepareRequest({ input: [message([{ type: 'input_text', text: defaultDeveloperText }]), { role: 'user', content: [{ type: 'input_text', text: 'review' }] }] }, 'SOURCE');
  expect(defaultRequest.input[1].content[0].text).toContain('SOURCE');
});

test('rejects invalid prompt structures', () => {
  for (const prompt of [null, [], { input: 'bad' }, { extra: true, input: [] }, { model: 1, input: [message()] }, { tools: 'bad', input: [message()] }, { store: 'bad', input: [message()] }, { input: [null] }, { input: [{ role: 'developer', content: 'bad' }] }, { input: [message([{ type: 'input_text', text: 'a' }, { type: 'input_text', text: 'b' }])] }, { input: [message([{ type: 'text', text: 'a' }])] }, { input: [message([{ type: 'input_text', text: 1 }])] }])
    expect(() => prepareRequest(prompt, 'SOURCE')).toThrow();
  expect(() => prepareRequest({ input: [message([{ type: 'input_text', text: defaultDeveloperText }])] }, 'SOURCE')).toThrow('user input_text');
  expect(() => prepareRequest({ input: [message(), message()] }, 'SOURCE')).toThrow('exactly one developer');
  expect(() => prepareRequest({ input: [message([{ type: 'input_text', text: 'custom' }])] }, 'SOURCE')).toThrow('placeholder');
});
