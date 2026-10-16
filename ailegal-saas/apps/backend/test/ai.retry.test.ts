import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AIUnavailableError, withAIRetry } from '../src/modules/ai/ai.retry.js';
import { generateText } from '../src/modules/ai/ai.provider.js';

test('recovers from transient 503 responses with exponential backoff', async () => {
  let calls = 0;
  const delays: number[] = [];
  const result = await withAIRetry(async () => {
    if (++calls < 3) throw Object.assign(new Error('busy'), { status: 503 });
    return 'flowchart';
  }, { wait: async delay => { delays.push(delay); }, random: () => 0 });
  assert.equal(result, 'flowchart');
  assert.equal(calls, 3);
  assert.deepEqual(delays, [1000, 2000]);
});

test('stops after three transient failures and exposes a recoverable service error', async () => {
  let calls = 0;
  await assert.rejects(withAIRetry(async () => {
    calls++;
    throw Object.assign(new Error('busy'), { status: 503 });
  }, { wait: async () => {}, random: () => 0 }), error =>
    error instanceof AIUnavailableError && error.statusCode === 503 && error.retryAfter === 10);
  assert.equal(calls, 3);
});

test('does not retry invalid credentials or other permanent provider failures', async () => {
  let calls = 0;
  const failure = Object.assign(new Error('invalid API key'), { status: 403 });
  await assert.rejects(withAIRetry(async () => { calls++; throw failure; }), error => error === failure);
  assert.equal(calls, 1);
});

test('keeps rate-limit responses distinct from provider unavailability', async () => {
  await assert.rejects(withAIRetry(async () => {
    throw Object.assign(new Error('rate limit'), { status: 429 });
  }, { wait: async () => {} }), error => error instanceof AIUnavailableError && error.statusCode === 429);
});

test('the Gemini provider retries a real SDK HTTP failure without calling Google', async t => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key-not-a-real-credential';
  t.after(() => {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return new Response(JSON.stringify(calls === 1
      ? { error: { message: 'Model temporarily busy', status: 'UNAVAILABLE' } }
      : { candidates: [{ content: { role: 'model', parts: [{ text: 'Recovered output' }] }, finishReason: 'STOP' }] }),
    { status: calls === 1 ? 503 : 200, headers: { 'Content-Type': 'application/json' } });
  });
  assert.equal(await generateText({ prompt: 'Test process', system: '', format: 'text' }), 'Recovered output');
  assert.equal(calls, 2);
});
