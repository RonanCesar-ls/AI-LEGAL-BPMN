import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import { AIService } from '../src/modules/ai/ai.service.js';
import { AIUnavailableError } from '../src/modules/ai/ai.retry.js';

// Only synthetic sessions are used; do not rely on a developer's .env or database.
process.env.JWT_SECRET = 'regression-test-secret';
const { authMiddleware } = await import('../src/middleware/auth.middleware.js');
const { tasksController, notifyDashboardUpdate } = await import('../src/modules/tasks/tasks.controller.js');
const { processController } = await import('../src/modules/process/process.controller.js');

async function serve(app: express.Express, t: { after: (fn: () => void) => void }) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

test('a valid session authenticates both JSON routes and the SSE query-token route', async t => {
  const app = express();
  app.get('/events', tasksController.sseEvents);
  app.get('/protected', authMiddleware, (_req, res) => res.sendStatus(204));
  const base = await serve(app, t);
  const claims = { userId: 'test-user', name: 'Test User', email: 'test@example.test', role: 'user' };
  const token = jwt.sign(claims, process.env.JWT_SECRET!, { expiresIn: '1h' });
  assert.equal((await fetch(`${base}/protected`, { headers: { Authorization: `Bearer ${token}` } })).status, 204);
  const stream = await fetch(`${base}/events?token=${encodeURIComponent(token)}`);
  assert.equal(stream.status, 200);
  assert.match(stream.headers.get('content-type')!, /text\/event-stream/);
  const reader = stream.body!.getReader();
  assert.match(new TextDecoder().decode((await reader.read()).value), /connected/);
  notifyDashboardUpdate();
  assert.match(new TextDecoder().decode((await reader.read()).value), /"type":"refresh"/);
  await reader.cancel();
  const expired = jwt.sign(claims, process.env.JWT_SECRET!, { expiresIn: -1 });
  const wrongClaims = jwt.sign({ name: 'No user ID' }, process.env.JWT_SECRET!);
  for (const invalid of ['', 'invalid-token', expired, wrongClaims]) {
    assert.equal((await fetch(`${base}/events?token=${encodeURIComponent(invalid)}`)).status, 401);
  }
});

test('generation returns 503 with a useful message and Retry-After when AI remains busy', async t => {
  t.mock.method(AIService.prototype, 'generateFlowchartFromText', async () => {
    throw new AIUnavailableError(Object.assign(new Error('busy'), { status: 503 }));
  });
  t.mock.method(console, 'error', () => {});
  const app = express();
  app.use(express.json());
  app.post('/generate', processController.generate);
  const base = await serve(app, t);
  const response = await fetch(`${base}/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Review a document' }),
  });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('retry-after'), '10');
  const data = await response.json();
  assert.equal(data.retryable, true);
  assert.match(data.error, /temporariamente indisponível/);
});

test('generation keeps the source document name when sending the prompt to AI', async t => {
  let source;
  t.mock.method(AIService.prototype, 'generateFlowchartFromText', async (_prompt, sourceFileName) => {
    source = sourceFileName;
    return { nodes: [], edges: [] };
  });
  const app = express();
  app.use(express.json());
  app.post('/generate', processController.generate);
  const base = await serve(app, t);
  const response = await fetch(`${base}/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Review a document', sourceFileName: 'RCC.pdf' }),
  });
  assert.equal(response.status, 200);
  assert.equal(source, 'RCC.pdf');
});
